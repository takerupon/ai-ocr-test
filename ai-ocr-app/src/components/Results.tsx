import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderData } from "@/types/order";
import { Download, Info } from "lucide-react";

interface ResultsProps {
  file: File | null;
  data: OrderData | null;
  isLoading: boolean;
  onExport: () => void;
}

export const Results = ({ file, data, isLoading, onExport }: ResultsProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-600">発注書から情報を抽出しています...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!file && !data) {
    return (
      <Card className="shadow-sm bg-gray-50 border border-dashed border-gray-300">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-6 w-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              発注書をアップロードすると、ここに結果が表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // プレビュー表示と結果表示のレイアウト
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* プレビュー表示 */}
        {previewUrl && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">アップロードされた画像</h3>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-gray-200">
              <img
                src={previewUrl}
                alt="アップロードされた発注書"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {data && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">抽出結果</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <div className="text-xs text-gray-500">発注書番号</div>
                <div className="text-sm font-medium">{data.orderNumber || "不明"}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <div className="text-xs text-gray-500">発注日</div>
                <div className="text-sm font-medium">{data.orderDate || "不明"}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <div className="text-xs text-gray-500">取引先</div>
              <div className="text-sm font-medium">{data.supplier || "不明"}</div>
            </div>

            {/* 商品リスト */}
            {data.items && data.items.length > 0 ? (
              <div>
                <div className="text-xs text-gray-500 mb-1">商品リスト</div>
                <div className="border rounded overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          商品名
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          数量
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          単価
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          金額
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.items.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 text-xs">{item.name}</td>
                          <td className="px-3 py-2 text-xs">{item.quantity}</td>
                          <td className="px-3 py-2 text-xs text-right">
                            {item.unitPrice ? `¥${item.unitPrice.toLocaleString()}` : ""}
                          </td>
                          <td className="px-3 py-2 text-xs text-right font-medium">
                            {item.amount ? `¥${item.amount.toLocaleString()}` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-2 rounded border border-gray-200 text-sm text-gray-600">
                商品情報が見つかりませんでした
              </div>
            )}

            {/* 合計金額 */}
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-200">
              <div>
                <div className="text-xs text-gray-500">合計金額</div>
                <div className="text-base font-bold">
                  {data.totalAmount ? `¥${data.totalAmount.toLocaleString()}` : "不明"}
                </div>
              </div>
              <Button onClick={onExport} size="sm" className="font-medium">
                <Download className="h-4 w-4 mr-1" />
                Excelで保存
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
