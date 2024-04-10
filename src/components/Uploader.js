import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useEditContext } from "../EditContext";
import { decompressText } from "./TextInput";
import styles from "./Uploader.module.css";

function Uploader() {
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { setTextData } = useEditContext();
  const [urlLine, setUrlLine] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  const history = useHistory();
  const location = useLocation();

  const handleUploadFileChange = (event) => {
    setFileUploaded(false);
    setFile(event.target.files[0]);
    setErrorMsg(null);
  };

  const handleFileEdit = () => {
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
    } else {
      setErrorMsg("Invalid file content");
    }
  };

  const handleFileRun = () => {
    const url = new URL(urlLine);
    const params = url.searchParams;
    // Retrieve the value of 'txt' parameter
    const txtValue = params.get("txt");
    const idValue = params.get("id");

    if (txtValue) {
      const params = new URLSearchParams({
        id: idValue,
        txt: txtValue,
      });
      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    } else {
      setErrorMsg("Invalid file content");
    }
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileContent = event.target.result;
        extractInfo(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const extractInfo = (fileContent) => {
    const lines = fileContent.split("\n");

    const textDataLine = lines.find((line) => line.includes("ActivityData:"));

    if (textDataLine) {
      setTextData(decompressText(textDataLine.replace("ActivityData:", "")));
    }

    const urlLineFound = lines.find(
      (line) =>
        (line.includes("localhost") ||
          line.includes("classinteractives.co.uk")) &&
        line.includes("?id=")
    );

    if (urlLineFound) {
      setUrlLine(urlLineFound);
      setFileUploaded(true);
    } else {
      setErrorMsg("Invalid file content");
    }
  };

  return (
    <>
      <h1 className="interactiveTitle">Load Saved Interactive</h1>
      <p className="instructions">
        Browse to the saved interactive .txt file...
      </p>
      <div className={`interactiveContainer ${styles.uploadContainer}`}>
        <input
          type="file"
          onChange={handleUploadFileChange}
          style={{ display: "none" }} // Hide the input
          id="fileUpload" // Add an id for referencing
        />
        <label htmlFor="fileUpload" className={styles.customFileUpload}>
          Choose File
        </label>
        {file && (
          <div className={styles.fileName}>
            {errorMsg ? errorMsg : file.name}
          </div>
        )}
        {file && <button onClick={handleFileUpload}>Upload</button>}
        <div>
          {fileUploaded && <button onClick={handleFileRun}>Run</button>}
          {fileUploaded && <button onClick={handleFileEdit}>Edit</button>}
        </div>
      </div>
    </>
  );
}

export default Uploader;
