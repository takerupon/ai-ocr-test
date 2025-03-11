import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderData } from "@/types/order";
import { FileText, Upload, Download, Clock } from "lucide-react";

interface ResultsDisplayProps {
  data: OrderData | null;
  isLoading: boolean;
  onExport: () => void;
}

export function ResultsDisplay({ data, isLoading, onExport }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md h-full flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary/70" />
            処理中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-600">発注書の情報を抽出しています</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md h-full flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">抽出結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-gray-100 mb-4">
              <Upload className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              発注書をアップロードしてください
            </h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              発注書の画像をアップロードすると、AIが自動的に情報を抽出します
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // データが空かどうかをチェック
  const isEmpty =
    !data.orderNumber &&
    !data.orderDate &&
    !data.supplier &&
    (!data.items || data.items.length === 0) &&
    !data.totalAmount;

  if (isEmpty) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md h-full flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">抽出結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-gray-100 mb-4">
              <FileText className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">情報を抽出できませんでした</h3>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              別の発注書画像を試すか、画像の品質を改善してください
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl text-gray-800">抽出結果</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-gray-500 mb-1">発注書番号</h3>
              <p className="text-sm font-semibold text-gray-800">{data.orderNumber || "不明"}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-gray-500 mb-1">発注日</h3>
              <p className="text-sm font-semibold text-gray-800">{data.orderDate || "不明"}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-xs font-medium text-gray-500 mb-1">取引先</h3>
            <p className="text-sm font-semibold text-gray-800">{data.supplier || "不明"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-1 text-gray-500" />
              商品リスト
            </h3>
            {data.items && data.items.length > 0 ? (
              <div className="mt-2 border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        商品名
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        数量
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        単価
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金額
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2.5 text-xs text-gray-800">{item.name}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-800">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right text-xs text-gray-800">
                          {item.unitPrice ? `¥${item.unitPrice.toLocaleString()}` : ""}
                        </td>
                        <td className="px-3 py-2.5 text-right text-xs font-medium text-gray-800">
                          {item.amount ? `¥${item.amount.toLocaleString()}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                商品情報が見つかりませんでした
              </p>
            )}
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="text-sm font-medium text-gray-700 mb-1">合計金額</h3>
            <p className="text-lg font-bold text-gray-900">
              {data.totalAmount ? `¥${data.totalAmount.toLocaleString()}` : "不明"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-3 border-t mt-4">
        <Button onClick={onExport} className="font-medium flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          Excelにエクスポート
        </Button>
      </CardFooter>
    </Card>
  );
}
