// ==UserScript==
// @name         Delete cards buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет кнопку со значком корзины для очистки всех карт из листа желаний на страничке хочу/не хочу
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

    // Находим элемент, в который нужно добавить кнопку
    const tabsNav = document.querySelector('.tabs__nav.tab__menu.tab_menu_fon');

    if (tabsNav) {
        // Создаем кнопку
        const button = document.createElement('button');
        button.classList.add('tabs__item'); // Добавляем класс для кнопки

        // Добавляем иконку с классом для отображения иконки в стиле других кнопок
        const icon = document.createElement('i');
        icon.classList.add('fal', 'fa-trash'); // Класс иконки для корзины (удаление)

        // Добавляем иконку в кнопку
        button.appendChild(icon);
        tabsNav.appendChild(button);

        // Функция для клика по кнопкам удаления карточек
        function clickButtons() {
            document.querySelectorAll('.card-offer-remove-btn')
                .forEach(button => button.click());
        }

        // Обработчик события для нажатия на кнопку
        button.addEventListener('click', function() {
            button.style.display = 'none';

            setInterval(clickButtons, 100);
        });
    }
})();
