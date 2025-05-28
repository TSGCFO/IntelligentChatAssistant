import { useEffect } from "react";
import { useSpeechSynthesis } from "@/hooks/use-speech";

interface AccessibilityAnnouncerProps {
  message: string;
  isVoiceMode: boolean;
  autoRead: boolean;
  isAIMessage: boolean;
}

export default function AccessibilityAnnouncer({
  message,
  isVoiceMode,
  autoRead,
  isAIMessage
}: AccessibilityAnnouncerProps) {
  const { speak, isSupported } = useSpeechSynthesis();

  useEffect(() => {
    // Only auto-read AI messages when voice mode is active and auto-read is enabled
    if (isVoiceMode && autoRead && isAIMessage && message && isSupported) {
      // Small delay to ensure the message is rendered
      const timer = setTimeout(() => {
        speak(message, { rate: 0.9, volume: 0.8 });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [message, isVoiceMode, autoRead, isAIMessage, speak, isSupported]);

  // This component doesn't render anything visible
  return null;
}