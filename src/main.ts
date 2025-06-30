import { videoStart, videoStop, scanBarcode, toggleElements } from "./barcode";

const barcodeFormats = ["ean_8", "ean_13", "upc_a", "upc_e"];

// 画面描写時に実行
(async function () {
  // videoタグ非表示
  toggleElements("none");

  // カメラ変更イベント
  document.getElementById("cameras")?.addEventListener("change", () => {
    videoStart();
  });

  // スキャンボタン
  document.getElementById("scan")?.addEventListener("click", () => {
    scanBarcode(barcodeFormats);
  });

  // キャンセルボタン
  document.getElementById("cancel")?.addEventListener("click", () => {
    videoStop();
  });
})();
