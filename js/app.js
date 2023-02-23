"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";

// page

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover_bar"),
  },
  content: {
    daysContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habbit__day"),
  },
};

// utils
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

// render
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(
      `[data-menu-habbit-id="${habbit.id}"]`
    );
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("data-menu-habbit-id", habbit.id);
      element.classList.add("menu__item", "btn");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = `<img class="img-fluid" src="./img/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__active");
    } else {
      existed.classList.remove("menu__active");
    }
  }
}

// renderHead
function rerenderHead(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

// render Body
function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = "";
  for (const index in activeHabbit.days) {
    const element = document.createElement("div");
    element.classList.add("row", "habbit", "justify-content-between");
    element.innerHTML = `
      <div class="col-xl-2 col-lg-2 col-12 habbit__day">Day ${Number(index) + 1}</div>
		  <div class="col-xl-8 col-lg-8 col-9 habbit_commit text-start">${activeHabbit.days[index].comment}</div>
			<div class="col-xl-2 col-lg-2 col-3 d-flex justify-content-end">
				<button class="btn habbit__delete">
					<img class="img-fluid" src="./img/delete.svg" alt="delete day ${index + 1}">
				</button>
    `;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `Day ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
   if (!activeHabbit) {
     return;
   }
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

// init
(() => {
  loadData();
})();
(() => {
  rerender(habbits[0].id);
})();
