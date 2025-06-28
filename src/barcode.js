import { BarcodeDetector } from "barcode-detector/ponyfill";
globalThis.BarcodeDetector ??= BarcodeDetector;

export default class Barcode {
  static getSupportedFormats() {
    return BarcodeDetector.getSupportedFormats();
  }
//    return BarcodeDetector.getSupportedFormats();
//  }
//
//  // videoの横幅はCSSで変更する
//  static setCamera(deviceId = "") {
//    const setting = { audio: false,
//                      video: { width: 1280,
//                               height: 720,
//                               facingMode: "environment",
//                               deviceId: deviceId, },
//                    }
//
//    const videoCaptureEl = document.getElementById("video-capture");
//    navigator.mediaDevices.getUserMedia(setting)
//                          .then((mediaStream) => {
//                            videoCaptureEl.srcObject = mediaStream
//                          });
//
//  }
//
//  // 先に画像を表示しておかないとlabelとdeviceIdが取得できない
//  static getCameras() {
//    const cameras = navigator.mediaDevices
//                             .enumerateDevices()
//    return cameras.filter((camera) => camera.kind == "videoinput")
//                  .map((camera) => [ camera.deviceId, camera.label ])
//  }
//
//  static setCamerasEl(selectId) {
//    const selectEl = document.getElementById(selectId)
//    if (! selectEl) {
//      throw new Error('Selectタグがありません。');
//    }
//
//    const cameras = Barcode.getCameras();
//    // カメラがない場合のエラー処理をここに追加
//    if(! cameras) {
//      throw new Error('お使いの端末にはカメラがありません。');
//    }
// 
//    selectEl.innerHTML = "";
//    cameras.forEach(camera => {
//      const option = document.createElement("option");
//      option.value = camera[0]
//      option.textContent = camera[1]
//      selectEl.appendChild(option)
//    })
//  }
//
//  constructor(formats, barcodeDetector = undefined){
//    this.barcodeDetector = new BarcodeDetector({ formats: formats })
//    Barcode.setCamera();
//  }
//
//  detect(source) {
//    console.log(source)
//    const result = ""
//    this.barcodeDetector.detect(source)
//    .then((data) => {
//       result = data
//    })
//    .catch((error) =>{
//      console.log(error)
//    })
//    return result
//  }
//
//  scan(){
//    console.log("scan start")
//    const source = document.getElementById("video-capture");
//     this.detect(source)
//    const barcodeValue = barcode?.rawValue ?? ""
//    if (!barcodeValue) {
//      setTimeout(() => this.scan(this.videoCaptureEl), 1000)
//      return
//    }
//    console.log("scan end")
//  }
}
