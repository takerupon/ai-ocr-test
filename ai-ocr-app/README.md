# AI OCR 発注書情報抽出システム

このアプリケーションは、AI OCR 技術を活用して発注書から必要な情報を抽出し、Excel シートに保存するためのツールです。

## 機能

- 発注書画像のアップロード（ドラッグ＆ドロップ対応）
- Google Gemini AI を使用した画像からのテキスト抽出
- 発注書情報の自動認識（発注番号、日付、取引先、商品リスト、金額など）
- 抽出データの Excel ファイル出力

## 技術スタック

- React + TypeScript
- Vite
- TailwindCSS
- shadcn/ui（UI コンポーネント）
- Google Gemini AI API（OCR 処理）
- ExcelJS（Excel 出力）

## 開発環境のセットアップ

### 前提条件

- Node.js 18 以上
- pnpm

### インストール手順

1. リポジトリをクローン

```bash
git clone <repository-url>
cd ai-ocr-app
```

2. 依存関係のインストール

```bash
pnpm install
```

3. 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、Gemini API キーを設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集し、`VITE_GEMINI_API_KEY`に有効な API キーを設定してください。

4. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173 を開いてアプリケーションにアクセスできます。

## 使用方法

1. 発注書の画像をアップロードエリアにドラッグ＆ドロップするか、「ファイルを選択」ボタンをクリックして選択します。
2. 「アップロード」ボタンをクリックすると、AI が画像を分析して情報を抽出します。
3. 抽出された情報が画面右側に表示されます。
4. 「Excel にエクスポート」ボタンをクリックすると、抽出データが Excel ファイルとしてダウンロードされます。

## ビルドと本番デプロイ

本番用ビルドを作成するには：

```bash
pnpm build
```

ビルドされたファイルは`dist`ディレクトリに生成されます。これらのファイルを任意のウェブサーバーにデプロイできます。

## ライセンス

[MIT](LICENSE)
