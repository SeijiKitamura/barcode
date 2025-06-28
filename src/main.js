import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import { BarcodeDetector } from "barcode-detector/ponyfill";
globalThis.BarcodeDetector ??= BarcodeDetector;

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


(async function(){
  // video要素を取得
  const videoCaptureEl = document.getElementById("video-capture")

  // 動画開始
  async function videoStart(deviceId = "") {
    const setting = { audio: false,
                      video: { width: 1280,
                               height: 720,
                               facingMode: "environment",
                               deviceId: deviceId, },
                    }
    navigator.mediaDevices.getUserMedia(setting)
                          .then((mediaStream) => {
                            videoCaptureEl.srcObject = mediaStream
                          });

  }

  await videoStart();

  // カメラリスト取得
  const cameras = await navigator.mediaDevices
                                 .enumerateDevices()
                                 .then((devices) => devices.filter((device) => device.kind === "videoinput")
                                                           .map((device) => [device.deviceId, device.label]))
                                 .catch((error) => { throw new Error("カメラがありません")});
  

  // カメラセット
  const camerasEl = document.getElementById("cameras");
  console.log(cameras)
  cameras.forEach((camera) => {
    const option = document.createElement("option");
    option.value = camera[0]
    option.textContent = camera[1]
    camerasEl.appendChild(option)
  })

  camerasEl.addEventListener("change", (event) =>{
    videoStart(event.target.value);
  })

  async function scan(){
    console.log("scan start")
    try{
      const barcodeDetector = new BarcodeDetector({ formats: ["ean_8", "ean_13", "upc_a", "upc_e"], });
      const results = await barcodeDetector.detect(videoCaptureEl)
      if (Array.isArray(results)) {
        if (results.length == 0) { throw new Error("未検出") } 
        else { 
          showResult(results[0])
          return
        }
      }   
    }
    catch(error){
      console.log(error)
      setTimeout(() => scan(), 1000);
    }
  }

  // 結果表示
  async function showResult(result =[]) {
    const resultEl = document.getElementById("result")
    resultEl.innerText = result["rawValue"]
  }

  // scanボタン投下
  const scanBtn = document.getElementById("scan");
  scanBtn.addEventListener("click", (event) =>{
    const resultEl = document.getElementById("result")
    resultEl.innerText = "";
    scan();
  })
  //console.log(barcode)
  //const barcodeValue = await barcode.detect(videoCaptureEl);
})();
