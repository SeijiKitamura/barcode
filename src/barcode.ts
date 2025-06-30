import { BarcodeDetector } from "barcode-detector/ponyfill";

/* バーコード取得・表示プログラム
   携帯電話等の端末についているカメラを使用してバーコードを読み取り、
   任意の要素に値を表示するプログラム
   
   必ず必要なもの
   1.<video id="video-capture" class="hide-element" style="width: 100%;
      max-width: fit-content;display: none;margin-inline: auto;" 
      autoplay playsinline muted></video>
     バーコードを読み取るためのvideo要素。ここに記載のものは最低限必要なものに
     なっている。
   2.<select id="cameras"></select>
     カメラを選択するボックス
   3.<button id="scan">読み取り</button>
     スキャン実行ボタン。
   4.<button id="cancel">キャンセル</button>
     キャンセルボタン実行ボタン。
   4.<div id="result"></div>
     結果を表示する要素。

   パラメータ
   1.barcodeFormats = ["読み込みたいバーコード"]
   2.intervalTime = 0-1000
*/

// 関数名: videoStart(element)
// 引数:   elemnt = videoタグ
// 説明: 　動画を画面に表示する
// 補足：
// 1.画面サイズはCSSを使用して調整してください。
// 2.カメラは最初に初期値で起動します。
// 3.data-device-idに現在取得したdeviceIdが入ります。
// 4.data-video-statusにカメラの状態(on)が入ります。
export async function videoStart(element: HTMLVideoElement): Promise<void> {
  // deta-deviceidから現在のカメラを特定する
  const deviceId = (await element.getAttribute("data-deviceid")) || "";
  const setting = {
    audio: false,
    video: {
      width: 1280,
      deviceId: deviceId,
    },
  };
  await navigator.mediaDevices.getUserMedia(setting).then((mediaStream) => {
    element.srcObject = mediaStream;
    const track = mediaStream.getTracks()[0];
    const deviceId = track.getSettings()["deviceId"] || "";
    element.setAttribute("data-deviceid", deviceId);
    element.setAttribute("data-video-status", "on")
  });
}

// 関数名: videoStop(element)
// 引数:   elemnt = videoタグ
// 説明: 　動画を止める
// 補足： 
// 1.data-video-statusにカメラの状態(off)が入ります。
export async function videoStop(element: HTMLVideoElement): Promise<void> {
  try {
    const stream: any = element.srcObject;
    if(stream) {
      stream.getTracks({video: true}).forEach((track: any) => {
        track.stop();
      })
    }
    element.setAttribute("data-video-status", "off")
  } catch (error) {
    console.log(error)
  }
}

// 関数名: getCamera()
// 引数:
// 説明: 　端末のカメラを配列で返します。
// 補足： 
// 1.ここで取得した値をselectボックスに使用します。
export async function getCameras(): Promise<string[][]> {
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => [device.deviceId, device.label])
    );
}

// 関数名: createCameraBox()
// 引数:  element = select要素
// 説明: 　端末のカメラを選択できるselectを作成します。
// 補足： 
// 1.ここで取得した値をvideoStart()に使用します。
// 2.deviceIdを取得しvideoタグにセットします。
//   起動直後はカメラリストが取得できないので後からoptionタグを生成するのに
//   私用します。
export async function createCameraBox(
  element: HTMLSelectElement
): Promise<void> {
  // カメラデータを取得
  const cameras = await getCameras();

  // optionタグを生成
  if (element && element.options && element.options.length == 0) {
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera[0];
      option.textContent = camera[1];
      element.appendChild(option);
    });
  }

  // videoタグのdata-deviceIdにdeviceIdをセット
  const videoId = element.getAttribute("data-video");
  if (videoId) {
    const videoCaptureEl = document.getElementById(videoId);
    if (videoCaptureEl) {
      const deviceId = videoCaptureEl.getAttribute("data-deviceid");
      if (deviceId && element.value != deviceId) {
        element.value = deviceId;
      }
    }
  }
}

// 関数名: scanBarcode(element, format, interval, resultEl)
// 引数:   element  = video要素
//         formats  = 読み込むバーコードを配列で渡す。
//         interval = バーコードを取得できなか場合のインターバル時間
//         resultEl = 取得したバーコードを表示するelement
// 説明: 　バーコードを読み取ります。
// 補足： 
// 1.videoタグにあるdata-video-statusの値で処理を継続するか判定しています。
// 2.カメラリストが空の場合、optionタグを生成しselectタグに挿入します。
//   (起動直後はカメラ情報が取得できないため)
// 3.バーコードを取取得にshowResult関数に処理を渡します
// 4.バーコードが取得できなかった場合、interval後(ミリ秒)にループします。
export async function scanBarcode(
  element: HTMLVideoElement,
  formats: any,
  interval: number,
  resultEl: HTMLElement
): Promise<any> {

  console.log(
    "scan start(element: " + element.id + ", formats:" + formats.join(",") + ")"
  );
  
  // カメラリストを作成します
  const camerasEl = document.getElementById("cameras") as HTMLSelectElement;
  const deviceId = (await element.getAttribute("data-deviceid")) || "";
  if(camerasEl && deviceId && camerasEl.value != deviceId) {
    createCameraBox(camerasEl);
    camerasEl.value = deviceId;
  }

  try {
    // フラグをたててバーコードを取得します
    //element.setAttribute("data-video-status","on");
    const barcodeDetector = new BarcodeDetector({ formats: formats });
    const results = await barcodeDetector.detect(element);
    if (Array.isArray(results)) {
      if (results.length == 0) {
        // offなら無限ループから抜けます
        if (element.getAttribute("data-video-status") === "off") {
          element.setAttribute("data-video-status", "on");
          return;
        }
        throw new Error("未検出");
      } else {
        //結果を表示
        showResult(resultEl, results[0]);

        // video要素他を非表示にします。
        toggleElements(".hide-element", "none");

        // フラグを立てます
        element.setAttribute("data-video-status","on");
        return;
      }
      console.log("到達到達領域")
    }
  } catch (error) {
    // ページ表示直後にカメラが間に合わずエラーになるのでここで握りつぶす
    //console.log(error)
    setTimeout(
      () => scanBarcode(element, formats, interval, resultEl),
      interval
    );
  }
}

// 関数名: showResult(element, result)
// 引数:   element  = 結果を表示する要素
//         result  = 取得したバーコードデータ
// 説明: 　バーコードを読み取ります。
export async function showResult(
  element: HTMLElement,
  result: any
): Promise<void> {
  console.log(result);
  // elementがinputの場合はinnerTextをvalueに変更する
  element.innerText = result["rawValue"];
}

// 関数名: toggleElements(clsname, flg)
// 引数:   clsname  = 表示・非表示したい要素のクラス
//         flg  = "block"は表示、"none"は非表示
// 説明: 　video要素やselect要素などを表示・非表示にする
export async function toggleElements(
  clsname: string,
  flg: string
): Promise<void> {
  document.querySelectorAll(clsname).forEach((element: any) => {
    element.style.display = flg;
  });
}