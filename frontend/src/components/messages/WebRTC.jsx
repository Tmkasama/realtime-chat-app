import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const WebRTCExample = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callType, setCallType] = useState(""); // "video" or "voice"
  const peerConnection = useRef();
  const remoteVideoRef = useRef();
  const localVideoRef = useRef();

  const socket = useRef(io("http://localhost:3000/"));

  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        peerConnection.current = new RTCPeerConnection();
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = handleRemoteTrack;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.current.on("offer", handleIncomingCall);
        socket.current.on("answer", handleAnswer);
        socket.current.on("candidate", handleCandidate);
      } catch (error) {
        console.error("Error initializing WebRTC:", error);
      }
    };

    initializeWebRTC();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  const sendOfferToSignalingServer = async (offer) => {
    try {
      socket.current.emit("offer", offer);
    } catch (error) {
      console.error("Error sending offer to signaling server:", error);
    }
  };

  const handleIncomingCall = async (offer) => {
    setIsIncomingCall(true);
  };

  const acceptCall = () => {
    setIsIncomingCall(false);
    // Implement logic to accept the call
  };

  const declineCall = () => {
    setIsIncomingCall(false);
    // Implement logic to decline the call
  };

  const startVideoCall = async () => {
    try {
      // Reset local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      // Recreate peer connection
      peerConnection.current = new RTCPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      sendOfferToSignalingServer(offer);
      console.log("Success");
      setIsCalling(true);
      setCallType("video");
    } catch (error) {
      console.error("Error starting video call:", error.message);
    }
  };

  const startVoiceCall = async () => {
    try {
      // Reset local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setLocalStream(stream);

      // Recreate peer connection
      peerConnection.current = new RTCPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      sendOfferToSignalingServer(offer);
      console.log("Success");
      setIsCalling(true);
      setCallType("voice");
    } catch (error) {
      console.error("Error starting voice call:", error.message);
    }
  };

  const stopCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      setLocalStream(null);
      remoteVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = null;
      setIsCalling(false);
    }
  };

  const buttonStyle = {
    scale: "1.5",
    margin: "5px",
  };

  return (
    <div>
      <div className="text-center text-[10px] gap-7">
        <button
          className="call-button"
          style={buttonStyle}
          onClick={startVideoCall}
        >
          Video Call
        </button>
        <button
          className="call-button"
          style={buttonStyle}
          onClick={startVoiceCall}
        >
          Voice Call
        </button>
        <button className="call-button" style={buttonStyle} onClick={stopCall}>
          Stop Call
        </button>
      </div>

      {isIncomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Incoming Call</h2>
            <div className="flex justify-center ">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mr-4"
                onClick={acceptCall}
              >
                Accept
              </button>

              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={declineCall}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalling && (
        <div>
          <video ref={remoteVideoRef} autoPlay></video>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            style={{ width: "100%" }}
          ></video>
        </div>
      )}
    </div>
  );
};

export default WebRTCExample;
