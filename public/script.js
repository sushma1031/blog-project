let openBtn = document.getElementById("open-modal");
let closeBtn = document.getElementById("close-modal");
let content = document.querySelector(".content-wrap");
let modalDiv = content.querySelector("#modal");

openBtn.addEventListener("click", displayModal);

closeBtn.addEventListener("click", closeModal);

function displayModal() {
  content.classList.add("modal-open");
  openBtn.setAttribute("disabled", true);
  modalDiv.style.display = "flex";
  window.scrollTo(0, 0);
}

function closeModal() {
  content.classList.remove("modal-open");
  openBtn.removeAttribute("disabled");
  modalDiv.style.display = "none";
}
