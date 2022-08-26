import { get, set } from "./storage";

const preferredInput = document.getElementById("preferred-sellers-input");
const undesiredInput = document.getElementById("undesired-sellers-input");

document.getElementById("save-button").addEventListener("click", () => {
  set({ preferred: preferredInput.value });
  set({ undesired: undesiredInput.value });
  window.close();
});

window.onload = function () {
  get("preferred", (result) => {
    const preferred = result.preferred;
    if (preferred) {
      preferredInput.value = preferred;
    }
  });

  get("undesired", (result) => {
    const undesired = result.undesired;
    if (undesired) {
      undesiredInput.value = undesired;
    }
  });
};
