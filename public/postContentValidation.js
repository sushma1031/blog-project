const form = document.querySelector(".needs-validation");
form.addEventListener(
  "submit",
  (event) => {
    if (isContentEmpty() || !form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add("was-validated");
  },
  false
);

function isContentEmpty() {
  let editor = tinymce.get("content");
  let invalidFbDiv = document.querySelector("#invalidFb");
  let editorArea = document.querySelector(".tox-tinymce");
  if (editor.getContent() === "") {
    editorArea.style.borderColor = "#dc3545";
    invalidFbDiv.textContent = "Post content cannot be empty.";
    return true;
  }
  editor.save();
  invalidFbDiv.textContent = "";
  editorArea.style.borderColor = "#eee";
  return false;
}
