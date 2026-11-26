# MCA IV Semester Project Viva Voce — Speaker Script
**Project Title:** Algorithm-Based Networking Platform to Mitigate Social Isolation (*Kindred*)  
**Student Name:** Gavin Paul P  
**Enrolment Number:** EC2532251010259  
**Project Guide:** Dr. G. Babu  
**Institution:** Directorate of Online Education, SRM Institute of Science and Technology, Kattankulathur – 603 203  
**Presentation File:** `Algorithm_Based_Networking_Platform_Presentation.pptx` (24 Slides)  
**Estimated Speaking Time:** ~12–15 Minutes  

---

## Slide 1: Cover Slide (SRM Institute of Science and Technology)
**Time:** ~20 seconds  
**What to say:**
> "Good morning / Good afternoon to the respected panel members and my project guide. My name is **Gavin Paul P**, Enrolment Number **EC2532251010259**, from the MCA Fourth Semester, Directorate of Online Education, SRM Institute of Science and Technology. Today, I am presenting my final semester project work for the Project Viva Voce."

---

## Slide 2: Title of Project & Project Guide
**Time:** ~25 seconds  
**What to say:**
> "The title of my project is **'Algorithm-Based Networking Platform to Mitigate Social Isolation'**, developed under the guidance of **Dr. G. Babu**.  
> The primary goal of this project is to move away from passive, feed-based social media and instead connect individuals through shared semantic interests using Natural Language Processing, TF-IDF vectorization, and Cosine Similarity."

---

## Slide 3: Abstract
**Time:** ~45 seconds  
**What to say:**
> "To give a high-level overview of the project: modern social networks prioritize infinite scrolling and vanity metrics like follower counts, which often leave students and remote professionals feeling isolated.  
> To solve this, we built **Kindred**—an algorithm-based networking platform.  
> When a member selects or creates interest topics on the platform, our NLP pipeline normalizes synonyms—for example, recognizing that *'AI'* and *'Artificial Intelligence'* mean the exact same thing—and computes pairwise **Cosine Similarity** over **TF-IDF vectors** to recommend the most compatible peers.  
> We also implemented **Role-Based Access Control (RBAC)** so regular members enjoy a clean, human-friendly interface for match discovery and real-time **Socket.IO** chat, while administrators get a dedicated Control Center connected to **MongoDB Atlas** for user governance, permanent bans, temporary timed soft-bans, and live NLP similarity benchmarks."

---

## Slide 4: Introduction (Part 1 — The Problem Domain)
**Time:** ~40 seconds  
**What to say:**
> "Moving to the Introduction: in university campuses and remote work environments, people frequently struggle to find peers who share their specific niche interests—whether that is AI and software engineering, competitive coding, creative arts, fitness, or literature.  
> Traditional social apps fail here because they rely on literal keyword searches. If one student writes *'ML'* and another writes *'Machine Learning'*, a basic keyword search misses the connection.  
> Our platform bridges this gap by combining a 50+ domain synonym dictionary with TF-IDF Cosine Similarity and connecting matched peers immediately in real-time WebSocket chat rooms."

---

## Slide 5: Introduction (Part 2 — Limitations vs. Our Solution)
**Time:** ~45 seconds  
**What to say:**
> "On Slide 5, we contrast the four major limitations of conventional platforms with our approach:  
> First, passive scrolling replaces real two-way conversation. Second, exact keyword matching fails on abbreviations and synonyms. Third, academic prototypes often clutter the user interface with raw math metrics. And fourth, moderation is usually binary—either nothing happens or an account is permanently deleted.  
> In our platform, we address all four: we curate and normalize interests using NLP, rank compatibility using TF-IDF and Cosine Similarity, separate the Regular Member experience from the Admin Control Center using RBAC, provide instant Socket.IO chat rooms, and introduce graduated moderation with temporary timed soft-bans backed by MongoDB Atlas."

---

## Slide 6: Features (Part 1 — Core NLP, Matching & RBAC)
**Time:** ~45 seconds  
**What to say:**
> "Slides 6 and 7 highlight the core features of the system.  
> 1. **NLP Synonym & Text Normalization Pipeline:** Every user's selected topics and custom tags are tokenized, cleaned of over 85 English stop-words, and passed through a 50+ domain synonym map—mapping terms like *'AI'* to *'artificial intelligence'*, *'ML'* to *'machine learning'*, and *'JS'* to *'javascript'*.  
> 2. **TF-IDF & Cosine Similarity Ranking:** The normalized tokens are converted into sublinear TF-IDF vectors, and pairwise Cosine Similarity computes an affinity percentage from 0% to 100%, displaying transparent 'In Common' topic badges.  
> 3. **Role-Based Access Control:** Normal users only see three clean tabs—*My Interests*, *Discover*, and *Messages*—while technical diagnostics and user management are strictly isolated to Administrators."

---

## Slide 7: Features (Part 2 — Moderation, Live Chat & Cloud Database)
**Time:** ~45 seconds  
**What to say:**
> "Continuing with the features on Slide 7:  
> 4. **Graduated Admin Moderation:** Administrators can permanently ban abusive accounts, apply temporary timed soft-bans for 15 minutes, 1 hour, 24 hours, or 7 days—which restrict chatting and adding topics while still allowing read access—or lift restrictions early and delete accounts.  
> 5. **Real-Time Socket.IO Chat Rooms:** Matched peers join deterministic rooms for instant bi-directional messaging with live soft-ban enforcement.  
> 6. **MongoDB Atlas Cloud Persistence:** All users, custom topics, similarity scores, moderation timestamps, and chat messages are stored live on a MongoDB Atlas cloud cluster."

---

## Slide 8: System Requirements
**Time:** ~35 seconds  
**What to say:**
> "Slide 8 outlines the Hardware and Software Requirements.  
> On the hardware side, the platform runs smoothly on an Intel Core i5 or Ryzen 5 processor with 8 GB RAM and an active internet connection for MongoDB Atlas and WebSocket synchronization.  
> On the software stack, the backend is built with **Node.js**, **Express.js**, **Socket.IO**, and **Mongoose ODM** connected to **MongoDB Atlas**. The frontend is built with **React Native (Expo Web)** for a responsive cross-platform UI. Additionally, we built a **Python Scikit-Learn and NLTK** microservice to cross-verify our TF-IDF and Cosine Similarity calculations."

---

## Slide 9: Existing System
**Time:** ~40 seconds  
**What to say:**
> "Slide 9 illustrates the drawbacks of the Existing System.  
> As shown in the SmartArt diagram on the right, existing networks revolve around **Passive Feeds**, **Keyword Mismatch**, and **Weak Governance**.  
> Users have to manually hunt through noisy public groups; literal keyword searches fail when people use different terminology; superficial follower counts create cold-start anxiety for newcomers; and there are no transparent compatibility scores or graduated temporary soft-ban tools. The result is high screen time, yet persistent real-world isolation."

---

## Slide 10: Proposed System
**Time:** ~40 seconds  
**What to say:**
> "Slide 10 presents our Proposed System, structured around three stages shown in the SmartArt diagram: **Curate**, **Match**, and **Connect**.  
> - In **Curate**, users pick or create interest tags on a clean dashboard while our NLP engine normalizes 50+ domain synonyms automatically.  
> - In **Match**, the system vectorizes profiles using TF-IDF and ranks peers via Cosine Similarity.  
> - In **Connect**, matched peers chat live in Socket.IO rooms, safeguarded by Role-Based Access Control and timed soft-ban moderation."

---

## Slide 11: Module Description (Overview & Module 1)
**Time:** ~40 seconds  
**What to say:**
> "Our architecture is divided into six cohesive modules, listed in the table on Slide 11:  
> 1. User Management & Role-Based Access Control  
> 2. Interest & Topic Curation Module  
> 3. NLP Preprocessing & Synonym Normalization Module  
> 4. TF-IDF & Cosine Similarity Matching Engine  
> 5. Real-Time WebSocket Chat Module  
> 6. Admin Moderation & Evaluation Module  
> Starting with **Module 1 (User Management & RBAC)**: it handles registration, Bcrypt password hashing, and JWT sessions. At login, it blocks permanently banned users, checks and auto-expires temporary soft-ban timers (`softBanUntil`), and routes regular members and administrators to their respective interfaces."

---

## Slide 12: Module Description (Modules 1 & 2 Detailed)
**Time:** ~40 seconds  
**What to say:**
> "Slide 12 details the database and middleware layer of **Module 1** along with **Module 2 (Interest & Topic Curation)**.  
> In Module 1, Express middleware guards (`requireAuth` and `requireAdmin`) protect all administrative routes so regular users cannot access moderation APIs.  
> In **Module 2**, members browse categorized interest chips across Technology, Arts, Fitness, and Academics, or create custom community topics with descriptions. Every time a user updates their topics, the backend immediately triggers a fresh recalculation of their compatibility matches."

---

## Slide 13: Module Description (Modules 3 & 4 — NLP & TF-IDF Engine)
**Time:** ~50 seconds  
**What to say:**
> "Slide 13 covers the algorithmic core of the project: **Module 3** and **Module 4**.  
> In **Module 3 (NLP Preprocessing & Synonym Engine)**, raw topic strings are lowercased, stripped of punctuation via regular expressions, tokenized, filtered against 85+ English stop-words, and expanded through our 50+ domain synonym dictionary so abbreviations like *'AI'*, *'ML'*, and *'NLP'* map to their full canonical terms.  
> In **Module 4 (TF-IDF & Cosine Similarity Matching Engine)**, the system constructs a dynamic vocabulary across all active profiles, computes sublinear Term Frequency–Inverse Document Frequency weights so rare niche interests get higher weight than generic hobbies, and applies the Cosine Similarity dot-product formula $\cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$ to rank peer compatibility from 0% to 100%."

---

## Slide 14: Module Description (Modules 5 & 6 — Live Chat & Admin Governance)
**Time:** ~50 seconds  
**What to say:**
> "Slide 14 explains **Module 5 (Real-Time WebSocket Chat)**, our **Dual-Engine Cross-Verification**, and **Module 6 (Admin Moderation & Evaluation)**.  
> - In **Module 5**, when two matched peers open a chat, we generate a deterministic room ID by sorting their user IDs (`sorted_user1_user2`). Messages are broadcast via Socket.IO in under 50 milliseconds and saved to the MongoDB Atlas `messages` collection. If a user is currently under a temporary soft-ban, `ChatService` blocks message transmission in real time.  
> - Finally, **Module 6** gives administrators full governance: Permanent Ban, Timed Soft-Ban (15 minutes to 7 days), Lift Restriction, Role Toggle between Member and Admin, Cascade User Deletion, and an automated Evaluation Suite that achieved **88.9% Precision**, **100% Recall**, and a **94.1% F1-Score** with under 15ms latency."

---

## Slide 15: Data Flow Diagram (DFD Level 0 & Level 1)
**Time:** ~45 seconds  
**What to say:**
> "Slide 15 shows the Data Flow Diagrams.  
> At the top, the **Level 0 Context Diagram** shows how the two external entities—**Regular Member** and **Administrator**—interact with the central Kindred Platform: Members send profiles, topics, and chat messages to receive ranked matches and live events, while Admins issue ban, soft-ban, and role rules and receive live system metrics.  
> At the bottom, the **Level 1 DFD** decomposes the system into five processes—Authentication & RBAC (1.0), Interest Curation & NLP Preprocessing (2.0), TF-IDF & Cosine Similarity (3.0), Real-Time Socket.IO Chat (4.0), and Admin Moderation (5.0)—flowing into our four MongoDB Atlas collections: `users`, `topics`, `matches`, and `messages`."

---

## Slide 16: Class Diagram (Part 1 — Domain & Persistence Entities)
**Time:** ~40 seconds  
**What to say:**
> "Slide 16 presents our UML Domain and Persistence Class Diagram for the MongoDB Atlas ODM layer.  
> - The **`User`** schema stores credentials, the `role` enum (`user` or `admin`), moderation `status` (`active`, `soft_banned`, or `banned`), `softBanUntil` timestamp, and references to selected topics.  
> - The **`Topic`** schema stores catalog tags and normalized NLP tokens.  
> - The **`Match`** schema stores pairwise `similarityScore` values and `commonTopics`.  
> - The **`Message`** schema stores real-time chat logs indexed by the deterministic `roomId`."

---

## Slide 17: Class Diagram (Part 2 — Service & Engine Layer)
**Time:** ~40 seconds  
**What to say:**
> "Slide 17 shows the Service and Controller Class Diagram.  
> - **`MatchingEngine`** encapsulates `STOP_WORDS`, `SYNONYM_MAP`, `preprocessText()`, `computeTfidfVectors()`, and `calculateCosineSimilarity()`.  
> - **`ChatService`** manages the Socket.IO server, active room sockets, `verifySenderNotRestricted()` for soft-ban enforcement, and message persistence.  
> - **`AdminModeration`** enforces the `requireAdmin` middleware and exposes methods for permanent ban, timed soft-ban presets (15m, 1h, 24h, 7d), lifting restrictions, role toggling, and live similarity pair testing."

---

## Slide 18: Output Screenshots (Part 1 — Regular Member View)
**Time:** ~45 seconds  
**What to say:**
> "Slide 18 shows screenshots from the working application for a **Regular Member** (Ananya Sharma).  
> - Notice how clean and natural the navigation bar is—showing only *My Interests*, *Discover*, and *Messages*, with zero intimidating mathematical formulas.  
> - On the left screenshot, Ananya curates her personal interests (*Artificial Intelligence, Machine Learning, NLP, Python*) or adds a custom interest.  
> - On the right screenshot, the **Discover** tab immediately ranks her top compatible peers—showing Gavin Paul P at an **86% Match**, Vikram Aditya at **52%**, and Rohith Kumar at **41%**—along with friendly badges showing what they have in common and a direct button to start chatting."

---

## Slide 19: Output Screenshots (Part 2 — Live Chat & Admin Governance)
**Time:** ~50 seconds  
**What to say:**
> "Slide 19 showcases the real-time chat and the **Administrator Control Center**:  
> - **Top-Left (A):** Two matched peers conversing live in a Socket.IO chat room with built-in conversation starters.  
> - **Top-Right (B):** When logged in as an **Admin**, the purple **Admin Console** tab appears. The Member Directory shows live platform health metrics and gives the admin one-click buttons on every user row to **Make Admin / Make Member**, apply a **Soft-Ban**, **Ban**, **Lift Restriction**, or **Delete**.  
> - **Bottom-Left (C):** The graduated **Temporary Soft-Ban Modal**, where the admin selects a duration (such as 1 Hour) and enters a reason for the member.  
> - **Bottom-Right (D):** The Admin-only **Semantic Similarity Sandbox**—proving that *'AI, ML'* and *'Artificial Intelligence, Machine Learning'* achieve a **100% (1.0) Semantic Match**—alongside automated health checks and the live MongoDB Atlas connection status."

---

## Slide 20: Source Code – GitHub Location
**Time:** ~20 seconds  
**What to say:**
> "Slide 20 provides the repository location and workspace structure of our full-stack source code, cleanly modularized into `backend/` (Node.js, Express, Socket.IO, and MongoDB Atlas models), `frontend/` (React Native / Expo Web interface), and `nlp_engine/` (the Python Scikit-Learn & NLTK verification microservice)."

---

## Slide 21: Conclusion
**Time:** ~45 seconds  
**What to say:**
> "To conclude on Slide 21:  
> The **Algorithm-Based Networking Platform (Kindred)** successfully demonstrates that intentional, algorithm-driven peer discovery can help mitigate social isolation.  
> By combining a 50+ domain synonym NLP pipeline with sublinear TF-IDF weighting and Cosine Similarity, the engine overcomes keyword mismatch and achieves a **94.1% F1-score** with **sub-15ms query latency**.  
> Through Role-Based Access Control, regular members enjoy a natural, jargon-free social experience, while administrators maintain community safety through graduated timed soft-bans and live MongoDB Atlas persistence."

---

## Slide 22: Future Enhancements
**Time:** ~35 seconds  
**What to say:**
> "Looking ahead on Slide 22, we have identified three key future enhancements:  
> 1. Integrating **Sentence-BERT (SBERT)** transformer embeddings with **FAISS** vector indexing to capture deep contextual semantics across long-form biographies at million-user scale.  
> 2. Expanding 1-on-1 Socket.IO chats into **multimedia group lounges** with WebRTC voice/video study rooms and AI-generated icebreakers.  
> 3. Adding an automated **NLP toxicity classifier** in chat to proactively flag abusive messages and recommend graduated soft-bans to administrators."

---

## Slide 23: References
**Time:** ~20 seconds  
**What to say:**
> "Slide 23 lists the core technical documentation and foundational academic references used in this project, including Salton & Buckley's foundational paper on TF-IDF term-weighting, Eisenstein's *Introduction to Natural Language Processing*, Scikit-Learn, NLTK, Socket.IO v4, and MongoDB Atlas documentation."

---

## Slide 24: Thank You
**Time:** ~15 seconds  
**What to say:**
> "That concludes my presentation. Thank you very much for your time and attention. I would now be happy to answer any questions from the panel or demonstrate the live working model."

---

## Quick Viva Q&A Cheat Sheet (Common Examiner Questions)

1. **Q: Why did you use TF-IDF + Cosine Similarity instead of simple keyword matching or Jaccard similarity?**
   - **Answer:** Simple keyword or Jaccard matching treats all interests as equally important and fails when users write synonyms (like *"AI"* vs *"Artificial Intelligence"*). In our platform, the NLP pipeline first normalizes 50+ domain synonyms to a canonical root, and then **TF-IDF** assigns higher mathematical weight to rare, specific niche interests while down-weighting very common interests. **Cosine Similarity** then measures the angle between two users' interest vectors independent of how many total topics they selected.

2. **Q: What is the difference between a Permanent Ban and a Temporary Soft-Ban in your system?**
   - **Answer:** A **Permanent Ban** (`status: 'banned'`) completely blocks the user from logging in or appearing in match discovery. A **Temporary Soft-Ban** (`status: 'soft_banned'` with a `softBanUntil` timestamp—15m, 1h, 24h, or 7d) allows the user to view their dashboard in read-only mode, but blocks them from sending chat messages in `ChatService` or modifying topics. Once the `softBanUntil` timestamp passes, the backend automatically restores their account to `active`.

3. **Q: How do you ensure a regular user cannot access admin features or see the internal NLP math tools?**
   - **Answer:** We enforce **Role-Based Access Control (RBAC)** at both layers: on the frontend, the Admin Console tab and NLP Similarity Sandbox are conditionally rendered only when `currentUser.role === 'admin'`. On the backend, every `/api/admin/*` route is protected by JWT authentication and the `requireAdmin` middleware, which returns an `HTTP 403 Forbidden` response if a regular user attempts to call it.

4. **Q: How does real-time chat ensure two users always enter the same private room?**
   - **Answer:** Instead of generating random room IDs, we create a deterministic room ID by sorting both users' unique IDs lexicographically (`[userA, userB].sort().join('_')`). Whether User A messages User B or User B messages User A, both clients join the exact same Socket.IO room and load the exact same message history from MongoDB Atlas.
