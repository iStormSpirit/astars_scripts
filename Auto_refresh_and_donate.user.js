// ==UserScript==
// @name         Auto Refresh and Donate
// @namespace    http://tampermonkey.net/
// @version      1.0a
// @description  Автоматизация донатов, отключение звука при донате
// @author       George
// @match        https://asstars.tv/clubs/boost/?id=6
// @match        https://as1.asstars.tv/clubs/boost/?id=6
// @match        https://asstars.club/clubs/boost/?id=6
// @match        https://astars.club/clubs/boost/?id=6
// @match        https://animestars.org/clubs/boost/?id=6
// @match        https://as1.astars.club/clubs/boost/?id=6
// @match        https://asstars1.astars.club/clubs/boost/?id=6
// @grant        none
// @updateURL    https://raw.githubusercontent.com/iStormSpirit/astars_scripts/master/Auto_refresh_and_donate.user.js
// @downloadURL  https://raw.githubusercontent.com/iStormSpirit/astars_scripts/master/Auto_refresh_and_donate.user.js
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

    if (window.Audio) {
        Audio.prototype.play = function() {
            return new Promise(() => {});
        };
    }
    setInterval(() => {
        if (isActivated) {
            refreshCard();
            setTimeout(donateCard, 250);
        }
    }, 500);
})();