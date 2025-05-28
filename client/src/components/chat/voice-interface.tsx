import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceInterfaceProps {
  onVoiceMessage: (message: string) => void;
  onReadMessage: (message: string) => void;
  isVoiceMode: boolean;
  onToggleVoiceMode: () => void;
  disabled?: boolean;
}

export default function VoiceInterface({
  onVoiceMessage,
  onReadMessage,
  isVoiceMode,
  onToggleVoiceMode,
  disabled = false
}: VoiceInterfaceProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [speechRate, setSpeechRate] = useState([1]);
  const [speechPitch, setSpeechPitch] = useState([1]);
  const [speechVolume, setSpeechVolume] = useState([0.8]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const { toast } = useToast();

  const {
    isListening,
    isSupported: speechRecognitionSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onSpeechEnd: (finalTranscript) => {
      if (finalTranscript.trim()) {
        onVoiceMessage(finalTranscript.trim());
        resetTranscript();
      }
    },
    continuous: false,
    language: 'en-US'
  });

  const {
    isSupported: speechSynthesisSupported,
    isSpeaking,
    voices,
    speak,
    stop: stopSpeaking,
    pause,
    resume
  } = useSpeechSynthesis();

  // Set default voice when voices are loaded
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      const defaultVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.default
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      setSelectedVoice(defaultVoice.name);
    }
  }, [voices, selectedVoice]);

  const handleVoiceToggle = () => {
    if (!speechRecognitionSupported || !speechSynthesisSupported) {
      toast({
        title: "Voice features not available",
        description: "Your browser doesn't support voice features. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    onToggleVoiceMode();
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReadAloud = (text: string) => {
    if (!text.trim()) return;
    
    const selectedVoiceObj = voices.find(voice => voice.name === selectedVoice);
    speak(text, {
      voice: selectedVoiceObj,
      rate: speechRate[0],
      pitch: speechPitch[0],
      volume: speechVolume[0]
    });
  };

  const isVoiceSupported = speechRecognitionSupported && speechSynthesisSupported;

  return (
    <div className="voice-interface">
      {/* Voice Mode Toggle */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={handleVoiceToggle}
            disabled={disabled || !isVoiceSupported}
            className="flex items-center space-x-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice Mode</span>
          </Button>
          
          {!isVoiceSupported && (
            <Badge variant="destructive" className="text-xs">
              Not Supported
            </Badge>
          )}
          
          {isVoiceMode && isVoiceSupported && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="p-2"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Voice Controls - Show when voice mode is active */}
      {isVoiceMode && isVoiceSupported && (
        <div className="p-3 space-y-3 bg-muted/20">
          {/* Microphone Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="sm"
                onClick={handleMicToggle}
                disabled={disabled}
                className="flex items-center space-x-2"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? "Stop" : "Start"} Listening</span>
              </Button>
              
              {isListening && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Listening...</span>
                </div>
              )}
            </div>

            {/* Speech Control */}
            <div className="flex items-center space-x-2">
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pause}
                  className="p-2"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="p-2"
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Live Transcript */}
          {transcript && (
            <Card className="p-3">
              <div className="text-sm">
                <Label className="text-xs text-muted-foreground">Live Transcript:</Label>
                <p className="mt-1 text-foreground">{transcript}</p>
              </div>
            </Card>
          )}

          {/* Speech Error */}
          {speechError && (
            <Card className="p-3 border-destructive bg-destructive/5">
              <div className="text-sm text-destructive">
                Speech Error: {speechError}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Voice Settings Panel */}
      {showSettings && isVoiceSupported && (
        <div className="p-4 border-t bg-background space-y-4">
          <h3 className="font-medium text-sm">Voice Settings</h3>
          
          {/* Auto-read toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-read" className="text-sm">
              Auto-read AI responses
            </Label>
            <Switch
              id="auto-read"
              checked={autoRead}
              onCheckedChange={setAutoRead}
            />
          </div>

          <Separator />

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speech Rate */}
          <div className="space-y-2">
            <Label className="text-sm">Speech Rate: {speechRate[0]}</Label>
            <Slider
              value={speechRate}
              onValueChange={setSpeechRate}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Speech Pitch */}
          <div className="space-y-2">
            <Label className="text-sm">Speech Pitch: {speechPitch[0]}</Label>
            <Slider
              value={speechPitch}
              onValueChange={setSpeechPitch}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Speech Volume */}
          <div className="space-y-2">
            <Label className="text-sm">Volume: {Math.round(speechVolume[0] * 100)}%</Label>
            <Slider
              value={speechVolume}
              onValueChange={setSpeechVolume}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Test Voice */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReadAloud("This is a test of the selected voice settings.")}
            disabled={isSpeaking}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Voice
          </Button>
        </div>
      )}

      {/* Accessibility Instructions */}
      {isVoiceMode && (
        <div className="p-3 text-xs text-muted-foreground bg-muted/10 border-t">
          <p><strong>Keyboard shortcuts:</strong></p>
          <p>• Space: Start/stop listening</p>
          <p>• Escape: Stop speech</p>
          <p>• Enter: Send voice message</p>
        </div>
      )}
    </div>
  );
}