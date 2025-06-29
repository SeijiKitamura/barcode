import { BarcodeDetector } from "barcode-detector/ponyfill";

let stream: MediaStream;
let flg: boolean = true;

// 動画開始
export async function videoStart(
  element: HTMLVideoElement,
  deviceId: string = ""
): Promise<void> {
  const setting = {
    audio: false,
    video: {
      width: 1280,
      height: 720,
      facingMode: "environment",
      deviceId: deviceId,
    },
  };
  await navigator.mediaDevices.getUserMedia(setting).then((mediaStream) => {
    stream = mediaStream;
    element.srcObject = mediaStream;
  });
  flg = true;
}

// 動画停止
export async function videoStop(){
  if(stream) {
    stream.getTracks().forEach((truck) => { truck.stop() });
    flg = false;
  }
}

// 端末に接続されているカメラを取得
export async function getCameras(): Promise<string[][]> {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => [device.deviceId, device.label])
    );
}

// select boxを作成
export async function createCameraBox(element: HTMLSelectElement): Promise<void> {
  const cameras = await getCameras();
  if(element.options.length == 0){
    await cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera[0];
            option.textContent = camera[1];
            element.appendChild(option);
          });
  }
}

// バーコードスキャン
// 戻り値：バーコードを発見するとresult[0]に値が入る
export async function scanBarcode(
  element: HTMLVideoElement,
  formats: any,
  interval: number,
  resultEl: HTMLElement
): Promise<any> {
  console.log(
    "scan start(element: " + element.id + ", formats:" + formats.join(",") + ")"
  );
  try {
    if (!flg) { return  }
    const barcodeDetector = new BarcodeDetector({ formats: formats });
    const results = await barcodeDetector.detect(element);
    if (Array.isArray(results)) {
      if (results.length == 0) {
        throw new Error("未検出");
      } else {
        showResult(resultEl,results[0])
        toggleElements(".hide-element", "none");
        return 
      }
    }
  } 
  catch (error) {
    // ページ表示直後にカメラが間に合わずエラーになるのでここで握りつぶす
    //console.log(error)
    setTimeout(() => scanBarcode(element, formats, interval, resultEl), interval);
  }
}

// 結果表示
export async function showResult(
  element: HTMLElement,
  result: any
): Promise<void> {
  // elementがinputの場合はinnerTextをvalueに変更する
  element.innerText = result["rawValue"];
}

// video要素とselect要素の表示・非表示
export async function toggleElements(
  clsname: string,
  flg: string
): Promise<void> {
  document.querySelectorAll(clsname).forEach((element: any) => {
    element.style.display = flg;
  });
}
