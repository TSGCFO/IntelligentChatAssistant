import { useState, useRef } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file_id: string;
  filename: string;
  size: number;
  type: string;
  upload_date: string;
}

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  disabled?: boolean;
}

export default function FileUpload({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  disabled
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest('POST', '/api/files/upload', formData);
      const uploadedFile = await response.json();

      onFileUploaded(uploadedFile);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('text') || type.includes('plain')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
    if (type.includes('document') || type.includes('word')) return '📃';
    if (type.includes('video/')) return '🎥';
    if (type.includes('audio/')) return '🎵';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    if (type.includes('json') || type.includes('xml')) return '⚙️';
    if (type.includes('code') || type.includes('javascript') || type.includes('python')) return '💻';
    return '📁';
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
          accept="*"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isUploading ? "Uploading..." : "Attach file"}</span>
        </Button>
        
        <span className="text-xs text-muted-foreground">
          PDF, images, text files (max 100MB)
        </span>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.file_id}
              className="flex items-center justify-between p-2 bg-muted rounded-lg border"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileRemoved(file.file_id)}
                className="h-8 w-8 p-0 flex-shrink-0"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}