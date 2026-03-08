// ==UserScript==
// @name         Cards Fast Info Rate Cache v2
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Need / Have / Trade info for cards (fast version)
// @author       George
// @match        https://as1.asstars.tv/*
// @match        https://asstars.club/*
// @match        https://astars.club/*
// @match        https://animestars.org/*
// @match        https://as1.astars.club/*
// @match        https://asstars1.astars.club/*
// @match        https://as2.asstars.tv/*
// @match        https://asstars.tv/*
// @match        https://animesss.tv/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const CACHE_TIME = 60 * 60 * 1000;
    const MAX_PARALLEL_REQUESTS = 4;

    let baseUrl = '';
    let activeRequests = 0;
    const requestQueue = [];

    function getBaseUrl() {
        const link = document.querySelector('link[rel="preconnect"]');
        if (link) {
            baseUrl = link.getAttribute('href');
            if (!baseUrl.endsWith('/')) baseUrl += '/';
        }
    }

    function saveCache(key, data) {
        localStorage.setItem(key, JSON.stringify({
            time: Date.now(), data: data
        }));
    }

    function getCache(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.time > CACHE_TIME) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;

    }

    function runQueue() {
        if (activeRequests >= MAX_PARALLEL_REQUESTS) return;
        if (requestQueue.length === 0) return;

        const task = requestQueue.shift();
        activeRequests++;
        task().finally(() => {
            activeRequests--;
            runQueue();
        });
        runQueue();
    }

    function enqueue(task) {
        requestQueue.push(task);
        runQueue();
    }

    function fetchCardData(url) {
        const cached = getCache(url);
        if (cached) return Promise.resolve(cached);

        return new Promise((resolve, reject) => {
            enqueue(() => {
                return new Promise((res) => {

                    GM_xmlhttpRequest({
                        method: "GET", url: url,
                        onload: function (response) {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(response.responseText, "text/html");

                            const data = {
                                need: parseInt(doc.querySelector('#owners-need')?.textContent || 0),
                                trade: parseInt(doc.querySelector('#owners-trade')?.textContent || 0),
                                have: parseInt(doc.querySelector('#owners-count')?.textContent || 0)
                            };
                            saveCache(url, data);
                            resolve(data);
                            res();
                        },

                        onerror: function (e) {
                            reject(e);
                            res();
                        }
                    });
                });
            });
        });
    }

    function getBackgroundColor(needCount, tradeCount) {
        if (needCount === 0 && tradeCount === 0) return '#f0f0f0';
        if (needCount >= 2 * tradeCount) return '#1DD300';
        else if (tradeCount < needCount && needCount < 2 * tradeCount) return '#7AE969';
        else if (0.75 * tradeCount <= needCount && needCount < tradeCount) return '#FFFF00';
        else if (0.5 * tradeCount <= needCount && needCount < 0.75 * tradeCount) return '#FF4040';
        else if (2 * needCount < tradeCount) return '#A60000';
        return '#f0f0f0';
    }

    function isDarkTheme() {
        return document.body.classList.contains('dark-theme');
    }

    function getTextColor() {
        return isDarkTheme() ? '#ffffff' : '#000000';
    }

    function createInfoBox() {
        let infoContainer = document.createElement('div');

        infoContainer.className = 'info-container';

        infoContainer.style.textAlign = 'center';
        infoContainer.style.marginTop = '2px';
        infoContainer.style.cursor = 'pointer';
        infoContainer.style.marginRight = '0px';
        infoContainer.style.marginLeft = '0px';
        infoContainer.style.height = '20px';
        infoContainer.style.flex = '1';
        infoContainer.style.padding = '5px';
        infoContainer.style.paddingBottom = '7.25px';
        infoContainer.style.borderRadius = '7px';
        infoContainer.style.display = 'flex';
        infoContainer.style.alignItems = 'center';
        infoContainer.style.justifyContent = 'space-between';

        let needContainer = document.createElement('div');
        let haveContainer = document.createElement('div');
        let tradeContainer = document.createElement('div');

        needContainer.style.flex = '1';
        haveContainer.style.flex = '1';
        tradeContainer.style.flex = '1';

        needContainer.style.display = 'flex';
        haveContainer.style.display = 'flex';
        tradeContainer.style.display = 'flex';

        needContainer.style.alignItems = 'center';
        haveContainer.style.alignItems = 'center';
        tradeContainer.style.alignItems = 'center';

        needContainer.style.justifyContent = 'center';
        haveContainer.style.justifyContent = 'center';
        tradeContainer.style.justifyContent = 'center';

        needContainer.style.whiteSpace = 'nowrap';
        haveContainer.style.whiteSpace = 'nowrap';
        tradeContainer.style.whiteSpace = 'nowrap';

        infoContainer.appendChild(needContainer);
        infoContainer.appendChild(haveContainer);
        infoContainer.appendChild(tradeContainer);

        return {
            box: infoContainer, need: needContainer, have: haveContainer, trade: tradeContainer
        };
    }

    function processCard(element, cardId) {
        if (!cardId) return;
        if (element.querySelector('.info-container')) return;

        const url = `${baseUrl}cards/users/?id=${cardId}`;
        fetchCardData(url).then(data => {
            const {box, need, have, trade} = createInfoBox();

            box.style.backgroundColor = getBackgroundColor(data.need, data.trade);

            let textColor = getTextColor();

            need.style.color = textColor;
            have.style.color = textColor;
            trade.style.color = textColor;

            need.textContent = `n: ${data.need}`;
            have.textContent = `h: ${data.have}`;
            trade.textContent = `t: ${data.trade}`;

            box.addEventListener('click', async () => {
                localStorage.removeItem(url);

                const newData = await fetchCardData(url);

                box.style.backgroundColor = getBackgroundColor(newData.need, newData.trade);

                let textColor = getTextColor();

                need.style.color = textColor;
                have.style.color = textColor;
                trade.style.color = textColor;

                need.textContent = `n: ${newData.need}`;
                have.textContent = `h: ${newData.have}`;
                trade.textContent = `t: ${newData.trade}`;

                box.classList.add('anime-cards__update-flash');

                setTimeout(() => {
                    box.classList.remove('anime-cards__update-flash');
                }, 1000);
            });
            element.appendChild(box);
        });
    }

    function scanCards() {
        document.querySelectorAll('.anime-cards__item-wrapper').forEach(card => {
            const id = card.querySelector('.anime-cards__item')?.dataset.id;
            processCard(card, id);
        });
    }

    function scanTrade() {
        document.querySelectorAll('.trade__main-items a').forEach(el => {
            const id = el.href.split('=').pop();
            processCard(el, id);
        });
    }

    function scanHistory() {
        document.querySelectorAll('.history__item .history__body a').forEach(el => {
            const id = el.href.split('=').pop();
            processCard(el, id);
        });
    }

    function scanLootbox() {
        document.querySelectorAll('.lootbox__card').forEach(card => {
            const id = card.dataset.id;
            processCard(card, id);
        });
    }

    function observeLootbox() {
        const row = document.querySelector('.lootbox__row');
        if (!row) return;

        let pack = row.dataset.packId;

        new MutationObserver(() => {
            const newPack = row.dataset.packId;

            if (newPack !== pack) {
                pack = newPack;
                scanLootbox();
            }
        }).observe(row, {attributes: true});
    }

    function observeTheme() {
        new MutationObserver(() => {
            const color = getTextColor();
            document.querySelectorAll('.info-container div').forEach(el => {
                el.style.color = color;
            });
        }).observe(document.body, {attributes: true, attributeFilter: ['class']});
    }

    function init() {

        getBaseUrl();
        if (!baseUrl) return;

        scanCards();
        scanTrade();
        scanHistory();
        scanLootbox();

        observeLootbox();
        observeTheme();

    }

    window.addEventListener('load', init);

    const style = document.createElement('style');
    style.textContent = `
.anime-cards__update-flash{
animation: flash-green 1s ease;
}
@keyframes flash-green{
0%{background-color: rgba(0,255,0,0.6);}
100%{background-color: inherit;}
}
`;
    document.head.appendChild(style);
})();
