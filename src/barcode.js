import { BarcodeDetector } from "barcode-detector/ponyfill";
globalThis.BarcodeDetector ??= BarcodeDetector;

// 動画開始
export async function videoStart(element, deviceId = "") {
  const setting = { audio: false,
                    video: { width: 1280,
                             height: 720,
                             facingMode: "environment",
                             deviceId: deviceId, },
                  }
  navigator.mediaDevices.getUserMedia(setting)
                        .then((mediaStream) => {
                          element.srcObject = mediaStream
                        });

}

// 端末に接続されているカメラを取得
export async function getCameras() {
  return navigator.mediaDevices
                  .enumerateDevices()
                  .then((devices) => devices.filter((device) => device.kind === "videoinput")
                                            .map((device) => [device.deviceId, device.label]))
}

// select boxを作成
export async function createCameraBox(element = "") {
  const cameras = await getCameras();
  cameras.forEach((camera) => {
    const option = document.createElement("option");
    option.value = camera[0]
    option.textContent = camera[1]
    element.appendChild(option)
  })
}

// バーコードスキャン
export async function scanBarcode(element, formats, interval, resultEl){
  element.style.display = "block"
  console.log("scan start(element: "+ element.id +", formats:" + formats.join(",") + " interval: " + interval + " resultEl: " + resultEl.id +")")
  try{
    const barcodeDetector = new BarcodeDetector({ formats: formats });
    const results = await barcodeDetector.detect(element)
    if (Array.isArray(results)) {
      if (results.length == 0) { throw new Error("未検出") } 
      else { 
        element.style.display = "none";
        showResult(resultEl, results[0])
        return
      }
    }   
  }
  catch(error){
    //console.log(error)
    setTimeout(() => scanBarcode(element, formats, interval, resultEl), interval);
  }
}

// 結果表示
export async function showResult(element, result =[]) {
  // elementがinputの場合はinnerTextをvalueに変更する
  element.innerText = result["rawValue"]
}
