// ==UserScript==
// @name         Casino visual
// @namespace    http://tampermonkey.net/
// @version      1.1a
// @description  Изменяет визуальный вид паков карт (удаляет хуйню и делает его адекватным)
// @author       George
// @match        https://asstars.tv/cards/pack/
// @match        https://asstars.club/cards/pack/
// @match        https://astars.club/cards/pack/
// @match        https://animestars.org/cards/pack/
// @match        https://as1.astars.club/cards/pack/
// @match        https://asstars1.astars.club/cards/pack/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const observer = new MutationObserver(() => {
        document.querySelectorAll('.lootbox__list').forEach(el => {
            el.classList.remove('step1', 'step2', 'step3'); // Удаляем классы анимации
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', function() {
        const lootboxImages = document.querySelector('.lootbox__images');
        if (lootboxImages) lootboxImages.remove();

        const lootboxTitle = document.querySelector('.lootbox__descr-title');
        if (lootboxTitle && lootboxTitle.textContent.includes('Паки карт')) {
            lootboxTitle.remove();
        }

        const lootboxDescr = document.querySelector('.lootbox__descr.d-flex.fd-column.r-gap-20');
        if (lootboxDescr) {
            const tempContainer = document.createElement('div');
            while (lootboxDescr.firstChild) {
                tempContainer.appendChild(lootboxDescr.firstChild);
            }
            lootboxDescr.parentNode.replaceChild(tempContainer, lootboxDescr);

            const descrSections = tempContainer.querySelectorAll('.lootbox__descr-section');
            if (descrSections.length >= 2) {
                descrSections[0].remove();
                descrSections[1].remove();
            }

            const bonusSection = tempContainer.querySelector('.lootbox__descr-section:has(.lootbox__descr-subtitle)');
            if (bonusSection) {
                const balanceSection = tempContainer.querySelector('.lootbox__descr-section--bd');
                if (balanceSection) {
                    const bonusList = bonusSection.querySelector('ul');
                    if (bonusList) balanceSection.appendChild(bonusList);
                    bonusSection.remove();
                }
            }

            const balanceBlock = tempContainer.querySelector('.lootbox__descr-section--bd');
            if (balanceBlock) {
                balanceBlock.classList.remove('lootbox__descr-section--bd');
            }
        }

        const ncardPack = document.querySelector('.ncard.ncard-pack.lootbox.d-flex.fd-column.r-gap-40');
        if (ncardPack) {
            ncardPack.classList.remove('r-gap-40');
            ncardPack.classList.add('r-gap-20');
        }

        const lootboxMiddle = document.querySelector('.lootbox__middle');
        if (lootboxMiddle) {
            const style = document.createElement('style');
            style.textContent = `
                .lootbox__middle-item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .lootbox__middle-count {
                    margin-right: 5px;
                }
                .lootbox__middle-price {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .lootbox__middle-item {
                    background-color: var(--bg-2);
                    padding: 5px;
                    border-radius: 10px;
                    text-align: center;
                    cursor: pointer;
                }
                .lootbox__title {
                   font-size: 24px;
                   font-weight: 700;
                   text-align: center;
                   margin-bottom: 20px;
                }
                .r-gap-5 {
                    row-gap: 5px;
                    margin-left: 135px;
                }
            `;
            document.head.appendChild(style);
        }

        const tabsContainer = document.querySelector('.ncard__tabs');
        if (!tabsContainer) return;

        const newTabsContainer = document.createElement('div');
        newTabsContainer.className = 'tabs-center-all';

        const newTabsMenu = document.createElement('div');
        newTabsMenu.className = 'tab__menu tab_menu_fon';

        const hallTab = document.createElement('a');
        hallTab.className = 'tab__item tab__item-top';
        hallTab.href = '/shop/';
        hallTab.textContent = 'Зал возвышения';

        const currentActiveBtn = tabsContainer.querySelector('.ncard__tabs-btn.is-active');
        if (currentActiveBtn && currentActiveBtn.textContent.includes('Возвышение')) {
            hallTab.classList.add('tab__item-active');
            hallTab.classList.remove('tab__item-top');
        }
        newTabsMenu.appendChild(hallTab);

        const premiumTab = document.createElement('a');
        premiumTab.className = 'tab__item tab__item-top';
        premiumTab.href = '/premium/';
        premiumTab.textContent = 'Возвышение';
        newTabsMenu.appendChild(premiumTab);

        const cardsTab = document.createElement('a');
        cardsTab.className = 'tab__item tab__item-top';
        cardsTab.href = '/cards/pack/';
        cardsTab.textContent = 'Паки карт';

        if (window.location.pathname.includes('/cards/pack/')) {
            cardsTab.classList.add('tab__item-active');
            cardsTab.classList.remove('tab__item-top');
        }
        newTabsMenu.appendChild(cardsTab);

        const usersTopTab = document.createElement('a');
        usersTopTab.className = 'tab__item tab__item-top';
        usersTopTab.href = '/users_top/';
        usersTopTab.textContent = 'Топ пользователей';
        newTabsMenu.appendChild(usersTopTab);

        newTabsContainer.appendChild(newTabsMenu);
        tabsContainer.replaceWith(newTabsContainer);

        const mainStyle = document.createElement('style');
        mainStyle.textContent = `
            .sect--padding, .page-padding {
                padding: 10px;
                padding-top: 0;
            }
            .col-main {padding-top: 0;}

            .tab__item {
                margin-right: 20px;
                cursor: pointer;
                display: block;
                flex-shrink: 0;
                font-size: 13px;
                letter-spacing: 1px;
                text-transform: uppercase;
                border-bottom: 3px solid transparent;
            }
            .tab__item-active {
                font-weight: 700;
                border-bottom: 3px solid #f06102;
                padding: 0;
                cursor: default;
            }
            .tab__item-top {font-weight: 500;}
            .link {color:var(--accent-s);}
            .button--primary {
                background-color: var(--accent-s);
                color: white;
            }
            .button {
                border: none;
                border-radius: 8px;
                padding: 9px 10px;
                cursor: pointer;
                font-weight: 400;
                letter-spacing: 0.5px;
                font-size: 14px;
                text-align: center;
            }
            .tabs__item--active {
                background: #24005a;
                color: #fff;
            }
            .tabs-center-all {
                margin: 0 auto;
                max-width: 100%;
            }
            .tab__menu {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
        `;
        document.head.appendChild(mainStyle);
    });
}());
