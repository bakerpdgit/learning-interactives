import "./TextInput.css";
import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router";
import { useEditContext } from "../EditContext";
import LZString from "lz-string";
import { handleImageFileChange } from "../ImageUploads";

export const LOCAL_MARKER = "[local]";

const compressText = (text) => {
  return LZString.compressToEncodedURIComponent(text);
};

const decompressText = (compressedText) => {
  return LZString.decompressFromEncodedURIComponent(compressedText);
};

function TextInput({
  interactiveId,
  instructions,
  defaultVal = "",
  invalidTxt,
  showUpload,
  showRecord,
}) {
  const history = useHistory();
  const location = useLocation();
  const [text, setText] = useState(defaultVal);
  const [url, setUrl] = useState("");
  const { enableEdit, setTextData, imageData, setImageData } = useEditContext();
  const [updating, setUpdating] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const mediaRecorderRef = useRef(null);

  const handleCompressAndNavigate = () => {
    let txtSubmitted = text.trim();

    // Add the URL or local marker if present
    if (showUpload && url) {
      txtSubmitted += "\n" + url;
    }

    if (!txtSubmitted) {
      return;
    }

    setTextData(txtSubmitted);

    enableEdit();
    const params = new URLSearchParams({
      id: interactiveId,
      txt: compressText("localrun"),
    });
    history.replace({ pathname: location.pathname, search: params.toString() });
  };

  useEffect(() => {
    // Process defaultVal to extract URL or local marker
    const lines = defaultVal.split("\n");
    const lastLine = lines[lines.length - 1];
    if (
      lastLine === LOCAL_MARKER ||
      lastLine.startsWith("http:") ||
      lastLine.startsWith("https:") ||
      lastLine.startsWith("data:") ||
      lastLine.startsWith("file:")
    ) {
      lines.pop();
      setText(lines.join("\n"));
      setUrl(lastLine);
    } else {
      setText(defaultVal);
    }
  }, [defaultVal]);

  const errorMessage = invalidTxt ? (
    <div className="error-message">
      The provided text is in an invalid format for this interactive. Please
      correct it below or return to this interactive via the homepage to start
      again with example input.
    </div>
  ) : null;

  // Function to update image/audio data
  const updateMediaData = (data) => {
    setImageData(data);
    setUrl(LOCAL_MARKER);
    setUpdating(false);
  };

  // Function to get the supported MIME type for recording
  const getSupportedMimeType = () => {
    const possibleTypes = [
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/wav",
    ];
    for (const mimeType of possibleTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return "";
  };

  // Start recording audio
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          alert("No supported audio format found for recording.");
          return;
        }
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        const localAudioChunks = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(localAudioChunks, { type: mimeType });
          const audioURL = URL.createObjectURL(audioBlob);
          setAudioURL(audioURL);
          updateMediaData(audioBlob); // Store the audio data
          setIsRecording(false);
          // Stop all tracks to release the microphone
          stream.getTracks().forEach((track) => track.stop());
        };
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
        alert("Could not access the microphone. Please check permissions.");
      });
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // Add this function inside your TextInput component
  const clearRecording = () => {
    setAudioURL("");
    setImageData(null);
  };

  return (
    <>
      {errorMessage}
      <div className="textInputContainer">
        <div className="interactiveBox">
          <p>{instructions || "Provide some text for this interactive:"}</p>
          <textarea
            disabled={updating || isRecording}
            className="interactiveTextArea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          {showUpload && (
            <div className="imageUploadContainer">
              <div>Enter an image URL or browse to a local image file:</div>
              <input
                type="text"
                placeholder="Image URL"
                disabled={updating}
                className="imageTextArea"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              ></input>
              <input
                type="file"
                className="fileUpload"
                accept="image/*"
                onChange={(event) => {
                  setUpdating(true);
                  handleImageFileChange(event.target.files[0], (data) =>
                    updateMediaData(data)
                  );
                }}
              />
              {url && (
                <img
                  src={url === LOCAL_MARKER ? imageData : url}
                  alt="Thumbnail"
                  style={{ width: "100px", height: "auto" }}
                />
              )}
            </div>
          )}

          {showRecord && (
            <div className="audioRecordContainer">
              <div>Record audio using your microphone:</div>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={updating}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              <button
                onClick={clearRecording}
                disabled={isRecording || updating || !audioURL}
                style={{ marginLeft: "10px" }}
              >
                Clear Recording
              </button>
              {audioURL && (
                <audio
                  controls
                  src={audioURL}
                  style={{ marginTop: "10px" }}
                ></audio>
              )}
            </div>
          )}

          <button
            onClick={handleCompressAndNavigate}
            disabled={updating || isRecording}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default TextInput;
export { compressText, decompressText };
