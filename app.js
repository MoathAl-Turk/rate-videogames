import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// UI Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name-display');
const formContainer = document.getElementById('form-container');
const form = document.getElementById('review-form');
const reviewsContainer = document.getElementById('reviews-container');

let currentUser = null;

// Handle Auth State Changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        loginBtn.style.display = 'none';
        userInfo.style.display = 'block';
        userNameDisplay.textContent = user.displayName;
        formContainer.style.display = 'block'; // Show the review form
    } else {
        // User is signed out
        currentUser = null;
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
        formContainer.style.display = 'none'; // Hide the review form
    }
});

// Login Button Click
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => {
        console.error("Login Error:", error);
    });
});

// Logout Button Click
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Handle Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
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
            reviewerName: currentUser.displayName,
            reviewerId: currentUser.uid,
            timestamp: serverTimestamp()
        });
        form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Database error. Are you logged in?");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
    }
});

// Real-time listener: Fetches existing reviews
const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    reviewsContainer.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <h3>${data.name}</h3>
            <div class="reviewer-name">Reviewed by: ${data.reviewerName || 'Anonymous'}</div>
            <div class="rating">⭐ ${data.rating} / 5</div>
            <p>${data.review}</p>
        `;
        reviewsContainer.appendChild(card);
    });
});
