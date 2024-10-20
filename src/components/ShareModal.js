import React, { useState } from "react";
import axios from "axios";
import styles from "./ShareModal.module.css";

const ITEMS_PER_PAGE = 10;

const ShareModal = ({ url, onClose }) => {
  const [username, setUsername] = useState("");
  const [currentItems, setCurrentItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(url);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [browseMode, setBrowseMode] = useState(null); // "repos" or "gists"

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
  };

  const handleFindRepositories = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/repos`
      );
      setHistory([{ type: "repos", items: response.data }]);
      setCurrentItems(response.data);
      setSelectedRepo(null);
      setSelectedBranch(null);
      setCurrentPage(1);
      setBrowseMode("repos");
      setRateLimitExceeded(false); // Reset if successful
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setRateLimitExceeded(true); // Rate limit exceeded
      } else {
        console.error("Error fetching repositories:", error);
      }
    }
  };

  const handleFindGists = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/gists`
      );
      setHistory([{ type: "gists", items: response.data }]);
      setCurrentItems(response.data);
      setSelectedRepo(null);
      setSelectedBranch(null);
      setCurrentPage(1);
      setBrowseMode("gists");
      setRateLimitExceeded(false); // Reset if successful
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setRateLimitExceeded(true); // Rate limit exceeded
      } else {
        console.error("Error fetching gists:", error);
      }
    }
  };

  const handleRepoClick = async (repoName) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${username}/${repoName}/branches`
      );
      setHistory([...history, { type: "branches", items: response.data }]);
      setCurrentItems(response.data);
      setSelectedRepo(repoName);
      setSelectedBranch(null);
      setCurrentPage(1);
      setRateLimitExceeded(false); // Reset if successful
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setRateLimitExceeded(true); // Rate limit exceeded
      } else {
        console.error("Error fetching branches:", error);
      }
    }
  };

  const handleBranchClick = async (branchName) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${username}/${selectedRepo}/git/trees/${branchName}?recursive=true`
      );
      const fileTree = response.data.tree.filter(
        (item) => item.type === "blob"
      );
      setHistory([...history, { type: "files", items: fileTree }]);
      setCurrentItems(fileTree);
      setSelectedBranch(branchName);
      setCurrentPage(1);
      setRateLimitExceeded(false); // Reset if successful
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setRateLimitExceeded(true); // Rate limit exceeded
      } else {
        console.error("Error fetching files:", error);
      }
    }
  };

  const handleFileClick = (filePath) => {
    const escapedPath = encodeURIComponent(filePath);
    const link = `http://www.classinteractives.co.uk?txt=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2F${username}%2F${selectedRepo}@${selectedBranch}%2F${escapedPath}`;
    setGeneratedUrl(link);
    // Trigger flash effect by adding the flash class
    const textAreaElement = document.querySelector(`.${styles.shareTextArea}`);
    textAreaElement.classList.add(styles.flash);

    // Remove the flash class after the animation ends
    textAreaElement.addEventListener(
      "animationend",
      () => {
        textAreaElement.classList.remove(styles.flash);
      },
      { once: true }
    );
  };

  const handleGistClick = (gist) => {
    const files = Object.values(gist.files);
    setHistory([...history, { type: "gistFiles", items: files }]);
    setCurrentItems(files);
    setCurrentPage(1);
  };

  const handleGistFileClick = (file) => {
    const encodedUrl = encodeURIComponent(file.raw_url);
    const link = `http://www.classinteractives.co.uk?txt=${encodedUrl}`;
    setGeneratedUrl(link);
    // Trigger flash effect by adding the flash class
    const textAreaElement = document.querySelector(`.${styles.shareTextArea}`);
    textAreaElement.classList.add(styles.flash);

    // Remove the flash class after the animation ends
    textAreaElement.addEventListener(
      "animationend",
      () => {
        textAreaElement.classList.remove(styles.flash);
      },
      { once: true }
    );
  };

  const handleUpClick = () => {
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setCurrentItems(newHistory[newHistory.length - 1].items);
    setCurrentPage(1);

    if (newHistory.length === 1) {
      setSelectedRepo(null);
      setSelectedBranch(null);
    } else if (newHistory.length === 2 && browseMode === "repos") {
      setSelectedBranch(null);
    }
  };

  const paginatedItems = currentItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Share URL</h2>
        <textarea
          readOnly
          value={generatedUrl}
          className={styles.shareTextArea}
        ></textarea>
        <div>
          <button className={styles.copyButton} onClick={handleCopy}>
            Copy
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        {rateLimitExceeded && (
          <div className={styles.rateLimitWarning}>
            ⚠️ GitHub API rate limit exceeded. Please try again later.
          </div>
        )}

        <div className={styles.noteBox}>
          <div className={styles.noteIcon}>📝</div>
          <div className={styles.noteContent}>
            <p>
              If you have added your activity file to a public{" "}
              <a
                href="https://gist.github.com/"
                target="_blank"
                rel="noreferrer"
              >
                GitGub Gist
              </a>{" "}
              or public{" "}
              <a href="https://github.com" target="_blank" rel="noreferrer">
                GitHub repository
              </a>
              , you can construct the share URL to give to students
              automatically by browsing to it below using your github username.
              You can create a new public gist from the link above by adding a
              new file with the same contents that you get from downloading this
              activity file.
            </p>
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
              />
              <button onClick={handleFindRepositories}>
                Find Public Repositories
              </button>
              <button onClick={handleFindGists}>Find Gists</button>
              {history.length > 1 && (
                <button onClick={handleUpClick}>Up</button>
              )}
              <ul>
                {paginatedItems.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      const currentType = history[history.length - 1].type;
                      if (currentType === "repos") {
                        handleRepoClick(item.name);
                      } else if (currentType === "branches") {
                        handleBranchClick(item.name);
                      } else if (currentType === "files") {
                        handleFileClick(item.path);
                      } else if (currentType === "gists") {
                        handleGistClick(item);
                      } else if (currentType === "gistFiles") {
                        handleGistFileClick(item);
                      }
                    }}
                  >
                    {item.name ||
                      item.description ||
                      item.filename ||
                      item.path ||
                      item.id}
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <div className={styles.paginationControls}>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.noteBox}>
          <div className={styles.noteIcon}>📝</div>
          <div className={styles.noteContent}>
            <p>
              Note:You can also create your own link-share method by hosting the
              activity file on the web for public access and then using jsdelivr
              to serve it. For example, this{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="http://www.classinteractives.co.uk?txt=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fbakerpdgit%2Flearning-interactives%40main%2Fsrc%2Fexamples%2FExampleInteractiveFile.txt"
              >
                link
              </a>{" "}
              pulls from an example activity file hosted on this project's
              GitHub via jsDelivr.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
