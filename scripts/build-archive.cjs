
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { execFileSync } = require("node:child_process");

const snapshotCommit = "558638cf4c8857508234bd5403a7809209a81071";
const root = path.resolve(__dirname, "..");
const cacheKey = createHash("sha256").update(fs.readFileSync(__filename)).digest("hex").slice(0, 16);
const archiveDirectory = path.join(root, "node_modules", ".cache", "class-interactives", cacheKey);
const readyFile = archiveDirectory + ".ready";

function run(command, args, cwd, env = process.env) {
  execFileSync(command, args, { cwd, env, stdio: "inherit" });
}

function update(source, file, replacements) {
  const destination = path.join(source, file);
  let contents = fs.readFileSync(destination, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of replacements) {
    if (!contents.includes(from)) throw new Error("Archive source did not match: " + file);
    contents = contents.replaceAll(from, to);
  }
  fs.writeFileSync(destination, contents);
}

function prepareArchive() {
  if (fs.existsSync(readyFile) && fs.existsSync(path.join(archiveDirectory, "index.html"))) return;
  if (!process.env.npm_execpath) throw new Error("Run the archive build through npm.");

  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryRoot, "class-interactives-archive-"));
  const source = path.join(temporary, "source");
  const archive = path.join(temporary, "source.tar");

  try {
    fs.mkdirSync(source);
    run("git", ["archive", "--format=tar", "-o", archive, snapshotCommit], root);
    run("tar", ["-xf", archive, "-C", source], root);

    update(source, "src/App.js", [
      ['<Router basename="">', '<Router basename="/archive">'],
      [
        '<div style={{ padding: "20px" }}>',
        '<div style={{ padding: "20px" }}>\n' +
        '      <div style={{ textAlign: "right" }}>\n' +
        '        <a href={"/" + (location.state?.archiveSource || location.search + location.hash)} onClick={() => {\n' +
        '          if (id && !location.state?.archiveSource && (txt === "DYewxghsBOCuB2Q" || txt === "DYewxghsCmAmCWAXIA")) {\n' +
        '            try { sessionStorage.setItem("class-interactives:archive-return", id); } catch {}\n' +
        '          }\n' +
        '        }}>Use updated site</a>\n' +
        '      </div>',
      ],
    ]);
    update(source, "src/components/Interactive.js", [[
      "search: params.toString(),\n      });\n    };\n\n    const restoreData",
      "search: params.toString(),\n        state: { archiveSource: location.search + location.hash },\n      });\n    };\n\n    const restoreData",
    ], [
      "    location.pathname,\n    txt,",
      "    location.pathname,\n    location.search,\n    location.hash,\n    txt,",
    ], [
      "fetch(decodeURIComponent(txt))",
      "fetch(txt)",
    ]]);
    update(source, "src/components/ShareModal.js", [[
      "http://www.classinteractives.co.uk?txt=",
      "https://www.classinteractives.co.uk/archive/?txt=",
    ]]);
    run(process.execPath, [process.env.npm_execpath, "ci", "--no-audit", "--no-fund"], source);
    run(process.execPath, [process.env.npm_execpath, "run", "build"], source, {
      ...process.env, PUBLIC_URL: "/archive", BUILD_PATH: "build",
    });
    fs.mkdirSync(archiveDirectory, { recursive: true });
    fs.cpSync(path.join(source, "build"), archiveDirectory, { recursive: true });
    fs.writeFileSync(readyFile, snapshotCommit);
  } finally {
    if (path.dirname(path.resolve(temporary)) === temporaryRoot &&
        path.basename(temporary).startsWith("class-interactives-archive-")) {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  }
}

if (require.main === module) {
  prepareArchive();
  if (!process.argv.includes("--prepare")) {
    fs.cpSync(archiveDirectory, path.join(root, "build", "archive"), { recursive: true });
  }
}

module.exports = { archiveDirectory };
