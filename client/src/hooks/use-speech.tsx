import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseSpeechOptions {
  onTranscriptChange?: (transcript: string) => void;
  onSpeechEnd?: (finalTranscript: string) => void;
  onSpeechStart?: () => void;
  autoStart?: boolean;
  continuous?: boolean;
  language?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error?: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export function useSpeechRecognition({
  onTranscriptChange,
  onSpeechEnd,
  onSpeechStart,
  autoStart = false,
  continuous = false,
  language = 'en-US'
}: UseSpeechOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // Additional checks for better browser compatibility
    const isSecureContext = window.isSecureContext || location.protocol === 'https:';
    const hasPermission = navigator.permissions;
    
    if (SpeechRecognition && isSecureContext) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        onSpeechStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            currentTranscript += result[0].transcript;
          } else {
            currentTranscript += result[0].transcript;
          }
        }
        
        setTranscript(currentTranscript);
        onTranscriptChange?.(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        onSpeechEnd?.(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice features",
            variant: "destructive",
          });
        } else if (event.error === 'no-speech') {
          toast({
            title: "No speech detected",
            description: "Please try speaking closer to your microphone",
            variant: "destructive",
          });
        }
      };

      if (autoStart) {
        startListening();
      }
    } else {
      setIsSupported(false);
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition. Please use a modern browser like Chrome or Edge.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, autoStart, onTranscriptChange, onSpeechEnd, onSpeechStart, toast, transcript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setError(null);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
}

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setIsSupported(false);
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech functionality",
        variant: "destructive",
      });
    }
  }, [toast]);

  const speak = useCallback((text: string, options: {
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.voice = options.voice || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech synthesis error",
        description: "Failed to read the text aloud",
        variant: "destructive",
      });
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, voices, toast]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
  }, []);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
    pause,
    resume
  };
}