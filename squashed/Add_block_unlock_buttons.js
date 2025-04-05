// ==UserScript==
// @name         Block Unlock buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет кнопки для блокировки и разблокировки всех карт на текущей страничке
// @author       George
// @match        https://asstars.tv/user/*/cards/*
// @match        https://animestars.org/user/*/cards/*
// @match        https://astars.club/user/*/cards/*
// @match        https://as1.astars.club/user/*/cards/*
// @match        https://asstars1.astars.club/user/*/cards/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Функция для блокировки карт
    function lockCards() {
        let buttons = document.querySelectorAll('.lock-card-btn i.fa-unlock');
        buttons.forEach(btn => {
            btn.parentElement.click();
            console.log(`Заблокирована карта с data-id: ${btn.parentElement.getAttribute('data-id')}`);
        });
    }

    // Функция для разблокировки карт
    function unlockCards() {
        let buttons = document.querySelectorAll('.lock-card-btn i.fa-lock');
        buttons.forEach(btn => {
            btn.parentElement.click();
            console.log(`Разблокирована карта с data-id: ${btn.parentElement.getAttribute('data-id')}`);
        });
    }

    // Функция для добавления кнопок
    function addButtons() {
        // Проверка, чтобы кнопки не добавлялись несколько раз
        if (document.querySelector('.unlock-cards-btn') || document.querySelector('.lock-cards-btn')) {
            return;
        }

        // Находим контейнер для кнопок
        const container = document.querySelector('.action_lock_show_block');
        if (!container) {
            return;
        }

        // Добавляем стиль для горизонтального центрирования кнопок
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.flexWrap = 'wrap'; // Чтобы кнопки переносились на новую строку при необходимости
        container.style.gap = '10px'; // Добавляем промежуток между кнопками

        // Создаём кнопки для блокировки и разблокировки карт
        let unlockBtn = document.createElement('a');
        unlockBtn.className = 'button button--primary profile-cards__deck-btn unlock-cards-btn';
        unlockBtn.innerHTML = '<i class="fal fa-unlock"></i> Разблокировка текущих';
        unlockBtn.href = '#';
        unlockBtn.addEventListener('click', (event) => {
            event.preventDefault();
            unlockCards();
        });

        let lockBtn = document.createElement('a');
        lockBtn.className = 'button button--primary profile-cards__deck-btn lock-cards-btn';
        lockBtn.innerHTML = '<i class="fal fa-lock"></i> Блокировка текущих';
        lockBtn.href = '#';
        lockBtn.addEventListener('click', (event) => {
            event.preventDefault();
            lockCards();
        });

        // Добавляем кнопки в начало контейнера
        container.prepend(lockBtn);
        container.prepend(unlockBtn);
    }

    // Добавляем кнопки после загрузки страницы
    window.addEventListener('load', addButtons);

    // Перезапуск функции добавления кнопок после изменения фильтров или динамической подгрузки контента
    const observer = new MutationObserver(addButtons);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
