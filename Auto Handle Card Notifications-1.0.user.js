// ==UserScript==
// @name         Auto Handle Card Notifications
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically clicks card notifications and closes card modals after clicking a button.
// @author       George
// @match        https://animestars.org/aniserials/video/*
// @match        https://astars.club/aniserials/video/*
// @match        https://asstars1.astars.club/aniserials/video/*
// @match        https://as1.astars.club/aniserials/video/*
// @match        https://asstars.tv/aniserials/video/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isActivated = false; // Флаг активации скрипта

    // Создаем кнопку для активации скрипта
    const button = document.createElement('button');
    button.innerText = 'Activate Script'; // Текст на кнопке
    button.style.position = 'fixed'; // Закрепляем кнопку на экране
    button.style.top = '20px'; // Расположение сверху
    button.style.left = '20px'; // Расположение слева
    button.style.zIndex = '1000'; // Делаем кнопку поверх других элементов
    button.style.padding = '10px'; // Паддинг
    button.style.backgroundColor = '#4CAF50'; // Зеленый фон
    button.style.color = 'white'; // Белый текст
    button.style.border = 'none'; // Без границ
    button.style.borderRadius = '5px'; // Закругленные углы
    button.style.fontSize = '16px'; // Размер шрифта
    button.style.cursor = 'pointer'; // Курсор как указатель

    // Добавляем кнопку на страницу
    document.body.appendChild(button);

    // Обработчик нажатия на кнопку
    button.addEventListener('click', () => {
        isActivated = true;
        console.log("Script activated.");
        button.innerText = 'Script Activated'; // Меняем текст кнопки после активации
        button.style.backgroundColor = '#008CBA'; // Меняем цвет фона кнопки
    });

    // Основной функционал скрипта
    setInterval(() => {
        if (isActivated) { // Скрипт работает только если он был активирован
            const cardNotification = document.querySelector(".card-notification");
            if (cardNotification) {
                cardNotification.click();
                console.log("Card notification clicked.");
            }
        }
    }, 2 * 1000);

    setInterval(() => {
        if (isActivated) { // Скрипт работает только если он был активирован
            const cardModalClose = document.querySelector('.ui-dialog[aria-describedby="card-modal"] .ui-dialog-titlebar-close');
            if (cardModalClose) {
                cardModalClose.click();
                console.log("Card window closed.");
            }
        }
    }, 2 * 1010);
})();
