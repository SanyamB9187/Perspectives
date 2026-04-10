import { renderBlogs, loadArticle } from "./blogService.js";

document.addEventListener("DOMContentLoaded", () => {

  if (document.getElementById("blog-container")) {
    renderBlogs();
  }

  if (window.location.pathname.includes("article.html")) {
    loadArticle();
  }

});

