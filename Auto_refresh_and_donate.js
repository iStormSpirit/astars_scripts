// ==UserScript==
// @name         Auto Refresh and Donate
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматизация донатов
// @author       George
// @match        https://animestars.org/clubs/6/boost/
// @match        https://astars.club/clubs/6/boost/
// @match        https://asstars1.astars.club/clubs/6/boost/
// @match        https://as1.astars.club/clubs/6/boost/
// @match        https://asstars.tv/clubs/6/boost/
// @grant        none
// @updateURL    https://raw.githubusercontent.com/iStormSpirit/astars_scripts/refs/heads/master/Auto_refresh_and_donate.js
// @downloadURL  https://raw.githubusercontent.com/iStormSpirit/astars_scripts/refs/heads/master/Auto_refresh_and_donate.js
// ==/UserScript==

(function () {
    'use strict';

    let isActivated = false;

    // Создаём кнопку для активации
    const button = document.createElement('button');
    button.innerText = 'Start Auto Donate';
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

    document.body.appendChild(button);

    button.addEventListener('click', () => {
        isActivated = !isActivated;
        if (isActivated) {
            console.log("Auto Donate Activated.");
            button.innerText = 'Stop Auto Donate';
            button.style.backgroundColor = '#FF5733';
        } else {
            console.log("Auto Donate Deactivated.");
            button.innerText = 'Start Auto Donate';
            button.style.backgroundColor = '#4CAF50';
        }
    });

    function refreshCard() {
        let refreshButton = document.querySelector('button.club__boost__refresh-btn');
        if (refreshButton) {
            refreshButton.click();
            console.log('Карта обновлена');
        }
    }

    function donateCard() {
        let donateButton = document.querySelector('button.club__boost-btn');
        if (donateButton) {
            donateButton.click();
            console.log('Карта внесена');
        }
    }

    setInterval(() => {
        if (isActivated) {
            refreshCard();
            setTimeout(donateCard, 10);
        }
    }, 10);
})();