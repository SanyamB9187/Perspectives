let selectedImage = null;

export function initEditor() {

  const imageInput = document.getElementById("blog-image");

  if (imageInput) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        selectedImage = file;
      }
    });
  }
}

export function openEditor() {
  const modal = document.getElementById("editor-modal");
  if (modal) modal.classList.remove("hidden");
}

export function closeEditor() {
  const modal = document.getElementById("editor-modal");
  if (modal) modal.classList.add("hidden");

  const title = document.getElementById("blog-title");
  const content = document.getElementById("blog-content");
  const image = document.getElementById("blog-image");
  const preview = document.getElementById("image-preview");

  if (title) title.value = "";
  if (content) content.value = "";
  if (image) image.value = "";
  if (preview) preview.style.display = "none";

  selectedImage = null;
}

export function getSelectedImage() {
  return selectedImage;
}