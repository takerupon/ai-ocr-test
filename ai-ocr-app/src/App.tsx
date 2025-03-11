import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { extractOrderDataFromImage, isGeminiApiConfigured } from "@/services/geminiService";
import { exportToExcel } from "@/services/excelService";
import { OrderData } from "@/types/order";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [apiConfigured, setApiConfigured] = useState(true);

  useEffect(() => {
    // APIキーが設定されているか確認
    setApiConfigured(isGeminiApiConfigured());
  }, []);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsLoading(true);
    setOrderData(null);

    try {
      // Gemini APIを使用して画像から情報を抽出
      const data = await extractOrderDataFromImage(uploadedFile);
      setOrderData(data);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI OCR 発注書情報抽出</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            発注書の画像をアップロードして、AIが自動的に情報を抽出します
          </p>
        </header>

        {!apiConfigured && (
          <Alert
            variant="default"
            className="mb-8 max-w-4xl mx-auto shadow-sm border-amber-200 bg-amber-50"
          >
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-800 font-medium">
              APIキーが設定されていません
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Gemini APIキーが設定されていないため、デモモードで動作しています。
              実際のデータ抽出を行うには、.envファイルにAPIキーを設定してください。
            </AlertDescription>
          </Alert>
        )}

        <main className="w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
              <ImagePreview file={file} />
            </div>
            <div>
              <ResultsDisplay data={orderData} isLoading={isLoading} onExport={handleExport} />
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AI OCR 発注書情報抽出システム</p>
        </footer>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
