// ==UserScript==
// @name         Cards Info Rate Cache
// @namespace    http://tampermonkey.net/
// @version      1.0a
// @description  Информация о картах, need / trade / want list
// @author       George
// @match        https://asstars.tv/*
// @match        https://asstars.club/*
// @match        https://astars.club/*
// @match        https://animestars.org/*
// @match        https://as1.astars.club/*
// @match        https://asstars1.astars.club/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    "use strict";
    let vLS = "";
    const vLN3600000 = 3600000;
    const vLN900000 = 900000;
    function f(p5, p6, p7) {
        const vO = {
            timestamp: Date.now(),
            data: p6
        };
        localStorage.setItem(p5, JSON.stringify(vO));
        if (p7) {
            setTimeout(() => {
                localStorage.removeItem(p5);
                if (p5.startsWith("data-id")) {
                    localStorage.removeItem(p5);
                }
            }, p7);
        }
    }
    function f2(p8) {
        const v12 = localStorage.getItem(p8);
        if (!v12) {
            return null;
        }
        const v13 = JSON.parse(v12);
        const v14 = Date.now();
        if (v14 - v13.timestamp > vLN3600000) {
            localStorage.removeItem(p8);
            if (p8.startsWith("data-id")) {
                localStorage.removeItem(p8);
            }
            return null;
        }
        return v13.data;
    }
    function f3(p9) {
        const v15 = localStorage.getItem(p9);
        if (!v15) {
            return null;
        }
        const v16 = JSON.parse(v15);
        const v17 = Date.now();
        if (v17 - v16.timestamp > vLN900000) {
            localStorage.removeItem(p9);
            return null;
        }
        return v16.data;
    }
    function f4(p10) {
        return new Promise(p11 => setTimeout(p11, p10));
    }
    function f5() {
        let v18 = document.querySelector("link[rel=\"preconnect\"]");
        if (v18) {
            vLS = v18.getAttribute("href");
            if (!vLS.endsWith("/")) {
                vLS += "/";
            }
        } else {
            console.error("Базовая ссылка не найдена.");
        }
    }
    function f6() {
        let v19 = document.createElement("div");
        v19.style.textAlign = "center";
        v19.style.marginTop = "2px";
        v19.style.cursor = "pointer";
        v19.style.marginRight = "0px";
        v19.style.marginLeft = "0px";
        v19.style.height = "20px";
        v19.style.flex = "1";
        v19.style.padding = "5px";
        v19.style.paddingBottom = "7.25px";
        v19.style.borderRadius = "7px";
        v19.style.display = "flex";
        v19.style.alignItems = "center";
        v19.style.justifyContent = "space-between";
        let v20 = document.createElement("div");
        v20.style.flex = "1";
        v20.style.display = "flex";
        v20.style.alignItems = "center";
        v20.style.justifyContent = "center";
        let v21 = document.createElement("div");
        v21.style.flex = "1";
        v21.style.display = "flex";
        v21.style.alignItems = "center";
        v21.style.justifyContent = "center";
        v19.appendChild(v20);
        v19.appendChild(v21);
        const vO2 = {
            infoContainer: v19,
            needContainer: v20,
            tradeContainer: v21
        };
        return vO2;
    }
    function f7(p12, p13) {
        if (p12 === 0 && p13 === 0) {
            return "#f0f0f0";
        }
        if (p12 >= p13 * 2) {
            return "#1DD300";
        } else if (p13 < p12 && p12 < p13 * 2) {
            return "#7AE969";
        } else if (p13 * 0.75 <= p12 && p12 < p13) {
            return "#FFFF00";
        } else if (p13 * 0.5 <= p12 && p12 < p13 * 0.75) {
            return "#FF4040";
        } else if (p12 * 2 < p13) {
            return "#A60000";
        } else {
            return "#f0f0f0";
        }
    }
    function f8() {
        return document.body.classList.contains("dark-theme");
    }
    function f9() {
        if (f8()) {
            return "#ffffff";
        } else {
            return "#000000";
        }
    }
    function f10(p14, p15, p16, p17) {
        if (p14.querySelector(".info-container")) {
            return;
        }
        let v22 = Promise.all([f11(p15), f11(p16)]).then(([v23, v24]) => {
            let {
                infoContainer: _0x7bce61,
                needContainer: _0x46b03a,
                tradeContainer: _0x34830f
            } = f6();
            _0x7bce61.classList.add("info-container");
            _0x7bce61.style.backgroundColor = f7(v23, v24);
            let vF9 = f9();
            _0x46b03a.style.color = vF9;
            _0x34830f.style.color = vF9;
            _0x46b03a.textContent = "need: " + v23;
            _0x34830f.textContent = "trade: " + v24;
            p14.appendChild(_0x7bce61);
            const v25 = p14.querySelector(".anime-cards__item")?.getAttribute("data-id");
            if (v25) {
                const vF32 = f3("want_card");
                if (vF32 && vF32.includes(v25)) {
                    p14.classList.add("anime-cards__wanted-by-user");
                }
            }
        });
        p17.push(v22);
    }
    async function f11(p18) {
        const vF22 = f2(p18);
        if (vF22 !== null) {
            return vF22;
        }
        let vLN02 = 0;
        async function f12(p19) {
            return new Promise((p20, p21) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: p19,
                    onload: function (p22) {
                        let v26 = new DOMParser();
                        let v27 = v26.parseFromString(p22.responseText, "text/html");
                        let v28 = v27.querySelectorAll(".profile__friends a").length;
                        vLN02 += v28;
                        let v29 = v27.querySelector(".pagination__pages-btn a");
                        if (v29) {
                            let v30 = v29.getAttribute("href");
                            p20(f12(v30));
                        } else {
                            f(p18, vLN02, vLN3600000);
                            p20(vLN02);
                        }
                    },
                    onerror: function (p23) {
                        p21(p23);
                    }
                });
            });
        }
        return await f12(p18);
    }
    function f13() {
        const v31 = new MutationObserver(p24 => {
            p24.forEach(p25 => {
                if (p25.attributeName === "class") {
                    f14();
                }
            });
        });
        v31.observe(document.body, {
            attributes: true
        });
    }
    function f14() {
        let vF92 = f9();
        document.querySelectorAll(".info-container").forEach(p26 => {
            p26.querySelectorAll("div").forEach(p27 => {
                p27.style.color = vF92;
            });
        });
    }
    async function f15() {
        let v32 = document.querySelectorAll(".anime-cards__item-wrapper");
        let vLN14 = 14;
        let vA2 = [];
        for (let vLN03 = 0; vLN03 < v32.length; vLN03 += vLN14) {
            let v33 = Array.from(v32).slice(vLN03, vLN03 + vLN14);
            for (let v34 of v33) {
                let v35 = v34.querySelector(".anime-cards__item").getAttribute("data-id");
                let v36 = vLS + "cards/" + v35 + "/users/need/";
                let v37 = vLS + "cards/" + v35 + "/users/trade/";
                f10(v34, v36, v37, vA2);
            }
            await f4(2500);
        }
        await Promise.all(vA2);
    }
    async function f16() {
        let v38 = document.querySelectorAll(".anime-cards--full-page .anime-cards__item-wrapper");
        let vLN142 = 14;
        let vA3 = [];
        for (let vLN04 = 0; vLN04 < v38.length; vLN04 += vLN142) {
            let v39 = Array.from(v38).slice(vLN04, vLN04 + vLN142);
            for (let v40 of v39) {
                let v41 = v40.querySelector(".anime-cards__item").getAttribute("data-id");
                let v42 = vLS + "cards/" + v41 + "/users/need/";
                let v43 = vLS + "cards/" + v41 + "/users/trade/";
                f10(v40, v42, v43, vA3);
            }
            await f4(100);
        }
        await Promise.all(vA3);
    }
    async function f17() {
        let v44 = document.querySelectorAll(".trade__main-items a");
        let vLN143 = 14;
        let vA4 = [];
        for (let vLN05 = 0; vLN05 < v44.length; vLN05 += vLN143) {
            let v45 = Array.from(v44).slice(vLN05, vLN05 + vLN143);
            for (let v46 of v45) {
                let v47 = v46.getAttribute("href");
                let v48 = v47.split("/")[2];
                let v49 = vLS + "cards/" + v48 + "/users/need/";
                let v50 = vLS + "cards/" + v48 + "/users/trade/";
                f10(v46, v49, v50, vA4);
                const vF33 = f3("want_card");
                if (vF33 && vF33.includes(v48)) {
                    v46.classList.add("anime-cards__wanted-by-user");
                }
            }
            await f4(100);
        }
        await Promise.all(vA4);
    }
    async function f18() {
        let v51 = document.querySelectorAll(".lootbox__card");
        let vLN3 = 3;
        let vA5 = [];
        for (let vLN06 = 0; vLN06 < v51.length; vLN06 += vLN3) {
            let v52 = Array.from(v51).slice(vLN06, vLN06 + vLN3);
            for (let v53 of v52) {
                let v54 = v53.getAttribute("data-id");
                let v55 = vLS + "cards/" + v54 + "/users/need/";
                let v56 = vLS + "cards/" + v54 + "/users/trade/";
                f10(v53, v55, v56, vA5);
                const vF34 = f3("want_card");
                if (vF34 && vF34.includes(v54)) {
                    v53.classList.add("anime-cards__wanted-by-user");
                }
            }
            await f4(100);
        }
        await Promise.all(vA5);
    }
    function f19() {
        const v57 = document.querySelector("a.glav-s[onclick*=\"AllAnimeCards\"]");
        if (!v57) {
            console.log("Элемент \"Все карты из аниме\" не найден.");
            return;
        }
        v57.addEventListener("click", async function (p28) {
            p28.preventDefault();
            console.log("Клик по \"Все карты из аниме\". Обновляем информацию...");
            await f4(200);
            await f16();
        });
    }
    async function f20(p29) {
        let vA6 = [];
        let vLN1 = 1;
        async function f21(p30) {
            return new Promise((p31, p32) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: p30,
                    onload: function (p33) {
                        let v58 = new DOMParser();
                        let v59 = v58.parseFromString(p33.responseText, "text/html");
                        let v60 = v59.querySelectorAll(".anime-cards__item");
                        v60.forEach(p34 => {
                            vA6.push(p34.getAttribute("data-id"));
                        });
                        let v61 = v59.querySelector(".pagination__pages-btn a");
                        if (v61) {
                            let v62 = v61.getAttribute("href");
                            p31(f21(v62));
                        } else {
                            f("want_card", vA6, vLN900000);
                            p31(vA6);
                        }
                    },
                    onerror: function (p35) {
                        p32(p35);
                    }
                });
            });
        }
        return await f21(p29 + "cards/need/page/" + vLN1 + "/");
    }
    async function f22() {
        f5();
        if (!vLS) {
            console.error("Скрипт остановлен из-за отсутствия базовой ссылки.");
            return;
        }
        const v63 = document.querySelector(".lgn__ava img");
        if (!v63) {
            console.log("Аватар пользователя не найден.");
            return;
        }
        const v64 = v63.getAttribute("title");
        if (!v64) {
            console.log("Имя пользователя не найдено.");
            return;
        }
        f13();
        const v65 = vLS + "user/" + v64 + "/";
        await f20(v65);
        if (document.querySelector(".anime-cards__item-wrapper")) {
            await f15();
        }
        if (document.querySelector(".anime-cards--full-page")) {
            await f16();
        }
        if (document.querySelector(".trade__main-items")) {
            await f17();
        }
        if (document.querySelector(".lootbox__list")) {
            await f18();
        }
        f19();
    }
    window.addEventListener("load", f22);
    const v66 = document.createElement("style");
    v66.textContent = "\n        .anime-cards__wanted-by-user {\n            border: 3px solid #1DD300;\n            border-radius: 7px;\n        }\n    ";
    document.head.appendChild(v66);
})();