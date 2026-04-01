import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAO6piukVhyv9Ylheqrp3Wr1KnR9Ew3MDY",
  authDomain: "perspectives-site.firebaseapp.com",
  projectId: "perspectives-site",
  storageBucket: "perspectives-site.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let selectedImage = null;

window.openEditor = function () {
  const modal = document.getElementById("editor-modal");
  if (modal) modal.classList.remove("hidden");
};

window.closeEditor = function () {
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

  selectedImage = "";
};


// ==============================
// GLOBAL FUNCTIONS (IMPORTANT)
// ==============================

// RENDER BLOGS (GLOBAL)
async function renderBlogs() {
  const container = document.getElementById("blog-container");
  if (!container) return;

  container.innerHTML = "Loading...";
  const category = document.body.dataset.category;

  try {
    const q = query(
      collection(db, "articles"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    container.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const blog = doc.data();
      const id = doc.id; // 🔥 IMPORTANT

      const div = document.createElement("a");
      div.className = "card";
      div.href = `article.html?id=${id}`;

      div.innerHTML = `
  <img src="${blog.image || 'https://via.placeholder.com/800x400'}">
  <div class="card-content">
    <p class="tag">${blog.category.toUpperCase()}</p>
    <h3>${blog.title}</h3>
    <p>${blog.content.substring(0, 80)}...</p>
    <span>${blog.createdAt?.toDate().toLocaleDateString()}</span>
  </div>
`;

      container.appendChild(div);
    });

  } catch (error) {
    console.error("Error fetching articles:", error);
    container.innerHTML = "Error loading articles";
  }
}

//  Render Book Bits

async function renderBookBits() {
  const container = document.querySelector(".quotes-container");
  if (!container) return;

  container.innerHTML = "";

  try {
    const q = query(
      collection(db, "bookbits"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      const bit = doc.data();

      const div = document.createElement("div");
      div.className = "quote-card";

      div.innerHTML = `
        <img src="${bit.image}">
        <p class="quote-caption">${bit.caption}</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading bookbits:", err);
  }
}

// ==============================
// SAVE BLOG
// ==============================
async function saveBlog() {
  const title = document.getElementById("blog-title").value;
  const content = document.getElementById("blog-content").value;

  if (!title || !content || !selectedImage) {
    alert("Please fill all fields and add image");
    return;
  }

  try {
    // 🔥 Upload image
    const imageRef = ref(storage, "articles/" + Date.now() + "_" + selectedImage.name);
    await uploadBytes(imageRef, selectedImage);

    // 🔥 Get URL
    const imageURL = await getDownloadURL(imageRef);

    const category = document.body.dataset.category;

    await addDoc(collection(db, "articles"), {
      title: title,
      content: content,
      image: imageURL,
      category: category,
      createdAt: serverTimestamp()
    });

    alert("Article published successfully");

    closeEditor();

  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error publishing article");
  }
}

//  Save Book bits

async function saveBookBit() {
  const caption = document.getElementById("bit-caption").value;
  const imageFile = document.getElementById("bit-image").files[0];

  if (!caption || !imageFile) {
    alert("Please add image and caption");
    return;
  }

  try {
    // 🔥 Upload image to Firebase Storage
    const imageRef = ref(storage, "bookbits/" + Date.now() + "_" + imageFile.name);
    await uploadBytes(imageRef, imageFile);

    const imageURL = await getDownloadURL(imageRef);

    // 🔥 Save to Firestore (DIFFERENT COLLECTION)
    await addDoc(collection(db, "bookbits"), {
      image: imageURL,
      caption: caption,
      createdAt: serverTimestamp()
    });

    alert("Book Bit added successfully");

    // OPTIONAL: clear inputs
    document.getElementById("bit-caption").value = "";
    document.getElementById("bit-image").value = "";

    // 🔥 re-render instantly
    renderBookBits();

  } catch (err) {
    console.error(err);
    alert("Error adding book bit");
  }
}


// ==============================
// LOAD SINGLE ARTICLE (ARTICLE PAGE)
// ==============================
async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const blog = docSnap.data();

      console.log("Data:", blog);

      const titleEl = document.getElementById("article-title");
      const contentEl = document.getElementById("article-content");
      const imageEl = document.getElementById("article-image");
      const dateEl = document.getElementById("article-date");
      const catEl = document.getElementById("article-category");

      if (titleEl) titleEl.innerText = blog.title;
      if (contentEl) contentEl.innerHTML = blog.content.replace(/\n/g, "<br>");
      if (imageEl) imageEl.src = blog.image || "https://via.placeholder.com/800x400?text=No+Image";

      if (dateEl && blog.createdAt) {
        dateEl.innerText = blog.createdAt.toDate().toLocaleDateString();
      }

      if (catEl) catEl.innerText = blog.category.toUpperCase();

    } else {
      console.log("No such article");
    }

  } catch (error) {
    console.error("Error loading article:", error);
  }
}

// ==============================
// DOM READY
// ==============================
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

  async function renderHomepageArticles() {
    const topContainer = document.querySelector(".feature-top");
    const gridContainer = document.querySelector(".feature-grid");

    if (!topContainer || !gridContainer) return;

    try {
      const q = query(
        collection(db, "articles"),
        orderBy("createdAt", "desc"),
        limit(3)
      );

      const snapshot = await getDocs(q);

      const articles = [];
      snapshot.forEach(doc => {
        articles.push({ id: doc.id, ...doc.data() });
      });

      if (articles.length === 0) return;

      // ======================
      // 🔥 TOP FEATURE (FIRST ARTICLE)
      // ======================
      const top = articles[0];

      topContainer.style.backgroundImage = `url(${top.image})`;
      topContainer.style.backgroundSize = "cover";
      topContainer.style.backgroundPosition = "center";
      console.log("Top article image:", top.image);
      topContainer.innerHTML = `
        <div class="feature-overlay"></div>

        <div class="feature-content">
          <span class="tag">${top.category.toUpperCase()}</span>

          <h2>${top.title}</h2>

          <p>${top.content.substring(0, 140)}...</p>

          <div class="meta">
            <span class="date">
              ${top.createdAt?.toDate().toLocaleDateString()}
            </span>
          </div>
        </div>
      `;

      topContainer.onclick = () => {
        window.location.href = `article.html?id=${top.id}`;
      };

      // ======================
      // 🔥 GRID (NEXT 2 ARTICLES)
      // ======================
      gridContainer.innerHTML = "";

      const gridArticles = articles.slice(1, 4); // 👈 3 articles

      if (gridArticles.length === 0) {
        gridContainer.innerHTML = "<p style='color:white'>No articles</p>";
        return;
      }

      gridArticles.forEach((article, i) => {
        const div = document.createElement("div");

        div.className = "card";

        // IMAGE
        if (article.image) {
          div.style.backgroundImage = `url(${article.image})`;
        }

        div.innerHTML = `
    <div class="card-overlay"></div>

    <span class="tag">${article.category.toUpperCase()}</span>

    <h3>${article.title}</h3>

    <p>${article.content.substring(0, 100)}...</p>

    <div class="meta">
      <span>${article.createdAt?.toDate().toLocaleDateString()}</span>
    </div>
  `;

        div.style.opacity = "1";

        div.onclick = () => {
          window.location.href = `article.html?id=${article.id}`;
        };

        gridContainer.appendChild(div);
      });

    } catch (error) {
      console.error("Homepage render error:", error);
    }
  }

  // ==============================
  // FULLSCREEN IMAGE VIEW
  // ==============================
  const fullscreen = document.getElementById("fullscreen-view");
  const fullscreenImg = document.getElementById("fullscreen-img");
  const images = document.querySelectorAll(".quotes-container img");

  if (fullscreen && fullscreenImg) {

    images.forEach(img => {
      img.addEventListener("click", () => {
        console.log("IMAGE CLICKED");
        fullscreenImg.src = img.src;

        fullscreen.classList.remove("hidden");

        setTimeout(() => {
          fullscreen.classList.add("active");
        }, 10);
      });

    });

    window.closeFullscreen = function () {
      fullscreen.classList.remove("active");

      setTimeout(() => {
        fullscreen.classList.add("hidden");
      }, 300);
    };

    fullscreen.addEventListener("click", (e) => {
      if (e.target === fullscreen) {
        window.closeFullscreen();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.closeFullscreen();
      }
    });
  }

  // ==============================
  // BLOG EDITOR
  // ==============================


  // ==============================
  // IMAGE UPLOAD
  // ==============================
  const imageInput = document.getElementById("blog-image");

  if (imageInput) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        selectedImage = file;
      }
    });
  }

  // ==============================
  // 🔥 ARTICLE DELETE FUNCTIONALITY
  // ==============================
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const deleteBtn = document.getElementById("delete-article-btn");

  if (deleteBtn && id) {

    const isAdmin = true; // future: replace with auth

    if (isAdmin) {
      deleteBtn.style.display = "block";
    }

    if (window.location.pathname.includes("article.html")) {
      deleteBtn.addEventListener("click", async function () {
        if (!confirm("Delete this article?")) return;

        try {
          const docRef = doc(db, "articles", id);

          // 🔥 Get article first (for image URL)
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const blog = docSnap.data();

            // 🔥 Delete image from storage (if exists)
            if (blog.image) {
              try {
                const imageRef = ref(storage, blog.image);
                await deleteObject(imageRef);
              } catch (err) {
                console.log("Image delete skipped:", err);
              }
            }

            // 🔥 Delete Firestore document
            await deleteDoc(docRef);

            alert("Article deleted successfully");

            // 🔥 Redirect
            window.location.href = "books.html";
          }

        } catch (error) {
          console.error("Error deleting article:", error);
          alert("Error deleting article");
        }
      });
    }
  }

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

  if (window.location.pathname.includes("article.html")) {
    loadArticle();
  }

  if (document.body.classList.contains("book-bits-page")) {
    renderBookBits();
  }
});

// slideshow 

const slides = document.querySelectorAll(".slide");
const bars = document.querySelectorAll(".bar");

if (slides.length > 0 && bars.length > 0) {

  let index = 0;

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    bars.forEach(bar => {
      bar.classList.remove("active");
      const span = bar.querySelector("span");
      if (span) {
        span.style.animation = "none";
        void span.offsetWidth;
      }
    });

    slides[i].classList.add("active");

    bars[i].classList.add("active");
    const span = bars[i].querySelector("span");
    if (span) {
      span.style.animation = "fillBar 5s linear forwards";
    }
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  showSlide(index);
  setInterval(nextSlide, 5000);
}

const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");
const publishBtn = document.getElementById("publish-btn");
const publishBitBtn = document.getElementById("publish-bit-btn");



if (addBtn) addBtn.addEventListener("click", openEditor);
if (cancelBtn) cancelBtn.addEventListener("click", closeEditor);
if (publishBtn) publishBtn.addEventListener("click", saveBlog);
document.addEventListener("click", function (e) {
  const img = e.target.closest(".quote-card img");
  if (!img) return;

  const fullscreen = document.getElementById("fullscreen-view");
  const fullscreenImg = document.getElementById("fullscreen-img");

  fullscreenImg.src = img.src;
  fullscreen.classList.remove("hidden");

  setTimeout(() => {
    fullscreen.classList.add("active");
  }, 10);
});

if (publishBitBtn) publishBitBtn.addEventListener("click", saveBookBit);