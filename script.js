import { elements } from "./elements.js";

const table = document.querySelector(".periodic-table");
const search = document.querySelector("#search");
const modal = document.querySelector("#modal");
const closeBtn = document.querySelector(".close");
const title = document.querySelector("#title");
const number = document.querySelector("#number");
const symbol = document.querySelector("#symbol");
const mass = document.querySelector("#mass");
const category = document.querySelector("#category");
const group = document.querySelector("#group");
const period = document.querySelector("#period");
let currentIndex = 0;
let cards = [];
const neighbors = {};

function createGroupLabels() {
    const container = document.querySelector(".group-labels");
    for (let i = 1; i <= 18; i++) {
        const label = document.createElement("div");
        label.textContent = i;
        label.className = "group-label";
        label.style.gridColumn = i;
        container.append(label);
    }
}

function createPeriodLabels() {
    const container = document.querySelector(".period-labels");
    for (let i = 1; i <= 7; i++) {
        const label = document.createElement("div");
        label.textContent = i;
        label.className = "period-label";
        container.append(label);
    }
}

createGroupLabels();
createPeriodLabels();

function renderElements(data) {
    table.innerHTML = "";
    data.forEach((element) => {
        const card = createCard(element);
        table.append(card);
        neighbors[element.atomicNumber] = {
            card,
            element
        };
    });
    addPlaceholders();
    buildNeighbors();
    updateSelection();
}

function buildNeighbors() {
    elements.forEach((el) => {
        const current = neighbors[el.atomicNumber];
        /* LEFT */
        current.left =
            neighbors[el.atomicNumber - 1] || null;

        /* RIGHT */
        current.right =
            neighbors[el.atomicNumber + 1] || null;

        /* UP */
        let up = null;
        let bestDistance = Infinity;
        elements.forEach((candidate) => {
            if (candidate.period < el.period) {
                const distance = Math.abs(candidate.group - el.group);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    up = neighbors[candidate.atomicNumber];
                }
            }
        });
        current.up = up;

        /* DOWN */
        let down = null;
        bestDistance = Infinity;

        elements.forEach((candidate) => {
            if (candidate.period > el.period) {
                const distance = Math.abs(candidate.group - el.group);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    down = neighbors[candidate.atomicNumber];
                }
            }
        });
        current.down = down;
    });
}

function createCard(element) {
    const card = document.createElement("div");
    card.className = `element ${element.category.toLowerCase().replace(/\s+/g, "-")}`;

    /* Position */
    card.style.gridColumn = element.group;
    card.style.gridRow = element.period;
    if (element.category === "Lanthanide") {
        card.style.gridRow = 9;
        card.style.gridColumn = element.atomicNumber - 53;
    }
    if (element.category === "Actinide") {
        card.style.gridRow = 10;
        card.style.gridColumn = element.atomicNumber - 85;
    }

    /* Dataset */
    Object.assign(card.dataset, {
        atomicNumber: element.atomicNumber,
        name: element.name,
        symbol: element.symbol,
        mass: element.atomicMass,
        category: element.category,
        group: element.group,
        period: element.period,
    });

    card.innerHTML = `
        <div class="number">${element.atomicNumber}</div>
        <div class="symbol">${element.symbol}</div>
    `;

    return card;
}

function addPlaceholders() {
    const lanthanide = document.createElement("div");
    lanthanide.className = "placeholder";
    lanthanide.style.gridColumn = 3;
    lanthanide.style.gridRow = 6;
    lanthanide.innerHTML = `
        <div>57-71</div>
        <small>Lanthanides</small>
        `;
    table.append(lanthanide);

    const actinide = document.createElement("div");
    actinide.className = "placeholder";
    actinide.style.gridColumn = 3;
    actinide.style.gridRow = 7;
    actinide.innerHTML = `
        <div>89-103</div>
        <small>Actinides</small>
    `;
    table.append(actinide);
}

/* Modal */
table.addEventListener("click", (e) => {
    const card = e.target.closest(".element");
    if (!card) return;
    title.textContent = card.dataset.name;
    number.textContent = card.dataset.atomicNumber;
    symbol.textContent = card.dataset.symbol;
    mass.textContent = card.dataset.mass;
    category.textContent = card.dataset.category;
    group.textContent = card.dataset.group;
    period.textContent = card.dataset.period;
    modal.style.display = "flex";

    const popup = document.querySelector(".modal-content");
    popup.style.left = "30%";
    popup.style.top = "20%";
    // popup.style.transform = "translate(-50%, -50%)";
});

closeBtn.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};

/* Search */
search.addEventListener("input", () => {
    const value = search.value.trim().toLowerCase();

    document.querySelectorAll(".element").forEach((card) => {
        const match =
            card.dataset.name.toLowerCase().includes(value) ||
            card.dataset.symbol.toLowerCase().includes(value) ||
            card.dataset.atomicNumber.includes(value);
        if (value === "") {
            card.classList.remove("highlight");
            card.classList.remove("fade");
            return;
        }

        if (match) {
            card.classList.add("highlight");
            card.classList.remove("fade");
        } else {
            card.classList.remove("highlight");
            card.classList.add("fade");
        }
    });
});

const themeBtn = document.querySelector("#themeToggle");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    if (document.body.classList.contains("light")) {
        themeBtn.textContent = "☀️ Light Mode";
    } else {
        themeBtn.textContent = "🌙 Dark Mode";
    }
});



function updateSelection() {
    cards = [...document.querySelectorAll(".element")];
    if (!cards.length) return;
    cards.forEach(card => card.classList.remove("selected"));
    cards[currentIndex].classList.add("selected");
    cards[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
    });
}

// function findCard(group, period) {
//     return cards.findIndex(card =>
//         Number(card.dataset.group) === group &&
//         Number(card.dataset.period) === period
//     );
// }
function moveSelection(rowStep, colStep) {
    cards = [...document.querySelectorAll(".element")];
    const current = cards[currentIndex];
    if (!current) return;

    let row = Number(current.style.gridRow);
    let col = Number(current.style.gridColumn);

    while (true) {
        row += rowStep;
        col += colStep;

        if (row < 1 || row > 10 || col < 1 || col > 18) {
            return;
        }
        const next = cards.find(card =>
            Number(card.style.gridRow) === row &&
            Number(card.style.gridColumn) === col
        );
        if (next) {
            currentIndex = cards.indexOf(next);
            updateSelection();
            return;
        }
    }
}

document.addEventListener("keydown", (e) => {
    cards = [...document.querySelectorAll(".element")];
    switch (e.key) {

        case "ArrowRight":
            moveSelection(0, 1);
            return;

        case "ArrowLeft":
            moveSelection(0, -1);
            return;

        case "ArrowDown":
            moveSelection(1, 0);
            return;

        case "ArrowUp":
            moveSelection(-1, 0);
            return;

        case "Enter":
            if (cards[currentIndex]) {
                cards[currentIndex].click();
            }
            return;

        case "Escape":
            modal.style.display = "none";
            return;

        default:
            return;
    }
    updateSelection();
});

renderElements(elements);