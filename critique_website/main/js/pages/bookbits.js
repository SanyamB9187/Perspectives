import { db, storage } from "../firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


//  
export async function renderBookBits() {
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


//  Save Book bits

export async function saveBookBit() {
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
    console.error("BookBits Error:", err);
    alert("Error adding book bit");
  }
}