import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // ファイルタイプの検証
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("サポートされていないファイル形式です。画像ファイルをアップロードしてください。");
      return false;
    }

    // ファイルサイズの検証
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
        // 自動アップロードはコメントアウト - 必要に応じて有効化
        // onFileUpload(file);
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
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
        // 自動アップロードはコメントアウト - 必要に応じて有効化
        // onFileUpload(file);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getFileTypeLabel = () => {
    return "JPEG, PNG, WebP, HEIC, PDF, TIFF (最大20MB)";
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-gray-800">発注書アップロード</CardTitle>
        <CardDescription className="text-gray-600">
          発注書の画像をアップロードして情報を抽出します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[0.98]"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={`p-3 rounded-full ${
                isDragging ? "bg-primary/10" : "bg-gray-100"
              } transition-colors duration-200`}
            >
              <Upload
                className={`h-8 w-8 ${isDragging ? "text-primary" : "text-gray-400"}`}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-sm font-medium text-gray-700">
              {isDragging
                ? "ファイルをドロップしてください"
                : "ここにファイルをドラッグ&ドロップするか"}
            </div>
            <Button variant="outline" size="sm" type="button" className="mt-1 font-medium">
              ファイルを選択
            </Button>
            <div className="text-xs text-gray-500 mt-2">{getFileTypeLabel()}</div>
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
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <Label className="text-xs text-gray-500 mb-1 block">選択されたファイル:</Label>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="truncate max-w-[180px] font-medium text-gray-700">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="h-7 w-7 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className="relative font-medium"
        >
          {isLoading ? (
            <>
              <span className="opacity-0">アップロード</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              </span>
            </>
          ) : (
            "アップロード"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
