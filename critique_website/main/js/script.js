import { db, storage } from "./firebase.js";
import { renderBlogs, saveBlog, loadArticle } from "./blogService.js";
import { initFullscreen } from "./ui/fullscreen.js";
import { renderHomepageArticles } from "./pages/home.js";
import { renderBookBits, saveBookBit } from "./pages/bookbits.js";
import { initSlider } from "./ui/slider.js";
import { initEditor, openEditor, closeEditor, getSelectedImage } from "./ui/editor.js";
import {
  doc,
  getDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ==============================
// DOM READY
// ==============================
console.log("JS Loaded");

window.addEventListener("DOMContentLoaded", function () {

  // ==============================
  // INTERSECTION OBSERVER
  // ==============================
  const fadeElements = document.querySelectorAll(".fade-up");


  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.2 });

    fadeElements.forEach(el => observer.observe(el));
  }

  if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
    renderHomepageArticles();
  }


  // ==============================
  // ARTICLE DELETE FUNCTIONALITY
  // ==============================

  // const params = new URLSearchParams(window.location.search);
  // const id = params.get("id");

  // const deleteBtn = document.getElementById("delete-article-btn");

  // if (deleteBtn && id) {

  //   const isAdmin = true;

  //   if (isAdmin) {
  //     deleteBtn.style.display = "block";
  //   }

  //   if (window.location.pathname.includes("article.html")) {
  //     deleteBtn.addEventListener("click", async function () {
  //       if (!confirm("Delete this article?")) return;

  //       try {
  //         const docRef = doc(db, "articles", id);
  //         const docSnap = await getDoc(docRef);

  //         if (docSnap.exists()) {
  //           const blog = docSnap.data();

  //           // Delete image from storage (if exists)
  //           if (blog.image) {
  //             try {
  //               const imageRef = ref(storage, blog.image); // keep this for now
  //               await deleteObject(imageRef);
  //             } catch (err) {
  //               console.log("Image delete skipped (URL issue):", err);
  //             }
  //           }

  //           // Delete Firestore document
  //           await deleteDoc(docRef);

  //           alert("Article deleted successfully");

  //           // Redirect
  //           window.location.href = "index.html";
  //         }

  //       } catch (error) {
  //         console.error("Error deleting article:", error);
  //         alert("Error deleting article");
  //       }
  //     });
  //   }
  // }

  // ==============================
  // BLOG VIEW (OPTIONAL MODAL)
  // ==============================


  window.openBlog = function (blog) {
    const view = document.getElementById("blog-view");

    if (!view) return;

    document.getElementById("view-title").innerText = blog.title;
    document.getElementById("view-content").innerText = blog.content;
    document.getElementById("view-image").src = blog.image || "";

    view.classList.remove("hidden");
  };

  document.getElementById("blog-view")?.addEventListener("click", () => {
    document.getElementById("blog-view").classList.add("hidden");
  });

  // ==============================
  // INITIAL LOAD
  // ==============================
  if (document.getElementById("blog-container")) {
    renderBlogs();
  }

  if (window.location.pathname.includes("/critique_website/main/article.html")) {
    loadArticle();
  }

  if (document.body.classList.contains("book-bits-page")) {
    renderBookBits();
  }
  initFullscreen();
  initSlider();
  initEditor();
});

const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");
const publishBtn = document.getElementById("publish-btn");
const publishBitBtn = document.getElementById("publish-bit-btn");

if (addBtn) addBtn.addEventListener("click", openEditor);
if (cancelBtn) cancelBtn.addEventListener("click", closeEditor);
if (publishBtn) {
  publishBtn.addEventListener("click", () => {
    saveBlog(getSelectedImage());
  });
}
if (publishBitBtn) publishBitBtn.addEventListener("click", saveBookBit);



// // ===== ADD BUTTON HINT =====
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("DOM Ready");
//   const hint = document.getElementById("addHint");
//   console.log("Hint element:", hint);

//   if (!localStorage.getItem("hintShown")) {
//     setTimeout(() => {
//       hint.classList.add("show");
//     }, 1200);

//     setTimeout(() => {
//       hint.classList.remove("show");
//     }, 5000);

//     localStorage.setItem("hintShown", "true");
//   }
// });

