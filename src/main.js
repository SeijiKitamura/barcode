import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { videoStart, getCameras, createCameraBox, scanBarcode, showResult } from "./barcode.js";

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`
setupCounter(document.querySelector('#counter'));

const videoCaptureEl = document.getElementById("video-capture")
const camerasEl = document.getElementById("cameras");
const scanBtn = document.getElementById("scan");
const resultEl = document.getElementById("result")
const barcodeFormats = ["ean_8", "ean_13", "upc_a", "upc_e"]
const intervalTime = 500;

// 画面描写時に実行
(async function(){
  console.log(resultEl)
  // 初期値で撮影開始
  // (画面描写時にこれを実行しないとカメラリストが取得できない)
  videoStart(videoCaptureEl);

  // videoCaptureElを隠す
  videoCaptureEl.style.display = "none";

  // カメラセット
  //const cameras = await getCameras();
  createCameraBox(camerasEl)

  // カメライベントセット
  camerasEl.addEventListener("change", (event) =>{
    videoStart(videoCaptureEl, event.target.value);
  })

  // scanボタン投下
  scanBtn.addEventListener("click", (event) =>{
    resultEl.innerText = "";
    scanBarcode(videoCaptureEl, barcodeFormats, intervalTime, resultEl);
  })
})();
