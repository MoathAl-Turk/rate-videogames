import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// 🔴 YOUR ADMIN EMAIL 🔴
const ADMIN_EMAIL = "moathalturk88@gmail.com";

// DOM Elements
const loginBtnNav = document.getElementById('login-btn-nav');
const navSettingsBtn = document.getElementById('nav-settings-btn');
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtnSettings = document.getElementById('logout-btn-settings');
const logo = document.getElementById('logo');

const viewHome = document.getElementById('view-home');
const viewRate = document.getElementById('view-rate');
const viewSettings = document.getElementById('view-settings');

const ratePromptCard = document.getElementById('rate-prompt-card');
const goToRateBtn = document.getElementById('go-to-rate-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const form = document.getElementById('review-form');
const reviewsContainer = document.getElementById('reviews-container');

let currentUser = null;
let validGamesList = []; // Array to hold all 11,000+ games

// ==========================================
// FETCH DATASET AND POPULATE DATALIST
// ==========================================
fetch('games.json')
    .then(response => response.json())
    .then(games => {
        validGamesList = games;
        const datalist = document.getElementById('game-options');
        
        // Add each game as an option to the searchable dropdown
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game;
            datalist.appendChild(option);
        });
    })
    .catch(err => console.error("Error loading games.json:", err));


// Routing logic
function showView(viewId) {
    viewHome.style.display = 'none';
    viewRate.style.display = 'none';
    viewSettings.style.display = 'none';
    document.getElementById(viewId).style.display = 'block';
}

goToRateBtn.addEventListener('click', () => showView('view-rate'));
backToHomeBtn.addEventListener('click', () => showView('view-home'));
navSettingsBtn.addEventListener('click', () => showView('view-settings'));
settingsBackBtn.addEventListener('click', () => showView('view-home'));
logo.addEventListener('click', () => showView('view-home'));

// Theme Switcher Logic
const themeButtons = document.querySelectorAll('.theme-btn');
themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        document.body.className = theme === 'default' ? '' : `theme-${theme}`;
    });
});

// Auth State Changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginBtnNav.style.display = 'none';
        userNameDisplay.style.display = 'inline';
        
        // Admin crown check
        userNameDisplay.textContent = user.email === ADMIN_EMAIL ? `👑 ${user.displayName} (Admin)` : user.displayName;
        
        navSettingsBtn.style.display = 'inline-block';
        ratePromptCard.style.display = 'block';
    } else {
        currentUser = null;
        loginBtnNav.style.display = 'inline-block';
        userNameDisplay.style.display = 'none';
        navSettingsBtn.style.display = 'none';
        ratePromptCard.style.display = 'none';
        showView('view-home');
    }
});

loginBtnNav.addEventListener('click', () => signInWithPopup(auth, provider));
logoutBtnSettings.addEventListener('click', () => signOut(auth));

// ==========================================
// SUBMIT REVIEW
// ==========================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const gameNameInput = document.getElementById('game-name');
    const name = gameNameInput.value.trim();
    
    // Strict Validation: Ensure the typed/selected name matches the games.json list
    if (!validGamesList.includes(name)) {
        alert("Please select a valid game from the dropdown list!");
        return;
    }

    const rating = document.getElementById('game-rating').value;
    const review = document.getElementById('game-review').value;
    const isAnonymous = document.getElementById('post-anonymous').checked;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        await addDoc(collection(db, "reviews"), {
            name: name,
            rating: parseInt(rating),
            review: review,
            reviewerName: isAnonymous ? 'Anonymous' : currentUser.displayName,
            reviewerId: currentUser.uid,
            timestamp: serverTimestamp()
        });
        form.reset();
        showView('view-home');
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error posting review.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
    }
});

// ==========================================
// HANDLE COMMENT SUBMISSIONS
// ==========================================
document.addEventListener('submit', async (e) => {
    if (e.target.classList.contains('comment-form')) {
        e.preventDefault();
        if (!currentUser) return alert("You must be logged in to comment.");
        
        const reviewId = e.target.getAttribute('data-review-id');
        const input = e.target.querySelector('input');
        const commentText = input.value;
        const btn = e.target.querySelector('button');
        
        btn.disabled = true;
        try {
            await addDoc(collection(db, "reviews", reviewId, "comments"), {
                text: commentText,
                author: currentUser.displayName,
                authorId: currentUser.uid,
                timestamp: serverTimestamp()
            });
            input.value = '';
        } catch (error) {
            console.error("Error posting comment: ", error);
        } finally {
            btn.disabled = false;
        }
    }
});

// ==========================================
// HANDLE GLOBAL COMMENT DELETION
// ==========================================
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-comment-btn')) {
        if (confirm("Delete this comment?")) {
            const reviewId = e.target.getAttribute('data-review-id');
            const commentId = e.target.getAttribute('data-comment-id');
            await deleteDoc(doc(db, "reviews", reviewId, "comments", commentId));
        }
    }
});

// ==========================================
// RENDER REVIEWS AND COMMENTS
// ==========================================
const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    reviewsContainer.innerHTML = '';
    
    snapshot.forEach((reviewDoc) => {
        const data = reviewDoc.data();
        const id = reviewDoc.id;
        
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <h3>${data.name}</h3>
            <div class="reviewer-name">Reviewed by: ${data.reviewerName}</div>
            <div class="rating">⭐ ${data.rating} / 5</div>
            <p>${data.review}</p>
        `;

        // SHOW DELETE BUTTON IF: User owns the review OR User is Admin
        if (currentUser && (currentUser.uid === data.reviewerId || currentUser.email === ADMIN_EMAIL)) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = currentUser.email === ADMIN_EMAIL && currentUser.uid !== data.reviewerId ? 'Admin: Delete Review' : 'Delete My Review';
            delBtn.onclick = async () => {
                if(confirm("Are you sure you want to delete this review?")) {
                    await deleteDoc(doc(db, "reviews", id));
                }
            };
            card.appendChild(delBtn);
        }

        const commentsDiv = document.createElement('div');
        commentsDiv.className = 'comments-section';
        
        let commentFormHTML = '';
        if (currentUser) {
            commentFormHTML = `
                <form class="comment-form" data-review-id="${id}">
                    <input type="text" placeholder="Write a comment..." required>
                    <button type="submit">Post</button>
                </form>
            `;
        } else {
            commentFormHTML = `<p style="font-size: 0.85rem; color: #888;">Log in to post a comment.</p>`;
        }
        
        commentsDiv.innerHTML = `
            <h4>Comments</h4>
            ${commentFormHTML}
            <div class="comments-list" id="comments-list-${id}">Loading comments...</div>
        `;
        card.appendChild(commentsDiv);
        reviewsContainer.appendChild(card);

        // Fetch Comments for this review
        const commentsQuery = query(collection(db, "reviews", id, "comments"), orderBy("timestamp", "asc"));
        onSnapshot(commentsQuery, (commentSnap) => {
            const listElement = document.getElementById(`comments-list-${id}`);
            if (!listElement) return;
            
            listElement.innerHTML = '';
            if (commentSnap.empty) {
                listElement.innerHTML = '<div style="font-size: 0.85rem; color: #888;">No comments yet.</div>';
                return;
            }
            
            commentSnap.forEach((cDoc) => {
                const cData = cDoc.data();
                
                // Show delete button for comments if author or Admin
                let deleteHTML = '';
                if (currentUser && (currentUser.uid === cData.authorId || currentUser.email === ADMIN_EMAIL)) {
                    deleteHTML = `<button class="delete-comment-btn" data-review-id="${id}" data-comment-id="${cDoc.id}" style="background: none; color: #ff5252; border: none; font-size: 0.75rem; cursor: pointer; padding: 0; margin-left: 10px; width: auto; font-weight: normal;">[Delete]</button>`;
                }

                listElement.innerHTML += `
                    <div class="comment" style="display: flex; justify-content: space-between; align-items: center;">
                        <div><span class="comment-author">${cData.author}:</span> ${cData.text}</div>
                        ${deleteHTML}
                    </div>
                `;
            });
        });
    });
});
