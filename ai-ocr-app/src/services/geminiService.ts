import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { OrderData } from "@/types/order";

// APIキーは環境変数から取得するか、開発時は直接設定
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// APIキーが設定されているか確認
const isApiKeyConfigured = API_KEY && API_KEY !== "your_gemini_api_key_here";

// Gemini AIの初期化（APIキーが設定されている場合のみ）
let genAI: GoogleGenerativeAI | null = null;
if (isApiKeyConfigured) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

// 安全性設定
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

/**
 * APIキーが設定されているかどうかを確認
 * @returns APIキーが設定されているかどうか
 */
export function isGeminiApiConfigured(): boolean {
  return isApiKeyConfigured;
}

/**
 * デモ用のモックデータを生成
 * @returns モックの発注書データ
 */
function generateMockData(): OrderData {
  return {
    orderNumber: "PO-2023-0001",
    orderDate: "2023年3月15日",
    supplier: "サンプル株式会社",
    items: [
      {
        name: "ノートパソコン",
        quantity: 2,
        unitPrice: 120000,
        amount: 240000,
      },
      {
        name: "モニター 24インチ",
        quantity: 3,
        unitPrice: 25000,
        amount: 75000,
      },
      {
        name: "ワイヤレスマウス",
        quantity: 5,
        unitPrice: 3000,
        amount: 15000,
      },
    ],
    totalAmount: 330000,
  };
}

/**
 * 画像から発注書情報を抽出する
 * @param imageFile 発注書の画像ファイル
 * @returns 抽出された発注書データ
 */
export async function extractOrderDataFromImage(imageFile: File): Promise<OrderData> {
  // APIキーが設定されていない場合はモックデータを返す
  if (!isApiKeyConfigured || !genAI) {
    console.warn("Gemini APIキーが設定されていません。モックデータを返します。");
    // 処理を遅延させてローディング状態を表示するため
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return generateMockData();
  }

  try {
    // モデルの取得 - gemini-1.5-pro または gemini-1.5-flash を使用
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // 高精度が必要な場合は gemini-1.5-pro、速度重視なら gemini-1.5-flash
      safetySettings,
    });

    // 画像をbase64に変換
    const base64Image = await fileToBase64(imageFile);

    // プロンプトの作成 - より具体的な指示を追加
    const prompt = `
      あなたはOCR専門の高性能AIアシスタントです。この画像は発注書です。
      画像から以下の情報を正確に抽出し、JSON形式で返してください。
      
      抽出すべき情報:
      1. 発注書番号 (orderNumber) - 通常「発注番号」「注文番号」などの近くに記載
      2. 発注日 (orderDate) - 日付形式（例: 2023年3月15日、2023/03/15など）
      3. 取引先名 (supplier) - 「○○株式会社」などの会社名
      4. 商品リスト (items) - 表形式で記載されていることが多い
         - 商品名 (name)
         - 数量 (quantity) - 数値のみ抽出
         - 単価 (unitPrice) - 数値のみ抽出（円記号やカンマは除外）
         - 金額 (amount) - 数値のみ抽出（円記号やカンマは除外）
      5. 合計金額 (totalAmount) - 「合計」「総額」などの近くにある数値（円記号やカンマは除外）
      
      注意事項:
      - 数値は数字のみを抽出し、カンマや通貨記号は除外してください
      - 見つからない情報はnullとしてください
      - 表形式のデータは正確に行と列を対応させてください
      - JSONのみを返してください、説明は不要です
      
      返すべきJSONの形式:
      {
        "orderNumber": "発注書番号",
        "orderDate": "発注日",
        "supplier": "取引先名",
        "items": [
          {
            "name": "商品名",
            "quantity": 数量,
            "unitPrice": 単価,
            "amount": 金額
          },
          ...
        ],
        "totalAmount": 合計金額
      }
    `;

    // 画像の準備 - 最新のAPIに合わせて更新
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type,
      },
    };

    try {
      // 生成リクエスト - 最新のAPIに合わせて更新
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, imagePart],
          },
        ],
        generationConfig: {
          temperature: 0.1, // 低い温度で決定論的な応答を得る
          maxOutputTokens: 4096, // 十分な長さの応答を許可
        },
      });

      const response = result.response;
      const text = response.text();
      console.log("Gemini API レスポンス:", text);

      // JSONの抽出（テキスト内にJSONが含まれている場合の処理）
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;

      try {
        const data = JSON.parse(jsonString) as OrderData;

        // 必須フィールドの確認と初期化
        if (!data.items) {
          data.items = [];
        }

        // 数値型の確認と変換
        data.items = data.items.map((item) => ({
          ...item,
          quantity:
            typeof item.quantity === "string"
              ? parseInt(item.quantity, 10) || item.quantity
              : item.quantity,
          unitPrice:
            typeof item.unitPrice === "string" ? parseInt(item.unitPrice, 10) : item.unitPrice,
          amount: typeof item.amount === "string" ? parseInt(item.amount, 10) : item.amount,
        }));

        if (typeof data.totalAmount === "string") {
          data.totalAmount = parseInt(data.totalAmount, 10);
        }

        return data;
      } catch (error) {
        console.error("JSON解析エラー:", error);
        console.error("解析に失敗したテキスト:", jsonString);
        // JSONの解析に失敗した場合はモックデータを返す
        return generateMockData();
      }
    } catch (error) {
      console.error("Gemini API 生成エラー:", error);
      throw new Error("画像からの情報抽出に失敗しました。Gemini APIのレスポンスエラー。");
    }
  } catch (error) {
    console.error("Gemini API エラー:", error);
    throw new Error("画像からの情報抽出に失敗しました");
  }
}

/**
 * ファイルをBase64に変換する
 * @param file 変換するファイル
 * @returns Base64エンコードされた文字列
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Data URLからBase64部分のみを抽出
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("ファイルの読み込みに失敗しました"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}
