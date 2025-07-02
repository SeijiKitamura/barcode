# Barcode Reader
[barcode-detector]()を使用したJavascriptバーコード読み取りプログラムです。
関数を使用して簡単にバーコードの読み取りと表示ができるようにすることを目的としました。

#### 読み取り可能なバーコード
流通されているほぼすべての1次元バーコードやQRコードも読み取り可能です。
より詳しいことは[こちら](https://github.com/Sec-ant/barcode-detector?tab=readme-ov-file#barcode-detector)のページを参照してください。

#### インストール
```bash
npm install xxxx
```

#### 使い方
1. HTML要素
   以下HTML要素をホームページ上に用意します。
   ``` HTML
   
   ```
1. Javascriptファイル
   ``` javascript
   import { videoStart, videoStop, scanBarcode, toggleElements } from "./barcode";
   (() =>{
     /* 後で処理を書く */
   })();
   ```
1. 以上

#### 関数
- videoStart()
  `video#video-capture`にカメラから取得した映像を表示します。
- videoStop()
  動画を表示していれば停止します。
- getCameras()
  端末に接続されているカメラの配列を返します。
  `[[ deviceId, label], [deviceId, label],....]`
- createCameras()
  getCameras()で取得した配列を使用して`select#cameras`に`option`タグを挿入します。
- scanBarcode(barcodeFormats = [ "ean_8", "ean_13", ....], interval = number)
  第1引数に読み取りたいバーコードの配列、第2引数にループする間隔を入れます。
  実行後、画面に表示されているバーコードを取得し、div#restultに結果を表示します。
  取得できない場合はvideoStop()されるまで無限ループします。
- showResult(result)
  scanBarcode()で取得したバーコード情報を使用して`div#restul`に結果を表示します。
- toggleElements(flg ="block"| "none")
  `.hide-element`クラスの要素を表示(block)・非表示(none)します。

#### Tips
- video要素の横幅
  親要素の横幅いっぱいになるように設定しています。video要素の横幅をいじるよりはvideoの親要素を変更した方がレイアウトしやすいと思います。
  なお縦幅については一切指定していません。そのためスマートフォンでは縦長に表示されます。
  ``` HTML
  /* Bad */
  /* video要素の横幅を広げるためにwidthに値を指定する */
  <video id="video-capture" style="width: 240px;"></video>
  ```

  ``` HTML
  /* Good */
  /* video要素の横幅を広げるために親要素のwidthに値を指定する */
  <div style="width: 360px;">
    <video id="video-capture" style="width: 100%;"></video>
  </div>
  ```