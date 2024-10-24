let serverName = "류트";
let channelNum = 1;
let apiKey = "";
let oldServerName = "";
let oldChannelNum = 0;
let oldApiKey = "";
let oldNextUpdate = "";

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

const categoryMap = {
  "음식 주머니": ["달걀", "감자", "옥수수", "밀", "보리"],
  "양털 주머니": ["양털"],
  "거미줄/실뭉치 주머니": ["거미줄", "실뭉치"],
  "가죽 주머니": ["가죽"],
  "옷감 주머니": ["옷감"],
  "실크 주머니": ["실크"],
  "꽃바구니": ["꽃바구니"],
};
let currentCategory = "전체";

let nextUpdate = "";
let getError = false;
let errorMsg = "";
let pouchList = []; //response 리스트
let updateInterval;
let buttonUpdateInterval;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const categoryButtons = document.querySelectorAll(".category_wrap button");

//onload
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

  oldNextUpdate = localStorage.getItem("nextUpdate");
  if (oldNextUpdate) {
    nextUpdate = oldNextUpdate;
  }
};

//api 호출
async function searchItems() {
  const apiUrl = new URL("https://open.api.nexon.com/mabinogi/v1/npcshop/list");
  pouchList = []; //초기화

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
        throw new Error(`Error status : ${error.message}`);
      }
      const data = await response.json();
      nextUpdate = data.date_shop_next_update;
      console.log(nextUpdate);
      if (oldNextUpdate != nextUpdate) {
        localStorage.setItem("nextUpdate", nextUpdate);
      }
      const pouchShop = data.shop.filter((shop) => shop.tab_name === "주머니");
      const categorizedPouch = {
        npc,
        location,
        categories: {},
      };

      //카테고리별로 묶기
      pouchShop
        .flatMap((obj) => obj.item)
        .forEach((item) => {
          for (const [category, keywords] of Object.entries(categoryMap)) {
            if (
              keywords.some((keyword) =>
                item.item_display_name.includes(keyword)
              )
            ) {
              if (!categorizedPouch.categories[category]) {
                categorizedPouch.categories[category] = [];
              }
              categorizedPouch.categories[category].push(item);
              break;
            }
          }
        });

      pouchList.push(categorizedPouch);
      getError = false;
    } catch (error) {
      console.log("Error : " + error);
      getError = true;
      errorMsg = error.message;
    }
  }
}

//화면 업데이트
function updateDisplay() {
  // const outerColor = document.getElementById("outer-color").value;
  // const textColor = document.getElementById("text-color").value;
  // const innerColor = document.getElementById("inner-color").value;
  // const outerErrorRange = document.getElementById("outer-error-range").value;
  // const textErrorRange = document.getElementById("text-error-range").value;
  // const innerErrorRange = document.getElementById("inner-error-range").value;
  // const outerChecked = document.getElementById("outer-check-box").checked;
  // const textChecked = document.getElementById("text-check-box").checked;
  // const innerChecked = document.getElementById("inner-check-box").checked;
  const shopItemsContainer = document.getElementById("shop_items");

  shopItemsContainer.innerHTML = ""; //innerHTML 초기화

  pouchList.forEach((item) => {
    const categoryItems =
      currentCategory === "전체"
        ? Object.values(item.categories).flat()
        : item.categories[currentCategory] || [];

        const filteredItems = categoryItems;
    // const filteredItems = categoryItems.filter((i) => {
    //   let decodeUrl = decodeURIComponent(i.image_url).split("item_color=")[1];
    //   const colorData = JSON.parse(decodeUrl);
    //   const colors = [
    //     {
    //       name: "겉감",
    //       hex: colorData.color_01,
    //       rgb: hexToRgb(colorData.color_01),
    //       filter: outerColor,
    //       checked: outerChecked,
    //       errorRange: outerErrorRange,
    //     },
    //     {
    //       name: "글자",
    //       hex: colorData.color_02,
    //       rgb: hexToRgb(colorData.color_02),
    //       filter: textColor,
    //       checked: textChecked,
    //       errorRange: textErrorRange,
    //     },
    //     {
    //       name: "안감",
    //       hex: colorData.color_03,
    //       rgb: hexToRgb(colorData.color_03),
    //       filter: innerColor,
    //       checked: innerChecked,
    //       errorRange: innerErrorRange,
    //     },
    //   ];
    //   return colors.every(
    //     (color) =>
    //       !color.checked ||
    //       colorMatch(color.filter, color.rgb, parseInt(color.errorRange))
    //   );
    // });

    if (filteredItems.length > 0) {
      const npcInfo = document.createElement("div");
      npcInfo.className = "npc_info";
      npcInfo.innerHTML = `
        <div class="item_location">${item.location} (${item.npc})</div>
        <div class="shop_wrap">
          ${filteredItems
            .map(
              (i) => `
              <div class="shop_item">
                <div>
                  <img src="${i.image_url}" alt="${i.item_display_name}">
                  <div class="item_name">${i.item_display_name}</div>
                </div>
              </div>
            `
            )
            .join("")}
        </div>
      `;
      shopItemsContainer.appendChild(npcInfo);
    }
  });
}

//카테고리 버튼 선택
function handleCategoryButtons() {
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.textContent;
      updateDisplay();
    });
  });
}

//검색 불가 상태 체크
function canSearch() {
  if (!nextUpdate) return true;

  const now = new Date();
  const nextUpdateDate = new Date(nextUpdate);
  const timeDiff = nextUpdateDate.getTime() - now.getTime();
  const minutesDiff = timeDiff / (1000 * 60);

  return minutesDiff >= 5;
}

//버튼 상태 업데이트
function updateButtonState() {
  const searchBtn = document.getElementById("search-button");
  const now = new Date();
  const nextUpdateDate = new Date(nextUpdate);
  const timeDiff = Math.max(0, nextUpdateDate.getTime() - now.getTime());
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  const secondsDiff = Math.floor((timeDiff % (1000 * 60)) / 1000);

  if (oldNextUpdate === nextUpdate) {
    nextUpdate = "";
  }

  if (!canSearch()) {
    searchBtn.disabled = true;
    searchBtn.textContent = `${minutesDiff}:${secondsDiff
      .toString()
      .padStart(2, "0")}`;
  } else {
    searchBtn.disabled = false;
    searchBtn.textContent = "검색";
    //버튼 인터벌 정지
    if (buttonUpdateInterval) {
      clearInterval(buttonUpdateInterval);
      buttonUpdateInterval = null;
    }
  }
}

//DomContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  handleCategoryButtons();
  const searchBtn = document.getElementById("search-button");

  //버튼 인터벌 확인
  if (buttonUpdateInterval) {
    clearInterval(buttonUpdateInterval);
  }
  buttonUpdateInterval = setInterval(updateButtonState, 1000);

  searchBtn.addEventListener("click", async () => {
    if (!canSearch()) {
      return;
    }
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

      updateButtonState();

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

  // const outerColorPicker = document.getElementById("outer-color-picker");
  // const outerColorR = document.getElementById("outer-color-r");
  // const outerColorG = document.getElementById("outer-color-g");
  // const outerColorB = document.getElementById("outer-color-b");
  // const outerColorInput = document.getElementById("outer-color");
  // const outerErrorRange = document.getElementById("outer-error-range");

  // const textColorPicker = document.getElementById("text-color-picker");
  // const textColorR = document.getElementById("text-color-r");
  // const textColorG = document.getElementById("text-color-g");
  // const textColorB = document.getElementById("text-color-b");
  // const textColorInput = document.getElementById("text-color");
  // const textErrorRange = document.getElementById("outer-error-range");

  // const innerColorPicker = document.getElementById("inner-color-picker");
  // const innerColorR = document.getElementById("inner-color-r");
  // const innerColorG = document.getElementById("inner-color-g");
  // const innerColorB = document.getElementById("inner-color-b");
  // const innerColorInput = document.getElementById("inner-color");
  // const innerErrorRange = document.getElementById("outer-error-range");

  //컬러 포맷 컴포넌트
  function formatColor(color) {
    if (color.charAt(0) !== "#") {
      color = "#" + color;
    }

    //유효한 색상 형식인지 확인
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return color.toUpperCase();
    }
    return null;
  }

  //입력 숫자 범위 설정
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateColor(position) {
    const elements = {
      outer: {
        picker: outerColorPicker,
        input: outerColorInput,
        r: outerColorR,
        g: outerColorG,
        b: outerColorB,
      },
      text: {
        picker: textColorPicker,
        input: textColorInput,
        r: textColorR,
        g: textColorG,
        b: textColorB,
      },
      inner: {
        picker: innerColorPicker,
        input: innerColorInput,
        r: innerColorR,
        g: innerColorG,
        b: innerColorB,
      },
    };

    const { picker, input, r, g, b } = elements[position];

    return function (color) {
      const formattedColor = formatColor(
        color ||
          rgbToHex(
            clamp(parseInt(r.value) || 0, 0, 255),
            clamp(parseInt(g.value) || 0, 0, 255),
            clamp(parseInt(b.value) || 0, 0, 255)
          )
      );

      if (formattedColor) {
        const rgb = hexToRgb(formattedColor);
        picker.value = formattedColor;
        input.value = formattedColor;
        r.value = rgb.r;
        g.value = rgb.g;
        b.value = rgb.b;
      }
    };
  }

  ["outer", "text", "inner"].forEach((position) => {
    const elements = {
      outer: {
        picker: outerColorPicker,
        input: outerColorInput,
        r: outerColorR,
        g: outerColorG,
        b: outerColorB,
        errorRange: outerErrorRange,
      },
      text: {
        picker: textColorPicker,
        input: textColorInput,
        r: textColorR,
        g: textColorG,
        b: textColorB,
        errorRange: textErrorRange,
      },
      inner: {
        picker: innerColorPicker,
        input: innerColorInput,
        r: innerColorR,
        g: innerColorG,
        b: innerColorB,
        errorRange: innerErrorRange,
      },
    };

    const { picker, input, r, g, b, errorRange } = elements[position];
    const updateColorForPosition = updateColor(position);

    picker.addEventListener("input", function () {
      updateColorForPosition(this.value);
    });
    input.addEventListener("input", function () {
      updateColorForPosition(this.value);
    });
    input.addEventListener("blur", function () {
      updateColorForPosition(this.value);
    });
    errorRange.addEventListener("blur", function () {
      this.value = clamp(parseInt(this.value) || 0, 0, 255);
      updateColorForPosition();
    });

    [(r, g, b)].forEach((input) => {
      input.addEventListener("input", () => updateColorForPosition());
      input.addEventListener("blur", function () {
        this.value = clamp(parseInt(this.value) || 0, 0, 255);
        updateColorForPosition();
      });
    });
  });

  outerColorInput.value = outerColorPicker.value.toUpperCase();
  textColorInput.value = textColorPicker.value.toUpperCase();
  innerColorInput.value = innerColorPicker.value.toUpperCase();
});

function toUpdateTime() {
  const currentTime = new Date().getTime();
  const timeLeft = new Date(nextUpdate).getTime() - currentTime;
  const nextUpdateKR = new Date(
    new Date(nextUpdate).getTime() + 9 * 60 * 60 * 1000
  );
  const hours = nextUpdateKR.getUTCHours();
  const ampm = hours < 12 ? "오전" : "오후";
  const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");

  if (timeLeft > 0 && getError == false) {
    const min = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((timeLeft % (1000 * 60)) / 1000);
    document.getElementById("next_update").innerHTML = `
    <div>
      다음 업데이트 : ${ampm} ${formattedHours}시 ${nextUpdateKR
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}분 / 남은 시간 : ${min}분 ${sec}초
    </div>`;
  } else if ((timeLeft <= 0 || timeLeft == undefined) && getError == false) {
    searchItems();
  } else {
    if (errorMsg.includes("wait until the data is ready")) {
      alert("데이터 업데이트 중입니다. 잠시 후 다시 시도해주세요!");
    } else {
      alert("새로고침 후 다시 시도해주세요");
    }
    clearInterval(updateInterval);
  }
}

//색상 포맷 변경
function hexToRgb(hex) {
  const rgb = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
  return rgb;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

//필터링
function colorMatch(targetColor, itemColor, errorRange) {
  const targetRGB = hexToRgb(targetColor);
  const itemRGB = itemColor;
  return (
    Math.abs(targetRGB.r - itemRGB.r) <= errorRange &&
    Math.abs(targetRGB.g - itemRGB.g) <= errorRange &&
    Math.abs(targetRGB.b - itemRGB.b) <= errorRange
  );
}
