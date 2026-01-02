let money = 0;
let mps = 0;
let clickMultiplier = 1;
let adrenalineActive = false;
let lastTime = Date.now();

// Мини-миссия
let missionActive = false;
let missionClicks = 0;
let missionClicksNeeded = 50;
let missionTimeLeft = 10;

// Улучшения (теперь с количеством и растущей ценой)
const upgrades = [
    { id: 'upgrade1', baseCost: 10,   addMps: 1,   owned: 0, multiplier: 1.15 },
    { id: 'upgrade2', baseCost: 50,   addMps: 5,   owned: 0, multiplier: 1.15 },
    { id: 'upgrade3', baseCost: 200,  addMps: 20,  owned: 0, multiplier: 1.15 },
    { id: 'upgrade4', baseCost: 1000, addMps: 100, owned: 0, multiplier: 1.15 }
];

// Элементы DOM
const moneyDisplay = document.getElementById('money');
const mpsDisplay = document.getElementById('mps');
const clickButton = document.getElementById('clickButton');
const floatingContainer = document.getElementById('floatingTextContainer');
const adrenalineBtn = document.getElementById('adrenalineBtn');
const missionPanel = document.getElementById('missionPanel');
const startMissionBtn = document.getElementById('startMissionBtn');
const missionTimer = document.getElementById('missionTimer');
const missionProgress = document.getElementById('missionProgress');
const missionClicksEl = document.getElementById('missionClicks');

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('gtaClickerSave');
    if (saved) {
        const data = JSON.parse(saved);
        money = data.money || 0;
        mps = data.mps || 0;
        upgrades.forEach((u, i) => {
            if (data.upgrades && data.upgrades[i]) {
                u.owned = data.upgrades[i].owned || 0;
            }
        });

        // Оффлайн-прогресс
        const offlineTime = (Date.now() - (data.lastTime || Date.now())) / 1000;
        const offlineEarnings = Math.floor(offlineTime * mps);
        if (offlineTime > 10 && offlineEarnings > 0) {
            money += offlineEarnings;
            createFloatingText(`Оффлайн: +${offlineEarnings.toLocaleString('ru-RU')}$`, '#00aa00');
        }
    }
    updateAll();
}

// Сохранение
function saveGame() {
    const data = {
        money,
        mps,
        upgrades: upgrades.map(u => ({ owned: u.owned })),
        lastTime: Date.now()
    };
    localStorage.setItem('gtaClickerSave', JSON.stringify(data));
}

// Анимация текста
function createFloatingText(text = `+${clickMultiplier}$`, color = '#00ff41') {
    const el = document.createElement('div');
    el.classList.add('floating-text');
    el.textContent = text;
    el.style.color = color;
    const offsetX = Math.random() * 80 - 40;
    el.style.left = `calc(50% + ${offsetX}px)`;
    el.style.top = '50%';
    floatingContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

// Клик по доллару
clickButton.addEventListener('click', () => {
    money += clickMultiplier;
    createFloatingText(`+${clickMultiplier}$`);
    updateAll();

    if (missionActive) {
        missionClicks++;
        missionClicksEl.textContent = missionClicks;
        if (missionClicks >= missionClicksNeeded) endMission(true);
    }
});

// Пассивный доход с анимацией
setInterval(() => {
    if (mps > 0) {
        money += mps;
        createFloatingText(`+${mps}$`, '#00aa00');
        updateAll();
    }
}, 1000);

// Адреналин
adrenalineBtn.addEventListener('click', () => {
    if (money >= 100 && !adrenalineActive) {
        money -= 100;
        clickMultiplier = 2;
        adrenalineActive = true;
        adrenalineBtn.disabled = true;
        adrenalineBtn.textContent = 'АДРЕНАЛИН АКТИВЕН (30с)';

        setTimeout(() => {
            clickMultiplier = 1;
            adrenalineActive = false;
            adrenalineBtn.disabled = false;
            adrenalineBtn.textContent = 'АДРЕНАЛИН (100$ — x2 на 30с)';
            updateAll();
        }, 30000);

        updateAll();
    }
});

// Мини-миссия
startMissionBtn.addEventListener('click', () => {
    missionActive = true;
    missionClicks = 0;
    missionTimeLeft = 10;
    missionClicksEl.textContent = 0;
    missionTimer.textContent = missionTimeLeft;
    missionProgress.classList.remove('hidden');
    startMissionBtn.classList.add('hidden');

    const timer = setInterval(() => {
        missionTimeLeft--;
        missionTimer.textContent = missionTimeLeft;
        if (missionTimeLeft <= 0) {
            clearInterval(timer);
            endMission(false);
        }
    }, 1000);
});

function endMission(success) {
    missionActive = false;
    if (success) {
        const reward = mps * 10;
        money += reward;
        createFloatingText(`МИССИЯ УСПЕШНА! +${reward.toLocaleString('ru-RU')}$`, '#ffff00');
    } else {
        createFloatingText('МИССИЯ ПРОВАЛЕНА', '#ff0000');
    }
    missionProgress.classList.add('hidden');
    startMissionBtn.classList.remove('hidden');
    updateAll();
}

// Покупка улучшений (с ростом цены)
upgrades.forEach(upgrade => {
    const btn = document.getElementById(upgrade.id);
    btn.addEventListener('click', () => {
        const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.owned));
        if (money >= currentCost) {
            money -= currentCost;
            upgrade.owned++;
            mps += upgrade.addMps;
            updateAll();
            saveGame();
        }
    });
});

// Обновление отображения
function updateAll() {
    moneyDisplay.textContent = Math.floor(money).toLocaleString('ru-RU');
    mpsDisplay.textContent = mps;

    // Обновляем цены улучшений
    upgrades.forEach(upgrade => {
        const btn = document.getElementById(upgrade.id);
        const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.owned));
        const costEl = btn.querySelector('.cost');
        costEl.textContent = `Цена: ${currentCost.toLocaleString('ru-RU')}$`;
        btn.disabled = money < currentCost;
    });

    // Адреналин
    adrenalineBtn.disabled = money < 100 || adrenalineActive;
}

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Инициализация
loadGame();
setInterval(saveGame, 10000); // автосейв каждые 10 сек
