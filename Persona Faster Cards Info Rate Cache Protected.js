// ==UserScript==
// @name         Personal Cards Info Rate Cache Protected
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Информация о картах, need / trade / want list
// @author       George
// @match        https://animestars.org/*
// @match        https://astars.club/*
// @match        https://asstars1.astars.club/*
// @match        https://as1.astars.club/*
// @match        https://asstars.tv/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  const vLS5ca7271d7b19c0d1d6cb = "5ca7271d7b19c0d1d6cb0f5cc783b608f5a7e9fee65f983438afd6f227f75946";
  let vLS = "";
  const vLN3600000 = 3600000;
  const vLN36000002 = 3600000;
  const vA = ["volk_lala", "oskolok300", "jorsh13bb", "jorsh13b", "StormSpirit", "Narcissistic", "Last Night", "Extazz", "Ellhun_teleri", "MarshWallow", "Nismo38rus", "Sawkeee", "MaYor", "Kaneki_Haise", "Gostapenko", "Violet_simp", "zik322"];
  async function f(p) {
    const v = new TextEncoder();
    const v2 = v.encode(p.join(""));
    const v3 = await crypto.subtle.digest("SHA-256", v2);
    const v4 = Array.from(new Uint8Array(v3));
    const v5 = v4.map(p2 => p2.toString(16).padStart(2, "0")).join("");
    return v5;
  }
  async function f2() {
    const v6 = await f(vA);
    if (v6 !== vLS5ca7271d7b19c0d1d6cb) {
      return false;
    }
    return true;
  }
  function f3(p3, p4, p5) {
    const vO = {
      timestamp: Date.now(),
      data: p4
    };
    localStorage.setItem(p3, JSON.stringify(vO));
    if (p5) {
      setTimeout(() => {
        localStorage.removeItem(p3);
        if (p3.startsWith("data-id")) {
          localStorage.removeItem(p3);
        }
      }, p5);
    }
  }
  function f4(p6) {
    const v7 = localStorage.getItem(p6);
    if (!v7) {
      return null;
    }
    const v8 = JSON.parse(v7);
    const v9 = Date.now();
    if (v9 - v8.timestamp > vLN3600000) {
      localStorage.removeItem(p6);
      if (p6.startsWith("data-id")) {
        localStorage.removeItem(p6);
      }
      return null;
    }
    return v8.data;
  }
  function f5(p7) {
    const v10 = localStorage.getItem(p7);
    if (!v10) {
      return null;
    }
    const v11 = JSON.parse(v10);
    const v12 = Date.now();
    if (v12 - v11.timestamp > vLN36000002) {
      localStorage.removeItem(p7);
      return null;
    }
    return v11.data;
  }
  function f6(p8) {
    return new Promise(p9 => setTimeout(p9, p8));
  }
  function f7() {
    let v13 = document.querySelector("link[rel=\"preconnect\"]");
    if (v13) {
      vLS = v13.getAttribute("href");
      if (!vLS.endsWith("/")) {
        vLS += "/";
      }
    } else {
      console.error("Базовая ссылка не найдена.");
    }
  }
  function f8() {
    let v14 = document.createElement("div");
    v14.style.textAlign = "center";
    v14.style.marginTop = "2px";
    v14.style.cursor = "pointer";
    v14.style.marginRight = "0px";
    v14.style.marginLeft = "0px";
    v14.style.height = "20px";
    v14.style.flex = "1";
    v14.style.padding = "5px";
    v14.style.paddingBottom = "7.25px";
    v14.style.borderRadius = "7px";
    v14.style.display = "flex";
    v14.style.alignItems = "center";
    v14.style.justifyContent = "space-between";
    let v15 = document.createElement("div");
    v15.style.flex = "1";
    v15.style.display = "flex";
    v15.style.alignItems = "center";
    v15.style.justifyContent = "center";
    let v16 = document.createElement("div");
    v16.style.flex = "1";
    v16.style.display = "flex";
    v16.style.alignItems = "center";
    v16.style.justifyContent = "center";
    v14.appendChild(v15);
    v14.appendChild(v16);
    const vO2 = {
      infoContainer: v14,
      needContainer: v15,
      tradeContainer: v16
    };
    return vO2;
  }
  function f9(p10, p11) {
    if (p10 === 0 && p11 === 0) {
      return "#f0f0f0";
    }
    if (p10 >= p11 * 2) {
      return "#1DD300";
    } else if (p11 < p10 && p10 < p11 * 2) {
      return "#7AE969";
    } else if (p11 * 0.75 <= p10 && p10 < p11) {
      return "#FFFF00";
    } else if (p11 * 0.5 <= p10 && p10 < p11 * 0.75) {
      return "#FF4040";
    } else if (p10 * 2 < p11) {
      return "#A60000";
    } else {
      return "#f0f0f0";
    }
  }
  function f10() {
    return document.body.classList.contains("dark-theme");
  }
  function f11() {
    if (f10()) {
      return "#ffffff";
    } else {
      return "#000000";
    }
  }
  function f12(p12, p13, p14, p15) {
    if (p12.querySelector(".info-container")) {
      return;
    }
    let v17 = Promise.all([f13(p13), f13(p14)]).then(([v18, v19]) => {
      let {
        infoContainer: _0x22e221,
        needContainer: _0x44b787,
        tradeContainer: _0x1496a6
      } = f8();
      _0x22e221.classList.add("info-container");
      _0x22e221.style.backgroundColor = f9(v18, v19);
      let vF11 = f11();
      _0x44b787.style.color = vF11;
      _0x1496a6.style.color = vF11;
      _0x44b787.textContent = "need: " + v18;
      _0x1496a6.textContent = "trade: " + v19;
      p12.appendChild(_0x22e221);
      const v20 = p12.querySelector(".anime-cards__item")?.getAttribute("data-id");
      if (v20) {
        const vF5 = f5("want_card");
        if (vF5 && vF5.includes(v20)) {
          p12.classList.add("anime-cards__wanted-by-user");
        }
      }
    });
    p15.push(v17);
  }
  async function f13(p16) {
    const vF4 = f4(p16);
    if (vF4 !== null) {
      return vF4;
    }
    let vLN0 = 0;
    async function f14(p17) {
      return new Promise((p18, p19) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: p17,
          onload: function (p20) {
            let v21 = new DOMParser();
            let v22 = v21.parseFromString(p20.responseText, "text/html");
            let v23 = v22.querySelectorAll(".profile__friends a").length;
            vLN0 += v23;
            let v24 = v22.querySelector(".pagination__pages-btn a");
            if (v24) {
              let v25 = v24.getAttribute("href");
              p18(f14(v25));
            } else {
              f3(p16, vLN0, vLN3600000);
              p18(vLN0);
            }
          },
          onerror: function (p21) {
            p19(p21);
          }
        });
      });
    }
    return await f14(p16);
  }
  function f15() {
    const v26 = new MutationObserver(p22 => {
      p22.forEach(p23 => {
        if (p23.attributeName === "class") {
          f16();
        }
      });
    });
    v26.observe(document.body, {
      attributes: true
    });
  }
  function f16() {
    let vF112 = f11();
    document.querySelectorAll(".info-container").forEach(p24 => {
      p24.querySelectorAll("div").forEach(p25 => {
        p25.style.color = vF112;
      });
    });
  }
  async function f17() {
    let v27 = document.querySelectorAll(".anime-cards__item-wrapper");
    let vLN7 = 14;
    let vA2 = [];
    for (let vLN02 = 0; vLN02 < v27.length; vLN02 += vLN7) {
      let v28 = Array.from(v27).slice(vLN02, vLN02 + vLN7);
      for (let v29 of v28) {
        let v30 = v29.querySelector(".anime-cards__item").getAttribute("data-id");
        let v31 = vLS + "cards/" + v30 + "/users/need/";
        let v32 = vLS + "cards/" + v30 + "/users/trade/";
        f12(v29, v31, v32, vA2);
      }
      await f6(100);
    }
    await Promise.all(vA2);
  }
  async function f18() {
    let v33 = document.querySelectorAll(".anime-cards--full-page .anime-cards__item-wrapper");
    let vLN72 = 14;
    let vA3 = [];
    for (let vLN03 = 0; vLN03 < v33.length; vLN03 += vLN72) {
      let v34 = Array.from(v33).slice(vLN03, vLN03 + vLN72);
      for (let v35 of v34) {
        let v36 = v35.querySelector(".anime-cards__item").getAttribute("data-id");
        let v37 = vLS + "cards/" + v36 + "/users/need/";
        let v38 = vLS + "cards/" + v36 + "/users/trade/";
        f12(v35, v37, v38, vA3);
      }
      await f6(100);
    }
    await Promise.all(vA3);
  }
  async function f19() {
    let v39 = document.querySelectorAll(".trade__main-items a");
    let vLN73 = 7;
    let vA4 = [];
    for (let vLN04 = 0; vLN04 < v39.length; vLN04 += vLN73) {
      let v40 = Array.from(v39).slice(vLN04, vLN04 + vLN73);
      for (let v41 of v40) {
        let v42 = v41.getAttribute("href");
        let v43 = v42.split("/")[2];
        let v44 = vLS + "cards/" + v43 + "/users/need/";
        let v45 = vLS + "cards/" + v43 + "/users/trade/";
        f12(v41, v44, v45, vA4);
        const vF52 = f5("want_card");
        if (vF52 && vF52.includes(v43)) {
          v41.classList.add("anime-cards__wanted-by-user");
        }
      }
      await f6(100);
    }
    await Promise.all(vA4);
  }
  async function f20() {
    let v46 = document.querySelectorAll(".lootbox__card");
    let vLN3 = 3;
    let vA5 = [];
    for (let vLN05 = 0; vLN05 < v46.length; vLN05 += vLN3) {
      let v47 = Array.from(v46).slice(vLN05, vLN05 + vLN3);
      for (let v48 of v47) {
        let v49 = v48.getAttribute("data-id");
        let v50 = vLS + "cards/" + v49 + "/users/need/";
        let v51 = vLS + "cards/" + v49 + "/users/trade/";
        f12(v48, v50, v51, vA5);
        const vF53 = f5("want_card");
        if (vF53 && vF53.includes(v49)) {
          v48.classList.add("anime-cards__wanted-by-user");
        }
      }
      await f6(100);
    }
    await Promise.all(vA5);
  }
  function f21() {
    const v52 = document.querySelector("a.glav-s[onclick*=\"AllAnimeCards\"]");
    if (!v52) {
      console.log("Элемент \"Все карты из аниме\" не найден.");
      return;
    }
    v52.addEventListener("click", async function (p26) {
      p26.preventDefault();
      console.log("Клик по \"Все карты из аниме\". Обновляем информацию...");
      await f6(1000);
      await f18();
    });
  }
  async function f22(p27) {
    let vA6 = [];
    let vLN1 = 1;
    async function f23(p28) {
      return new Promise((p29, p30) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: p28,
          onload: function (p31) {
            let v53 = new DOMParser();
            let v54 = v53.parseFromString(p31.responseText, "text/html");
            let v55 = v54.querySelectorAll(".anime-cards__item");
            v55.forEach(p32 => {
              vA6.push(p32.getAttribute("data-id"));
            });
            let v56 = v54.querySelector(".pagination__pages-btn a");
            if (v56) {
              let v57 = v56.getAttribute("href");
              p29(f23(v57));
            } else {
              f3("want_card", vA6, vLN36000002);
              p29(vA6);
            }
          },
          onerror: function (p33) {
            p30(p33);
          }
        });
      });
    }
    return await f23(p27 + "cards/need/page/" + vLN1 + "/");
  }
  async function f24() {
    f7();
    if (!vLS) {
      console.error("Скрипт остановлен из-за отсутствия базовой ссылки.");
      return;
    }
    const v58 = document.querySelector(".lgn__ava img");
    if (!v58) {
      console.log("Аватар пользователя не найден.");
      return;
    }
    const v59 = v58.getAttribute("title");
    if (!v59) {
      console.log("Имя пользователя не найдено.");
      return;
    }
    if (!vA.includes(v59)) {
      console.log("Пользователь не в списке разрешенных. Скрипт остановлен.");
      return;
    }
    const v60 = await f2();
    if (!v60) {
      return;
    }
    f15();
    const v61 = vLS + "user/" + v59 + "/";
    await f22(v61);
    if (document.querySelector(".anime-cards__item-wrapper")) {
      await f17();
    }
    if (document.querySelector(".anime-cards--full-page")) {
      await f18();
    }
    if (document.querySelector(".trade__main-items")) {
      await f19();
    }
    if (document.querySelector(".lootbox__list")) {
      await f20();
    }
    f21();
  }
  window.addEventListener("load", f24);
  const v62 = document.createElement("style");
  v62.textContent = "\n        .anime-cards__wanted-by-user {\n            border: 3px solid #1DD300;\n            border-radius: 7px;\n        }\n    ";
  document.head.appendChild(v62);
})();
