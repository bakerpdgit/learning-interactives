
import React, { useState } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { activityUrl, hostedActivityLinks } from "../activityFormat";
import SiteDialog from "./SiteDialog";

const API = "https://api.github.com";
const PAGE_SIZE = 10;

async function githubList(path, page) {
  const url = new URL(API + path);
  if (page) {
    url.searchParams.set("per_page", PAGE_SIZE);
    url.searchParams.set("page", page);
  }
  const response = await fetch(url, { credentials: "omit" });
  if (response.status === 429 || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")) {
    throw new Error("GitHub’s request limit has been reached. Try again later or share the saved file.");
  }
  if (response.status === 404) throw new Error("GitHub couldn’t find this public item.");
  if (!response.ok) throw new Error("GitHub couldn’t be reached. Check your network and try again.");
  return {
    data: await response.json(),
    next: response.headers.get("link")?.includes('rel="next"') || false,
  };
}

function ShareLink({label, url}) {
  const [notice, setNotice] = useState("");
  return <div className="shareLink">
    <TextField fullWidth size="small" label={label} value={url}
      InputProps={{ readOnly: true }} onFocus={(event) => event.target.select()} />
    <div className="buttonRow">
      <Button aria-label={"Open " + label} href={url} target="_blank" rel="noreferrer">Open</Button>
      <Button aria-label={"Copy " + label} onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setNotice("Link copied.");
        } catch {
          setNotice("Select and copy the link above.");
        }
      }}>Copy</Button>
      {notice && <span role="status">{notice}</span>}
    </div>
  </div>;
}

const titles = {
  repos: "Repositories", gists: "Public Gists", branches: "Branches",
  files: "Files", gistFiles: "Gist files",
};

export default function ShareModal({directLink, hasMedia, onSave, onClose}) {
  const [username, setUsername] = useState("");
  const [screens, setScreens] = useState([]);
  const [links, setLinks] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const screen = screens.at(-1);
  const page = screen?.page ?? screen?.localPage ?? 1;
  const visibleItems = screen?.page ? screen.items : screen?.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasNext = screen?.page ? screen.next : (screen?.items.length || 0) > page * PAGE_SIZE;

  const load = async (target, replace = false) => {
    setBusy(true);
    setError("");
    try {
      const {data, next} = await githubList(target.path, target.page);
      const items = target.kind === "files" ? data.tree.filter((item) => item.type === "blob") : data;
      const loaded = {...target, items, next};
      setScreens((previous) => replace ? [...previous.slice(0, -1), loaded] :
        target.owner && (target.kind === "repos" || target.kind === "gists") ? [loaded] : [...previous, loaded]);
      if (data.truncated) setError("GitHub returned part of this repository. Choose a listed file or share the saved file.");
    } catch (error) {
      setError(error instanceof TypeError ? "GitHub couldn’t be reached from this network." : error.message);
    } finally {
      setBusy(false);
    }
  };

  const turnPage = (direction) => {
    const next = page + direction;
    if (screen.page) load({...screen, page: next}, true);
    else setScreens((previous) => [...previous.slice(0, -1), {...screen, localPage: next}]);
  };

  const start = (kind) => {
    const owner = username.trim();
    if (!owner) return;
    setLinks([]);
    load({ kind, owner, path: "/users/" + encodeURIComponent(owner) + "/" + kind, page: 1 });
  };

  const select = (item) => {
    const owner = screen.owner;
    const repo = screen.repo;
    const repoApi = "/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo || item.name);
    setLinks([]);
    setError("");
    switch (screen.kind) {
      case "repos":
        load({ kind: "branches", owner, repo: item.name, path: repoApi + "/branches", page: 1 });
        break;
      case "branches":
        load({ kind: "files", owner, repo, branch: item.name,
          path: repoApi + "/git/trees/" + item.commit.sha + "?recursive=true" });
        break;
      case "files":
        setLinks(hostedActivityLinks(owner, repo, screen.branch, item.path));
        break;
      case "gists":
        setScreens((previous) => [...previous, {kind: "gistFiles", items: Object.values(item.files)}]);
        break;
      case "gistFiles":
        setLinks([{label: "GitHub Gist", url: activityUrl({ txt: item.raw_url })}]);
        break;
      default:
        break;
    }
  };

  return <SiteDialog title="Share activity" wide onClose={onClose}
    actions={<><Button onClick={onSave}>Save activity</Button><Button onClick={onClose}>Close</Button></>}>
    {directLink ?
      <ShareLink label="Activity link" url={directLink} /> :
      <p>{hasMedia ? "Save this activity as a file to include its image or recording." :
        "This activity is too long for a direct link. Save the activity file or share it from a public host."}</p>}
    <details className="shareSources" open={screen ? true : undefined}>
      <summary>Share a file hosted on GitHub</summary>
      <p>Save the activity, add it to a public repository or Gist, then select the file below.</p>
      <form onSubmit={(event) => { event.preventDefault(); start("repos"); }}>
        <TextField size="small" label="GitHub username" value={username}
          onChange={(event) => setUsername(event.target.value)} />
        <div className="buttonRow">
          <Button type="submit" disabled={busy || !username.trim()}>Find repositories</Button>
          <Button disabled={busy || !username.trim()} onClick={() => start("gists")}>Find Gists</Button>
        </div>
      </form>
      {busy && <p role="status">Loading from GitHub…</p>}
      {error && <Alert severity="error">{error}</Alert>}
      {screen && <section aria-label={titles[screen.kind]}>
        <div className="sourceHeading">
          <h3>{titles[screen.kind]}</h3>
          {screens.length > 1 && <Button disabled={busy} onClick={() => {
            setScreens((previous) => previous.slice(0, -1));
            setLinks([]);
            setError("");
          }}>Back</Button>}
        </div>
        {visibleItems.length ? <ul className="sourceList">
          {visibleItems.map((item) => <li key={item.path || item.filename || item.id || item.name}>
            <Button disabled={busy} onClick={() => select(item)}>
              {item.name || item.path || item.filename || item.description || Object.keys(item.files || {}).join(", ")}
            </Button>
          </li>)}
        </ul> : <p>No public items found.</p>}
        {(page > 1 || hasNext) && <div className="buttonRow">
          <Button disabled={busy || page === 1}
            onClick={() => turnPage(-1)}>Previous</Button>
          <span>Page {page}</span>
          <Button disabled={busy || !hasNext}
            onClick={() => turnPage(1)}>Next</Button>
        </div>}
      </section>}
      {links.length > 1 && <p>These links follow the selected branch. jsDelivr may show a cached version after edits.</p>}
      {links.map(({label, url}) => <ShareLink key={url} label={label} url={url} />)}
    </details>
  </SiteDialog>;
}
