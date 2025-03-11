import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import { Results } from "@/components/Results";
import { extractOrderDataFromImage, isGeminiApiConfigured } from "@/services/geminiService";
import { exportToExcel } from "@/services/excelService";
import { OrderData } from "@/types/order";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [apiConfigured, setApiConfigured] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setApiConfigured(isGeminiApiConfigured());
  }, []);

  // 処理進行状況のシミュレーション
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    }
  }, [isLoading]);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsLoading(true);
    setOrderData(null);
    setProgress(10);

    try {
      const data = await extractOrderDataFromImage(uploadedFile);
      setOrderData(data);
      setProgress(100);

      if (!apiConfigured) {
        toast.warning("デモモードで動作しています。実際のデータは抽出されていません。");
      } else {
        toast.success("発注書の情報を抽出しました");
      }
    } catch (error) {
      console.error("処理エラー:", error);
      toast.error("情報の抽出に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!orderData) return;

    try {
      await exportToExcel(orderData);
      toast.success("Excelファイルをダウンロードしました");
    } catch (error) {
      console.error("エクスポートエラー:", error);
      toast.error("Excelファイルの生成に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI OCR 発注書情報抽出</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            発注書の画像をアップロードして、AI技術で自動的に情報を抽出します
          </p>
        </header>

        {!apiConfigured && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 text-sm">
              Gemini APIキーが設定されていないため、デモモードで動作しています。
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

            {isLoading && (
              <div className="mt-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-center mb-2 text-sm text-gray-700">
                  <span>処理中...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AIが発注書の情報を分析しています
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <Results file={file} data={orderData} isLoading={isLoading} onExport={handleExport} />
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
          <p>
            © {new Date().getFullYear()} AI OCR 発注書情報抽出システム |
            あらゆる発注書を素早く正確に処理
          </p>
        </footer>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
