// Import standard Firebase v9 modular SDKs directly via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔴 REPLACE THIS WITH YOUR FIREBASE WEB APP CONFIG 🔴
const firebaseConfig = {
  apiKey: "AIzaSyB9Z5WUXRf4KdYostUH4x4r0bgAX0XuixY",
  authDomain: "gamerater-a6108.firebaseapp.com",
  projectId: "gamerater-a6108",
  storageBucket: "gamerater-a6108.firebasestorage.app",
  messagingSenderId: "1088131185322",
  appId: "1:1088131185322:web:401af0aa65614a91aa6ed3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in anonymously so users don't have to create accounts to view/post
signInAnonymously(auth).catch((error) => {
    console.error("Auth Error:", error.message);
});

const form = document.getElementById('review-form');
const reviewsContainer = document.getElementById('reviews-container');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('game-name').value;
    const rating = document.getElementById('game-rating').value;
    const review = document.getElementById('game-review').value;
    const submitBtn = form.querySelector('button');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        await addDoc(collection(db, "reviews"), {
            name: name,
            rating: parseInt(rating),
            review: review,
            timestamp: serverTimestamp()
        });
        form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error saving review. Check the console.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
    }
});

// Real-time listener: Fetches existing reviews and updates instantly when new ones are added
const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    reviewsContainer.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <h3>${data.name}</h3>
            <div class="rating">⭐ ${data.rating} / 5</div>
            <p>${data.review}</p>
        `;
        reviewsContainer.appendChild(card);
    });
});
