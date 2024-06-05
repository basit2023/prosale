import { useState, useRef } from "react";
import { saveAs } from 'file-saver'; // Import file-saver to save recorded audio file

const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const audioRef = useRef(null);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);

                // Initialize MediaRecorder
                const recorder = new MediaRecorder(streamData);
                setMediaRecorder(recorder);

                // Set up event listeners for MediaRecorder
                recorder.ondataavailable = (event) => {
                    const audioBlob = new Blob([event.data], { type: 'audio/wav' });
                    saveAs(audioBlob, 'recorded-audio.wav'); // Save recorded audio file
                };

                recorder.onstop = () => {
                    setRecording(false);
                };
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.start();
            setRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };

    return (
        <div>
            <h2>Audio Recorder</h2>
            <main>
                <div className="audio-controls">
                    {!permission ? (
                        <button onClick={getMicrophonePermission} type="button">
                            Get Microphone
                        </button>
                    ): null}
                    {permission && !recording ? (
                        <button onClick={startRecording} type="button">
                            Start Recording
                        </button>
                    ): null}
                    {permission && recording ? (
                        <button onClick={stopRecording} type="button">
                            Stop Recording
                        </button>
                    ): null}
                </div>
                <audio ref={audioRef} controls />
            </main>
        </div>
    );
};
export default AudioRecorder;
