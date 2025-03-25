/// ==UserScript==
// @name         Auto Handle Card Notifications (Toggle)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматически нажимает уведомления и закрывает карточные окна. Можно включать/выключать кнопкой.
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

    // Создаём кнопку для управления скриптом
    const button = document.createElement('button');
    button.innerText = 'Activate Script'; // Текст на кнопке
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.left = '20px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50'; // Зеленый (включить)
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';

    // Добавляем кнопку на страницу
    document.body.appendChild(button);

    // Обработчик нажатия на кнопку
    button.addEventListener('click', () => {
        isActivated = !isActivated; // Переключаем состояние
        if (isActivated) {
            console.log("Script activated.");
            button.innerText = 'Deactivate Script'; // Меняем текст кнопки
            button.style.backgroundColor = '#FF5733'; // Красный (выключить)
        } else {
            console.log("Script deactivated.");
            button.innerText = 'Activate Script'; // Возвращаем первоначальный текст
            button.style.backgroundColor = '#4CAF50'; // Зелёный (включить)
        }
    });

    // Основной функционал скрипта (работает только при активации)
    setInterval(() => {
        if (isActivated) {
            const cardNotification = document.querySelector(".card-notification");
            if (cardNotification) {
                cardNotification.click();
                console.log("Card notification clicked.");
            }
        }
    }, 2000);

    setInterval(() => {
        if (isActivated) {
            const cardModalClose = document.querySelector('.ui-dialog[aria-describedby="card-modal"] .ui-dialog-titlebar-close');
            if (cardModalClose) {
                cardModalClose.click();
                console.log("Card window closed.");
            }
        }
    }, 2010);
})();