// ==UserScript==
// @name         Forge cards
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Изменение оформления переплаки
// @author       George
// @match        https://animestars.org/cards_remelt/*
// @match        https://astars.club/cards_remelt/*
// @match        https://asstars1.astars.club/cards_remelt/*
// @match        https://as1.astars.club/cards_remelt/*
// @match        https://asstars.tv/cards_remelt/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function rearrangeElements() {
        let wrapper = document.querySelector('.remelt__wrapper');
        if (!wrapper) return;

        let one = wrapper.querySelector('.remelt__item--one');
        let two = wrapper.querySelector('.remelt__item--two');
        let three = wrapper.querySelector('.remelt__item--three');
        let result = wrapper.querySelector('.remelt__item--result');
        let button = document.querySelector('.remelt__start-btn'); // Кнопка "Перековка"

        if (one && two && three && result && button) {
            let container = document.createElement('div');
            container.style.display = 'flex';
            container.style.justifyContent = 'space-between'; // Пространство между блоками
            container.style.alignItems = 'center';
            container.style.gap = '20px'; // Промежутки между элементами
            container.style.width = '100%';
            container.style.margin = '0 auto';

            // Блок для первых трех элементов (по левому краю)
            let leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.gap = '15px';
            leftContainer.appendChild(one);
            leftContainer.appendChild(two);
            leftContainer.appendChild(three);

            // Центр: Кнопка "Перековка"
            let buttonContainer = document.createElement('div');
            button.style.display = 'block'; // Делаем кнопку блочным элементом
            buttonContainer.appendChild(button);

            // Правый блок с результатом
            let rightContainer = document.createElement('div');
            rightContainer.style.display = 'flex';
            rightContainer.style.justifyContent = 'center';
            rightContainer.style.alignItems = 'center';
            rightContainer.appendChild(result);

            // Добавляем все в главный контейнер
            container.appendChild(leftContainer);
            container.appendChild(buttonContainer);
            container.appendChild(rightContainer);

            // Очищаем старый контент и добавляем новый контейнер
            wrapper.innerHTML = '';
            wrapper.appendChild(container);
        }
    }

    setTimeout(rearrangeElements, 1000);
})();
