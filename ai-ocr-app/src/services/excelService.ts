import * as ExcelJS from "exceljs";
import { OrderData } from "@/types/order";

/**
 * 発注書データをExcelファイルに変換してダウンロードする
 * @param data 発注書データ
 */
export async function exportToExcel(data: OrderData): Promise<void> {
  try {
    // 新しいワークブックを作成
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("発注書データ");

    // ヘッダー行のスタイル
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } as ExcelJS.Color },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
    };

    // 基本情報セクション
    worksheet.addRow(["発注書情報"]);
    worksheet.addRow(["発注書番号", data.orderNumber || ""]);
    worksheet.addRow(["発注日", data.orderDate || ""]);
    worksheet.addRow(["取引先", data.supplier || ""]);
    worksheet.addRow([]);

    // 商品リストセクション
    worksheet.addRow(["商品リスト"]);

    // ヘッダー行
    const itemsHeader = worksheet.addRow(["商品名", "数量", "単価", "金額"]);
    itemsHeader.eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    // 商品データ
    if (data.items && data.items.length > 0) {
      data.items.forEach((item) => {
        const row = worksheet.addRow([
          item.name,
          item.quantity,
          item.unitPrice || "",
          item.amount || "",
        ]);

        // 数値のセルは右寄せに
        if (item.unitPrice) {
          row.getCell(3).numFmt = "¥#,##0";
          row.getCell(3).alignment = { horizontal: "right" };
        }
        if (item.amount) {
          row.getCell(4).numFmt = "¥#,##0";
          row.getCell(4).alignment = { horizontal: "right" };
        }
      });
    }

    // 合計行
    const totalRow = worksheet.addRow(["", "", "合計", data.totalAmount || ""]);
    totalRow.getCell(3).font = { bold: true };
    if (data.totalAmount) {
      totalRow.getCell(4).numFmt = "¥#,##0";
      totalRow.getCell(4).alignment = { horizontal: "right" };
      totalRow.getCell(4).font = { bold: true };
    }

    // 列幅の自動調整
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Excelファイルの生成
    const buffer = await workbook.xlsx.writeBuffer();

    // ファイルのダウンロード
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `発注書データ_${data.orderNumber || new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Excel出力エラー:", error);
    throw new Error("Excelファイルの生成に失敗しました");
  }
}
