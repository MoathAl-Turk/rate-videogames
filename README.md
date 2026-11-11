# GameRater

**GameRater** is a futuristic, interactive web application designed for gamers to rate video games, browse a real-time review feed, and participate in community discussions through comments. It features high-end glassmorphism design, custom UI themes, and a secure moderation system.

---

## Key Features

*   **Google Authentication:** Secure sign-in via Firebase Auth to unlock rating and commenting features.
*   **Verified Game Database:** Integrated searchable game dataset (11,493+ unique entries) ensuring users can only submit reviews for real video game titles.
*   **Real-Time Review Feed:** Live feed of reviews sorted by newest timestamp, featuring star ratings and custom review cards.
*   **Anonymous Posting:** Option to publish reviews anonymously while keeping track of user authorization.
*   **Interactive Comments:** Community engagement system allowing logged-in users to post and delete comments on any review.
*   **Admin Moderation Dashboard:** Dedicated admin controls (`moathalturk88@gmail.com`) to approve/deny unlisted games and delete any review or comment.
*   **Futuristic UI & Custom Themes:** Built with a Rocket League-inspired 20XX animated grid background, glassmorphism card styling, and an interactive theme picker (Nebula Purple, Matrix Green, Stealth Black).
*   **Accessibility Controls:** Built-in toggle to disable background motion if needed.
*   **Mobile Responsive:** Fully optimized layout for seamless use on smartphones, tablets, and desktops.

---

## Tech Stack

*   **Frontend:** HTML5, CSS3 (Custom Glassmorphism & Animations), JavaScript (ES6 Modules, Single Page Application architecture)
*   **Backend & Database:** Firebase Firestore (Real-time CRUD operations, Sub-collections for comments), Firebase Authentication (Google Provider)
*   **Dataset:** Custom JSON-parsed game directory (`games.json`)

---

## Getting Started & Deployment

To run or deploy this project locally:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/moathal-turk/rate-videogames.git](https://github.com/moathal-turk/rate-videogames.git)
