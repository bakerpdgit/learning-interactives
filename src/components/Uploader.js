import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import styles from "./Uploader.module.css";

function Uploader() {
  const [file, setFile] = useState(null);
  const history = useHistory();
  const location = useLocation();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileContent = event.target.result;
        extractAndLogInfo(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const extractAndLogInfo = (fileContent) => {
    const lines = fileContent.split("\n");
    const urlLine = lines.find(
      (line) => line.includes("localhost") || line.includes("classinteractives")
    );
    if (urlLine) {
      const url = new URL(urlLine);
      const params = url.searchParams;
      // Retrieve the value of 'txt' parameter
      const txtValue = params.get("txt");
      const idValue = params.get("id");

      if (txtValue) {
        const params = new URLSearchParams({
          id: idValue,
          txtedit: txtValue,
        });
        history.replace({
          pathname: location.pathname,
          search: params.toString(),
        });
      }
    } else {
      console.error("No valid URL found in the file.");
    }
  };

  return (
    <>
      <h1 className="interactiveTitle">Upload Saved Interactive</h1>
      <p className="instructions">
        Browse to the saved interactive .txt file...
      </p>
      <div className="interactiveContainer">
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }} // Hide the input
          id="fileUpload" // Add an id for referencing
        />
        <label htmlFor="fileUpload" className={styles.customFileUpload}>
          Choose File
        </label>
        {file && <div className={styles.fileName}>{file.name}</div>}
        {file && <button onClick={handleFileUpload}>Upload and edit</button>}
      </div>
    </>
  );
}

export default Uploader;
