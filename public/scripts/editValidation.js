import isContentEmpty from "./contentValidation.js";
const editForm = document.querySelector(".edit-form");
const imageInput = document.querySelector(".edit-form #image");
const imageSrc = document.querySelector(".edit-form #imageSource");
let prevSrc = imageSrc.value;

editForm.addEventListener(
  "submit",
  (event) => {
    console.log(editForm.checkValidity());
    if (imageInput.files.length === 0) {
      imageSrc.value = prevSrc;
    }
    if (isContentEmpty() || !editForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    editForm.classList.add("was-validated");
  },
  false
);

imageInput.addEventListener("change", (event) => {
  imageSrc.value = "";
  let imgFile = event.target.files[0];
  let thumbnail = document.querySelector(".thumbnail-img");
  thumbnail.file = imgFile;

  const reader = new FileReader();
  reader.onload = (e) => {
    thumbnail.src = e.target.result;
  };
  reader.readAsDataURL(imgFile);
});

