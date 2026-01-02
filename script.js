let money = 0;
let mps = 0;
let clickMultiplier = 1;
let adrenalineActive = false;
let adrenalineTimeLeft = 0;
let adrenalineInterval = null;

let missionActive = false;
let missionClicks = 0;
let missionClicksNeeded = 50;
let missionTimeLeft = 10;

const upgrades = [
    { id: 'upgrade1', baseCost: 10,   addMps: 1,   owned: 0, multiplier: 1.15 },
    { id: 'upgrade2', baseCost: 50,   addMps: 5,   owned: 0, multiplier: 1.15 },
    { id: 'upgrade3', baseCost: 200,  addMps: 20,  owned: 0, multiplier: 1.15 },
    { id: 'upgrade4', baseCost: 1000, addMps: 100, owned: 0, multiplier: 1.15 }
];

const moneyDisplays = [document.getElementById('money'), document.getElementById('money-upgrades')];
const mpsDisplays = [document.getElementById('mps'), document.getElementById('mps-upgrades')];

const clickButton = document.getElementById('clickButton');
const floatingContainer = document.getElementById('floatingTextContainer');
const adrenalineBtn = document.getElementById('adrenalineBtn');
const adrenalineTimer = document.getElementById('adrenalineTimer');
const adrenalineFill = document.getElementById('adrenalineFill');
const adrenalineSeconds = document.getElementById('adrenalineSeconds');

const missionPanel = document.getElementById('missionPanel');
const startMissionBtn = document.getElementById('startMissionBtn');
const missionTimer = document.getElementById('missionTimer');
const missionProgress = document.getElementById('missionProgress');
const missionClicksEl = document.getElementById('missionClicks');

function loadGame() {
    const saved = localStorage.getItem('gtaClickerSave');
    if (saved) {
        const data = JSON.parse(saved);
        money = data.money || 0;
        mps = data.mps || 0;
        upgrades.forEach((u, i) => u.owned = data.upgrades?.[i]?.owned || 0);

        const offlineTime = (Date.now() - (data.lastTime || Date.now())) / 1000;
        const earnings = Math.floor(offlineTime * mps);
        if (earnings > 0) {
            money += earnings;
            createFloatingText(`Оффлайн: +${earnings.toLocaleString('ru-RU')}$`, '#00ff00');
        }
    }
    updateAll();
}

function saveGame() {
    localStorage.setItem('gtaClickerSave', JSON.stringify({
        money, mps,
        upgrades: upgrades.map(u => ({owned: u.owned})),
        lastTime: Date.now()
    }));
}

function createFloatingText(text = `+${clickMultiplier}$`, color = '#00ff41') {
    const el = document.createElement('div');
    el.classList.add('floating-text');
    el.textContent = text;
    el.style.color = color;
    const offsetX = Math.random() * 100 - 50;
    el.style.left = `calc(50% + ${offsetX}px)`;
    floatingContainer.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}

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

setInterval(() => {
    if (mps > 0) {
        money += mps;
        createFloatingText(`+${mps}$`, '#00cc00');
        updateAll();
    }
}, 1000);

adrenalineBtn.addEventListener('click', () => {
    if (money >= 100 && !adrenalineActive) {
        money -= 100;
        clickMultiplier = 2;
        adrenalineActive = true;
        adrenalineTimeLeft = 30;

        adrenalineTimer.classList.remove('hidden');
        adrenalineSeconds.textContent = adrenalineTimeLeft;
        adrenalineFill.style.width = '100%';

        adrenalineInterval = setInterval(() => {
            adrenalineTimeLeft--;
            adrenalineSeconds.textContent = adrenalineTimeLeft;
            adrenalineFill.style.width = (adrenalineTimeLeft / 30 * 100) + '%';

            if (adrenalineTimeLeft <= 0) {
                clearInterval(adrenalineInterval);
                clickMultiplier = 1;
                adrenalineActive = false;
                adrenalineTimer.classList.add('hidden');
                updateAll();
            }
        }, 1000);

        updateAll();
    }
});

startMissionBtn.addEventListener('click', () => {
    missionActive = true;
    missionClicks = 0;
    missionTimeLeft = 10;
    missionClicksEl.textContent = 0;
    missionTimer.textContent = 10;
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
        createFloatingText(`УСПЕХ! +${reward.toLocaleString('ru-RU')}$`, '#ffff00');
    } else {
        createFloatingText('ПРОВАЛ', '#ff0000');
    }
    missionProgress.classList.add('hidden');
    startMissionBtn.classList.remove('hidden');
    updateAll();
}

upgrades.forEach(u => {
    document.getElementById(u.id).addEventListener('click', () => {
        const cost = Math.floor(u.baseCost * Math.pow(u.multiplier, u.owned));
        if (money >= cost) {
            money -= cost;
            u.owned++;
            mps += u.addMps;
            updateAll();
            saveGame();
        }
    });
});

function updateAll() {
    const formattedMoney = Math.floor(money).toLocaleString('ru-RU');
    moneyDisplays.forEach(d => d.textContent = formattedMoney);
    mpsDisplays.forEach(d => d.textContent = mps);

    upgrades.forEach(u => {
        const btn = document.getElementById(u.id);
        const cost = Math.floor(u.baseCost * Math.pow(u.multiplier, u.owned));
        btn.querySelector('.cost').textContent = `Цена: ${cost.toLocaleString('ru-RU')}$`;
        btn.disabled = money < cost;
    });

    adrenalineBtn.disabled = money < 100 || adrenalineActive;
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + '-screen').classList.add('active');

        updateAll();
    });
});

loadGame();
setInterval(saveGame, 10000);
