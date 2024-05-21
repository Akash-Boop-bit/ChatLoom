import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';


function VoiceToTextInput({ inputText, setInputText }) {
  const [isListening, setIsListening] = useState(false);

  const handleStartListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech recognition started");
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      setInputText(transcript);
      console.log("Transcript:", transcript);
    };

    recognition.start();
  };

  return (
    <div style={{ display: "inline-block", marginLeft: "1vh" }}>
      <button onClick={handleStartListening} disabled={isListening}>
        {isListening ? (
          "Listening..."
        ) : (
          <FontAwesomeIcon icon={faMicrophone} />
        )}
      </button>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Speak into the microphone..."
        style={{ display: "none" }}
        rows={4}
      />
    </div>
  );
}

export default VoiceToTextInput;
