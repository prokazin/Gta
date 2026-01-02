let money = 0;
let mps = 0; // Money per second

const moneyDisplay = document.getElementById('money');
const mpsDisplay = document.getElementById('mps');
const clickButton = document.getElementById('clickButton');
const resetButton = document.getElementById('resetButton');
const upgrades = [
    { id: 'upgrade1', cost: 10, addMps: 1 },
    { id: 'upgrade2', cost: 50, addMps: 5 },
    { id: 'upgrade3', cost: 200, addMps: 20 },
    { id: 'upgrade4', cost: 1000, addMps: 100 }
];

// Клик для заработка
clickButton.addEventListener('click', () => {
    money++;
    updateDisplay();
    checkUpgrades();
});

// Автозаработок каждую секунду
setInterval(() => {
    money += mps;
    updateDisplay();
    checkUpgrades();
}, 1000);

// Покупка улучшений
upgrades.forEach(upgrade => {
    const button = document.getElementById(upgrade.id);
    button.addEventListener('click', () => {
        if (money >= upgrade.cost) {
            money -= upgrade.cost;
            mps += upgrade.addMps;
            updateDisplay();
            button.disabled = true; // Одноразовая покупка
        }
    });
});

// Сброс
resetButton.addEventListener('click', () => {
    money = 0;
    mps = 0;
    upgrades.forEach(upgrade => {
        document.getElementById(upgrade.id).disabled = true;
    });
    updateDisplay();
});

// Обновление отображения
function updateDisplay() {
    moneyDisplay.textContent = Math.floor(money);
    mpsDisplay.textContent = mps;
}

// Проверка доступности улучшений
function checkUpgrades() {
    upgrades.forEach(upgrade => {
        const button = document.getElementById(upgrade.id);
        button.disabled = money < upgrade.cost;
    });
}

// Инициализация
updateDisplay();
checkUpgrades();
