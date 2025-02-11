// ==UserScript==
// @name         Auto delete card on page by list
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Delete card on page by list
// @author       George
// @match        https://asstars.tv/user/*
// @match        https://animestars.org/user/*
// @match        https://astars.club/user/*
// @match        https://asstars1.astars.club/user/*
// @match        https://as1.astars.club/user/*
// @match        https://asstars.tv/user/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickButtons() {
        document.querySelectorAll('.card-offer-remove-btn')
            .forEach(button => button.click());
    }

    window.addEventListener('load', clickButtons);

    setInterval(clickButtons, 2000);
})();