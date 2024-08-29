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

export default isContentEmpty;