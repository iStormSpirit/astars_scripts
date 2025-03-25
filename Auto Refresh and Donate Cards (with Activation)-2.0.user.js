// ==UserScript==
// @name         Auto Refresh and Donate Cards (with Activation)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Автоматизация обновления и внесения карт (включается кнопкой).
// @author       George
// @match        https://animestars.org/clubs/6/boost/
// @match        https://astars.club/clubs/6/boost/
// @match        https://asstars1.astars.club/clubs/6/boost/
// @match        https://as1.astars.club/clubs/6/boost/
// @match        https://asstars.tv/clubs/6/boost/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isActivated = false; // Флаг активации скрипта

    // Создаём кнопку для активации
    const button = document.createElement('button');
    button.innerText = 'Start Auto Donate'; // Текст на кнопке
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.left = '20px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';

    // Добавляем кнопку на страницу
    document.body.appendChild(button);

    // Обработчик нажатия на кнопку
    button.addEventListener('click', () => {
        isActivated = !isActivated; // Переключаем флаг (вкл/выкл)
        if (isActivated) {
            console.log("Auto Donate Activated.");
            button.innerText = 'Stop Auto Donate';
            button.style.backgroundColor = '#FF5733'; // Красный цвет (стоп)
        } else {
            console.log("Auto Donate Deactivated.");
            button.innerText = 'Start Auto Donate';
            button.style.backgroundColor = '#4CAF50'; // Зелёный цвет (старт)
        }
    });

    // Функция для нажатия кнопки обновления карты
    function refreshCard() {
        let refreshButton = document.querySelector('button.club__boost__refresh-btn');
        if (refreshButton) {
            refreshButton.click();
            console.log('Карта обновлена');
        }
    }

    // Функция для нажатия кнопки внесения карты
    function donateCard() {
        let donateButton = document.querySelector('button.club__boost-btn');
        if (donateButton) {
            donateButton.click();
            console.log('Карта внесена');
        }
    }

    // Основной цикл (работает только при включении)
    setInterval(() => {
        if (isActivated) { // Выполняем только если скрипт активирован
            refreshCard(); // Обновляем карту
            setTimeout(donateCard, 100); // Первое внесение через 100 мс
            setTimeout(donateCard, 300); // Второе внесение через 300 мс
        }
    }, 500); // Интервал 500 мс (0.5 секунды)
})();