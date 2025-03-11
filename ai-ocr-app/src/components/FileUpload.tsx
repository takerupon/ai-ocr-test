import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, FileText } from "lucide-react";

// 許可する画像形式
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "image/tiff",
];

// 最大ファイルサイズ（20MB）
const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("サポートされていないファイル形式です。画像ファイルをアップロードしてください。");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`ファイルサイズが大きすぎます。20MB以下のファイルをアップロードしてください。`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div
          className={`border border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className={`h-6 w-6 ${isDragging ? "text-primary" : "text-gray-400"}`} />
            <div className="text-sm text-gray-600">
              {isDragging ? "ファイルをドロップ" : "ファイルをドラッグ、または選択してください"}
            </div>
            <div className="text-xs text-gray-500">JPEG, PNG, WebP, HEIC, PDF, TIFF (最大20MB)</div>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="truncate max-w-[200px] text-sm text-gray-700">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFile}
                className="h-6 w-6 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mt-3 flex justify-end">
            <Button onClick={handleUpload} disabled={isLoading} size="sm" className="font-medium">
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>処理中...</span>
                </div>
              ) : (
                "抽出開始"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
