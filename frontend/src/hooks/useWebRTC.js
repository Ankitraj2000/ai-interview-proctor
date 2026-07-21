import { useState, useRef, useEffect } from 'react';

export const useWebRTC = (onTelemetry) => {
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [error, setError] = useState(null);
  const [isProctoring, setIsProctoring] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioProcessorRef = useRef(null);

  // Stop all active tracks on a stream
  const stopStreamTracks = (targetStream) => {
    if (targetStream) {
      targetStream.getTracks().forEach(track => track.stop());
    }
  };

  // Start candidate's webcam and microphone streams
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 15 },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (err) {
      console.error("Error accessing camera/microphone:", err);
      setError("Failed to access camera or microphone. Please check system permissions.");
      throw err;
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      setError(null);
      const screenMediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      setScreenStream(screenMediaStream);
      return screenMediaStream;
    } catch (err) {
      console.error("Error accessing screen share:", err);
      setError("Screen sharing permission denied or failed to initialize.");
      throw err;
    }
  };

  // Stop camera and mic
  const stopCamera = () => {
    stopStreamTracks(stream);
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    stopStreamTracks(screenStream);
    setScreenStream(null);
  };

  // Initialize audio processing to estimate amplitude decibels
  const initAudioProcessing = (mediaStream, wsConn) => {
    try {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(mediaStream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      audioProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Handle raw audio input buffers
      processor.onaudioprocess = (e) => {
        if (!wsConn || wsConn.readyState !== WebSocket.OPEN) return;

        const inputBuffer = e.inputBuffer.getChannelData(0);
        
        // Convert Float32Array PCM to 16-bit IntPCM base64
        const bufferLength = inputBuffer.length;
        const int16Buffer = new Int16Array(bufferLength);
        for (let i = 0; i < bufferLength; i++) {
          // Clamp values between -1 and 1
          const s = Math.max(-1, Math.min(1, inputBuffer[i]));
          int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert int16 buffer to binary representation base64
        const binaryString = String.fromCharCode.apply(null, new Uint8Array(int16Buffer.buffer));
        const base64Audio = btoa(binaryString);

        // We will send this chunk to the WebSocket handler along with the next image frame.
        // To prevent packet overload, we can store it in a ref and append it to the next video payload.
        wsRef.current.latestAudio = base64Audio;
      };
    } catch (err) {
      console.warn("Failed to initialize audio processor:", err);
    }
  };

  const sessionIdRef = useRef(null);

  // Start sending frame streams over WebSocket
  const startProctoring = (sessionId) => {
    if (isProctoring) return;
    sessionIdRef.current = sessionId;
    
    setIsProctoring(true);
    // Derive WebSocket URL from current window location so it works in both
    // local dev (Vite proxy: /ws → localhost:8000) and Docker (Nginx: /ws → ai-service:8000)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/proctor/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Connection Opened for session:", sessionId);
      setWsConnected(true);
      if (stream) {
        initAudioProcessing(stream, ws);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onTelemetry) {
          onTelemetry(data);
        }
      } catch (err) {
        console.error("Error parsing WebSocket telemetry payload:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket Connection Closed");
      setWsConnected(false);
      setIsProctoring(false);
      clearInterval(intervalRef.current);

      // Auto-reconnect if session is active
      const activeSession = sessionIdRef.current;
      if (activeSession) {
        setTimeout(() => {
          if (sessionIdRef.current === activeSession) {
            console.log("Auto-reconnecting WebSocket for session:", activeSession);
            startProctoring(activeSession);
          }
        }, 1500);
      }
    };

    // Frame capture interval: Every 500ms (2 FPS)
    intervalRef.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Auto-recover video.srcObject if unattached
      if (stream && video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch(() => {});
      }

      // Sync canvas dimensions (640x480 for accurate YOLO object & face recognition)
      if (video.videoWidth) {
        canvas.width = 640;
        canvas.height = 480;
        
        // Draw frame from HTML5 video element
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Compress frame to JPEG format (0.8 quality for clear object detection)
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        // Fetch cached audio chunks
        const base64Audio = wsRef.current.latestAudio || null;
        wsRef.current.latestAudio = null; // Clear queue

        const payload = {
          image: base64Image,
          audio: base64Audio
        };

        ws.send(JSON.stringify(payload));
      }
    }, 500);
  };

  // Stop WebSocket proctoring feed
  const stopProctoring = () => {
    sessionIdRef.current = null;
    setIsProctoring(false);
    clearInterval(intervalRef.current);
    
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsConnected(false);
  };

  // Ensure video element srcObject is updated whenever stream is active or video element mounts
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn("Video play error:", err));
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProctoring();
      stopCamera();
      stopScreenShare();
    };
  }, []);

  return {
    stream,
    screenStream,
    error,
    isProctoring,
    wsConnected,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    startScreenShare,
    stopScreenShare,
    startProctoring,
    stopProctoring
  };
};
