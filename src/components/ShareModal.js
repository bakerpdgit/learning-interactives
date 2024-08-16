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
      setRateLimitExceeded(false); // Reset if successful
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setRateLimitExceeded(true); // Rate limit exceeded
      } else {
        console.error("Error fetching repositories:", error);
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

  const handleUpClick = () => {
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setCurrentItems(newHistory[newHistory.length - 1].items);
    setCurrentPage(1);

    if (newHistory.length === 1) {
      setSelectedRepo(null);
    } else if (newHistory.length === 2) {
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

        <div className={styles.noteBox}>
          <div className={styles.noteIcon}>📝</div>
          <div className={styles.noteContent}>
            <p>
              Note: An alternative link-share method is to download the activity
              file and host it on the web for public access. The easiest method
              is to host them on a free public{" "}
              <a href="https://github.com" target="_blank" rel="noreferrer">
                GitHub
              </a>{" "}
              and use our link-build tool below. Here is a working example{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="http://www.classinteractives.co.uk?txt=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fbakerpdgit%2Flearning-interactives%40main%2Fsrc%2Fexamples%2FExampleInteractiveFile.txt"
              >
                link
              </a>{" "}
              pulling from an example file hosted on this project's GitHub via
              jsDelivr.
            </p>
          </div>
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
              If you have added your activity file to a public GitHub
              repository, you can construct the share URL to give to students
              automatically by browsing to it below:
              <br />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
              />
              <button onClick={handleFindRepositories}>
                Find Public Repositories
              </button>
              {history.length > 1 && (
                <button onClick={handleUpClick}>Up</button>
              )}
              <ul>
                {paginatedItems.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      if (history[history.length - 1].type === "repos") {
                        handleRepoClick(item.name);
                      } else if (
                        history[history.length - 1].type === "branches"
                      ) {
                        handleBranchClick(item.name);
                      } else if (history[history.length - 1].type === "files") {
                        handleFileClick(item.path);
                      }
                    }}
                  >
                    {item.name || item.path}
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
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
