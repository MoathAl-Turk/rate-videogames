import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// Added doc and deleteDoc for the delete feature
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

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name-display');
const formContainer = document.getElementById('form-container');
const form = document.getElementById('review-form');
const reviewsContainer = document.getElementById('reviews-container');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginBtn.style.display = 'none';
        userInfo.style.display = 'block';
        userNameDisplay.textContent = user.displayName;
        formContainer.style.display = 'block';
    } else {
        currentUser = null;
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
        formContainer.style.display = 'none';
    }
});

loginBtn.addEventListener('click', () => signInWithPopup(auth, provider));
logoutBtn.addEventListener('click', () => signOut(auth));

// Handle New Review Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const name = document.getElementById('game-name').value;
    const rating = document.getElementById('game-rating').value;
    const review = document.getElementById('game-review').value;
    const isAnonymous = document.getElementById('post-anonymous').checked; // Checkbox value
    const submitBtn = form.querySelector('button');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        await addDoc(collection(db, "reviews"), {
            name: name,
            rating: parseInt(rating),
            review: review,
            // Use 'Anonymous' if checked, otherwise use their real display name
            reviewerName: isAnonymous ? 'Anonymous' : currentUser.displayName,
            reviewerId: currentUser.uid, // We still save their ID secretly so they can delete it later
            timestamp: serverTimestamp()
        });
        form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
    }
});

// Handle Comment Submissions (Event Delegation)
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

// Render Reviews and Comments
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

        // Add Delete Button ONLY if the logged-in user owns this review
        if (currentUser && currentUser.uid === data.reviewerId) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'Delete My Review';
            delBtn.onclick = async () => {
                if(confirm("Are you sure you want to delete this review?")) {
                    await deleteDoc(doc(db, "reviews", id));
                }
            };
            card.appendChild(delBtn);
        }

        // Add Comments Section UI
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

        // Fetch and listen for Comments on this specific review
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
                listElement.innerHTML += `
                    <div class="comment">
                        <span class="comment-author">${cData.author}:</span> ${cData.text}
                    </div>
                `;
            });
        });
    });
});
