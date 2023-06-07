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

  // const modalDiv = document.createElement("div");
  // modalDiv.id = "modal";
  // modalDiv.className = "contact-modal mx-auto px-2 py-2";
  // const modalMessageDiv = document.createElement("div");
  // modalMessageDiv.className = "message";
  // const modalMessageHeading = document.createElement("h5");
  // modalMessageHeading.innerHTML = "Thank you for your message!";
  // const modalMessageContent = document.createElement("p");
  // modalMessageContent.innerHTML =
  //   "This form is currently static and is not accepting responses. If you wish to contact me, kindly reach me via email at sushmajram@gmail.com.";

  // const closeBtn = document.createElement("button");
  // closeBtn.id = "close-modal";
  // closeBtn.type = "button";
  // closeBtn.innerHTML =
  //   '<i class="fa-solid fa-xmark" style="color: #f1f1f1;"></i>';

  // modalMessageDiv.appendChild(modalMessageHeading);
  // modalMessageDiv.appendChild(modalMessageContent);

  // modalDiv.appendChild(modalMessageDiv);
  // modalDiv.appendChild(closeBtn);

  // content.appendChild(modalDiv);
}

function closeModal() {
  content.classList.remove("modal-open");
  openBtn.removeAttribute("disabled");
  modalDiv.style.display = "none";
}
