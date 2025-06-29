import {
  videoStart,
  videoStop,
  createCameraBox,
  scanBarcode,
  toggleElements,
} from "./barcode";

const videoCaptureEl = document.getElementById(
  "video-capture"
) as HTMLVideoElement;
const camerasEl = document.getElementById("cameras") as HTMLSelectElement;
const scanBtn = document.getElementById("scan")!;
const cancelBtn = document.getElementById("cancel")!;
const resultEl = document.getElementById("result")!;
const barcodeFormats = ["ean_8", "ean_13", "upc_a", "upc_e"];
const intervalTime: number = 500;

// 画面描写時に実行
(async function () {

  toggleElements(".hide-element", "none");

  // カメライベントセット
  camerasEl.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLSelectElement;
    // videoタグにdeviceIdをセット
    videoCaptureEl.setAttribute("data-deviceid", target.value)
    videoStart(videoCaptureEl);
  });

  // scanボタン投下
  scanBtn.addEventListener("click", () => {
    toggleElements(".hide-element", "block");
    videoStart(videoCaptureEl);
    createCameraBox(camerasEl);
    scanBarcode(videoCaptureEl, barcodeFormats, intervalTime, resultEl)
  });

  // キャンセルボタン
  cancelBtn.addEventListener("click", () => {
    videoStop();
    toggleElements(".hide-element", "none");
  });

  //videoタグにcamera#idをセット
  videoCaptureEl.setAttribute("data-cameras", camerasEl.id);

  // selectタグにvideo#idをセット
  camerasEl.setAttribute("data-video", videoCaptureEl.id)
})();
