import { Button } from "@/components/ui/button";
import { AlertTriangle, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceModeInfoProps {
  hasAnyVoiceSupport: boolean;
}

export default function VoiceModeInfo({ hasAnyVoiceSupport }: VoiceModeInfoProps) {
  const { toast } = useToast();

  const showAlternative = () => {
    toast({
      title: "Voice Input Alternative",
      description: "Use Windows key + H (Windows) or dictation features in your browser to speak into the text box.",
      duration: 6000
    });
  };

  if (!hasAnyVoiceSupport) {
    return (
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mx-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Voice features need HTTPS and browser permissions
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Edge/Replit preview has security restrictions for voice features
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={showAlternative}
            className="text-xs shrink-0 ml-2"
          >
            Show Alternative
          </Button>
        </div>
      </div>
    );
  }

  return null;
}