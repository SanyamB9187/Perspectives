import { db, storage } from "./firebase.js";
import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    deleteDoc,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


export async function renderBlogs() {
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
            const id = doc.id;

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

export async function saveBlog(selectedImage) {

    const title = document.getElementById("blog-title").value;
    const author = document.getElementById("author-name").value;
    const content = document.getElementById("blog-content").value;

    // NEW
    const trailerInput = document.getElementById("blog-trailer");

    // only exists on movie pages
    const trailer = trailerInput ? trailerInput.value : "";

    if (!title || !content || !author) {
        alert("Please fill all fields");
        return;
    }

    if (!selectedImage) {
        alert("Please select an image");
        return;
    }

    try {

        const imageRef = ref(storage, "articles/" + Date.now() + "_" + selectedImage.name);

        await uploadBytes(imageRef, selectedImage);

        const imageURL = await getDownloadURL(imageRef);

        console.log("IMAGE URL SAVED:", imageURL);

        const category = document.body.dataset.category;

        await addDoc(collection(db, "articles"), {

            title: title,
            author: author,
            content: content,
            image: imageURL,

            // NEW
            trailer: trailer,

            category: category,
            createdAt: serverTimestamp()

        });

        alert("Article published successfully");

    } catch (error) {

        console.error("Error adding document: ", error);
        alert("Error publishing article");

    }

    document.getElementById("author-name").value = "";
}

export async function loadArticle() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    try {

        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            const blog = docSnap.data();

            console.log(blog.title);
            console.log("Data:", blog);

            const titleEl = document.getElementById("article-title");
            const contentEl = document.getElementById("article-content");
            const imageEl = document.getElementById("article-image");
            const dateEl = document.getElementById("article-date");
            const catEl = document.getElementById("article-category");
            const authorEl = document.getElementById("article-author");

            const trailerSection = document.querySelector(".trailer-section");
            const trailerFrame = document.getElementById("article-trailer");

            // TRAILER MAPPING
            const articleMedia = {

                 "\"Notes from Underground - Fyodor Dostoevsky\"": {
                    label: "Jordan Peterson's Insights",
                    url: "https://www.youtube.com/embed/yo1MBH6j4bs"
                },
                
                "Southpaw - Jake Gyllenhaal": {
                    label: "Official Trailer",
                    url: "https://www.youtube.com/embed/Mh2ebPxhoLs"
                },

                "CR7 - The man the myth": {
                    label: "Related Video",
                    url: "https://www.youtube.com/embed/oNMgYz9KTXM"
                },

                "F1 - Sonny's card bit": {
                    label: "Official Trailer",
                    url: "https://www.youtube.com/embed/8yh9BPUBbbQ"
                }

            };


            // ARTICLE CONTENT

            if (titleEl) titleEl.innerText = blog.title;

            if (contentEl) {
                contentEl.innerHTML = blog.content.replace(/\n/g, "<br>");
            }

            if (imageEl) {

                imageEl.src = blog.image
                    ? blog.image
                    : "https://via.placeholder.com/1200x600?text=No+Image";

                imageEl.style.display = "block";
            }

            if (dateEl && blog.createdAt) {

                dateEl.innerText =
                    blog.createdAt.toDate().toLocaleDateString();
            }

            if (authorEl) {

                authorEl.innerText =
                    `By ${blog.author || "Unknown"}`;
            }

            if (catEl) {

                catEl.innerText =
                    blog.category.toUpperCase();
            }

            // =========================
            // TRAILER LOGIC
            // =========================

            const media = articleMedia[blog.title];


            const sectionHeading = document.querySelector(".section-heading");

            if (media && trailerFrame && trailerSection) {
                trailerSection.style.display = "block";
                trailerFrame.src = media.url;

                if (sectionHeading) {
                    sectionHeading.innerText = media.label;
                }
            }
            else {
                trailerSection.style.display = "none";
            }

        } else {

            console.log("No such article");

        }

    } catch (error) {

        console.error("Error loading article:", error);

    }
}

