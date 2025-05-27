// ==UserScript==
// @name         Buttons Management Tools (Updated)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Updated for new UI: delete cards, lock/unlock all, share all, pagination, clear search
// @author       George
// @match        https://asstars.tv/user/*/cards/*
// @match        https://as1.asstars.tv/user/*/cards/*
// @match        https://animestars.org/user/*/cards/*
// @match        https://astars.club/user/*/cards/*
// @match        https://asstars1.astars.club/user/*/cards/*
// @match        https://as1.astars.club/user/*/cards/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const TAB_MENU_SELECTOR = '.tabs__nav.tab__menu.tab_menu_fon1';

    function addDeleteButton() {
        const tabsNav = document.querySelector(TAB_MENU_SELECTOR);
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
        const tabMenu = document.querySelector(TAB_MENU_SELECTOR);
        if (tabMenu && !document.querySelector('.share-all-btn')) {
            const shareButton = document.createElement('button');
            shareButton.classList.add('tabs__item', 'share-all-btn');
            shareButton.innerHTML = '<i class="fal fa-arrow-right-arrow-left"></i>';
            tabMenu.appendChild(shareButton);

            shareButton.addEventListener('click', () => {
                const elements = document.querySelectorAll('.anime-cards__item.show-trade_button');
                const dataIds = [...new Set(Array.from(elements).map(el => el.getAttribute('data-owner-id')))];
                function processNext(index = 0) {
                    if (index >= dataIds.length) return;
                    const id = dataIds[index];
                    if (!id) return processNext(index + 1);
                    const button = document.createElement('button');
                    button.setAttribute('data-id', id);
                    button.setAttribute('data-type', '1');
                    button.setAttribute('onclick', 'ProposeAdd.call(this); return false;');
                    setTimeout(() => {
                        button.click();
                        processNext(index + 1);
                    }, 1100);
                }
                processNext(0);
            });
        }
    }

    function addClearSearchButton() {
        const tabsNav = document.querySelector(TAB_MENU_SELECTOR);
        if (tabsNav && !document.querySelector('.clear-search-btn')) {
            const clearSearchButton = document.createElement('button');
            clearSearchButton.classList.add('tabs__item', 'clear-search-btn');
            clearSearchButton.innerHTML = '<i class="fal fa-times-circle"></i>';

            const allButton = Array.from(tabsNav.children).find(el => el.textContent.trim() === "Все");
            if (allButton) {
                tabsNav.insertBefore(clearSearchButton, allButton);
            } else {
                tabsNav.prepend(clearSearchButton);
            }

            clearSearchButton.addEventListener('click', function () {
                const searchInput = document.querySelector('.card-filter-form__search, input[type="search"], input[type="text"].search-input');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                const searchButton = document.querySelector('.tabs__search-btn, .card-filter-form__submit');
                if (searchButton) searchButton.click();
                const searchForm = document.querySelector('form.card-filter-form, form.search-form');
                if (searchForm) searchForm.dispatchEvent(new Event('submit', { bubbles: true }));
                let currentUrl = new URL(window.location.href);
                if (currentUrl.searchParams.has('stars')) {
                    currentUrl.searchParams.delete('stars');
                    window.location.href = currentUrl.toString();
                }
            });
        }
    }

    function addPaginationNextButton() {
        let paginationButton = document.querySelector('.pagination__pages-btn a');
        const tabMenu = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon1');

        if (paginationButton && tabMenu && !document.querySelector('.pagination-btn')) {
            let paginationIconButton = document.createElement('button');
            paginationIconButton.classList.add('tabs__item', 'pagination-btn');
            paginationIconButton.innerHTML = '<i class="fal fa-long-arrow-right"></i>';
            paginationIconButton.title = 'Следующая страница';

            paginationIconButton.addEventListener('click', () => {
                window.location.href = paginationButton.href;
            });

            tabMenu.appendChild(paginationIconButton);
        }
    }

    function addPaginationPrevButton() {
        if (document.querySelector('.pagination-prev-btn')) return;

        const currentPageSpan = document.querySelector('.pagination__pages span:not(.nav_ext)');
        if (!currentPageSpan) return;

        const currentPage = parseInt(currentPageSpan.textContent);
        if (isNaN(currentPage) || currentPage <= 1) return;

        const baseUrl = window.location.href.replace(/\/page\/\d+\/$/, '/');

        let prevPageUrl = currentPage === 2
            ? baseUrl
            : baseUrl.replace(/\/$/, `/page/${currentPage - 1}/`);

        let paginationPrevButton = document.createElement('button');
        paginationPrevButton.classList.add('tabs__item', 'pagination-prev-btn');
        paginationPrevButton.innerHTML = '<i class="fal fa-long-arrow-left"></i>';
        paginationPrevButton.title = 'Предыдущая страница';

        paginationPrevButton.addEventListener('click', () => {
            window.location.href = prevPageUrl;
        });

        const tabMenu = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon1');
        if (tabMenu) {
            tabMenu.insertBefore(paginationPrevButton, tabMenu.firstChild); // или .appendChild()
        }
    }

    function lockCards() {
        document.querySelectorAll('.lock-card-btn i.fa-unlock').forEach(btn => {
            btn.parentElement.click();
        });
    }

    function unlockCards() {
        document.querySelectorAll('.lock-card-btn i.fa-lock').forEach(btn => {
            btn.parentElement.click();
        });
    }

    function addButtons() {
        if (document.querySelector('.unlock-cards-btn') || document.querySelector('.lock-cards-btn')) return;
        const container = document.querySelector('.action_lock_show_block');
        if (!container) return;
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.flexWrap = 'wrap';
        container.style.gap = '10px';

        let unlockBtn = document.createElement('a');
        unlockBtn.className = 'btn btn-red c-gap-10 profile-cards__deck-btn';
        unlockBtn.innerHTML = '<i class="fal fa-unlock"></i> Разблокировка текущих';
        unlockBtn.href = '#';
        unlockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            unlockCards();
        });

        let lockBtn = document.createElement('a');
        lockBtn.className = 'btn btn-green c-gap-10 profile-cards__deck-btn';
        lockBtn.innerHTML = '<i class="fal fa-lock"></i> Блокировка текущих';
        lockBtn.href = '#';
        lockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            lockCards();
        });

        container.prepend(lockBtn);
        container.prepend(unlockBtn);
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

    waitForElement(TAB_MENU_SELECTOR, initializeAllFeatures);
})();
