import {
  videoStart,
  createCameraBox,
  scanBarcode,
  showResult,
  toggleElements,
} from "./barcode";

const videoCaptureEl = document.getElementById(
  "video-capture"
) as HTMLVideoElement;
const camerasEl = document.getElementById("cameras")!;
const scanBtn = document.getElementById("scan")!;
const resultEl = document.getElementById("result")!;
const barcodeFormats = ["ean_8", "ean_13", "upc_a", "upc_e"];
const intervalTime: number = 500;

// 画面描写時に実行
(async function () {
  // 初期値で撮影開始
  // (画面描写時にこれを実行しないとカメラリストが取得できない)
  videoStart(videoCaptureEl, "");

  toggleElements(".hide-element", "none");
  // カメラセット
  createCameraBox(camerasEl);

  // カメライベントセット
  camerasEl.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLSelectElement;
    videoStart(videoCaptureEl, target.value);
  });

  // scanボタン投下
  scanBtn.addEventListener("click", () => {
    resultEl.innerText = "";
    toggleElements(".hide-element", "block");
    loop_scan(videoCaptureEl, barcodeFormats, intervalTime, resultEl);
  });

  // 未検出だった場合ループする。
  async function loop_scan(
    element: HTMLVideoElement,
    formats: any,
    intarval: number,
    resultElement: HTMLElement
  ) {
    const barcode = await scanBarcode(element, formats);
    if (
      !Array.isArray(barcode) ||
      (Array.isArray(barcode) && barcode.length == 0)
    ) {
      setTimeout(
        () => loop_scan(videoCaptureEl, barcodeFormats, intarval, resultEl),
        intarval
      );
    } else {
      showResult(resultElement, barcode[0]);
      toggleElements(".hide-element", "none");
      return;
    }
  }
})();
