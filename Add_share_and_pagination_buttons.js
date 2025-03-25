// ==UserScript==
// @name         Share all buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматически нажимает кнопки "Готов поменять" для всех карт на текущей страничке (иконка выгрузки), добавляет кнопку пагинации вверху (иконка стрелка)
// @author       George
// @match        https://asstars.tv/user/*/cards/*
// @match        https://animestars.org/user/*/cards/*
// @match        https://astars.club/user/*/cards/*
// @match        https://asstars1.astars.club/user/*/cards/*
// @match        https://as1.astars.club/user/*/cards/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Создаем кнопку "Выложить"
    let uploadButton = document.createElement('button');
    uploadButton.classList.add('tabs__item');
    uploadButton.title = 'Добавить в обмен'; // Подсказка для кнопки
    uploadButton.innerHTML = '<i class="fal fa-upload"></i>'; // Иконка загрузки

    // Найдем контейнер для кнопки "Выложить"
    let tabMenu = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon');

    if (tabMenu) {
        // Добавляем кнопку в контейнер
        tabMenu.appendChild(uploadButton);

        // Функция для обработки клика по "Выложить"
        function handleClick() {
            // Получаем все элементы с классом anime-cards__item show-trade_button
            let dataIdElements = document.querySelectorAll('.anime-cards__item.show-trade_button');
            let dataIds = new Set();

            dataIdElements.forEach(el => {
                let id = el.getAttribute('data-id');
                if (id) {
                    dataIds.add(id);
                }
            });

            dataIds = Array.from(dataIds);
            console.log("Фильтрованные data-id:", dataIds);

            // Функция для создания элемента и виртуального нажатия с задержкой
            function clickWithDelay(index) {
                if (index >= dataIds.length) return;

                let id = dataIds[index];
                let button = document.createElement('button');
                button.className = 'all-owners';
                button.setAttribute('data-id', id);
                button.setAttribute('data-type', '1');
                button.setAttribute('onclick', 'ProposeAdd.call(this); return false;');

                console.log(`Создан виртуальный элемент для data-id ${id}, нажимаем через 0.5 сек.`);

                setTimeout(() => {
                    button.click();
                    console.log(`Виртуально нажата кнопка для data-id ${id}`);
                    clickWithDelay(index + 1);
                }, 1100);
            }

            // Запускаем процесс нажатия с задержкой
            clickWithDelay(0);
        }

        // Добавляем обработчик на кнопку "Выложить"
        uploadButton.addEventListener('click', handleClick);
    }

    // Находим элемент пагинации
    let paginationButton = document.querySelector('.pagination__pages-btn a');
    if (paginationButton) {
        // Получаем ссылку на следующую страницу
        let nextPageUrl = paginationButton.href;

        // Создаем кнопку с иконкой для пагинации
        let paginationIconButton = document.createElement('button');
        paginationIconButton.classList.add('tabs__item');
        paginationIconButton.title = 'Следующая страница'; // Подсказка для кнопки
        paginationIconButton.innerHTML = '<i class="fal fa-long-arrow-right"></i>'; // Иконка стрелки

        // Находим контейнер для сортировки
        let sortBlock = document.querySelector('.sort-block.sort-block--btn');
        if (sortBlock) {
            // Добавляем новую кнопку в контейнер сортировки
            sortBlock.appendChild(paginationIconButton);

            // Добавляем обработчик клика для кнопки пагинации
            paginationIconButton.addEventListener('click', function() {
                window.location.href = nextPageUrl; // Переходим по ссылке пагинации
            });

            // Сделаем кнопку пагинации на одной линии с селектором сортировки
            paginationIconButton.style.marginLeft = '10px'; // Добавляем отступ между сортировкой и пагинацией
            paginationIconButton.style.display = 'inline-flex'; // Убираем перенос на новую строку
        }
    }
})();
