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

// Элементы
const moneyDisplay = document.getElementById('money');
const mpsDisplay = document.getElementById('mps');
const clickButton = document.getElementById('clickButton');
const floatingContainer = document.getElementById('floatingTextContainer');
const adrenalineBtn = document.getElementById('adrenalineBtn');
const missionPanel = document.getElementById('missionPanel');
const startMissionBtn = document.getElementById('startMissionBtn');
const missionTitle = document.getElementById('missionTitle');
const missionClicksNeededEl = document.getElementById('missionClicksNeeded');
const missionTimer = document.getElementById('missionTimer');
const missionProgress = document.getElementById('missionProgress');
const missionClicksEl = document.getElementById('missionClicks');

const upgrades = [
    { id: 'upgrade1', cost: 10, addMps: 1 },
    { id: 'upgrade2', cost: 50, addMps: 5 },
    { id: 'upgrade3', cost: 200, addMps: 20 },
    { id: 'upgrade4', cost: 1000, addMps: 100 }
];

// Загрузка сохранённого прогресса
function loadGame() {
    const saved = localStorage.getItem('gtaClickerSave');
    if (saved) {
        const data = JSON.parse(saved);
        money = data.money || 0;
        mps = data.mps || 0;
        upgrades.forEach((u, i) => {
            if (data.purchased && data.purchased[i]) {
                document.getElementById(u.id).disabled = true;
            }
        });

        // Оффлайн-прогресс (пункт 1)
        const offlineTime = (Date.now() - (data.lastTime || Date.now())) / 1000;
        const offlineEarnings = offlineTime * mps;
        if (offlineTime > 10) { // больше 10 сек оффлайн
            money += offlineEarnings;
            if (offlineEarnings > 0) {
                createFloatingText(`Оффлайн: +${Math.floor(offlineEarnings).toLocaleString('ru-RU')}$`);
            }
        }
    }
    updateDisplay();
    checkUpgrades();
}

// Сохранение
function saveGame() {
    const purchased = upgrades.map(u => document.getElementById(u.id).disabled);
    const data = {
        money, mps, purchased,
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

// Клик
clickButton.addEventListener('click', () => {
    money += clickMultiplier;
    createFloatingText(`+${clickMultiplier}$`);
    updateDisplay();
    checkUpgrades();

    // Для миссии
    if (missionActive) {
        missionClicks++;
        missionClicksEl.textContent = missionClicks;
        if (missionClicks >= missionClicksNeeded) {
            endMission(true);
        }
    }
});

// Пассивный доход с анимацией (пункт 9)
setInterval(() => {
    if (mps > 0) {
        money += mps;
        createFloatingText(`+${mps}$`, '#00aa00');
        updateDisplay();
        checkUpgrades();
        saveGame();
    }
}, 1000);

// Адреналин (пункт 2)
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
            adrenalineBtn.textContent = 'АДРЕНАЛИН (x2 на 30с)';
            updateDisplay();
        }, 30000);
        
        updateDisplay();
    }
});

// Мини-миссия (пункт 7)
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
        const reward = mps * 10; // x10 от текущего дохода
        money += reward;
        createFloatingText(`МИССИЯ УСПЕШНА! +${reward.toLocaleString('ru-RU')}$`, '#ffff00');
    } else {
        createFloatingText('МИССИЯ ПРОВАЛЕНА', '#ff0000');
    }
    missionProgress.classList.add('hidden');
    startMissionBtn.classList.remove('hidden');
    updateDisplay();
}

// Покупка улучшений
upgrades.forEach(upgrade => {
    const btn = document.getElementById(upgrade.id);
    btn.addEventListener('click', () => {
        if (money >= upgrade.cost) {
            money -= upgrade.cost;
            mps += upgrade.addMps;
            btn.disabled = true;
            updateDisplay();
            saveGame();
        }
    });
});

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

function updateDisplay() {
    moneyDisplay.textContent = Math.floor(money).toLocaleString('ru-RU');
    mpsDisplay.textContent = mps;
}

function checkUpgrades() {
    upgrades.forEach(upgrade => {
        const btn = document.getElementById(upgrade.id);
        btn.disabled = money < upgrade.cost || btn.disabled;
    });
    adrenalineBtn.disabled = money < 100 || adrenalineActive;
}

// Инициализация
loadGame();
setInterval(saveGame, 10000); // автосейв каждые 10 сек
