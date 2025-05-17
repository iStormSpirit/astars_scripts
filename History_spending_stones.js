// ==UserScript==
// @name         History Spending Stones
// @namespace    http://tampermonkey.net/
// @version      1.0a
// @description  Подсчитывает и показывает кол-во потраченных камней духа за все время на страничке с историей трат
// @author       George
// @match        https://asstars.tv/transactions/*
// @match        https://asstars.club/transactions/*
// @match        https://astars.club/transactions/*
// @match        https://animestars.org/transactions/*
// @match        https://as1.astars.club/transactions/*
// @match        https://asstars1.astars.club/transactions/*

// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(async function () {
    'use strict';

    let total = 0;
    let currentPageNumber = 1;

    const currentSpendingDiv = document.createElement('div');
    currentSpendingDiv.id = 'currentSpending';
    document.body.appendChild(currentSpendingDiv);

    GM_addStyle(`
        #currentSpending {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
        }
    `);

    function updateCurrentSpendingText(value, pageNumber) {
        currentSpendingDiv.innerHTML = `Cтраница: ${pageNumber} потрачено: ${Math.round(value)}`;
    }

    // Функция для добавления итогового значения на страницу
    function addSpendingToPage(total) {
        const balanceElement = document.querySelector('.transactions__balance');

        if (balanceElement) {
            const spendingSpan = document.createElement('span');
            spendingSpan.textContent = `Потрачено: ${Math.round(total)}`;
            const diamondDiv = document.createElement('div');
            diamondDiv.className = 'diamond';

            spendingSpan.appendChild(diamondDiv);
            balanceElement.appendChild(spendingSpan);
        } else {
            console.warn('Элемент с балансом не найден на странице.');
        }
    }

    // Функция для сбора значений с текущей страницы
    function collectValuesFromPage(document) {
        // Находим все элементы с классом transactions__red
        const redTransactions = document.querySelectorAll('.transactions__red');

        // Проходим по каждому элементу
        redTransactions.forEach(transaction => {
            const textValue = transaction.textContent.trim();
            const cleanedValue = textValue.replace(/[^0-9.-]/g, '');
            const numericValue = parseFloat(cleanedValue);

            if (!isNaN(numericValue)) {
                // Вычитаем значение из total
                total -= numericValue;
            } else {
                console.warn(`Не удалось преобразовать значение: ${textValue}`);
            }
        });
        updateCurrentSpendingText(total, currentPageNumber);
        console.log(`Текущее значение после страницы ${currentPageNumber}: потрачено ${total}`);
    }

    async function fetchNextPage(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function (response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    resolve(doc);
                },
                onerror: function (error) {
                    reject(error);
                }
            });
        });
    }

    function getNextPageUrl(document) {
        const nextPageButton = document.querySelector('.pagination__pages-btn a[href]');
        return nextPageButton ? nextPageButton.href : null;
    }

    async function processAllPages() {
        let currentDoc = document;
        let nextPageUrl = getNextPageUrl(currentDoc);

        while (nextPageUrl) {
            collectValuesFromPage(currentDoc);
            currentPageNumber++;

            console.log(`Загрузка страницы: ${nextPageUrl}`);
            currentDoc = await fetchNextPage(nextPageUrl);
            nextPageUrl = getNextPageUrl(currentDoc);
        }

        collectValuesFromPage(currentDoc);
        addSpendingToPage(total);
    }

    await processAllPages();
})();