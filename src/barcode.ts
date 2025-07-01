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

// 関数名: videoStart()
// 説明: 　動画を画面に表示する
// 補足：
// 1.画面サイズはCSSを使用して調整してください。
// 2.カメラは最初に初期値で起動します。
// 3.data-device-idに現在取得したdeviceIdが入ります。
// 4.data-video-statusにカメラの状態(on)が入ります。

import { BarcodeDetector } from "barcode-detector/ponyfill";

export async function videoStart(): Promise<void> {
  const element = document.getElementById("video-capture") as HTMLVideoElement;
  if (!element) {
    throw new Error("video要素がありません");
  }

  const cameraEl = document.getElementById("cameras") as HTMLSelectElement;
  if (!cameraEl) {
    throw new Error("select要素がありません");
  }

  // 選択したカメラを特定する
  const deviceId = cameraEl.value || "";

  // data-video-statusで撮影中を判断
  const streaming = element.getAttribute("data-video-status");

  // カメラ初期値をセット
  const setting = {
    audio: false,
    video: {
      width: 1280,
      deviceId: deviceId,
    },
  };

  // 撮影中でdeviceIdに変更がないなら処理終了
  if (deviceId && streaming == "on") {
    const stream: any = element.srcObject;
    if (stream) {
      const track = stream.getTracks();
      if (track) {
        const now_deviceId = track[0].getSettings()["deviceId"];
        if (now_deviceId == deviceId) {
          return;
        }
      }
    }
  }

  // elementにdata-device-idとdata-video-statusをセット
  await navigator.mediaDevices.getUserMedia(setting).then((mediaStream) => {
    element.srcObject = mediaStream;
    element.setAttribute("data-video-status", "on");
  });
}

// 関数名: videoStop()
// 説明: 　動画を止める
// 補足：
// 1.data-video-statusにカメラの状態(off)が入ります。
export async function videoStop(): Promise<void> {
  const element = document.getElementById("video-capture") as HTMLVideoElement;
  if (!element) {
    throw new Error("video要素がありません");
  }

  try {
    const stream: any = element.srcObject;
    if (stream) {
      stream.getTracks({ video: true }).forEach((track: any) => {
        track.stop();
      });
    }
    element.srcObject = null;
    element.setAttribute("data-video-status", "off");
    toggleElements("none");
  } catch (error) {
    console.log(error);
  }
}

// 関数名: getCamera()
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
// 説明: 　端末のカメラを選択できるselectを作成します。
// 補足：
// 1.ここで取得した値をvideoStart()に使用します。
// 2.deviceIdを取得しvideoタグにセットします。
//   起動直後はカメラリストが取得できないので後からoptionタグを生成するのに
//   私用します。
export async function createCameraBox(): Promise<void> {
  const element = document.getElementById("cameras") as HTMLSelectElement;
  if (!element) {
    throw new Error("select要素がありません");
  }

  // videoタグ存在チェック
  const videoCaptureEl = document.getElementById("video-capture");
  if (!videoCaptureEl) {
    throw new Error("video要素がありません");
  }

  // optionsがあるなら処理終了
  if (element.length > 0) return;

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
}

// 関数名: scanBarcode(element, format, interval, resultEl)
// 引数:   formats  = 読み込むバーコードを配列で渡す。
//         interval = バーコードを取得できなか場合のインターバル時間
// 説明: 　バーコードを読み取ります。
// 補足：
// 1.videoタグにあるdata-video-statusの値で処理を継続するか判定しています。
// 2.カメラリストが空の場合、optionタグを生成しselectタグに挿入します。
//   (起動直後はカメラ情報が取得できないため)
// 3.バーコードを取取得にshowResult関数に処理を渡します
// 4.バーコードが取得できなかった場合、interval後(ミリ秒)にループします。
export async function scanBarcode(
  formats: any = ["ean_8", "ean_13", "upc_a", "upc-e"],
  interval: number = 500
): Promise<any> {
  const element = document.getElementById("video-capture") as HTMLVideoElement;
  if (!element) {
    throw new Error("video要素がありません");
  }

  const resultEl = document.getElementById("result") as HTMLElement;
  if (!resultEl) {
    throw new Error("結果を表示する要素がありません");
  }

  // カメラリストを作成します
  const camerasEl = document.getElementById("cameras") as HTMLSelectElement;
  if (!camerasEl) {
    throw new Error("select要素がありません");
  }

  // offなら無限ループから抜けます
  if (element.getAttribute("data-video-status") === "off") {
    // onしておかないとキャンセルを押したとき再始動しない
    element.setAttribute("data-video-status", "on");
    return;
  }

  // resultを初期化
  resultEl.innerText = "";

  // video要要等を表示
  await toggleElements("block");

  // 動画スタート
  await videoStart();

  // select要素作成
  createCameraBox();

  console.log(
    "scan start(video: " +
      element.id +
      ", formats:" +
      formats.join(",") +
      ", interval: " +
      interval +
      ", result:" +
      resultEl.id +
      ")"
  );

  try {
    const barcodeDetector = new BarcodeDetector({ formats: formats });
    const results = await barcodeDetector.detect(element);
    if (Array.isArray(results)) {
      if (results.length == 0) {
        throw new Error("未検出");
      } else {
        //結果を表示
        showResult(results[0]);

        // video停止
        videoStop();
        return;
      }
    }
  } catch (error) {
    // ページ表示直後はカメラが間に合わずエラーになるのでここで握りつぶす
    //console.log(error)
    setTimeout(() => scanBarcode(formats, interval), interval);
  }
}

// 関数名: showResult(element, result)
// 引数:   result  = 取得したバーコードデータ
// 説明: 　バーコードを読み取ります。
export async function showResult(result: any): Promise<void> {
  const element = document.getElementById("result");
  if (!element) {
    throw new Error("結果を表示する要素がありません");
  }
  console.log(result);
  // elementがinputの場合はinnerTextをvalueに変更する
  element.innerText = result["rawValue"];
}

// 関数名: toggleElements(clsname, flg)
// 引数:   flg  = "block"は表示、"none"は非表示
// 説明: 　video要素やselect要素などを表示・非表示にする
export async function toggleElements(flg: string): Promise<void> {
  document.querySelectorAll(".hide-element").forEach((element: any) => {
    element.style.display = flg;
  });
}
