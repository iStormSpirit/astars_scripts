// ==UserScript==
// @name         Auto Rewards Handler
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Auto-claim rewards
// @author       George
// @match        https://asstars.tv/*
// @match        https://as1.asstars.tv/*
// @match        https://asstars.club/*
// @match        https://astars.club/*
// @match        https://animestars.org/*
// @match        https://as1.astars.club/*
// @match        https://asstars1.astars.club/*
// @grant        none
// ==/UserScript==

const DELAY = 300;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


let currentNotification = {
    element: null,
    id: null,
    type: null,
    timeoutId: null
};

function displayNotification(id, message, type = 'temporary', options = {}) {
    if (window.location.pathname.includes('/pm/') || window.location.pathname.includes('emotions.php') || window.location.pathname.includes('/messages/')) {
        return;
    }

    const {total, current, isSuccess = true, duration = 3500, sticky = false} = options;
    if (currentNotification.element && currentNotification.id !== id) {
        if (currentNotification.timeoutId) clearTimeout(currentNotification.timeoutId);
        if (currentNotification.element.parentNode) {
            currentNotification.element.remove();
        }
        currentNotification.element = null;
        currentNotification.id = null;
    }

    let notificationElement = currentNotification.element;

    if (!notificationElement || currentNotification.id !== id || (currentNotification.type === 'progress' && type !== 'progress')) {
        if (notificationElement && notificationElement.parentNode) {
            notificationElement.remove();
        }
        notificationElement = document.createElement('div');
        notificationElement.className = 'card-helper-status-notification';
        document.body.appendChild(notificationElement);
        currentNotification.element = notificationElement;
        currentNotification.id = id;
    }

    currentNotification.type = type;
    let iconHtml = '';
    if (type === 'progress') {
        iconHtml = '<div class="card-helper-spinner"></div>';
        if (total !== undefined && current !== undefined) {
            let progressText = total === 'неизвестно' ?
                `Обработано ${current}` : `${current}/${total}`;
            message = `${message} ${progressText}`;
        }
    } else if (type === 'completion' || type === 'temporary') {
        const iconClass = isSuccess ?
            'card-helper-checkmark' : 'card-helper-crossmark';
        const iconChar = isSuccess ? '✔' : '✖';
        iconHtml = `<span class="${iconClass}">${iconChar}</span>`;
    }

    notificationElement.innerHTML = `
        <div class="ch-status-icon-container">${iconHtml}</div>
        <span class="card-helper-status-text">${message}</span>
    `;
    requestAnimationFrame(() => {
        notificationElement.classList.add('show');
    });
    if (currentNotification.timeoutId) {
        clearTimeout(currentNotification.timeoutId);
        currentNotification.timeoutId = null;
    }

    if (!sticky && (type === 'completion' || type === 'temporary')) {
        currentNotification.timeoutId = setTimeout(() => {
            hideCurrentNotification(id);
        }, duration);
    }
}


function showTemporaryMessage(id, message, isSuccess = true, duration = 3500) {
    displayNotification(id, message, 'temporary', {isSuccess, duration});
}

function hideCurrentNotification(idToHide) {
    if (currentNotification.element && currentNotification.id === idToHide) {
        const element = currentNotification.element;
        element.classList.remove('show');
        if (currentNotification.timeoutId) {
            clearTimeout(currentNotification.timeoutId);
            currentNotification.timeoutId = null;
        }
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
            if (currentNotification.element === element) {
                currentNotification.element = null;
                currentNotification.id = null;
                currentNotification.type = null;
            }
        }, 400);
    }
}


const style = document.createElement('style');
style.textContent = `
@keyframes glowEffect {0% { box-shadow: 0 0 5px #6c5ce7; } 50% { box-shadow: 0 0 20px #6c5ce7; } 100% { box-shadow: 0 0 5px #6c5ce7; }}
@keyframes glowChargeEffect {0% { box-shadow: 0 0 7px #4CAF50; } 50% { box-shadow: 0 0 25px #4CAF50; } 100% { box-shadow: 0 0 7px #4CAF50; }}
@keyframes fadeInUp {from {opacity: 0; transform: translateY(10px);} to {opacity: 1; transform: translateY(0);}}
@keyframes breatheShadowInteractive { 0% { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); transform: scale(1); } 50% { box-shadow: 0 5px 15px rgba(108, 92, 231, 0.4); transform: scale(1.02); } 100% { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); transform: scale(1); } }
@keyframes pulseWorkingBorderInteractive { 0% { box-shadow: 0 0 0 0px rgba(86, 200, 239, 0.7), 0 3px 8px rgba(0,0,0,0.25); } 70% { box-shadow: 0 0 0 10px rgba(86, 200, 239, 0), 0 5px 12px rgba(0,0,0,0.3); } 100% { box-shadow: 0 0 0 0px rgba(86, 200, 239, 0), 0 3px 8px rgba(0,0,0,0.25); } }
@keyframes pulseIcon { 0% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.2) rotate(0deg); opacity: 0.7; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes cardHelperSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
 
.processing-card {position: relative;}
.processing-card img {position: relative; z-index: 2;}
.processing-card::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; max-height: calc(100% - 30px); border-radius: 8px; z-index: 1; animation: glowEffect 1.5s infinite; pointer-events: none; }
.charging-card {position: relative;}
.charging-card img {position: relative; z-index: 2;}
.charging-card::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; max-height: calc(100% - 30px); border-radius: 8px; z-index: 1; animation: glowChargeEffect 1.5s infinite; pointer-events: none; }
 
.card-stats {position: relative; background: linear-gradient(45deg, #6c5ce7, #a367dc); padding: 8px; color: white; font-size: 12px; margin-top: 5px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); animation: fadeInUp 0.3s ease; z-index: 0 !important;}
.history__inner {max-width: 1200px !important; margin: 0 auto !important; padding: 15px !important;}
.history__item {background: rgba(108, 92, 231, 0.05) !important; border-radius: 10px !important; padding: 20px !important; margin-bottom: 20px !important;}
.history__body {display: flex !important; flex-wrap: wrap !important; gap: 15px !important; padding: 15px !important; border-radius: 8px !important;}
.history__body--gained {background: rgba(46, 213, 115, 0.1) !important; margin-bottom: 10px !important;}
.history__body--lost {background: rgba(255, 71, 87, 0.1) !important;}
@media screen and (min-width: 769px) {.history__body-item {width: 120px !important; height: auto !important; transition: transform 0.2s !important;} .history__body-item img {width: 120px !important; height: auto !important; border-radius: 8px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;}}
.history__body-item:hover {transform: scale(1.05) !important; z-index: 2 !important;}
.card-stats span {display: flex; align-items: center; gap: 4px;}
.card-stats span i {font-size: 14px;}
.lootbox__card {position: relative !important; transform: scale(0.85) !important; margin-top: -15px !important; margin-bottom: 35px !important;}
.lootbox__card .card-stats {position: absolute !important; bottom: -35px !important; left: 0 !important; right: 0 !important; margin: 0; padding: 8px !important; border-radius: 5px; z-index: 9999 !important; background: linear-gradient(45deg, #6c5ce7, #a367dc) !important; font-size: 16px !important; width: 100% !important; transform: none !important; text-rendering: optimizeLegibility !important; -webkit-font-smoothing: antialiased !important;}
.lootbox__card .card-stats span {color: white !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.3) !important; padding: 0 8px !important; flex: 1; text-align: center; font-weight: 500 !important;}
.lootbox__card .card-stats i {color: white !important; font-size: 16px !important; margin-right: 4px;}
.lootbox__list {gap: 25px !important; padding-bottom: 20px !important;}
 
@media screen and (max-width: 768px) {
    .history__body-item, .history__body-item img {width: 100px !important;}
    .processing-card::before, .charging-card::before {top: -1px !important; left: -1px !important; right: -1px !important; bottom: -1px !important; opacity: 0.5 !important;}
    div[style*="position: fixed"][style*="right: 1%"] { transform: scale(0.9); transform-origin: bottom right; }
    .anim-interactive-button { width: 40px !important; height: 40px !important; }
    .anim-interactive-button span[class*="fa-"] { font-size: 18px !important; }
    .anim-button-tooltip { font-size: 11px !important; padding: 5px 8px !important; }
    .card-stats {font-size: 10px !important; padding: 4px !important;} .card-stats span i {font-size: 12px !important;}
    .remelt__inventory-list {grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important;}
    .remelt__inventory-item {width: 100% !important; margin: 0 !important;} .remelt__inventory-item img {width: 100% !important; height: auto !important;}
    .remelt__inventory-item .card-stats {width: 100% !important; margin-top: 4px !important;}
    .lootbox__card {transform: scale(0.8) !important; margin-top: -20px !important; margin-bottom: 30px !important;}
}
 
.anim-interactive-button { background-color: #6c5ce7; color: #fff; border: none; border-radius: 50%; width: 45px; height: 45px; padding: 0; cursor: pointer; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; justify-content: center; align-items: center; animation: breatheShadowInteractive 2.5s infinite ease-in-out; outline: none; position: relative; }
.anim-interactive-button span[class*="fa-"] { display: inline-block; font-size: 20px; transition: transform 0.25s ease-out; }
.anim-interactive-button:hover { background-color: #5f51e3; transform: scale(1.12) translateY(-3px); box-shadow: 0 7px 18px rgba(0, 0, 0, 0.25); }
.anim-interactive-button:hover span[class*="fa-"] { transform: rotate(18deg); }
.anim-interactive-button:active { background-color: #5245c9; transform: scale(0.93) translateY(0px); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); transition-duration: 0.08s; }
.anim-interactive-button:active span[class*="fa-"] { transform: rotate(-8deg) scale(0.88); }
.anim-interactive-button.is-working { animation: pulseWorkingBorderInteractive 1s infinite ease-in-out, breatheShadowInteractive 2.5s infinite ease-in-out paused !important; }
.anim-interactive-button.is-working:hover { transform: scale(1.05) translateY(-1px); }
 
.anim-button-tooltip { position: absolute; right: calc(100% + 10px); top: 50%; transform: translateY(-50%) translateX(10px); background-color: #2d3436; color: #fff; padding: 8px 12px; border-radius: 4px; font-size: 14px; opacity: 0; transition: opacity 0.25s ease, transform 0.25s ease; white-space: nowrap; z-index: 1001; pointer-events: none; }
 
.card-helper-status-notification { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #3e444c; color: #f0f0f0; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-family: Arial, sans-serif; z-index: 2147483647; display: flex; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); opacity: 0; transition: opacity 0.4s ease, bottom 0.4s ease; max-width: 380px; min-width: 280px; box-sizing: border-box; }
.card-helper-status-notification.show { opacity: 1; bottom: 30px; }
.ch-status-icon-container { margin-right: 10px; display: flex; align-items: center; height: 18px; }
.card-helper-spinner { width: 16px; height: 16px; border: 2px solid #666; border-top: 2px solid #ddd; border-radius: 50%; animation: cardHelperSpin 0.8s linear infinite; }
.card-helper-checkmark, .card-helper-crossmark { font-size: 18px; line-height: 1; }
.card-helper-checkmark { color: #76c779; } .card-helper-crossmark { color: #e57373; }
.card-helper-status-text { white-space: normal; text-align: left; line-height: 1.3; }
`;
document.head.appendChild(style);

function clearIcons() {
    $('.card-notification:first')?.click();
}

function autoRepeatCheck() {
    clearIcons();
    checkGiftCard(document);
    const volumeButton = document.querySelector('.adv_volume.volume_on');
    if (volumeButton) {
        volumeButton.click();
    }
}

async function checkGiftCard(doc) {
    const button = doc.querySelector('#gift-icon');
    if (!button) return;
    const giftCode = button.getAttribute('data-code');
    if (!giftCode) return;
    try {
        const response = await fetch('/engine/ajax/controller.php?mod=gift_code_game', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({code: giftCode, user_hash: dle_login_hash})
        });
        const data = await response.json();
        if (data.status === 'ok') {
            showTemporaryMessage('giftStatus', data.text, true);
            button.remove();
        } else if (data.text) {
            showTemporaryMessage('giftStatus', data.text, false);
        }
    } catch (error) {
        console.error("Error checking gift card:", error);
        showTemporaryMessage('giftError', "Ошибка проверки гифт карты.", false);
    }
}

async function startPing() {
    const userHash = window.dle_login_hash;
    if (!userHash) return;
    try {
        await sleep(DELAY * 3);
        await $.ajax({
            url: "/engine/ajax/controller.php?mod=user_count_timer",
            type: "post", data: {user_hash: userHash}, dataType: "json", cache: false
        });
    } catch (e) {
        console.error("Error in startPing:", e.statusText || e.message || e);
    }
}

async function checkNewCard() {
    let userHash = window.dle_login_hash;
    if (!userHash) {
        setTimeout(() => {
            userHash = window.dle_login_hash;
            if (userHash) checkNewCard();
        }, 2000);
        return;
    }

    const currentDateTime = new Date();
    const localStorageKey = 'checkCardStopped' + userHash;
    const currentHourMarker = currentDateTime.toISOString().slice(0, 13);

    if (localStorage.getItem(localStorageKey) === currentHourMarker) {
        return;
    }

    try {
        await sleep(DELAY * 3);

        const data = await new Promise((resolve, reject) => {
            $.ajax({
                url: "/engine/ajax/controller.php?mod=reward_card",
                type: "post",
                data: {
                    action: "check_reward",
                    user_hash: userHash
                },
                dataType: "json",
                cache: false,
                success: resolve,
                error: reject
            });
        });

        if (data && data.stop_reward === "yes") {
            localStorage.setItem(localStorageKey, currentHourMarker);
            return;
        }

        if (!data || !data.cards || !data.cards.owner_id) {
            return;
        }

        if (data.cards.name) {
            showTemporaryMessage('newCardReceived', 'Получена новая карта: ' + data.cards.name, true, 5000);
        }

        const ownerId = data.cards.owner_id;

        await $.ajax({
            url: "/engine/ajax/controller.php?mod=cards_ajax",
            type: "post",
            data: {
                action: "take_card",
                owner_id: ownerId,
                user_hash: userHash
            },
            dataType: "json",
            cache: false
        });
    } catch (e) {
    }
}


(function () {
    'use strict';

    function initializeScript() {
        if (typeof $ === 'undefined') {
            console.error("jQuery не найден.");
            showTemporaryMessage('jQueryError', 'jQuery не найден!', false, 10000);
        }
        if (typeof dle_login_hash === 'undefined') console.warn("dle_login_hash не определена.");
        setInterval(autoRepeatCheck, 2000);
        setInterval(startPing, 31000);
        setInterval(checkNewCard, 10000);
        $('#tg-banner')?.remove();
        try {
            localStorage.setItem('notify18', 'closed');
            localStorage.setItem('hideTelegramAs', 'true');
        } catch (e) {
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeScript);
    else initializeScript();
})();