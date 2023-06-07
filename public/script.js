let openBtn = document.getElementById("open-modal");
let closeBtn = document.getElementById("close-modal");
let form = document.querySelector(".contact-form");
let content = document.querySelector(".content-wrap");
let modalDiv = document.querySelector("#modal");
let inputs = form.querySelectorAll("input");
let textarea = form.querySelector("textarea");

openBtn.addEventListener("click", displayModal);

closeBtn.addEventListener("click", closeModal);

function displayModal() {
  content.classList.add("modal-open");
  openBtn.setAttribute("disabled", true);
  inputs.forEach(input => {
    input.setAttribute("disabled", true);
  })
  textarea.setAttribute("disabled", true);
  modalDiv.style.display = "flex";
  window.scrollTo(0, 0);
}

function closeModal() {
  content.classList.remove("modal-open");
  openBtn.removeAttribute("disabled");
  inputs.forEach((input) => {
    input.removeAttribute("disabled");
  });
  textarea.removeAttribute("disabled");
  modalDiv.style.display = "none";
}
