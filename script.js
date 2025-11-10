// アコーディオン動作
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const isOpen = content.classList.contains('open');
    document.querySelectorAll('.accordion-content.open').forEach(c => c.classList.remove('open'));
    if (!isOpen) content.classList.add('open');
  });
});


// 各リンクをクリックしたらマーカーのポップアップを開く
document.querySelectorAll('.bus-stop-link').forEach(link => {
  link.addEventListener('click', () => {
    const stopName = link.getAttribute('data-stop');
    const marker = busStops[stopName];
    if (marker) {
      marker.openPopup();
      map.setView(marker.getLatLng(), 16); // マーカー位置にズーム
    }
  });
});

//表示するマップの緯度、経度、座標
var map = L.map('mapid',{maxBounds: [
    [40.82395, 140.73295],  // 南西の緯度・経度
    [40.82994, 140.74650]   // 北東の緯度・経度
  ],
  maxBoundsViscosity: 1.0  // バウンダリの粘着度。1.0にすると範囲外へは完全に移動不可
}).setView([40.82712, 140.73881], 16);

//OpenStreetMap:タイルを作成
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	//マップの最大拡大率、最小縮小率
	maxZoom: 19,
	minZoom: 16,
	zoomControl: true,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

//バス停に青いピンを立てる
const data = [
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



//ブルーのマーカー
const icon_blue = L.icon({
  iconUrl:'./ほわ赤ピン.png',
  iconSize:[50,50],
  iconAnchor:[30,49],
  popupAnchor:[20,30]
});

//ピンクのマーカー
const icon_pink = L.icon({
  iconUrl:'./ほわ黄ピン3.png',
  iconSize:[70,70],
  iconAnchor: [37, 60],      // 画像の底中央に合わせる
  popupAnchor: [20, 15]      // ポップアップはピンの上に表示
});

const busStops = {};

// クリック座標表示用マーカーはループの外で1回だけ宣言
let clickMarker = null;
// ポップアップを追跡する変数を追加
let currentPopup = null; 

// 各マーカー作成＋ポップアップリンク設定
data.forEach(loc => {
  const popupContent = `<a href="#" class="popup-link" data-id="${loc.id}">${loc.name}</a>`;
  const marker = L.marker([loc.lat, loc.lng], { icon: icon_blue })
    .bindPopup(popupContent, { offset: L.point(-30, -65) });
marker.on('click', () => {
    // 既に開いているポップアップがあれば閉じる
    if (currentPopup && map.hasLayer(currentPopup)) {
      map.closePopup(currentPopup);
    }

    marker.bindPopup(popupContent, { offset: L.point(-30, -65) });
    currentPopup = marker.getPopup(); // ← 開いたポップアップを記録
  });

  marker.addTo(map);

  busStops[loc.name] = marker;
});


//ポップアップのメッセージをクリックしたときのサイドパネル
const sidePanel = document.getElementById('side-panel');
const closeBtn = document.getElementById('close-btn');
const panelContent = document.getElementById('panel-content');

closeBtn.addEventListener('click', () => {
  sidePanel.classList.remove('open');
});

// ポップアップリンクをクリックしたらサイドパネル表示
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('popup-link')) {
    e.preventDefault();

    // data.id を取得（数値に変換）
    const id = parseInt(e.target.dataset.id, 10);

    // idに対応する店舗をフィルタリング
    const filteredShops = shops.filter(shop => shop.id === id);

    if (filteredShops.length > 0) {
      let html = `<h3>バス停近くのお店</h3>`;
// sid ごとにグループ化
      const shopGroups = {};
      filteredShops.forEach(shop => {
        if (!shopGroups[shop.sid]) {
          shopGroups[shop.sid] = {
            sname: shop.sname,
            jyuusyo: shop.jyuusyo,
            products: []
          };
        }
        shopGroups[shop.sid].products.push(shop.oname);
      });

      // 表示用に整形
      for (const sid in shopGroups) {
        const group = shopGroups[sid];
        const url = shopsurl.find(url => url.sid === parseInt(sid))?.url || '#';

	// sidに対応するショップの最初の情報を取得
  	const firstShop = filteredShops.find(shop => shop.sid === parseInt(sid));

        html += `
          <div>
            <h4><a href="#" class="shop-link"
     		data-lat="${firstShop.lat}"
     		data-lng="${firstShop.lng}"
     		data-sid="${sid}">
    		 ${group.sname}
 		 </a>
	    </h4>
            <p><strong>住所：</strong>${group.jyuusyo}</p>
            <p><strong>おすすめの商品：</strong></p>
            <ul>
              ${group.products.map(product => `<li>${product}</li>`).join('')}
            </ul>
            <p><a href="${url}" target="_blank" rel="noopener noreferrer">店舗ページへ</a></p>
          </div>
          <hr>
        `;
      }

      panelContent.innerHTML = html;
    } else {
      panelContent.innerHTML = `<p>該当する店舗情報がありません。</p>`;
    }

    sidePanel.classList.add('open');
  }
});

// サイドパネル内の店名リンクをクリックしたとき
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('shop-link')) {
    e.preventDefault();

    const lat = parseFloat(e.target.dataset.lat);
    const lng = parseFloat(e.target.dataset.lng);
    const shopsid = parseInt(e.target.dataset.sid, 10);
    
    // shopsidから店舗URLを取得
    const shopUrl = shopsurl.find(s => s.sid === shopsid)?.url || "#";

    if (!isNaN(lat) && !isNaN(lng)) {
      // 既存のピンクマーカー削除
      if (clickMarker) {
        map.removeLayer(clickMarker);
      }

      // 地図を移動して、移動完了後にマーカーを立ててポップアップ表示
      map.setView([lat, lng], 18);

      map.once('moveend', () => {
        clickMarker = L.marker([lat, lng], { icon: icon_pink }).addTo(map);
        clickMarker.bindPopup(
          `<a href="${shopUrl}" target="_blank" rel="noopener noreferrer">${e.target.textContent}</a>`,
          { offset: L.point(-20, -60) }
        ).openPopup();
      });
    }
  }
});

//ショップリスト
const shops = [
  {id:1, sid: 1, sname: "思い出もおみやげ　葛西商店", jyuusyo: "青森市新町1-1-21", oname: "ホタテで乾杯！", lat: 40.828215,lng: 140.735518 },
  {id:1, sid: 1, sname: "思い出もおみやげ　葛西商店", jyuusyo: "青森市新町1-1-21", oname: "りんごdip", lat: 40.828215,lng: 140.735518 },
  {id:1, sid: 1, sname: "思い出もおみやげ　葛西商店", jyuusyo: "青森市新町1-1-21", oname: "林檎けんぴ りんご茶 干りんご", lat: 40.828215,lng: 140.735518 },
  {id:2, sid: 2, sname: "お食事処　おさない", jyuusyo: "青森市新町1-1-17", oname: "ほたてカレー", lat: 40.828087, lng: 140.736035 },
  {id:2, sid: 2, sname: "お食事処　おさない", jyuusyo: "青森市新町1-1-17", oname: "ベーコンエッグ定食", lat: 40.828087, lng: 140.736035 },
  {id:2, sid: 2, sname: "お食事処　おさない", jyuusyo: "青森市新町1-1-17", oname: "さかな定食", lat: 40.828087, lng: 140.736035 },
  {id:2, sid: 3, sname: "電器屋ＩＫＯ", jyuusyo: "青森市新町1-9-22", oname: "シンプル湯沸かし", lat: 40.827610, lng: 140.736998 },
  {id:2, sid: 3, sname: "電器屋ＩＫＯ", jyuusyo: "青森市新町1-9-22", oname: "アラジントースター", lat: 40.827610, lng: 140.736998 },
  {id:2, sid: 3, sname: "電器屋ＩＫＯ", jyuusyo: "青森市新町1-9-22", oname: "卓上電気グリル鍋", lat: 40.827610, lng: 140.736998 },
  {id:3, sid: 4, sname: "和食や じんすけ", jyuusyo: "青森市新町2-8-5", oname: "陸奥湾コース（会席）", lat: 40.825473, lng: 140.744656 },
  {id:3, sid: 4, sname: "和食や じんすけ", jyuusyo: "青森市新町2-8-5", oname: "活イカの造り", lat: 40.825473, lng: 140.744656 },
  {id:3, sid: 4, sname: "和食や じんすけ", jyuusyo: "青森市新町2-8-5", oname: "当日OKおまかせコース", lat: 40.825473, lng: 140.744656 },
  {id:4, sid: 5, sname: "ジェラート・ナチュレ", jyuusyo: "青森市新町1丁目6-22", oname: "林檎のジェラート", lat: 40.826654, lng: 140.736202 },
  {id:4, sid: 6, sname: "喫茶クレオパトラ", jyuusyo: "青森市新町2-8-4", oname: "バナナとりんごのケーキ", lat: 40.825497, lng: 140.744557 },
  {id:4, sid: 6, sname: "喫茶クレオパトラ", jyuusyo: "青森市新町2-8-4", oname: "レスキュースープ", lat: 40.825497, lng: 140.744557 },
  {id:4, sid: 6, sname: "喫茶クレオパトラ", jyuusyo: "青森市新町2-8-4", oname: "英国風スコーンセット", lat: 40.825497, lng: 140.744557 },
  {id:5, sid: 7, sname: "パサージュ広場", jyuusyo: "青森市新町1丁目8-5", oname: "おしゃれな店舗が集まってます！", lat: 40.827074, lng: 140.737256 },
  {id:6, sid: 8, sname: "True", jyuusyo: "青森市古川1丁目16-1 一郎屋ビル 1F", oname: "Trueカレー", lat: 40.824760, lng: 140.737202 },
  {id:6, sid: 8, sname: "True", jyuusyo: "青森市古川1丁目16-1 一郎屋ビル 1F", oname: "2色カレー", lat: 40.824760, lng: 140.737202 },
  {id:6, sid: 9, sname: "COFFEEMAN good", jyuusyo: "青森市古川1丁目17-1", oname: "コーヒーを通じてつながるコミュニティスタンド", lat: 40.825509, lng: 140.737765 },
  {id:7, sid: 10, sname: "鮨処あすか", jyuusyo: "青森市新町1-9-22", oname: "サーモン塩麹焼き", lat: 40.827025, lng: 140.738530 },
  {id:7, sid: 10, sname: "鮨処あすか", jyuusyo: "青森市新町1-9-22", oname: "自家製茶碗蒸し", lat: 40.827025, lng: 140.738530 },
  {id:7, sid: 10, sname: "鮨処あすか", jyuusyo: "青森市新町1-9-22", oname: "ばらちらし", lat: 40.827025, lng: 140.738530 },
  {id:7, sid: 11, sname: "うぐいす", jyuusyo: "青森市新町1-11-16 ダイワロイネットホテル青森 1F", oname: "特製おまかせ握り9貫※事前予約必須", lat: 40.826853, lng: 140.739391 },
  {id:7, sid: 11, sname: "うぐいす", jyuusyo: "青森市新町1-11-16 ダイワロイネットホテル青森 1F", oname: "THE OBANZAI", lat: 40.826853, lng: 140.739391 },
  {id:7, sid: 11, sname: "うぐいす", jyuusyo: "青森市新町1-11-16 ダイワロイネットホテル青森 1F", oname: "UGUISUの極上牛まぶし膳", lat: 40.826853, lng: 140.739391 },
  {id:7, sid: 12, sname: "チャンドラ", jyuusyo: "青森市新町1-13-5", oname: "エンガデン", lat: 40.826353, lng: 140.739506 },
  {id:8, sid: 13, sname: "新町キューブ", jyuusyo: "青森市新町2丁目6-25", oname: "貸しスタジオ、イベントあり", lat: 40.826303, lng: 140.742164 },
  {id:8, sid: 14, sname: "洋菓子店 赤い林檎", jyuusyo: "青森市新町2丁目6-15", oname: "マドレーヌ", lat: 40.826100, lng: 140.743808 },
  {id:8, sid: 14, sname: "洋菓子店 赤い林檎", jyuusyo: "青森市新町2丁目6-15", oname: "ダックワーズ", lat: 40.826100, lng: 140.743808 },
  {id:8, sid: 14, sname: "洋菓子店 赤い林檎", jyuusyo: "青森市新町2丁目6-15", oname: "シフォンケーキ ココア", lat: 40.826100, lng: 140.743808 },
  {id:9, sid: 15, sname: "さくら野百貨店 青森本店", jyuusyo: "青森市新町1-13-2", oname: "シルクレッグウォーマー", lat: 40.826258, lng: 140.739093 },
  {id:9, sid: 15, sname: "さくら野百貨店 青森本店", jyuusyo: "青森市新町1-13-2", oname: " [岩手鉄製]ダクタイルディープパン", lat: 40.826258, lng: 140.739093 },
  {id:9, sid: 15, sname: "さくら野百貨店 青森本店", jyuusyo: "青森市新町1-13-2", oname: "津軽びいどろ「ぐい呑み」", lat: 40.826258, lng: 140.739093 }
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