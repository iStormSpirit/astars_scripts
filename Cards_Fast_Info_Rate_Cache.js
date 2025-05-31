// ==UserScript==
// @name         Cards Fast Info Rate Cache
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Информация о картах для обновленного сайта, need / have / trade / want list
// @description  Отображение: профиль, карты, обмен, история обмена, паки карт, все карты из анимэ. библиотке карт, обновление списка желаемого.
// @author       George
// @match        https://asstars.tv/*
// @match        https://as1.asstars.tv/*
// @match        https://asstars.club/*
// @match        https://astars.club/*
// @match        https://animestars.org/*
// @match        https://as1.astars.club/*
// @match        https://asstars1.astars.club/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    let baseUrl = '';
    const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 час в миллисекундах
    const WANT_CARD_CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 час в миллисекундах
    const DELAY_REQUEST = 100
    const DELAY_REQUEST_FULL_CARDS = 500
    const BATCH_SIZE = 14

    function saveToCache(key, data, expirationTime) {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
        if (expirationTime) {
            setTimeout(() => {
                localStorage.removeItem(key);
                if (key.startsWith('data-id')) {
                    localStorage.removeItem(key);
                }
            }, expirationTime);
        }
    }

    function getFromCache(key) {
        const cachedData = localStorage.getItem(key);
        if (!cachedData) return null;

        const parsedData = JSON.parse(cachedData);
        const currentTime = Date.now();

        if (currentTime - parsedData.timestamp > CACHE_EXPIRATION_TIME) {
            localStorage.removeItem(key);
            if (key.startsWith('data-id')) {
                localStorage.removeItem(key);
            }
            return null;
        }

        return parsedData.data;
    }

    // Функция для получения данных из localStorage с проверкой срока годности для want_card
    function getWantCardFromCache(key) {
        const cachedData = localStorage.getItem(key);
        if (!cachedData) return null;

        const parsedData = JSON.parse(cachedData);
        const currentTime = Date.now();

        if (currentTime - parsedData.timestamp > WANT_CARD_CACHE_EXPIRATION_TIME) {
            localStorage.removeItem(key);
            return null;
        }

        return parsedData.data;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getBaseUrl() {
        let linkElement = document.querySelector('link[rel="preconnect"]');
        if (linkElement) {
            baseUrl = linkElement.getAttribute('href');
            if (!baseUrl.endsWith('/')) {
                baseUrl += '/';
            }
        } else {
            console.error('Базовая ссылка не найдена.');
        }
    }

    function createUpdateButton() {
        const button = document.createElement('button');
        button.id = 'want-card-update-btn';
        button.textContent = 'WANT CARD UPD';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.left = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '8px 12px';
        button.style.backgroundColor = 'rgba(128, 128, 128, 0.7)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '12px';
        button.style.transition = 'background-color 0.3s ease';

        button.addEventListener('click', async function () {
            localStorage.removeItem('want_card');

            button.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
            button.textContent = 'WANT CARD UPDATING...';

            const userAvatar = document.querySelector(".lgn__ava img");
            if (userAvatar) {
                const currentUsername = userAvatar.getAttribute('title');
                if (currentUsername) {
                    const userProfileUrl = `${baseUrl}user/${currentUsername}/`;
                    await fetchAllWantCards(userProfileUrl);

                    button.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
                    button.textContent = 'WANT CARD UPDATED!';

                    setTimeout(() => {
                        button.style.backgroundColor = 'rgba(128, 128, 128, 0.7)';
                        button.textContent = 'WANT CARD UPD';
                    }, 3000);
                }
            }
        });

        document.body.appendChild(button);
    }

    function createInfoContainer() {
        let infoContainer = document.createElement('div');
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
        needContainer.style.flex = '1';
        needContainer.style.display = 'flex';
        needContainer.style.alignItems = 'center';
        needContainer.style.justifyContent = 'center';

        let haveContainer = document.createElement('div');
        haveContainer.style.flex = '1';
        haveContainer.style.display = 'flex';
        haveContainer.style.alignItems = 'center';
        haveContainer.style.justifyContent = 'center';

        let tradeContainer = document.createElement('div');
        tradeContainer.style.flex = '1';
        tradeContainer.style.display = 'flex';
        tradeContainer.style.alignItems = 'center';
        tradeContainer.style.justifyContent = 'center';

        infoContainer.appendChild(needContainer);
        infoContainer.appendChild(haveContainer);
        infoContainer.appendChild(tradeContainer);

        return {infoContainer, needContainer, haveContainer, tradeContainer};
    }

    // Функция для определения цвета фона на основе соотношения need и trade
    function getBackgroundColor(needCount, tradeCount) {
        if (needCount === 0 && tradeCount === 0) {
            return '#f0f0f0';
        }

        if (needCount >= 2 * tradeCount) {
            return '#1DD300';
        } else if (tradeCount < needCount && needCount < 2 * tradeCount) {
            return '#7AE969';
        } else if (0.75 * tradeCount <= needCount && needCount < tradeCount) {
            return '#FFFF00';
        } else if (0.5 * tradeCount <= needCount && needCount < 0.75 * tradeCount) {
            return '#FF4040';
        } else if (2 * needCount < tradeCount) {
            return '#A60000';
        } else {
            return '#f0f0f0';
        }
    }

    function isDarkTheme() {
        return document.body.classList.contains('dark-theme');
    }

    function getTextColor() {
        return isDarkTheme() ? '#ffffff' : '#000000';
    }


    function processItem(item, cardUrl, promises) {
        if (item.querySelector('.info-container')) {
            return;
        }

        let promise = fetchCardData(cardUrl).then(data => {
            let {infoContainer, needContainer, haveContainer, tradeContainer} = createInfoContainer();
            infoContainer.classList.add('info-container');

            infoContainer.style.backgroundColor = getBackgroundColor(data.need, data.trade);

            let textColor = getTextColor();
            needContainer.style.color = textColor;
            haveContainer.style.color = textColor;
            tradeContainer.style.color = textColor;

            needContainer.textContent = `n: ${data.need}`;
            haveContainer.textContent = `h: ${data.have}`;
            tradeContainer.textContent = `t: ${data.trade}`;

            infoContainer.addEventListener('click', async function () {
                localStorage.removeItem(cardUrl); // Сброс кэша

                const newData = await fetchCardData(cardUrl);

                infoContainer.style.backgroundColor = getBackgroundColor(newData.need, newData.trade);

                needContainer.textContent = `n: ${newData.need}`;
                haveContainer.textContent = `h: ${newData.have}`;
                tradeContainer.textContent = `t: ${newData.trade}`;

                infoContainer.classList.add('anime-cards__update-flash');
                setTimeout(() => {
                    infoContainer.classList.remove('anime-cards__update-flash');
                }, 1000);

            });

            item.appendChild(infoContainer);

            const cardId = cardUrl.split('/')[4];
            if (cardId) {
                const wantCards = getWantCardFromCache('want_card');
                if (wantCards && wantCards.includes(cardId)) {
                    item.classList.add('anime-cards__wanted-by-user');
                }
            }
        });

        promises.push(promise);
    }

    // Асинхронная функция для получения количества элементов с пагинацией
    async function fetchCardData(url) {
        const cachedData = getFromCache(url);
        if (cachedData !== null) return cachedData;

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: function (response) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, "text/html");

                    const data = {
                        need: parseInt(doc.querySelector('#owners-need')?.textContent || 0),
                        trade: parseInt(doc.querySelector('#owners-trade')?.textContent || 0),
                        have: parseInt(doc.querySelector('#owners-count')?.textContent || 0)
                    };

                    saveToCache(url, data, CACHE_EXPIRATION_TIME);
                    resolve(data);
                },
                onerror: function (error) {
                    reject(error);
                }
            });
        });
    }

    // Асинхронная функция для обновления информации о картах в истории обменов
    async function updateTradeHistoryInfo() {
        let cards = document.querySelectorAll(".history__item .history__body a");
        let promises = [];

        for (let card of cards) {
            let link = card.getAttribute("href");
            let cardId = link.split("/")[2];
            let cardUrl = `${baseUrl}cards/users/?id=${cardId}`;
            processItem(card, cardUrl, promises);

            const want_card = getWantCardFromCache("want_card");
            if (want_card && want_card.includes(cardId)) {
                card.classList.add("anime-cards__wanted-by-user");
            }
        }
        await Promise.all(promises);
    }

    // Асинхронная функция для обновления информации о картах с задержкой
    async function updateCardInfo() {
        let cards = document.querySelectorAll('.anime-cards__item-wrapper');
        let batchSize = BATCH_SIZE;
        let promises = [];

        const wantCards = getWantCardFromCache('want_card');

        for (let i = 0; i < cards.length; i += batchSize) {
            let batch = Array.from(cards).slice(i, i + batchSize);

            for (let card of batch) {
                let cardId = card.querySelector('.anime-cards__item').getAttribute('data-id');
                let cardUrl = `${baseUrl}cards/users/?id=${cardId}`;

                if (wantCards && wantCards.includes(cardId)) {
                    card.classList.add('anime-cards__wanted-by-user');
                }

                processItem(card, cardUrl, promises);
            }
            await delay(DELAY_REQUEST);
        }
        await Promise.all(promises);
    }

    // Асинхронная функция для обновления информации о картах в блоке anime-cards--full-page
    async function updateFullPageCardsInfo() {
        let fullPageCards = document.querySelectorAll('.anime-cards--full-page .anime-cards__item-wrapper');
        let batchSize = BATCH_SIZE;
        let promises = [];

        for (let i = 0; i < fullPageCards.length; i += batchSize) {
            let batch = Array.from(fullPageCards).slice(i, i + batchSize);

            for (let card of batch) {
                let cardId = card.querySelector('.anime-cards__item').getAttribute('data-id');
                let cardUrl = `${baseUrl}cards/users/?id=${cardId}`;

                processItem(card, cardUrl, promises);
            }
            await delay(DELAY_REQUEST);
        }
        await Promise.all(promises);
    }

    // Асинхронная функция для обновления информации о предметах обмена
    async function updateTradeItemsInfo() {
        let tradeItems = document.querySelectorAll('.trade__main-items a');
        let batchSize = BATCH_SIZE; // Размер пакета
        let promises = [];

        for (let i = 0; i < tradeItems.length; i += batchSize) {
            let batch = Array.from(tradeItems).slice(i, i + batchSize);

            for (let item of batch) {
                let href = item.getAttribute('href');
                let cardId = href.split('/')[2];
                let cardUrl = `${baseUrl}cards/users/?id=${cardId}`;

                processItem(item, cardUrl, promises);

            }
            await delay(DELAY_REQUEST);
        }

        await Promise.all(promises);
    }


    // Функция для отслеживания изменений в лутбоксе
    function observeLootboxChanges() {

        const lootboxRow = document.querySelector('.lootbox__row');
        if (!lootboxRow) {
            console.log('[Lootbox] Элемент лутбокса не найден');
            return;
        }

        let currentPackId = lootboxRow.getAttribute('data-pack-id');

        const observer = new MutationObserver(async (mutations) => {
            console.log('[Lootbox] Обнаружены изменения:', mutations);

            const newPackId = lootboxRow.getAttribute('data-pack-id');
            console.log(`[Lootbox] Новый pack-id: ${newPackId}, Старый: ${currentPackId}`);

            if (newPackId !== currentPackId) {
                currentPackId = newPackId;
                await updateLootboxCardsInfo();
            }
        });

        observer.observe(lootboxRow, {
            attributes: true,
            attributeFilter: ['data-pack-id'],
            subtree: true
        });

        console.log('[Lootbox] Наблюдатель успешно запущен');
        updateLootboxCardsInfo();
    }

    // Асинхронная функция для обновления информации о картах в лутбоксов
    async function updateLootboxCardsInfo() {

        const lootboxCards = document.querySelectorAll('.lootbox__card');

        if (lootboxCards.length === 0) {
            console.log('[Lootbox] Карты не найдены, завершаем обновление');
            return;
        }

        const promises = [];
        const wantCards = getWantCardFromCache('want_card'); // Получаем список желаемых карт

        for (const card of lootboxCards) {
            const cardId = card.getAttribute('data-id');

            if (!cardId) {
                console.log('[Lootbox] Карта без data-id, пропускаем');
                continue;
            }

            const oldInfo = card.querySelector('.info-container');
            if (oldInfo) {
                oldInfo.remove();
            }

            const cardUrl = `${baseUrl}cards/users/?id=${cardId}`;

            processItem(card, cardUrl, promises);

            if (wantCards && wantCards.includes(cardId)) {
                card.classList.add('anime-cards__wanted-by-user');
                console.log(`[Lootbox] Карта ${cardId} в списке желаемых - добавляем рамку`);
            } else {
                card.classList.remove('anime-cards__wanted-by-user');
                console.log(`[Lootbox] Карта ${cardId} НЕ в списке желаемых - удаляем рамку`);
            }

            await delay(DELAY_REQUEST);
        }

        await Promise.all(promises);
        console.log('[Lootbox] Обновление информации завершено');
    }


    // Функция для отслеживания клика по элементу "Все карты из аниме"
    function observeAllAnimeCardsClick() {
        const allAnimeCardsLink = document.querySelector('a.glav-s[onclick*="AllAnimeCards"]');

        if (!allAnimeCardsLink) {
            return;
        }

        // Перехватываем клик
        allAnimeCardsLink.addEventListener('click', async function (event) {
            event.preventDefault(); // Отменяем стандартное поведение
            console.log('Клик по "Все карты из аниме". Обновляем информацию...');

            await delay(DELAY_REQUEST_FULL_CARDS);
            await updateFullPageCardsInfo();
        });
    }

    // Асинхронная функция для сбора всех data-id карт, которые пользователь хочет
    async function fetchAllWantCards(userProfileUrl) {

        const cachedWantCards = localStorage.getItem("want_card")

        if (cachedWantCards !== null && cachedWantCards.length > 0) {
            console.log("Пропуск загрузки want_card — данные актуальны");
            return;
        }

        console.log("Загрузка want_card...");
        let wantCards = [];
        let currentPage = 1;

        async function fetchPage(pageUrl) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: pageUrl,
                    onload: function (response) {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(response.responseText, "text/html");

                        let cards = doc.querySelectorAll('.anime-cards__item');
                        cards.forEach(card => {
                            wantCards.push(card.getAttribute('data-id'));
                        });

                        let nextPageLink = doc.querySelector('.pagination__pages-btn a');
                        if (nextPageLink) {
                            let nextPageUrl = nextPageLink.getAttribute('href');
                            resolve(fetchPage(nextPageUrl));
                        } else {
                            saveToCache('want_card', wantCards, WANT_CARD_CACHE_EXPIRATION_TIME);
                            resolve(wantCards);
                        }
                    },
                    onerror: function (error) {
                        reject(error);
                    }
                });
            });
        }

        console.log("Все want_card загружены");
        return await fetchPage(`${userProfileUrl}cards/need/page/${currentPage}/`);
    }

    // Асинхронная функция инициализации
    async function init() {
        getBaseUrl();

        if (!baseUrl) {
            console.error('Скрипт остановлен из-за отсутствия базовой ссылки.');
            return;
        }

        const userAvatar = document.querySelector(".lgn__ava img");
        if (!userAvatar) {
            console.log('Аватар пользователя не найден.');
            return;
        }

        const currentUsername = userAvatar.getAttribute('title');
        if (!currentUsername) {
            console.log('Имя пользователя не найдено.');
            return;
        }

        createUpdateButton();

        const userProfileUrl = `${baseUrl}user/${currentUsername}/`;
        await fetchAllWantCards(userProfileUrl);

        if (document.querySelector('.anime-cards__item-wrapper')) {
            await updateCardInfo();
        }
        if (document.querySelector('.anime-cards--full-page')) {
            await updateFullPageCardsInfo();
        }
        if (document.querySelector('.trade__main-items')) {
            await updateTradeItemsInfo();
        }
        if (document.querySelector(".history__item")) {
            await updateTradeHistoryInfo();
        }

        const lootboxList = document.querySelector('.lootbox__list');
        if (lootboxList) {
            console.log('[Init] Лутбокс найден, запускаем наблюдатель');
            observeLootboxChanges();
        } else {
            new MutationObserver((mutations, observer) => {
                const lb = document.querySelector('.lootbox__list');
                if (lb) {
                    console.log('[Init] Лутбокс появился, запускаем наблюдатель');
                    observer.disconnect();
                    observeLootboxChanges();
                }
            }).observe(document.body, {childList: true, subtree: true});
        }
        observeAllAnimeCardsClick();
    }

    window.addEventListener('load', init);

    // Добавляем CSS для зеленой рамки
    const style = document.createElement('style');
    style.textContent = `
        .anime-cards__wanted-by-user {
            border: 3px solid #1DD300;
            border-radius: 7px;
        }
        .anime-cards__update-flash {
            animation: flash-green 1s ease;
        }
        @keyframes flash-green {
            0%   { background-color: rgba(0, 255, 0, 0.6); }
            100% { background-color: inherit; }
        }
    `;
    document.head.appendChild(style);
})();