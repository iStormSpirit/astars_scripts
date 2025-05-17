// ==UserScript==
// @name         Auto Rewards Handler
// @namespace    http://tampermonkey.net/
// @version      1.1a
// @description  Auto-claim rewards
// @author       George
// @match        https://asstars.tv/*
// @match        https://asstars.club/*
// @match        https://astars.club/*
// @match        https://animestars.org/*
// @match        https://as1.astars.club/*
// @match        https://asstars1.astars.club/*
// @grant        none
// ==/UserScript==

const DELAY = 40;
let currentTime = 0;
const VIDEO_DURATION = 1440;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function getCurrentDomain() {
    return `${window.location.protocol}//${window.location.hostname}`;
}

function showNotification(message) {
    const notification = document.createElement('div');

    notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2ecc71;
    color: white;
    padding: 16px 25px;
    border-radius: 4px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideInRight 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
    font-family: Arial, sans-serif;
    font-weight: 500;
    `;

    notification.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </svg>
    ${message}
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}


function simulateWatching() {
    const userHash = window.dle_login_hash;
    if (!userHash) return;

    const currentDomain = window.location.origin;
    currentTime += 30;
    if (currentTime > VIDEO_DURATION) currentTime = 30;

    fetch(`${currentDomain}/engine/ajax/controller.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors'
        },
        body: new URLSearchParams({
            mod: 'user_count_timer',
            user_hash: userHash,
            time: currentTime.toString(),
            duration: VIDEO_DURATION.toString(),
            episode: '1',
            watch: '1'
        })
    });

    fetch(`${currentDomain}/engine/ajax/controller.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json, text/javascript, */*; q=0.01'
        },
        body: new URLSearchParams({
            mod: 'reward_card',
            action: 'check_reward',
            user_hash: userHash,
            time: currentTime.toString(),
            duration: VIDEO_DURATION.toString()
        })
    });
}

async function checkGiftCard(doc) {
    const button = doc.querySelector('#gift-icon');
    if (!button) return;

    const giftCode = button.getAttribute('data-code');
    if (!giftCode) return false;

    try {
        const response = await fetch('/engine/ajax/controller.php?mod=gift_code_game', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                code: giftCode,
                user_hash: window.dle_login_hash
            })
        });
        const data = await response.json();
        if (data.status === 'ok') {
            console.log('Награда получена:', data.text); // Добавлено логирование
            showNotification(data.text);
            button.remove();
        }
    } catch (error) {
    }
}

function checkNewCard() {
    const userHash = window.dle_login_hash;
    if (!userHash) {
        setTimeout(checkNewCard, 2000);
        return;
    }

    const currentDomain = getCurrentDomain();
    const url = `${currentDomain}/engine/ajax/controller.php?mod=reward_card&action=check_reward&user_hash=${userHash}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.stop_reward === "yes") return;
            if (data.cards?.owner_id) {
                const cardName = data.cards.name || '';
                console.log('Новая карта получена:', cardName); // Добавлено логирование
                showNotification('Получена новая карта: ' + cardName);
                fetch(`${currentDomain}/engine/ajax/controller.php?mod=cards_ajax`, {
                    method: "POST",
                    headers: {"Content-Type": "application/x-www-form-urlencoded"},
                    body: new URLSearchParams({
                        action: "take_card",
                        owner_id: data.cards.owner_id
                    })
                });
            }
        })
        .catch(() => {
        });
}

(function () {
    'use strict';

    let lastActiveTime = localStorage.getItem('lastCrystalTime') || "00:00";
    let processedCrystals = new Set(JSON.parse(localStorage.getItem('processedCrystals') || '[]'));
    let worker = null;

    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    }

    function getCrystalId(msg) {
        const timeElement = msg.querySelector(".lc_chat_li_date");
        const author = msg.querySelector(".lc_chat_li_autor");
        return author && timeElement ? `${author.textContent.trim()}_${timeElement.textContent.trim()}` : null;
    }

    function initializeWorker() {
        const workerCode = `
            self.onmessage = e => {
                if (e.data.action === 'start') {
                    setInterval(() => self.postMessage({type: 'checkCrystal'}), 1000);
                    setInterval(() => self.postMessage({type: 'checkTimeout'}), 2000);
                    setInterval(() => self.postMessage({type: 'checkInactive'}), 4000);
                }
            };`;

        worker = new Worker(URL.createObjectURL(new Blob([workerCode])));

        worker.onmessage = e => {
            switch (e.data.type) {
                case 'checkCrystal':
                    document.querySelectorAll(".lc_chat_li").forEach(msg => {
                        const crystalId = getCrystalId(msg);
                        if (msg.querySelector("#diamonds-chat") && crystalId && !processedCrystals.has(crystalId)) {
                            msg.querySelector("#diamonds-chat").click();
                            processedCrystals.add(crystalId);
                            localStorage.setItem('processedCrystals', JSON.stringify([...processedCrystals]));
                        }
                    });
                    break;

                case 'checkTimeout':
                    document.querySelector(".lc_chat_timeout_imback")?.click();
                    break;

                case 'checkInactive':
                    document.querySelector(".push-warning .DLEPush-close")?.click();
                    break;
            }
        };
    }

    function autoRepeatCheck() {
        checkGiftCard(document);
        Audio.prototype.play = () => new Promise(() => {
        });
    }

    function initializeScript() {
        initializeWorker();
        worker.postMessage({action: 'start'});
        setInterval(simulateWatching, 30000);

        setInterval(() => {
            autoRepeatCheck();
            checkNewCard();
        }, 5000);
        setInterval(simulateWatching, 30000);

        setInterval(() => {
            fetch(`${getCurrentDomain()}/engine/ajax/controller.php?mod=user_count_timer&user_hash=${window.dle_login_hash}`)
                .catch(() => {
                });
        }, 31000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
})();