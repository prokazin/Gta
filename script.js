let money = 0;
let mps = 0;

const moneyDisplay = document.getElementById('money');
const mpsDisplay = document.getElementById('mps');
const clickButton = document.getElementById('clickButton');
const floatingContainer = document.getElementById('floatingTextContainer');

const upgrades = [
    { id: 'upgrade1', cost: 10, addMps: 1 },
    { id: 'upgrade2', cost: 50, addMps: 5 },
    { id: 'upgrade3', cost: 200, addMps: 20 },
    { id: 'upgrade4', cost: 1000, addMps: 100 }
];

function createFloatingText() {
    const text = document.createElement('div');
    text.classList.add('floating-text');
    text.textContent = '+1$';

    const offsetX = Math.random() * 80 - 40;
    text.style.left = `calc(50% + ${offsetX}px)`;
    text.style.top = '50%';

    floatingContainer.appendChild(text);

    setTimeout(() => {
        text.remove();
    }, 1200);
}

clickButton.addEventListener('click', () => {
    money++;
    createFloatingText();
    updateDisplay();
    checkUpgrades();
});

setInterval(() => {
    money += mps;
    updateDisplay();
    checkUpgrades();
}, 1000);

upgrades.forEach(upgrade => {
    const button = document.getElementById(upgrade.id);
    button.addEventListener('click', () => {
        if (money >= upgrade.cost) {
            money -= upgrade.cost;
            mps += upgrade.addMps;
            updateDisplay();
            button.disabled = true;
        }
    });
});

function updateDisplay() {
    moneyDisplay.textContent = Math.floor(money).toLocaleString('ru-RU');
    mpsDisplay.textContent = mps;
}

function checkUpgrades() {
    upgrades.forEach(upgrade => {
        const button = document.getElementById(upgrade.id);
        button.disabled = money < upgrade.cost;
    });
}

updateDisplay();
checkUpgrades();
