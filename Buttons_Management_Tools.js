// ==UserScript==
// @name         Buttons Management Tools
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds buttons: delete cards, lock all cards, unlock all cards, share all cards, pagination navigation, clear search
// @author       George
// @match        https://asstars.tv/user/*/cards/*
// @match        https://animestars.org/user/*/cards/*
// @match        https://astars.club/user/*/cards/*
// @match        https://asstars1.astars.club/user/*/cards/*
// @match        https://as1.astars.club/user/*/cards/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addDeleteButton() {
        const tabsNav = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon');
        if (tabsNav && !document.querySelector('.delete-all-cards-btn')) {
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('tabs__item', 'delete-all-cards-btn');
            deleteButton.innerHTML = '<i class="fal fa-trash"></i>';
            tabsNav.appendChild(deleteButton);

            deleteButton.addEventListener('click', function () {
                deleteButton.style.display = 'none';
                document.querySelectorAll('.card-offer-remove-btn').forEach(button => button.click());
            });
        }
    }

    function addShareButton() {
        const tabMenu = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon');
        if (tabMenu && !document.querySelector('.share-all-btn')) {
            const shareButton = document.createElement('button');
            shareButton.classList.add('tabs__item', 'share-all-btn');
            shareButton.innerHTML = '<i class="fal fa-arrow-right-arrow-left></i>';
            tabMenu.appendChild(shareButton);

            shareButton.addEventListener('click', () => {
                // Собираем уникальные data-id
                const elements = document.querySelectorAll('.anime-cards__item.show-trade_button');
                const dataIds = [...new Set(Array.from(elements).map(el => el.getAttribute('data-id')))];

                // Рекурсивная функция с задержкой
                function processNext(index = 0) {
                    if (index >= dataIds.length) return;

                    const id = dataIds[index];
                    if (!id) {
                        processNext(index + 1);
                        return;
                    }

                    // Создаем виртуальную кнопку
                    const button = document.createElement('button');
                    button.setAttribute('data-id', id);
                    button.setAttribute('data-type', '1'); // Добавляем data-type из примера
                    button.setAttribute('onclick', 'ProposeAdd.call(this); return false;');

                    console.log(`Добавление карты ${id} (${index + 1}/${dataIds.length})`);

                    // Кликаем с задержкой перед следующим вызовом
                    setTimeout(() => {
                        button.click();
                        processNext(index + 1);
                    }, 1100); // Задержка как в оригинальном примере
                }

                // Запускаем обработку
                console.log(`Найдено карт для добавления: ${dataIds.length}`);
                processNext(0);
            });
        }
    }

    function addPaginationNextButton() {
        let paginationButton = document.querySelector('.pagination__pages-btn a');
        if (paginationButton && !document.querySelector('.pagination-btn')) {
            let paginationIconButton = document.createElement('button');
            paginationIconButton.classList.add('tabs__item', 'pagination-btn');
            paginationIconButton.innerHTML = '<i class="fal fa-long-arrow-right"></i>';

            paginationIconButton.addEventListener('click', () => {
                window.location.href = paginationButton.href;
            });

            let sortBlock = document.querySelector('.sort-block.sort-block--btn');
            if (sortBlock) sortBlock.appendChild(paginationIconButton);

            paginationIconButton.style.marginLeft = '5px';
            paginationIconButton.style.display = 'inline-flex';
        }
    }

    function addPaginationPrevButton() {
        if (document.querySelector('.pagination-prev-btn')) {
            return;
        }

        // Находим текущую страницу (элемент span)
        const currentPageSpan = document.querySelector('.pagination__pages span:not(.nav_ext)');
        if (!currentPageSpan) return;

        const currentPage = parseInt(currentPageSpan.textContent);
        if (isNaN(currentPage) || currentPage <= 1) return; // Если страница 1 или меньше - ничего не делаем

        const baseUrl = window.location.href.replace(/\/page\/\d+\/$/, '/');

        let prevPageUrl;
        if (currentPage === 2) {
            prevPageUrl = baseUrl;
        } else {
            prevPageUrl = baseUrl.replace(/\/$/, `/page/${currentPage - 1}/`);
        }

        let paginationPrevButton = document.createElement('button');
        paginationPrevButton.classList.add('tabs__item', 'pagination-prev-btn');
        paginationPrevButton.innerHTML = '<i class="fal fa-long-arrow-left"></i>';

        paginationPrevButton.addEventListener('click', () => {
            window.location.href = prevPageUrl;
        });

        let sortBlock = document.querySelector('.sort-block.sort-block--btn');
        if (sortBlock) {
            const nextBtn = sortBlock.querySelector('.pagination-btn');
            if (nextBtn) {
                sortBlock.insertBefore(paginationPrevButton, nextBtn);
            } else {
                sortBlock.appendChild(paginationPrevButton);
            }

            paginationPrevButton.style.marginLeft = '10px';
            paginationPrevButton.style.display = 'inline-flex';

        }
    }

    function lockCards() {
        let buttons = document.querySelectorAll('.lock-card-btn i.fa-unlock');
        buttons.forEach(btn => {
            btn.parentElement.click();
            console.log(`Заблокирована карта с data-id: ${btn.parentElement.getAttribute('data-id')}`);
        });
    }

    function unlockCards() {
        let buttons = document.querySelectorAll('.lock-card-btn i.fa-lock');
        buttons.forEach(btn => {
            btn.parentElement.click();
            console.log(`Разблокирована карта с data-id: ${btn.parentElement.getAttribute('data-id')}`);
        });
    }

    function addButtons() {
        if (document.querySelector('.unlock-cards-btn') || document.querySelector('.lock-cards-btn')) {
            return;
        }

        const container = document.querySelector('.action_lock_show_block');
        if (!container) {
            return;
        }

        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.flexWrap = 'wrap'; // Чтобы кнопки переносились на новую строку при необходимости
        container.style.gap = '10px'; // Добавляем промежуток между кнопками

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

        container.prepend(lockBtn);
        container.prepend(unlockBtn);
    }

    function addClearSearchButton() {
        const tabsNav = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon');
        if (tabsNav && !document.querySelector('.clear-search-btn')) {
            const clearSearchButton = document.createElement('button');
            clearSearchButton.classList.add('tabs__item', 'clear-search-btn');

            const icon = document.createElement('i');
            icon.classList.add('fal', 'fa-times-circle');
            clearSearchButton.appendChild(icon);

            const allButton = Array.from(tabsNav.children).find(el => el.textContent.trim() === "Все");

            if (allButton) {
                tabsNav.insertBefore(clearSearchButton, allButton);
                console.log('Кнопка очистки добавлена перед "Все"');
            } else {
                tabsNav.prepend(clearSearchButton);
                console.warn('Кнопка "Все" не найдена, добавлена в начало блока');
            }

            clearSearchButton.addEventListener('click', function () {
                console.log('Кнопка очистки поиска нажата'); // Лог для проверки

                const searchInput = document.querySelector('.card-filter-form__search, input[type="search"], input[type="text"].search-input');

                if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', {bubbles: true}));
                    searchInput.dispatchEvent(new Event('change', {bubbles: true}));
                    console.log('Поле поиска очищено');
                } else {
                    console.warn('Поле поиска не найдено');
                }

                const searchButton = document.querySelector('.tabs__search-btn, .card-filter-form__submit');
                if (searchButton) {
                    searchButton.click();
                    console.log('Кнопка поиска нажата');
                } else {
                    console.warn('Кнопка поиска не найдена');
                }

                const searchForm = document.querySelector('form.card-filter-form, form.search-form');
                if (searchForm) {
                    searchForm.dispatchEvent(new Event('submit', {bubbles: true}));
                    console.log('Форма поиска отправлена');
                } else {
                    console.warn('Форма поиска не найдена');
                }
            });
        }
    }

    function waitForElement(selector, callback, timeout = 10000) {
        const intervalTime = 100;
        let elapsed = 0;

        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                callback(element);
            } else if (elapsed >= timeout) {
                clearInterval(interval);
                console.warn(`Элемент ${selector} не найден за ${timeout} мс`);
            }
            elapsed += intervalTime;
        }, intervalTime);
    }

    function initializeAllFeatures() {
        addDeleteButton();
        addShareButton();
        addClearSearchButton();
        addPaginationNextButton();
        addPaginationPrevButton();
        addButtons();

    }

    waitForElement('.tabs__nav.tab__menu.tab_menu_fon', () => {
        initializeAllFeatures();
    });
})();
