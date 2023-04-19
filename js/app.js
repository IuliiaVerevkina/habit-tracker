"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

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
	modal: {
		modalField: document.querySelector(".modal__form input[name = 'icon']"),
		modalWindow: document.querySelector(".modal-close")
	},
};
const myModal = new bootstrap.Modal("#staticBackdrop", {
	keyboard: false,
});

const myModal_1 = new bootstrap.Modal("#staticModalWindow", {
	keyboard: false,
});

// utils
function loadData() {
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	if(habbitsString === null) {
		myModal_1.show();
		page.modal.modalWindow.addEventListener("click", function() {
			myModal_1.hide();
			myModal.show();
		})
	}
	const habbitArray = JSON.parse(habbitsString);
	if (Array.isArray(habbitArray)) {
		habbits = habbitArray;
	}
}

function saveData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = "";
	}
}

function validateAndGetFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};
	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove("error");
		if (!fieldValue) {
			form[field].classList.add("error");
		}
		res[field] = fieldValue;
	}
	let isValid = true;
	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		}
	}
	if (!isValid) {
		return;
	}
	return res;
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
      <div class="col-xl-2 col-lg-2 col-12 habbit__day">Day ${Number(index) + 1
			}</div>
		  <div class="col-xl-8 col-lg-8 col-12 habbit_commit text-start">${activeHabbit.days[index].comment
			}</div>
			<div class="col-xl-2 col-lg-2 col-12 d-flex justify-content-end">
				<button class="btn habbit__delete" onclick="removeDay(${Number(index)})">
					<img class="img-fluid" src="./img/delete.svg" alt="delete day ${Number(index) + 1
			}">
				</button>
    `;
		page.content.daysContainer.appendChild(element);
	}
	page.content.nextDay.innerHTML = `Day ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;
	const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
	if (!activeHabbit) {
		return;
	}
	document.location.replace(document.location.pathname + "#" + activeHabbitId);
	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderContent(activeHabbit);
}

// work with days
function addDays(event) {
	event.preventDefault();
	const data = validateAndGetFormData(event.target, ["comment"]);
	if (!data) {
		return;
	}
	habbits = habbits.map((habbit) => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: data.comment }]),
			};
		}
		return habbit;
	});
	resetForm(event.target, ["comment"]);
	rerender(globalActiveHabbitId);
	saveData();
}

// remove Day
function removeDay(index) {
	habbits = habbits.map((habbit) => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days,
			};
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	saveData();
}

// working with habbits
function setIcon(context, icon) {
	page.modal.modalField.value = icon;
	const activeIcon = document.querySelector(".icon.icon__active");
	activeIcon.classList.remove("icon__active");
	context.classList.add("icon__active");
}

function addHabbit(event) {
	event.preventDefault();
	const data = validateAndGetFormData(event.target, ["name", "icon", "target"]);
	if (!data) {
		return;
	}
	const maxId = habbits.reduce(
		(acc, habbit) => (acc > habbit.id ? acc : habbit.id),
		0
	);
	habbits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: [],
	});

	resetForm(event.target, ["name", "target"]);
	saveData();
	rerender(maxId + 1);
	myModal.hide();
}

// init
(() => {
	loadData();
	if (habbits.length === 0) {
		return;
	}
	const hashId = Number(document.location.hash.replace("#", ""));
	const urlHabbit = habbits.find((habbit) => habbit.id === hashId);
	if (urlHabbit) {
		rerender(urlHabbit.id);
	} else {
		rerender(habbits[0].id);
	}
})();
