window.addEventListener('DOMContentLoaded', () => {
	const startCameraBtn = document.getElementById("kidou");
	const stopCameraBtn = document.getElementById("teishi");
	const video = document.getElementById("video");
	const button = document.getElementById("button");
	const img = document.getElementById("tapgazou");
	const outputDiv = document.getElementById("output");
	const kameratoukawaku = document.getElementById("kameratoukawaku");
	const shutterButton = document.getElementById("shutter-button");
	const photoCanvas = document.getElementById("photo-canvas");
	const photoImg = document.getElementById("photo-img");
	let cameraStream = null;

	// 枠画像が読み込まれたら位置調整する
	kameratoukawaku.addEventListener('load', () => {
		if (video.style.display !== "none") {
			updateFramePosition();
		}
	});

	function updateFramePosition() {
		if (video.style.display === "none") return; // 非表示なら処理しない

		const rect = video.getBoundingClientRect();
		const videoWidth = rect.width;
		const videoHeight = rect.height;

		// 枠画像の元サイズ（自然サイズ）を使ってアスペクト比を保持しながらサイズ調整
		const frameWidth = videoWidth * 0.5; // 動画幅の50%に設定（適宜調整可）
		const frameHeight = frameWidth * (kameratoukawaku.naturalHeight / kameratoukawaku.naturalWidth);

		kameratoukawaku.style.width = `${frameWidth}px`;
		kameratoukawaku.style.height = `${frameHeight}px`;

		// 動画の左上からの相対座標で配置（親要素が相対位置である前提）
		const videoContainer = document.getElementById("video-container");
		const containerRect = videoContainer.getBoundingClientRect();
		const offsetX = video.offsetLeft;
		const offsetY = video.offsetTop;

		kameratoukawaku.style.position = "absolute";
		kameratoukawaku.style.left = `${offsetX + videoWidth - frameWidth}px`;
		kameratoukawaku.style.top = `${offsetY + videoHeight - frameHeight}px`;

		kameratoukawaku.style.zIndex = 20;
	}

	// カメラ起動ボタン
		startCameraBtn.addEventListener("click", () => {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				alert("カメラにアクセスできません。");
				return;
			}

		navigator.mediaDevices.getUserMedia({
			video: { facingMode: { ideal: "environment" } }
		})
		.then(stream => {
			cameraStream = stream;
			video.srcObject = stream;
			video.style.display = "block"; // 映像表示
			kameratoukawaku.style.display = "block"; //カメラ枠表示
			stopCameraBtn.style.display = "inline"; // 停止ボタン表示
			startCameraBtn.style.display = "none";  // 起動ボタン非表示

			video.addEventListener('loadedmetadata', () => {
				updateFramePosition();
			});

			// カメラ映像が読み込まれたらシャッターボタンを表示
			video.addEventListener('loadedmetadata', () => {
				updateFramePosition();
				if (shutterButton) {
					shutterButton.style.display = "block";
				}
			}, { once: true }); // イベントリスナーを1回だけ実行


			// ウィンドウリサイズ時も位置更新
			window.addEventListener('resize', () => {
				updateFramePosition();
			});
		})
		.catch(err => {
			alert("カメラの起動に失敗しました。");
			console.error(err);
		});
	});
	// カメラ停止ボタン
	stopCameraBtn.addEventListener("click", () => {
		if (cameraStream) {
			cameraStream.getTracks().forEach(track => track.stop());
			cameraStream = null;
			video.srcObject = null;
		}
		video.style.display = "none"; // 映像非表示
		kameratoukawaku.style.display = "none"; //  カメラ枠非表示
		stopCameraBtn.style.display = "none"; // 停止ボタン非表示
		startCameraBtn.style.display = "inline"; // 起動ボタン表示
		// 撮影ボタンと写真を非表示にする
        	if (shutterButton) {
			shutterButton.style.display = "none";
        	}
        	if (photoImg) {
			photoImg.style.display = "none";
        	}
	});

	// 撮影ボタンのクリックイベント
	if (shutterButton) {
		shutterButton.addEventListener("click", () => {
			if (!cameraStream) {
				alert("カメラが起動していません。");
				return;
			}

			if (!photoCanvas || !photoImg) {
				console.error("Canvas or img element not found.");
				return;
			}

			photoCanvas.width = video.videoWidth;
			photoCanvas.height = video.videoHeight;
			const context = photoCanvas.getContext("2d");

			// 1. Canvasに動画の現在のフレームを描画
			context.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);

			// 2. カメラ枠画像を読み込み、Canvasに描画
			const frameImage = new Image();
			frameImage.src = "kameratoukawaku.png";
        
			frameImage.onload = () => {
				// 枠画像のサイズを調整
				const frameWidth = photoCanvas.width * 0.5;
				const frameHeight = frameWidth * (frameImage.naturalHeight / frameImage.naturalWidth);

				// 枠画像を描画する位置を計算
				const frameX = photoCanvas.width - frameWidth;
				const frameY = photoCanvas.height - frameHeight;

				// Canvasに枠画像を描画（元の画像の上に重ねる）
				context.drawImage(frameImage, frameX, frameY, frameWidth, frameHeight);
            
				// 3. 合成したCanvasの内容を画像データに変換
				const imageDataUrl = photoCanvas.toDataURL("image/png");

				// 4. 画像を表示するimgタグにデータを設定し、表示
				photoImg.src = imageDataUrl;
				photoImg.style.display = "block";

				photoImg.width = video.clientWidth;
				photoImg.height = video.clientHeight;
			};
        
			frameImage.onerror = () => {
				alert("カメラ枠画像の読み込みに失敗しました。");
				// 枠画像なしで元の画像を表示するフォールバック処理
				const imageDataUrl = photoCanvas.toDataURL("image/png");
				photoImg.src = imageDataUrl;
				photoImg.style.display = "block";
			};
		});
	}


  	// バス停データ
  	const places = [
    		{ id: 1, lat: 40.828338, lng: 140.734743, name: "青森駅②" },
    		{ id: 1, lat: 40.828158, lng: 140.734646, name: "青森駅③" },
    		{ id: 1, lat: 40.828014, lng: 140.734571, name: "青森駅④" },
    		{ id: 1, lat: 40.828223, lng: 140.734877, name: "青森駅⑥" },
    		{ id: 2, lat: 40.827681, lng: 140.736102, name: "アウガ前" },
    		{ id: 4, lat: 40.826473, lng: 140.736062, name: "古川一丁目" },
    		{ id: 5, lat: 40.827104, lng: 140.737875, name: "新町一丁目①" },
    		{ id: 6, lat: 40.826656, lng: 140.739090, name: "新町一丁目②" },
    		{ id: 7, lat: 40.826183, lng: 140.738001, name: "新町一丁目③" },
    		{ id: 8, lat: 40.826122, lng: 140.742392, name: "県庁通り(上り)" },
    		{ id: 8, lat: 40.826333, lng: 140.740705, name: "県庁通り(下り)" },
    		{ id: 3, lat: 40.825604, lng: 140.744627, name: "新町二丁目(下り)" },
   		{ id: 3, lat: 40.825716, lng: 140.744688, name: "新町二丁目(上り)" },
    		{ id: 9, lat: 40.825812, lng: 140.739828, name: "八甲通り" },
  	];

  	// 店舗データ（JSONからJS変数に変換済み）
 	 const shops = [
    		{id: 1,sid: 1,jyuusyo: "青森市新町1-1-21",sname: "思い出もおみやげ　葛西商店",oname: "ホタテで乾杯！"},
    		{id: 1,sid: 1,jyuusyo: "青森市新町1-1-21",sname: "思い出もおみやげ　葛西商店",oname: "りんごdip"},
    		{id: 1,sid: 1,jyuusyo: "青森市新町1-1-21",sname: "思い出もおみやげ　葛西商店",oname: "林檎けんぴ りんご茶 干りんご"},
    		{id: 2,sid: 2,jyuusyo: "青森市新町1-1-17",sname: "お食事処　おさない",oname: "ほたてカレー"},
    		{id: 2,sid: 2,jyuusyo: "青森市新町1-1-17",sname: "お食事処　おさない",oname: "ベーコンエッグ定食"},
    		{id: 2,sid: 2,jyuusyo: "青森市新町1-1-17",sname: "お食事処　おさない",oname: "さかな定食"},
    		{id: 2,sid: 3,jyuusyo: "青森市新町1-9-22",sname: "電器屋ＩＫＯ",oname: "シンプル湯沸かし"},
 		{id: 2,sid: 3,jyuusyo: "青森市新町1-9-22",sname: "電器屋ＩＫＯ",oname: "アラジントースター"},
  		{id: 2,sid: 3,jyuusyo: "青森市新町1-9-22",sname: "電器屋ＩＫＯ",oname: "卓上電気グリル鍋"},
 		{id: 3,sid: 4,jyuusyo: "青森市新町2-8-5",sname: "和食や じんすけ",oname: "陸奥湾コース（会席）"},
 		{id: 3,sid: 4,jyuusyo: "青森市新町2-8-5",sname: "和食や じんすけ",oname: "活イカの造り"},
 		{id: 3,sid: 4,jyuusyo: "青森市新町2-8-5",sname: "和食や じんすけ",oname: "当日OKおまかせコース"},
    		{id: 4,sid: 5,jyuusyo: "青森市新町1丁目6-22",sname: "ジェラート・ナチュレ",oname: "林檎のジェラート"},
    		{id: 4,sid: 6,jyuusyo: "青森市新町2-8-4",sname: "喫茶クレオパトラ",oname: "バナナとりんごのケーキ"},
    		{id: 4,sid: 6,jyuusyo: "青森市新町2-8-4",sname: "喫茶クレオパトラ",oname: "レスキュースープ"},
    		{id: 4,sid: 6,jyuusyo: "青森市新町2-8-4",sname: "喫茶クレオパトラ",oname: "英国風スコーンセット"},
    		{id: 5,sid: 7,jyuusyo: "青森市新町1丁目8-5",sname: "パサージュ広場",oname: "おしゃれな店舗が集まってます！"},
    		{id: 6,sid: 8,jyuusyo: "青森市古川1丁目16-1 一郎屋ビル 1F",sname: "True",oname: "Trueカレー"},
    		{id: 6,sid: 8,jyuusyo: "青森市古川1丁目16-1 一郎屋ビル 1F",sname: "True",oname: "2色カレー"},
    		{id: 6,sid: 9,jyuusyo: "青森市古川1丁目17-1",sname: "COFFEEMAN good",oname: "コーヒーを通じてつながるコミュニティスタンド"},
    		{id: 7,sid: 10,jyuusyo: "青森市新町1-9-22",sname: "鮨処あすか",oname: "サーモン塩麹焼き"},
    		{id: 7,sid: 10,jyuusyo: "青森市新町1-9-22",sname: "鮨処あすか",oname: "自家製茶碗蒸し"},
    		{id: 7,sid: 10,jyuusyo: "青森市新町1-9-22",sname: "鮨処あすか",oname: "ばらちらし"},
    		{id: 7,sid: 11,jyuusyo: "青森市新町1-11-16 ダイワロイネットホテル青森 1F",sname: "うぐいす",oname: "特製おまかせ握り9貫※事前予約必須"},
    		{id: 7,sid: 11,jyuusyo: "青森市新町1-11-16 ダイワロイネットホテル青森 1F",sname: "うぐいす",oname: "THE OBANZAI"},
    		{id: 7,sid: 11,jyuusyo: "青森市新町1-11-16 ダイワロイネットホテル青森 1F",sname: "うぐいす",oname: "UGUISUの極上牛まぶし膳"},
    		{id: 7,sid: 12,jyuusyo: "青森市新町1-13-5",sname: "チャンドラ",oname: "エンガデン"},
    		{id: 8,sid: 13,jyuusyo: "青森市新町2丁目6-25",sname: "新町キューブ",oname: "貸しスタジオ、イベントあり"},
    		{id: 8,sid: 14,jyuusyo: "青森市新町1-9-22",sname: "洋菓子店 赤い林檎",oname: "マドレーヌ"},
    		{id: 8,sid: 14,jyuusyo: "青森市新町1-9-22",sname: "洋菓子店 赤い林檎",oname: "ダックワーズ"},
    		{id: 8,sid: 14,jyuusyo: "青森市新町1-9-22",sname: "洋菓子店 赤い林檎",oname: "シフォンケーキ ココア"},
    		{id: 9,sid: 15,jyuusyo: " 青森市新町1-13-2",sname: "さくら野百貨店 青森本店",oname: "シルクレッグウォーマー"},
    		{id: 9,sid: 15,jyuusyo: " 青森市新町1-13-2",sname: "さくら野百貨店 青森本店",oname: " [岩手鉄製]ダクタイルディープパン"},
    		{id: 9,sid: 15,jyuusyo: " 青森市新町1-13-2",sname: "さくら野百貨店 青森本店",oname: "津軽びいどろ「ぐい呑み」"},
  	];
  	//店舗url
  	const shopsurl = [
    		{sid: 1,url: "https://www.ippinshinmachi.com/ippin1/kasai/#title"},
   		{sid: 2,url: "https://www.ippinshinmachi.com/ippin1/osanai/#osanai1"},
    		{sid: 3,url: "https://www.ippinshinmachi.com/ippin3/iko/#ikoippin"},
    		{sid: 4,url: "https://www.ippinshinmachi.com/ippin2/jinsuke/#jinsukeippin"},
    		{sid: 5,url: "https://www.instagram.com/gelato_natur_aomori/?hl=ja"},
    		{sid: 6,url: "https://www.ippinshinmachi.com/ippin2/cleopatra/#kureopatoraippin"},
    		{sid: 7,url: "https://passage-aomori.net/"},
    		{sid: 8,url: "https://www.instagram.com/true.0503/"},
    		{sid: 9,url: "https://www.instagram.com/coffeemangood/"},
    		{sid: 10,url: "https://www.ippinshinmachi.com/ippin1/asuka/#asukaippin"},
    		{sid: 11,url: "https://uguisu-aomori.owst.jp/"},
    		{sid: 12,url: "https://www.ippinshinmachi.com/ippin2/%E3%83%81%E3%83%A3%E3%83%B3%E3%83%89%E3%83%A9%E3%81%AE%E9%80%B8%E5%93%81/#chandoraippin"},
    		{sid: 13,url: "https://cube-naracorp.jp/"},
    		{sid: 14,url: "https://www.ippinshinmachi.com/ippin1/akairingo/#akairingoippin"},
    		{sid: 15,url: "https://www.ippinshinmachi.com/ippin3/sakurano/#sakuranoippin"},
  	];

  	// 初期表示
  	outputDiv.innerHTML = `
    		<strong>現在地：</strong>「TAP」を押してください<br><br>
    		<strong>最寄りのバス停：</strong>「TAP」を押してください<br><br>
    		<strong>店舗情報：</strong>「TAP」を押してください
  	`;

  	// 距離計算（緯度経度2点間の距離をメートルで返す）
  	function getDistance(lat1, lng1, lat2, lng2) {
    		const R = 6371000; // 地球の半径(m)
    		const rad = Math.PI / 180;
    		const dLat = (lat2 - lat1) * rad;
    		const dLng = (lng2 - lng1) * rad;
    		const a =
      			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      			Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
      			Math.sin(dLng / 2) * Math.sin(dLng / 2);
    			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    			return R * c;
  	}

  	// 最寄りのバス停を探す
  	function findNearestBusStop(lat, lng) {
    		let nearest = null;
    		let minDist = Infinity;
    		for (const place of places) {
     			const dist = getDistance(lat, lng, place.lat, place.lng);
      				if (dist < minDist) {
        				minDist = dist;
        				nearest = place;
     			}
    		}
    		return nearest;
  	}

	// タップボタン押下イベント
	button.addEventListener("mousedown", () => {
    		// マウスが押されたときに画像をtap2.pngに切り替える
    		img.src = "tap2.png";
  	});

  	button.addEventListener("mouseup", () => {
    		// マウスが離されたときに画像をtap.pngに戻す
    		img.src = "tap.png";
  	});

  	// タッチデバイス用（スマホなど）
  	button.addEventListener("touchstart", () => {
		img.src = "tap2.png";
	});

  	button.addEventListener("touchend", () => {
    		img.src = "tap.png";
 	});

  	button.addEventListener("click", () => {
    		if (!navigator.geolocation) {
      			outputDiv.textContent = "Geolocationはサポートされていません";
      			return;
    		}
    		outputDiv.textContent = "現在地取得中...";

    		navigator.geolocation.getCurrentPosition(
      		(pos) => {
        		const lat = pos.coords.latitude;
       			const lng = pos.coords.longitude;

        		// 現在地表示
			const now = new Date();
			const timeStr = now.toLocaleTimeString();
			outputDiv.innerHTML = ""; // 一旦クリア
			outputDiv.innerHTML += `<strong>現在地</strong><br><strong>取得時間：</strong>${timeStr}<br>`;
        		// 最寄りのバス停を探す
        		const nearest = findNearestBusStop(lat, lng);
        		if (!nearest) {
          			outputDiv.innerHTML += "<strong>最寄りのバス停：</strong>見つかりませんでした<br>";
          			outputDiv.innerHTML += "<strong>おすすめ店舗情報：</strong>該当なし";
          			return;
        		}
			const nearestId = nearest.id;
        		// 同じ id を持つバス停名をすべて取得
        		const sameIdBusStops = places.filter(place => place.id === nearest.id);
        		outputDiv.innerHTML += `<strong>最寄りのバス停：</strong>${nearest.name}<br>`;

        		// バス停sidに紐づく店舗を取得
        		const matchedShops = shops.filter(shop => shop.id === nearest.id);

        		if (matchedShops.length === 0) {
          			outputDiv.innerHTML += "<strong>おすすめ店舗情報：</strong>該当なし";
          			return;
        		}

			const uniqueShops = [];
			const shopNames = new Set();

			matchedShops.forEach(shop => {
	  			if (!shopNames.has(shop.sname)) {
	    				shopNames.add(shop.sname);
	    				uniqueShops.push(shop);
	  			}
			});

			outputDiv.innerHTML += `<br>`;
			// 店舗情報表示（店舗名・住所は1回だけ、おすすめはすべて表示）
			outputDiv.innerHTML += `<strong>おすすめ店舗情報</strong><br>`;
	
			// 店舗名でグルーピング
			const shopsGrouped = {};
			matchedShops.forEach(shop => {
	  			if (!shopsGrouped[shop.sname]) {
	    				shopsGrouped[shop.sname] = {
	      					jyuusyo: shop.jyuusyo,
	      				onames: []
	    				};
	  			}
	  			shopsGrouped[shop.sname].onames.push(shop.oname);
			});

			// グループ化した店舗ごとに出力
			for (const sname in shopsGrouped) {
	  			const shop = shopsGrouped[sname];
          			// sidを取得
          			const shopInfo = matchedShops.find(s => s.sname === sname);
          			const sid = shopInfo ? shopInfo.sid : null;

          			// URLを探す
          			const urlInfo = shopsurl.find(u => u.sid === sid);
          			const url = urlInfo ? urlInfo.url : null;

	  			outputDiv.innerHTML += `<strong>店舗名: </strong>${sname}<br><strong>住所: </strong>${shop.jyuusyo}<br><strong>おすすめ</strong><br>`;
	  			shop.onames.forEach(oname => {
	    				outputDiv.innerHTML += `・${oname}<br>`;
	  			});

         			if (url) {
           				outputDiv.innerHTML += `<strong>URL: </strong><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a><br>`;
          			}
	  			outputDiv.innerHTML += `<br>`;
			}

      		},
      		(err) => {
        		outputDiv.textContent = "位置情報取得に失敗しました。許可が必要です。";
      		},
      		{ enableHighAccuracy: true }
		);
  	});
});
