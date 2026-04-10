import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  export async function renderHomepageArticles() {
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

    console.log("ALL ARTICLES:", articles);

    if (articles.length === 0) return;

    // TOP FEATURE
    const top = articles[0];
    
    topContainer.style.backgroundImage = `url(${top.image || 'https://via.placeholder.com/800x400'})`;
    topContainer.style.backgroundSize = "cover";
    topContainer.style.backgroundPosition = "center";

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

    // GRID
    gridContainer.innerHTML = "";

    const gridArticles = articles.slice(1);

    gridArticles.forEach((article) => {
      console.log("GRID IMAGE:", article.image);

      const div = document.createElement("div");
      div.className = "card";

      div.style.backgroundImage = `url(${article.image || 'https://via.placeholder.com/800x400'})`;

      div.innerHTML = `
        <div class="card-overlay"></div>
        <span class="tag">${article.category.toUpperCase()}</span>
        <h3>${article.title}</h3>
        <p>${article.content.substring(0, 100)}...</p>
        <div class="meta">
          <span>${article.createdAt?.toDate().toLocaleDateString()}</span>
        </div>
      `;

      div.onclick = () => {
        window.location.href = `article.html?id=${article.id}`;
      };

      gridContainer.appendChild(div);
    });

  } catch (error) {
    console.error("Homepage render error:", error);
  }
  
}