# Algorithm-Based Networking Platform to Mitigate Social Isolation (Kindred)

**Author:** Gavin Paul P (`EC2532251010259`)  
**Degree:** Master of Computer Applications (MCA — IV Semester)  
**Institution:** Directorate of Online Education, SRM Institute of Science and Technology, Kattankulathur – 603 203  
**Project Guide:** Dr. G. Babu  
**Repository:** [https://github.com/Gavin123P/Academic-Projects/tree/main/Algorithm-Based-Networking-Platform](https://github.com/Gavin123P/Academic-Projects/tree/main/Algorithm-Based-Networking-Platform)

---

## 1. Project Overview

Modern social platforms rely on passive infinite scrolling and vanity metrics, leaving students and remote professionals socially isolated. **Kindred** is an **Algorithm-Based Networking Platform** that connects individuals through shared semantic interests using **Natural Language Processing (NLP)**, **TF-IDF Vectorization**, and **Cosine Similarity**, combined with **Role-Based Access Control (RBAC)**, **Graduated Community Moderation (Ban & Timed Soft-Ban)**, and **Real-Time Socket.IO Chat**.

### Architecture Highlights
- **Frontend Layer (`/frontend` & `/backend/public`):** React Native (Expo Web) responsive user interface with tailored views for **Regular Members** and **Administrators**.
- **Backend Layer (`/backend`):** Node.js & Express.js REST API + Socket.IO Real-Time WebSockets + JWT & Bcrypt Authentication.
- **Database Layer:** **MongoDB Atlas Cloud Cluster (`matching_app`)** via Mongoose ODM (`users`, `topics`, `matches`, `messages` collections) with automatic local JSON fallback.
- **NLP & Matching Engine (`/backend/services/MatchingEngine.js` & `/nlp_engine`):** Tokenization, 85+ English Stop-Word Removal, 50+ Domain Synonym Normalization (`"AI"` ↔ `"Artificial Intelligence"`, `"ML"` ↔ `"Machine Learning"`), Sublinear TF-IDF Vectorization, and Pairwise Cosine Similarity Ranking.

---

## 2. Core Modules

1. **User Management & Role-Based Access Control (Module 1):**
   - Supports two distinct roles: **Regular Member (`user`)** and **Administrator (`admin`)**.
   - Regular Members see a clean, natural interface (**My Interests**, **Discover**, **Messages**) free of intimidating mathematical jargon.
   - Administrators unlock the **Admin Control Center** with live platform metrics, member directory governance, database connection controls, and the NLP Similarity Sandbox.
2. **Interest & Topic Curation (Module 2):**
   - Browse categorized interest tags (Technology, AI & Data Science, Creative Arts, Wellness, Gaming, Academics) or create custom community topics in real time.
3. **NLP Preprocessing & 50+ Synonym Engine (Module 3):**
   - Lowercases text, strips punctuation, removes 85+ stop-words, and maps 50+ abbreviations/synonyms to canonical roots before vectorization.
4. **TF-IDF & Cosine Similarity Matching Engine (Module 4):**
   - Computes sublinear TF-IDF vectors across active profiles and ranks peer compatibility from `0%` to `100%` using Cosine Similarity:
     $$\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
5. **Real-Time WebSocket Chat Service (Module 5):**
   - Deterministic private room generation (`sorted_user1_user2`) with sub-50ms bi-directional messaging via Socket.IO and persistent chat history in MongoDB Atlas.
6. **Graduated Admin Moderation & System Evaluation (Module 6):**
   - **Permanent Ban:** Blocks account login and hides profile from discovery.
   - **Temporary Timed Soft-Ban (`15m`, `1h`, `24h`, `7d`):** Allows read-only browsing while restricting chat messaging and topic creation until automatic expiry.
   - **Lift Restriction / Role Toggle / Cascade Delete:** One-click admin controls synchronized live with MongoDB Atlas.
   - **Automated Evaluation Suite:** Achieves **88.9% Precision**, **100% Recall**, **94.1% F1-Score**, and **<15ms query latency**.

---

## 3. Quick Start (One-Click Launcher on Windows)

Double-click **`start.bat`** in the project root, or run:

```cmd
start.bat
```

This automatically starts the Node.js + Socket.IO backend connected to MongoDB Atlas on `http://localhost:5000` and opens the web application in your default browser. To stop the server, simply close the terminal window or press `Ctrl + C`.

---

## 4. Manual Installation & Setup

### Step 1: Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` and set your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/matching_app?retryWrites=true&w=majority
JWT_SECRET=srm_mca_networking_platform_secret_2026
PYTHON_NLP_URL=http://localhost:5001
```

### Step 2: Start the Backend & Web Server (`/backend`)
```bash
cd backend
npm install
npm start
```
Open **`http://localhost:5000`** in your browser.

### Step 3: (Optional) Start Expo Frontend Dev Server (`/frontend`)
```bash
cd frontend
npm install
npx expo start --web
```

### Step 4: (Optional) Start Python Scikit-Learn NLP Microservice (`/nlp_engine`)
```bash
cd nlp_engine
pip install -r requirements.txt
python app.py
```

---

## 5. Default Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Gavin Paul P | `gavin@srmist.edu.in` | `password123` |
| **Admin** | Rohith Kumar | `rohith@vtsenterprises.com` | `password123` |
| **Member** | Ananya Sharma | `ananya.ai@srmist.edu.in` | `password123` |
| **Member** | Karthik Rajan | `karthik.dev@gmail.com` | `password123` |
| **Member** | Meera Nair | `meera.design@gmail.com` | `password123` |
| **Member** | Vikram Aditya | `vikram.ds@gmail.com` | `password123` |

---

## 6. Project Deliverables Included

- `backend/` — Node.js, Express.js, Socket.IO, Mongoose Models, MatchingEngine, and Web Client
- `frontend/` — React Native (Expo Web) Cross-Platform Application
- `nlp_engine/` — Python Scikit-Learn & NLTK TF-IDF Cosine Similarity Service
- `Algorithm_Based_Networking_Platform_Report.pdf` & `.docx` — Complete 81-Page MCA Project Report
- `Algorithm_Based_Networking_Platform_Presentation.pptx` — 24-Slide Project Viva-Voce Presentation
- `Viva_Presentation_Speaker_Script.md` — Slide-by-Slide Viva Speaker Notes & Q&A Guide
