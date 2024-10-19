let serverName = "류트";
let channelNum = 1;
let apiKey = "";
let oldServerName = "";
let oldChannelNum = 0;
let oldApiKey = "";

const npcInfo = [
  { npc: "델", location: "이멘 마하" },
  { npc: "델렌", location: "이멘 마하" },
  { npc: "상인 라누", location: "반호르" },
  { npc: "상인 피루", location: "벨바스트" },
  { npc: "모락", location: "칼리다" },
  { npc: "상인 아루", location: "카브" },
  { npc: "리나", location: "코르" },
  { npc: "상인 누누", location: "던바튼" },
  { npc: "상인 메루", location: "이멘 마하" },
  { npc: "켄", location: "필리아" },
  { npc: "귀넥", location: "카루" },
  { npc: "얼리", location: "오아시스" },
  { npc: "데위", location: "페라" },
  { npc: "테일로", location: "켈라" },
  { npc: "상인 세누", location: "스카하" },
  { npc: "상인 베루", location: "탈틴" },
  { npc: "상인 에루", location: "타라" },
  { npc: "상인 네루", location: "티르코네일" },
  { npc: "카디", location: "발레스" },
  { npc: "인장 상인", location: "" },
  { npc: "피오나트", location: "" },
];

let nextUpdate = "";
let getError = false;
let pouchList = [];
let updateInterval;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

window.onload = function () {
  console.log(`                 _     _               
                | |   (_)              
 _ __ ___   __ _| |__  _ _________   _ 
| '_ \` _ \\ / _\` | '_ \\| |_  /_  / | | |
| | | | | | (_| | |_) | |/ / / /| |_| |
|_| |_| |_|\\__,_|_.__/|_/___/___|\\__,_| 🩵
made by https://github.com/Aither0527`);

  //apikey 로컬스토리지 저장
  const apiKeyStored = localStorage.getItem("apiKey");
  if (apiKeyStored) {
    document.getElementById("api-key").value = apiKeyStored;
  }

  document.getElementById("api-key").addEventListener("input", function () {
    const api = this.value;
    localStorage.setItem("apiKey", api);
  });
};

async function searchItems() {
  const apiUrl = new URL("https://open.api.nexon.com/mabinogi/v1/npcshop/list");

  for (const { npc, location } of npcInfo) {
    const params = new URLSearchParams({
      npc_name: npc,
      server_name: serverName,
      channel: channelNum,
    });

    try {
      const response = await fetch(`${apiUrl}?${params}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-nxopen-api-key": apiKey,
        },
      });

      if (!response.ok) {
        console.log("Error : " + error);
        throw new Error(`Error status : ${response.status}`);
      }
      const data = await response.json();
      nextUpdate = data.date_shop_next_update;
      const pouchShop = data.shop.filter((shop) => shop.tab_name === "주머니");
      pouchList.push({
        npc,
        location,
        shopList: pouchShop.flatMap((obj) => obj.item),
      });
      await delay(500);
      getError = false;
    } catch (error) {
      console.log("Error : " + error);
      getError = true;
    }
  }
}

function updateDisplay(category = "total") {
  let outerColor = document.getElementById("outer-color").value;
  let textColor = document.getElementById("text-color").value;
  let innerColor = document.getElementById("inner-color").value;
  let errorRange = document.getElementById("error-range").value;
  let filtered = document.getElementById("check-box").checked ? true : false;
  const shopItemsContainer = document.getElementById("shop_items");
  shopItemsContainer.innerHTML = ""; //innerHTML 초기화
  let displayList;

  switch (category) {
    case "total":
      displayList = pouchList;
      break;
    default:
      displayList = pouchList;
  }

  displayList.map((item) => {
    if (item.shopList.length != 0) {
      const npcInfo = document.createElement("div");
      npcInfo.className = "npc_info";
      npcInfo.innerHTML = `
        <div class="item_location">${item.location} (${item.npc})</div>
        <div class="shop_wrap">
        ${item.shopList
          .map((i) => {
            if (i.item_display_name.includes("주머니")) {
              let decodeUrl = decodeURIComponent(i.image_url).split(
                "item_color="
              )[1];
              const colorData = JSON.parse(decodeUrl);
              const color1 = hexToRgb(colorData.color_01);
              const color2 = hexToRgb(colorData.color_02);
              const color3 = hexToRgb(colorData.color_03);
              //필터링 한 경우
              if (filtered) {
                if (
                  //색상 매치인 경우만 출력
                  colorMatch(outerColor, color1, errorRange) &&
                  colorMatch(textColor, color2, errorRange) &&
                  colorMatch(innerColor, color3, errorRange)
                ) {
                  return `
                <div class="shop_item">
                  <div>
                    <img src="${i.image_url}" alt="${i.item_display_name}">
                    <div class="item_name">${i.item_display_name}</div>
                    <div class="item_text_wrap">
                      <div style="color:${colorData.color_01}">겉감 </div>
                      <div style="width: 15px; height: 15px; background-color: ${colorData.color_01}"></div>
                      <div>(${color1.r}, ${color1.g}, ${color1.b})</div>
                    </div>
                    <div class="item_text_wrap">
                      <div style="color:${colorData.color_02}">숫자 </div>
                      <div style="width: 15px; height: 15px; background-color: ${colorData.color_02}"></div>
                      <div>(${color2.r}, ${color2.g}, ${color2.b})</div>
                    </div>
                    <div class="item_text_wrap">
                      <div style="color:${colorData.color_03}">안감 </div>
                      <div style="width: 15px; height: 15px; background-color: ${colorData.color_03}"></div>
                      <div>(${color3.r}, ${color3.g}, ${color3.b})</div>
                    </div>
                  </div>
                </div>
            `;
                }
              } else {
                //필터링 안 한 경우 전부 출력
                return `
              <div class="shop_item">
                <div>
                  <img src="${i.image_url}" alt="${i.item_display_name}">
                  <div class="item_name">${i.item_display_name}</div>
                  <div class="item_text_wrap">
                    <div style="color:${colorData.color_01}">겉감 </div>
                    <div style="width: 15px; height: 15px; background-color: ${colorData.color_01}"></div>
                    <div>(${color1.r}, ${color1.g}, ${color1.b})</div>
                  </div>
                  <div class="item_text_wrap">
                    <div style="color:${colorData.color_02}">숫자 </div>
                    <div style="width: 15px; height: 15px; background-color: ${colorData.color_02}"></div>
                    <div>(${color2.r}, ${color2.g}, ${color2.b})</div>
                  </div>
                  <div class="item_text_wrap">
                    <div style="color:${colorData.color_03}">안감 </div>
                    <div style="width: 15px; height: 15px; background-color: ${colorData.color_03}"></div>
                    <div>(${color3.r}, ${color3.g}, ${color3.b})</div>
                  </div>
                </div>
              </div>
          `;
              }
            }
          })
          .join("")}
        </div>
      `;

      shopItemsContainer.appendChild(npcInfo);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-button");
  searchBtn.addEventListener("click", async () => {
    serverName = document.getElementById("server-name").value;
    channelNum = document.getElementById("channel-num").value;
    apiKey = document.getElementById("api-key").value;
    if (!apiKey) {
      alert("api key를 입력해주세요");
      return 0;
    }
    try {
      //검색 버튼 비활성화 및 로딩 표시
      searchBtn.disabled = true;
      searchBtn.textContent = "검색 중...";

      //로딩 메시지 표시
      const shopItemsContainer = document.getElementById("shop_items");
      shopItemsContainer.innerHTML = '<div class="loading">검색 중...</div>';

      //변경사항이 있는 경우만 searchItems를 실행하여 데이터 fetch
      if (
        serverName != oldServerName ||
        channelNum != oldChannelNum ||
        apiKey != oldApiKey
      ) {
        await searchItems();
      }

      updateDisplay();

      updateInterval = setInterval(toUpdateTime, 1000);
      oldServerName = serverName;
      oldChannelNum = channelNum;
      oldApiKey = apiKey;
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      const shopItemsContainer = document.getElementById("shop_items");
      shopItemsContainer.innerHTML =
        '<div class="error">검색 중 오류가 발생했습니다. 다시 시도해 주세요.</div>';
    } finally {
      //검색 버튼 활성화
      searchBtn.disabled = false;
      searchBtn.textContent = "검색";
    }
  });

  //카테고리 버튼
  const categories = ["total"];
  categories.forEach((category) => {
    const button = document.getElementById(`${category}-button`);
    if (button) {
      button.addEventListener("click", () => updateDisplay(category));
    }
  });

  const outerColorPicker = document.getElementById("outer-color-picker");
  const textColorPicker = document.getElementById("text-color-picker");
  const innerColorPicker = document.getElementById("inner-color-picker");

  const outerColorInput = document.getElementById("outer-color");
  const textColorInput = document.getElementById("text-color");
  const innerColorInput = document.getElementById("inner-color");

  //겉감 색상 변경
  outerColorPicker.addEventListener("input", function () {
    outerColorInput.value = this.value.toUpperCase();
  });

  outerColorInput.addEventListener("input", function () {
    let color = this.value;
    //'#'이 없으면 추가
    if (color.charAt(0) !== "#") {
      color = "#" + color;
    }
    //유효한 색상 형식인지 확인
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      outerColorPicker.value = color;
    }
  });

  //중간 색상 변경
  textColorPicker.addEventListener("input", function () {
    textColorInput.value = this.value.toUpperCase();
  });

  textColorInput.addEventListener("input", function () {
    let color = this.value;
    //'#'이 없으면 추가
    if (color.charAt(0) !== "#") {
      color = "#" + color;
    }
    //유효한 색상 형식인지 확인
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      textColorPicker.value = color;
    }
  });

  //안감 색상 변경
  innerColorPicker.addEventListener("input", function () {
    innerColorInput.value = this.value.toUpperCase();
  });

  innerColorInput.addEventListener("input", function () {
    let color = this.value;
    //'#'이 없으면 추가
    if (color.charAt(0) !== "#") {
      color = "#" + color;
    }
    //유효한 색상 형식인지 확인
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      innerColorPicker.value = color;
    }
  });
  outerColorInput.value = outerColorPicker.value.toUpperCase();
  textColorInput.value = textColorPicker.value.toUpperCase();
  innerColorInput.value = innerColorPicker.value.toUpperCase();
});

function toUpdateTime() {
  const currentTime = new Date().getTime();
  const timeLeft = new Date(nextUpdate).getTime() - currentTime;
  if (timeLeft > 0 && getError == false) {
    const min = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((timeLeft % (1000 * 60)) / 1000);
    document.getElementById(
      "next_update"
    ).innerHTML = `다음 업데이트까지 ${min}분 ${sec}초`;
  } else if ((timeLeft <= 0 || timeLeft == undefined) && getError == false) {
    searchItems();
  } else {
    alert("새로고침 후 다시 시도해주세요");
    clearInterval(updateInterval);
  }
}

function hexToRgb(hex) {
  hex = hex.toString().replace(/^#/, "");

  const rgb = {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };

  return rgb;
}

function colorMatch(targetColor, itemColor, errorRange) {
  const targetRGB = hexToRgb(targetColor);
  const itemRGB = itemColor;
  return (
    Math.abs(targetRGB.r - itemRGB.r) <= errorRange &&
    Math.abs(targetRGB.g - itemRGB.g) <= errorRange &&
    Math.abs(targetRGB.b - itemRGB.b) <= errorRange
  );
}
