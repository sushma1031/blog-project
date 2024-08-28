import isContentEmpty from "./contentValidation.js";
const composeForm = document.querySelector(".compose-form");

composeForm.addEventListener(
  "submit",
  (event) => {
    if (isContentEmpty() || !composeForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    composeForm.classList.add("was-validated");
  },
  false
);