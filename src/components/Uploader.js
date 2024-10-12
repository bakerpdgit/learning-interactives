import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useEditContext } from "../EditContext";
import { compressText, decompressText } from "./TextInput";
import InputModal from "./InputModal";
import styles from "./Uploader.module.css";

export const ACTIVITY_IMAGE_SEPARATOR = "|~|";
export const ACTIVITY_AUDIO_SEPARATOR = "|¦|";

function Uploader() {
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { setTextData, setImageData } = useEditContext();
  const [urlLine, setUrlLine] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const idValue = params.get("id");

    if (idValue) {
      const params = new URLSearchParams({
        id: idValue,
        txt: compressText("localedit"),
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
    const idValue = params.get("id");

    if (idValue) {
      const params = new URLSearchParams({
        id: idValue,
        txt: compressText("localrun"),
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

  const dataUrlToBlob = (dataUrl) => {
    const [prefix, base64Data] = dataUrl.split(",");
    const mimeMatch = prefix.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "";
    const byteString = atob(base64Data);
    const byteNumbers = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteNumbers[i] = byteString.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const loadAudioData = async (dataURL) => {
    setImageData(dataUrlToBlob(dataURL));
  };

  const extractInfo = (fileContent) => {
    const lines = fileContent.split("\n");

    let txtData = null;
    let imgData = null;
    let audioData = null;

    const activityDataLine = lines.find((line) =>
      line.includes("ActivityData:")
    );

    if (activityDataLine) {
      [txtData, imgData] = activityDataLine
        .replace("ActivityData:", "")
        .split(ACTIVITY_IMAGE_SEPARATOR);

      if (imgData) {
        setImageData(decompressText(imgData));
      }

      [txtData, audioData] = txtData.split(ACTIVITY_AUDIO_SEPARATOR);

      if (audioData) {
        loadAudioData(audioData);
      }

      if (txtData) {
        txtData = decompressText(txtData);
        setTextData(txtData);
      }
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

      const url = new URL(urlLineFound);
      const params = url.searchParams;
      const txtValue = params.get("txt");
      if (txtValue) {
        if (txtData) {
          const lines = txtData.split("\n");
          for (let index = 0; index < lines.length; index++) {
            if (lines[index].startsWith("data:")) {
              setImageData(lines[index]);
              lines[index] = "[local]";
            }
          }
          setTextData(lines.join("\n"));
        }

        const decompressedTxt = decompressText(txtValue);
        if (decompressedTxt && !decompressedTxt.startsWith("local")) {
          setTextData(decompressedTxt);
        }
      }
    } else {
      setErrorMsg("Invalid file content");
    }
  };

  const handleUrlSubmit = (inputValue) => {
    setIsModalOpen(false);
    extractInfo(inputValue.trim());
  };

  return (
    <>
      <h1 className="interactiveTitle">Load Saved Interactive</h1>
      <p className="instructions">
        Browse to the saved interactive .txt file or load from a URL...
      </p>
      <div className={`interactiveContainer ${styles.uploadContainer}`}>
        <input
          type="file"
          onChange={handleUploadFileChange}
          style={{ display: "none" }}
          id="fileUpload"
        />
        <label htmlFor="fileUpload" className={styles.customFileUpload}>
          Choose File
        </label>
        {file && (
          <div className={styles.fileName}>
            {errorMsg ? errorMsg : file.name}
          </div>
        )}
        {file && <button onClick={handleFileUpload}>Load File</button>}
        <button onClick={() => setIsModalOpen(true)}>Load URL</button>
        <div>
          {fileUploaded && <button onClick={handleFileRun}>Run</button>}
          {fileUploaded && <button onClick={handleFileEdit}>Edit</button>}
        </div>
      </div>
      {isModalOpen && (
        <InputModal
          title="Enter URL"
          placeholder="Paste your URL here"
          onSubmit={handleUrlSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default Uploader;
