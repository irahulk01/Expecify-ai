"use client";

import { useState, useRef, useCallback } from "react";

// ─── Speech Recognition Types ────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export function useSpeechRecognition(onFinalize: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTextRef = useRef("");
  const sentThisSessionRef = useRef(false);

  const stopRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(async () => {
    setVoiceError(null);
    setInterimText("");
    setIsListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Your browser does not support Speech Recognition.");
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Set to English (India) for better accent support

      recognition.onstart = () => {
        sentThisSessionRef.current = false;
        currentTextRef.current = "";
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        setInterimText(transcript);
        currentTextRef.current = transcript;

        // Reset silence timer on every result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          stopRecognition();
        }, 3000); // 3-second window
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setVoiceError("Microphone access denied. Please allow microphone permissions.");
        } else {
          setVoiceError(`Speech error: ${event.error}`);
        }
        stopRecognition();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        // When microphone stops, automatically send the recognized text
        if (currentTextRef.current.trim() && !sentThisSessionRef.current) {
          sentThisSessionRef.current = true;
          onFinalize(currentTextRef.current.trim());
          setInterimText("");
          currentTextRef.current = "";
        }
      };

      // Request permissions first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognition.start();
    } catch (err: any) {
      console.error("Mic error:", err);
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setVoiceError("Microphone access denied. Please check your browser permissions.");
      } else if (err.name === "NotFoundError") {
        setVoiceError("No microphone found. Please connect a microphone.");
      } else {
        setVoiceError("Could not access microphone.");
      }
      setIsListening(false);
    }
  }, [onFinalize, stopRecognition]);

  return {
    isListening,
    interimText,
    voiceError,
    startRecognition,
    stopRecognition,
    setVoiceError,
  };
}
