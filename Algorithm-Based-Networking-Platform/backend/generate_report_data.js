const fs = require('fs');
const path = require('path');

function readCodeFile(relPath) {
  try {
    return fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  } catch (_) {
    return '';
  }
}

const REPORT_CHAPTERS = [
  {
    number: '1',
    title: 'INTRODUCTION',
    sections: [
      {
        code: '1.1',
        heading: 'Background and the Digital Paradox of Social Connectivity',
        paragraphs: [
          'In the contemporary digital landscape, social networking platforms have become ubiquitous, serving as the primary medium for human communication, information exchange, and community formation. Over the past two decades, billions of individuals have adopted web and mobile platforms to maintain social ties across geographical boundaries. However, empirical studies in computational social science and digital psychology have revealed a striking modern paradox: while individuals are more digitally connected than at any point in human history, self-reported levels of social isolation, alienation, and chronic loneliness have reached record highs.',
          'The root cause of this paradox lies in the architectural incentives of conventional social media platforms. Mainstream networks are predominantly engineered around attention-maximizing content feeds, viral amplification loops, and superficial vanity metrics such as "likes," "views," "streaks," and "shares." These mechanisms reward broadcasting and passive observation rather than reciprocal interpersonal dialogue. Consequently, users spend hours scrolling through algorithmic feeds curated for advertising engagement without experiencing substantive, two-way human connection.',
          'Addressing this societal challenge requires a fundamental shift in platform architecture—moving away from passive feed consumption toward intentional, interest-driven human discovery. By leveraging advancements in Natural Language Processing (NLP), information retrieval, and real-time bidirectional network protocols, it is possible to construct a social networking paradigm that connects individuals based on deep intellectual, creative, and personal commonalities rather than popularity or proximity.',
          'This internship project, titled "Algorithm-Based Networking Platform to Mitigate Social Isolation" (deployed under the user-facing community brand "Kindred"), presents a complete full-stack engineering solution designed, implemented, and validated to bridge this gap. Developed using React Native (Expo) and modern responsive web standards on the frontend, a scalable Node.js and Express.js application server with Socket.IO real-time messaging on the backend, a Python Scikit-Learn and NLTK analytical layer for semantic text processing, and a cloud-hosted MongoDB Atlas NoSQL database, the system provides a cohesive, human-centered environment for meaningful community building.'
        ]
      },
      {
        code: '1.2',
        heading: 'Problem Statement',
        paragraphs: [
          'Current social networking paradigms suffer from four critical structural flaws that exacerbate social fragmentation and digital isolation among students, remote professionals, and young adults:',
          '1. Passive Content Consumption: Traditional platforms center the user experience around an infinite vertical feed. Users spend the vast majority of their session duration passively consuming third-party media rather than participating in direct, meaningful dialogue with peers who share their curiosity.',
          '2. Inefficient and Superficial Matching: Existing discovery mechanisms rely heavily on mutual social graphs ("friends of friends"), coarse geographical proximity, or superficial profile swiping. These heuristics fail to surface connections grounded in specific intellectual, academic, technical, or creative interests.',
          '3. Vocabulary Mismatch and Lack of Semantic Context: Basic keyword-matching systems fail when two users express the exact same passion using different terminology or abbreviations. For example, a user listing "AI" and "ML" as their interests is frequently missed by naive string-matching systems when compared against a peer who lists "Artificial Intelligence" and "Machine Learning."',
          '4. Absence of Structured Role-Based Governance and Community Safety: Open networking platforms often lack granular moderation controls. Without clear separation between regular community members and platform administrators—and without flexible enforcement tools such as temporary cooldowns ("soft-bans"), permanent bans, and message moderation—online spaces can quickly degrade in conversational quality.'
        ]
      },
      {
        code: '1.3',
        heading: 'Motivation and Research Significance',
        paragraphs: [
          'Social isolation is a pressing public health and psychological concern, particularly among university students enrolled in online degree programs, remote software engineers, and individuals transitioning into new academic or professional fields. When individuals lack accessible avenues to discuss their niche interests—whether Artificial Intelligence, Spring Boot microservices, UI/UX design, mindfulness, or strategy games—they experience intellectual and social disconnection.',
          'The primary motivation behind this work is to engineer a "targeted interaction" environment that eliminates the friction and randomness of social discovery. Rather than exposing users to noisy public timelines or complex machine-speak, the platform provides a warm, natural interface where members simply select or type the topics they care about. Behind the scenes, an intelligent TF-IDF vectorization and Cosine Similarity matching engine evaluates semantic overlap across the community and introduces compatible peers who can immediately transition into real-time WebSocket conversations.'
        ]
      },
      {
        code: '1.4',
        heading: 'Objectives and Scope of the Project',
        paragraphs: [
          'The overarching objective of this project is to design, build, test, and deploy a production-ready prototype of an Algorithm-Based Networking Platform that fosters genuine human dialogue. Specifically, the project accomplishes the following technical objectives:',
          '• To design and implement a clean, jargon-free client interface (supporting both web browsers and mobile devices via React Native / Expo) that prioritizes human connection over passive feed scrolling.',
          '• To implement a robust Role-Based Access Control (RBAC) architecture that distinguishes between Regular Members (who access only My Interests, Discover People, and Real-Time Messages) and Platform Administrators (who possess full database visibility, user moderation controls, and diagnostic tools).',
          '• To equip administrators with comprehensive community safety powers, including permanent account bans, time-bounded temporary soft-bans (e.g., 15 minutes, 1 hour, 24 hours, or 7 days with automated expiration), instant account restoration, role promotion/demotion, and permanent account or message deletion.',
          '• To develop an NLP Data Preprocessing and Matching Engine utilizing tokenization, stop-word removal, semantic synonym normalization, Term Frequency–Inverse Document Frequency (TF-IDF) vectorization, and Cosine Similarity.',
          '• To integrate a low-latency, room-based real-time messaging layer using Socket.IO WebSockets alongside persistent cloud storage in MongoDB Atlas.'
        ]
      },
      {
        code: '1.5',
        heading: 'Proposed Modular Development Approach',
        paragraphs: [
          'To ensure maintainability, extensibility, and rigorous verification, the platform was engineered following an iterative, modular software development lifecycle:',
          '• Phase 1 — Requirement & Domain Analysis: Identifying functional workflows for member onboarding, interest curation, semantic matching, real-time chat, and administrative moderation.',
          '• Phase 2 — Multi-Tier Architectural Design: Establishing clean RESTful and WebSocket contracts between the presentation layer, the Node.js/Express application layer, the Python NLP microservice, and the MongoDB Atlas cloud database.',
          '• Phase 3 — Incremental Module Implementation: Developing isolated, testable services for User Management, RBAC Moderation, Topic Management, NLP Preprocessing, Cosine Similarity Calculation, Match Recommendation, and Socket.IO Chat.',
          '• Phase 4 — System Testing & Live Cloud Verification: Validating functional test cases (TC-01 through TC-10) against a live MongoDB Atlas cluster (`matching_app`) and benchmarking end-to-end API response latency.'
        ]
      }
    ]
  },
  {
    number: '2',
    title: 'LITERATURE SURVEY & SOFTWARE REQUIREMENT ANALYSIS',
    sections: [
      {
        code: '2.1',
        heading: 'Review of Related Literature and Social Discovery Systems',
        paragraphs: [
          'Research into computer-mediated communication (CMC) and recommender systems has evolved significantly over the past decade. Early social networks relied on explicit social graph traversal (Friend-of-a-Friend algorithms), where link prediction was formulated as a graph topology problem using metrics such as Common Neighbors, Jaccard Coefficient, and Adamic-Adar indices. While effective for digitizing pre-existing offline acquaintances, graph-based recommenders suffer from the "cold-start problem" when an isolated individual seeks to form entirely new connections outside their current social circle.',
          'Content-based filtering and vector space models, pioneered in information retrieval by Salton and Buckley (TF-IDF weighting) and further formalized in modern Natural Language Processing (Eisenstein, 2019), offer a compelling solution to the cold-start social discovery problem. By representing each user profile as a high-dimensional feature vector derived from their self-described interests, interpersonal compatibility can be computed geometrically via the cosine of the angle between user vectors.',
          'However, classical bag-of-words TF-IDF models treat orthographically distinct synonyms (such as "AI" and "Artificial Intelligence", or "JS" and "JavaScript") as orthogonal dimensions, yielding zero similarity. Our platform overcomes this limitation by introducing a domain-aware Semantic Synonym and Acronym Normalization pipeline prior to TF-IDF vectorization, ensuring that semantically identical topics map to shared canonical feature tokens.'
        ]
      },
      {
        code: '2.2',
        heading: 'Hardware Requirements Specification',
        paragraphs: [
          'To support concurrent execution of the Node.js/Express application server, WebSocket event loop, Python NLP microservice, and client rendering environment, the hardware specifications detailed below are established for development and deployment.'
        ],
        table: {
          caption: 'Table 2.1: Hardware Requirements Specification across Tiers',
          headers: ['Component', 'Minimum Specification', 'Recommended Specification', 'Operational Purpose'],
          rows: [
            ['Processor (CPU)', 'Intel Core i5 (Quad-Core, 2.4 GHz)', 'Intel Core i7 / AMD Ryzen 7 (8-Core)', 'Concurrent Node.js, Python NLP & Metro bundler processes'],
            ['Memory (RAM)', '8 GB DDR4', '16 GB DDR4 / DDR5', 'In-memory TF-IDF matrix calculation & browser/emulator instances'],
            ['Storage Drive', '256 GB SATA SSD', '512 GB NVMe M.2 SSD', 'Fast package resolution, local cache & log persistence'],
            ['Network Interface', 'Broadband 10 Mbps', 'Low-latency Fiber 50+ Mbps', 'Real-time WebSocket frames & MongoDB Atlas TLS connection'],
            ['Client Device', 'Any Smartphone or Desktop Browser', 'Android 12+ / iOS 16+ / Modern Web', 'Executing the React Native (Expo) & Responsive Web UI']
          ]
        }
      },
      {
        code: '2.3',
        heading: 'Software Requirements Specification',
        paragraphs: [
          'The software stack combines a modern JavaScript/TypeScript application ecosystem with Python scientific computing libraries and cloud-native NoSQL storage.'
        ],
        table: {
          caption: 'Table 2.2: Software & Technology Stack Specification',
          headers: ['Layer / Category', 'Technology / Package', 'Version', 'Role in the Platform'],
          rows: [
            ['Operating System', 'Windows 10/11, macOS, or Linux', '64-bit OS', 'Cross-platform development and server hosting'],
            ['Frontend Mobile/Web', 'React Native (Expo) & Tailwind Web', 'Expo SDK 54 / React 19', 'Cross-platform mobile and browser user interface'],
            ['Backend Runtime', 'Node.js with Express.js', 'Node v24.x / Express 4.19', 'RESTful API server, authentication & RBAC enforcement'],
            ['Cloud Database', 'MongoDB Atlas + Mongoose ODM', 'MongoDB 7.0 / Mongoose 8.5', 'Cloud NoSQL document storage for users, topics, matches, chats'],
            ['AI / NLP Engine', 'Python + Scikit-Learn + NLTK', 'Python 3.11+ / Sklearn 1.3+', 'Tokenization, stop-word removal, TF-IDF & Cosine Similarity'],
            ['Real-Time Layer', 'Socket.IO (Server & Client)', 'v4.7.5', 'Low-latency bidirectional WebSocket rooms & live moderation push'],
            ['Security & Auth', 'JSON Web Tokens (jsonwebtoken) & bcryptjs', 'JWT 9.0 / Bcrypt 2.4', 'Password salting/hashing and stateless session authentication']
          ]
        }
      },
      {
        code: '2.4',
        heading: 'Functional and Role-Based Requirements',
        paragraphs: [
          'A core architectural requirement of the platform is providing a natural, clutter-free experience for regular community members while granting comprehensive governance capabilities to administrators:',
          '1. Regular Member Functional Requirements (`role: "user"`):',
          '• Onboarding & Profile Creation: Users can register with their name, email, password, and short bio, or sign in to an existing account.',
          '• Interest Curation ("My Interests" Tab): Users can browse curated topics across categories (AI & Data Science, Software & Web Engineering, Creative Arts & Design, Wellness & Outdoors, Gaming & Sci-Fi), toggle selections, and add custom topics.',
          '• Clean Match Discovery ("Discover" Tab): Users view compatible members ranked by match percentage (e.g., 86% Match), see shared interest tags and community themes, and initiate conversations without being exposed to technical machine-speak or internal diagnostic tools.',
          '• Real-Time Messaging ("Messages" Tab): Users exchange instant messages with matched peers, view online indicators, and use contextual conversation starters.',
          '2. Administrator Functional Requirements (`role: "admin"`):',
          '• Full Member Directory & Role Management: Administrators can view all registered accounts, promote regular members to Admin, or demote admins to Member.',
          '• Temporary Soft-Ban Enforcement: Administrators can apply time-bounded suspensions (15 minutes, 1 hour, 24 hours, or 7 days) with a custom note. Soft-banned users are immediately disconnected via Socket.IO and blocked from logging in or sending messages until the timer automatically expires.',
          '• Permanent Ban & Account Restoration: Administrators can permanently suspend abusive accounts (hiding them from discovery) or lift any active ban with a single click.',
          '• Account & Message Deletion: Administrators can permanently remove any user account (cascading deletion across matches and messages) or delete specific chat messages.',
          '• Match Simulator, Automated Health Checks & Database Control: Administrators have exclusive access to the semantic compatibility sandbox, automated test suite runner (TC-01 to TC-04), and live MongoDB Atlas configuration.'
        ]
      }
    ]
  },
  {
    number: '3',
    title: 'SYSTEM ANALYSIS & FEASIBILITY STUDY',
    sections: [
      {
        code: '3.1',
        heading: 'Multi-Dimensional Feasibility Study',
        paragraphs: [
          'Before committing to full-scale implementation, a rigorous feasibility analysis was conducted across five operational dimensions to validate the viability of the platform:',
          '• Technical Feasibility: The combination of React Native/Web, Node.js, Python Scikit-Learn, and MongoDB Atlas represents a battle-tested, industry-standard architecture. Furthermore, by implementing a dual-engine design—where the Node.js backend seamlessly delegates to the Python NLP microservice when active and falls back to an identical built-in TF-IDF + Cosine Similarity engine—the system guarantees 100% operational availability across any host environment.',
          '• Economic Feasibility: Every framework, library, and runtime utilized in the project (Node.js, Express, React Native, Socket.IO, Scikit-Learn, NLTK) is open-source, and the cloud database runs on the MongoDB Atlas M0/Flex tier. Consequently, capital expenditure is near zero while supporting horizontal scalability.',
          '• Operational Feasibility: The user interface was intentionally stripped of engineering jargon ("machine speak"). Regular members interact with intuitive, human-friendly concepts—Interests, Match Percentage, and Messages—while complex diagnostics and moderation tools are cleanly encapsulated inside the Admin Control Center.',
          '• Social & Ethical Feasibility: By prioritizing substantive shared interests and equipping community administrators with graduated moderation tools (such as temporary 1-hour soft-bans rather than only permanent deletion), the platform fosters a safe, welcoming, and psychologically healthy digital environment.'
        ]
      },
      {
        code: '3.2',
        heading: 'Comparative Analysis: Existing System vs. Proposed System',
        paragraphs: [
          'Traditional social networks optimize for ad-impression time rather than interpersonal connection quality. Table 3.1 contrasts the structural characteristics of conventional feed-based networks with our proposed Algorithm-Based Networking Platform.'
        ],
        table: {
          caption: 'Table 3.1: Structural Comparison of Existing Social Networks vs. Proposed Platform',
          headers: ['Evaluation Criterion', 'Existing Feed-Based Platforms', 'Proposed Algorithm-Based Platform (Kindred)'],
          rows: [
            ['Primary User Activity', 'Passive scrolling through algorithmic media feeds', 'Active topic curation and 1-on-1 real-time dialogue'],
            ['Discovery Mechanism', 'Mutual friend graphs, location, or popularity metrics', 'TF-IDF Vectorization & Cosine Similarity on user interests'],
            ['Semantic Understanding', 'Exact keyword or hashtag matching only', 'NLP synonym & acronym normalization (e.g., "AI" = "Artificial Intelligence")'],
            ['User Interface Language', 'Cluttered with vanity metrics, ads, or technical jargon', 'Warm, natural, human-centric copy tailored to user role'],
            ['Access Control & Safety', 'Coarse reporting with slow manual review', 'Real-time Admin RBAC with instant Soft-Ban, Permanent Ban & Unban'],
            ['Real-Time Transition', 'Delayed or requires mutual follow requests', 'Instant room-based WebSocket chat upon match discovery']
          ]
        }
      },
      {
        code: '3.3',
        heading: 'Role-Based Access Control (RBAC) and Moderation State Machine',
        paragraphs: [
          'To maintain community trust without over-policing, the platform implements a three-state account lifecycle managed by Administrators: Active (`active`), Temporarily Soft-Banned (`soft_banned`), and Permanently Banned (`banned`).',
          'When an Administrator applies a Soft-Ban, the backend records `accountStatus = "soft_banned"`, computes `softBanUntil = Date.now() + durationMinutes * 60000`, and stores the moderator note in `banReason`. An instant WebSocket event (`userModerated`) is broadcast so that if the restricted user is currently online, their session is immediately terminated with a clear explanation. Whenever any user attempts to sign in or perform an API action, the `normalizeUserBan()` middleware checks whether `softBanUntil <= Date.now()`; if the cooldown period has elapsed, the account automatically transitions back to `active` without requiring manual administrator intervention.'
        ]
      }
    ]
  },
  {
    number: '4',
    title: 'SYSTEM DESIGN & ARCHITECTURAL MODELING',
    sections: [
      {
        code: '4.1',
        heading: 'Four-Tier System Architecture',
        paragraphs: [
          'The platform follows a modular four-tier client-server and microservice architecture designed for separation of concerns, low latency, and horizontal scalability:',
          '1. Presentation Tier (React Native Expo & Responsive Web Client): Renders role-specific navigation and views. Regular users see three streamlined tabs (My Interests, Discover, Messages), whereas authenticated Administrators additionally unlock the Admin Control Center.',
          '2. Application & Real-Time Tier (Node.js, Express.js & Socket.IO): Exposes RESTful endpoints for authentication, interest updates, match retrieval, and admin moderation, while managing persistent WebSocket rooms for real-time chat and live moderation push notifications.',
          '3. Analytical AI/NLP Tier (Python Scikit-Learn & MatchingEngine Service): Performs text normalization, stop-word removal, semantic synonym expansion, TF-IDF vectorization, Cosine Similarity computation, and thematic clustering.',
          '4. Cloud Data Persistence Tier (MongoDB Atlas + Local Fault-Tolerant Backup): Stores structured documents across four collections (`users`, `topics`, `matches`, and `messages`) in the `matching_app` database on MongoDB Atlas.'
        ],
        image: {
          file: 'screenshots/diagram_system_architecture.png',
          caption: 'Figure 4.1: Four-Tier System Architecture & Role-Based Access Control (RBAC) Diagram'
        }
      },
      {
        code: '4.2',
        heading: 'Data Flow Diagrams (DFD Level 0 and Level 1)',
        paragraphs: [
          'Data Flow Diagrams illustrate how user-supplied profile credentials, interest selections, and chat messages traverse the system processes and data stores.',
          '• DFD Level 0 (Context Diagram): Depicts the user interacting with the Networking Platform as a unified black-box system, supplying profile data and interest topics while receiving ranked match recommendations and real-time chat capabilities.',
          '• DFD Level 1 (Process Decomposition): Decomposes the platform into its core functional processes—Process 1.0 (User Management & RBAC), Process 2.0 (Topic Management), Process 3.0 (NLP Matching Engine), and Process 4.0 (Real-Time Communication)—interacting with the User Database (D1) and Topics Database (D2).'
        ],
        images: [
          {
            file: 'original_docx/word/media/image9.png',
            caption: 'Figure 4.2: DFD Level 0 — Context Diagram of the Networking Platform'
          },
          {
            file: 'original_docx/word/media/image10.png',
            caption: 'Figure 4.3: DFD Level 1 — Process Decomposition Diagram'
          }
        ]
      },
      {
        code: '4.3',
        heading: 'Use Case Diagram and Sequence Diagram',
        paragraphs: [
          'The Use Case Diagram defines the functional boundaries of the platform, illustrating how actors interact with core use cases including Register/Login, Manage Topics, View Recommendations, Initiate Chat, and System Evaluation / Administration.',
          'The Sequence Diagram details the chronological message flow when a user updates their topics of interest: (1) The user selects topics in the client UI; (2) The frontend dispatches `POST /api/topics` to the Node.js backend; (3) The backend persists the updated profile in MongoDB Atlas and invokes the NLP Matching Engine to compute pairwise Cosine Similarity scores; (4) Ranked matches are returned to update the UI immediately.'
        ],
        images: [
          {
            file: 'original_docx/word/media/image11.png',
            caption: 'Figure 4.4: UML Use Case Diagram of the Networking Platform'
          },
          {
            file: 'original_docx/word/media/image12.png',
            caption: 'Figure 4.5: UML Sequence Diagram — Topic Selection and Matching Flow'
          }
        ]
      },
      {
        code: '4.4',
        heading: 'Entity-Relationship (ER) Diagram and MongoDB Collection Schemas',
        paragraphs: [
          'Although MongoDB is a document-oriented NoSQL database, modeling the logical relationships between entities via an Entity-Relationship (ER) Diagram ensures referential integrity across collections. As shown in Figure 4.6, the `USER` entity selects multiple `TOPIC` records, participates in pairwise `MATCH` records quantified by a similarity score, and exchanges `MESSAGE` documents within a matched conversation room.'
        ],
        image: {
          file: 'original_docx/word/media/image13.png',
          caption: 'Figure 4.6: Entity-Relationship (ER) Diagram (`USER`, `TOPIC`, `MATCH`, `MESSAGE`)'
        },
        tables: [
          {
            caption: 'Table 4.1: User Profiles Collection Schema (`users`)',
            headers: ['Field Name', 'Data Type', 'Constraint / Default', 'Description'],
            rows: [
              ['_id', 'ObjectId', 'Primary Key (Auto)', 'Unique MongoDB document identifier for the user'],
              ['username', 'String', 'Unique, Not Null', 'User display name shown in discovery and chat'],
              ['email', 'String', 'Unique, Not Null, Lowercase', 'Registered email address used for authentication'],
              ['password', 'String', 'Not Null (Bcrypt Hash)', 'Salted and hashed authentication credential'],
              ['role', 'String (Enum)', '"user" | "admin"', 'Determines Member vs. Administrator permissions'],
              ['topics', 'Array<String>', 'Default: []', 'List of active interest topics selected by the user'],
              ['clusterTheme', 'String', 'Default: "General"', 'Primary thematic cluster assigned by the NLP engine'],
              ['accountStatus', 'String (Enum)', '"active" | "soft_banned" | "banned"', 'Moderation state enforced during login and API calls'],
              ['softBanUntil', 'Date / Null', 'Default: null', 'Timestamp when a temporary soft-ban automatically expires'],
              ['banReason', 'String', 'Default: ""', 'Administrator note explaining the moderation restriction'],
              ['createdAt', 'Date', 'Default: Date.now', 'Account registration timestamp']
            ]
          },
          {
            caption: 'Table 4.2: Topics and Interests Collection Schema (`topics`)',
            headers: ['Field Name', 'Data Type', 'Constraint / Default', 'Description'],
            rows: [
              ['_id (topic_id)', 'ObjectId', 'Primary Key (Auto)', 'Unique identifier for the topic document'],
              ['user_id', 'ObjectId', 'Foreign Key (ref: User)', 'Reference to the user who created/selected the topic'],
              ['topic_name', 'String', 'Not Null, Trimmed', 'Canonical display name of the interest topic'],
              ['category', 'String', 'Default: "Community"', 'High-level category grouping (e.g., AI & Data Science)'],
              ['topic_list', 'Array<String>', 'Not Null', 'Associated keywords and sub-topics for matching']
            ]
          },
          {
            caption: 'Table 4.3: Match History Collection Schema (`matches`)',
            headers: ['Field Name', 'Data Type', 'Constraint / Default', 'Description'],
            rows: [
              ['_id (match_id)', 'ObjectId', 'Primary Key (Auto)', 'Unique identifier for the match pair record'],
              ['user1_id', 'ObjectId', 'Foreign Key (ref: User)', 'First user in the evaluated pair'],
              ['user2_id', 'ObjectId', 'Foreign Key (ref: User)', 'Second user in the evaluated pair'],
              ['similarityScore', 'Number (Float)', '0.0 to 1.0', 'Cosine similarity score calculated by MatchingEngine'],
              ['sharedTopics', 'Array<String>', 'Default: []', 'Normalized semantic tokens shared between both users'],
              ['clusterTheme', 'String', 'Default: "Community"', 'Shared community cluster label']
            ]
          },
          {
            caption: 'Table 4.4: Chat Messages Collection Schema (`messages`)',
            headers: ['Field Name', 'Data Type', 'Constraint / Default', 'Description'],
            rows: [
              ['_id (msg_id)', 'ObjectId', 'Primary Key (Auto)', 'Unique identifier for the chat message'],
              ['match_id', 'String (Indexed)', 'Not Null', 'Deterministic room identifier (`sorted(user1, user2)`)'],
              ['senderId', 'String', 'Not Null', 'User ID of the message author'],
              ['senderName', 'String', 'Not Null', 'Display name of the sender'],
              ['receiverId', 'String', 'Not Null', 'User ID of the message recipient'],
              ['content / message', 'String', 'Not Null, Trimmed', 'Text body of the real-time chat message'],
              ['timestamp', 'Date', 'Default: Date.now', 'Exact server timestamp of message delivery']
            ]
          }
        ]
      }
    ]
  },
  {
    number: '5',
    title: 'DETAILED MODULE DESCRIPTION & MATHEMATICAL FOUNDATIONS',
    sections: [
      {
        code: '5.1',
        heading: 'User Management & Role-Based Access Control (RBAC) Module',
        paragraphs: [
          'The User Management Module serves as the security gateway of the application. During registration (`POST /api/auth/register`), user passwords are salted and hashed using `bcryptjs` (10 rounds) before persistence in MongoDB Atlas. Upon login (`POST /api/auth/login`), credentials are verified and a signed JSON Web Token (JWT) containing `{ userId, email, role }` is issued.',
          'Crucially, this module enforces role separation between `user` (Regular Member) and `admin` (Platform Administrator). In the client interface, regular members are presented with a clean, three-tab layout (My Interests, Discover, Messages) free of administrative controls or diagnostic jargon. Administrators are dynamically granted access to the fourth tab (`Admin Console`) and `/api/admin/*` endpoints.'
        ]
      },
      {
        code: '5.2',
        heading: 'Community Safety & Admin Moderation Module (Ban, Soft-Ban & Delete)',
        paragraphs: [
          'To empower administrators with complete control over platform safety and database hygiene, the Admin Moderation Module implements five granular actions via `PATCH /api/admin/users/:id/moderate` and `DELETE /api/admin/users/:id`:',
          '• Temporary Soft-Ban (`action: "soft_ban"`): Suspends a user for a configurable duration (15 minutes, 1 hour, 24 hours, or 7 days) with an explanatory note. Soft-banned users cannot sign in, modify topics, or send chat messages until `softBanUntil` elapses, at which point the system automatically restores their status to `active`.',
          '• Permanent Ban (`action: "ban"`): Permanently blocks the user from logging in and filters their profile out of regular members\' Discover feeds.',
          '• Instant Unban (`action: "unban"`): Clears `softBanUntil` and `banReason`, immediately restoring full access.',
          '• Role Toggle (`role: "admin" | "user"`): Promotes trusted members to Administrator or reverts an administrator to regular Member status.',
          '• Cascading Account & Message Deletion (`DELETE /api/admin/users/:id`, `DELETE /api/admin/messages/:id`): Permanently deletes a user document alongside all associated match records and chat history in MongoDB Atlas.'
        ]
      },
      {
        code: '5.3',
        heading: 'NLP Data Preprocessing Module (`preprocessText`)',
        paragraphs: [
          'Raw user-entered topics often contain punctuation noise, mixed casing, English stop-words, and shorthand acronyms. The `MatchingEngine.preprocessText(rawText)` method standardizes input through a four-stage pipeline:',
          '1. Case Normalization & Phrase Splitting: Converts input text to lowercase and segments comma- or semicolon-delimited phrases.',
          '2. Semantic Synonym & Acronym Expansion: Maps domain acronyms and synonyms to canonical token groups so that semantic equivalents are recognized. For example, `"ai"` and `"artificial intelligence"` both normalize to `"artificial intelligence ai"`; `"ml"` and `"machine learning"` normalize to `"machine learning ml"`; `"nlp"` and `"natural language processing"` normalize to `"natural language processing nlp"`.',
          '3. Alphanumeric Tokenization: Extracts clean lexical word tokens via regular expression matching (`/[a-z0-9]+/g`).',
          '4. Stop-Word Removal & Deduplication: Filters out non-informative English stop-words (such as `"and"`, `"the"`, `"in"`, `"of"`, `"for"`) and deduplicates repeated tokens within a single user profile so term frequencies remain balanced.'
        ]
      },
      {
        code: '5.4',
        heading: 'Mathematical Formulation of TF-IDF and Cosine Similarity',
        paragraphs: [
          'Once two user profiles A and B are preprocessed into filtered token lists T_A and T_B, the Matching Algorithm Module constructs a joint vocabulary V = T_A U T_B of dimensionality d = |V|. Each user profile is transformed into a numerical vector using Term Frequency-Inverse Document Frequency (TF-IDF) weighting (matching Scikit-Learn\'s smooth IDF formulation):',
          '  tf(t, D) = count of term t in document D',
          '  idf(t)   = ln( (1 + N) / (1 + df(t)) ) + 1',
          '  w(t, D)  = tf(t, D) x idf(t)',
          'where N = 2 is the number of profiles being compared in the pairwise corpus and df(t) in {1, 2} is the number of profiles containing token t. This produces two d-dimensional numerical vectors u_A and u_B.',
          'The similarity between User A and User B is then computed using Cosine Similarity, defined as the normalized dot product of their TF-IDF vectors:',
          '  CosineSimilarity(u_A, u_B) = Sum_{i=1..d}(u_A[i] * u_B[i]) / ( sqrt(Sum(u_A[i]^2)) * sqrt(Sum(u_B[i]^2)) )',
          'Because all TF-IDF weights are non-negative, the resulting similarity score lies strictly in the interval [0.0, 1.0], where 1.0 (100% Match) indicates identical semantic interest profiles and 0.0 indicates disjoint interests.',
          'Worked Numerical Example 1 (TC-03 - Semantic Synonym Recognition): Suppose User A enters "AI" and User B enters "Artificial Intelligence". After preprocessText(), both profiles expand to the exact same canonical token set ["artificial", "intelligence", "ai"]. Their TF-IDF vectors are identical: u_A = [1, 1, 1] and u_B = [1, 1, 1]. Consequently, CosineSimilarity(u_A, u_B) = 3 / (sqrt(3) * sqrt(3)) = 1.0000 (100% Match).',
          'Worked Numerical Example 2 (Appendix D.1 Benchmark): Suppose User A enters "coding, java" (["coding", "java"]) and User B enters "java, spring boot" (["java", "spring", "boot"]). The joint vocabulary is V = ["coding", "java", "spring", "boot"]. The shared token "java" has df = 2 (idf = ln(3/3) + 1 = 1.0), whereas non-shared tokens have df = 1 (idf = ln(3/2) + 1 = 1.4055). Computing the dot product and Euclidean norms yields CosineSimilarity = 1.0 / (sqrt(1.4055^2 + 1^2) * sqrt(1^2 + 1.4055^2 + 1.4055^2)) = 0.2606.'
        ]
      },
      {
        code: '5.5',
        heading: 'Recommendation, Real-Time Communication & Evaluation Modules',
        paragraphs: [
          '• Recommendation Module: Iterates over active candidate profiles, invokes `MatchingEngine.computeSimilarity()`, persists the resulting `Match` document in MongoDB Atlas, and returns candidates sorted in descending order of `similarityScore` along with their shared semantic tokens and community cluster badge.',
          '• Real-Time Communication Module (`ChatService`): Built on Socket.IO, this module assigns each matched pair a deterministic private room ID (`[user1Id, user2Id].sort().join("_")`). When a user opens a conversation, the client emits `joinMatch(matchId)`. When a message is sent via `privateMessage` or `POST /api/messages`, `ChatService.sendMessage()` validates that the sender is not banned/soft-banned, saves the `Message` document in MongoDB Atlas, and broadcasts `newMessage` to all sockets in the room with sub-20ms latency.',
          '• Evaluation Module: Continuously monitors API latency (`latencyMetrics`), active WebSocket connections, collection counts, and executes the automated verification suite (`POST /api/evaluation/run-tests`).'
        ]
      }
    ]
  },
  {
    number: '6',
    title: 'SYSTEM IMPLEMENTATION, API SPECIFICATION & TESTING',
    sections: [
      {
        code: '6.1',
        heading: 'RESTful API & WebSocket Endpoint Specification',
        paragraphs: [
          'The Node.js and Express.js backend exposes a structured set of RESTful endpoints and Socket.IO events to serve both the Regular Member UI and the Admin Control Center. Table 6.1 documents the complete API contract.'
        ],
        table: {
          caption: 'Table 6.1: Complete RESTful API and WebSocket Event Specification',
          headers: ['Method / Event', 'Endpoint / Channel', 'Access Role', 'Functional Description'],
          rows: [
            ['POST', '/api/auth/register', 'Public', 'Registers a new user account with bcrypt password hashing'],
            ['POST', '/api/auth/login', 'Public', 'Authenticates user, checks Ban/Soft-Ban status, returns JWT'],
            ['GET', '/api/users', 'Authenticated', 'Returns sanitized list of community profiles'],
            ['GET', '/api/topics', 'Authenticated', 'Returns curated topic catalog and user topic records'],
            ['POST', '/api/topics', 'Member / Admin', 'Updates user interests, runs NLP engine & recalculates matches'],
            ['GET', '/api/matches/:userId', 'Member / Admin', 'Returns ranked match recommendations (hides banned users)'],
            ['GET', '/api/messages/:matchId', 'Member / Admin', 'Retrieves persistent chat history for a match room'],
            ['POST', '/api/messages', 'Member / Admin', 'Persists a chat message and broadcasts via Socket.IO'],
            ['POST', '/api/nlp/preprocess', 'Admin', 'Tokenizes text, removes stop-words & assigns cluster theme'],
            ['POST', '/api/nlp/similarity', 'Admin', 'Calculates pairwise TF-IDF Cosine Similarity score'],
            ['GET', '/api/admin/overview', 'Admin Only', 'Returns all users, bans, recent messages, and DB metrics'],
            ['PATCH', '/api/admin/users/:id/moderate', 'Admin Only', 'Applies Soft-Ban, Permanent Ban, Unban, or Role Toggle'],
            ['DELETE', '/api/admin/users/:id', 'Admin Only', 'Permanently deletes a user and their matches/messages'],
            ['DELETE', '/api/admin/messages/:id', 'Admin Only', 'Deletes a specific chat message for content moderation'],
            ['POST', '/api/evaluation/run-tests', 'Admin Only', 'Executes automated system health checks (TC-01 to TC-04)'],
            ['Socket.IO', 'joinMatch / privateMessage', 'Member / Admin', 'Joins private match room and transmits real-time messages'],
            ['Socket.IO', 'userModerated / userDeleted', 'System Push', 'Instantly notifies & signs out banned/soft-banned clients']
          ]
        }
      },
      {
        code: '6.2',
        heading: 'Comprehensive System Testing & Verification Log',
        paragraphs: [
          'System testing was conducted across unit, integration, functional, security/RBAC, and performance dimensions against the live MongoDB Atlas cluster (`cluster0.j340nle.mongodb.net/matching_app`). Table 6.2 presents the expanded 10-case System Test Log verifying all functional and administrative requirements.'
        ],
        table: {
          caption: 'Table 6.2: Comprehensive System Test Log (TC-01 to TC-10)',
          headers: ['Test ID', 'Module / Requirement', 'Test Input / Action', 'Expected Output', 'Actual Output', 'Result'],
          rows: [
            ['TC-01', 'Account Registration', 'Valid Name, Email & Password', 'Account created with hashed password', 'User document stored in Atlas', 'PASS'],
            ['TC-02', 'High Similarity Matching', 'Topics: "AI", "ML" vs "AI, Machine Learning"', 'Cosine Similarity score > 0.80', 'Match score: 1.00 (100% Match)', 'PASS'],
            ['TC-03', 'NLP Synonym Check', '"AI" vs "Artificial Intelligence"', 'Semantic match identified (> 0.80)', 'Match identified (Score: 1.00)', 'PASS'],
            ['TC-04', 'Real-Time Messaging', 'Send message in Match Room', 'Instant Socket.IO delivery & DB save', 'Delivered in < 15ms & persisted', 'PASS'],
            ['TC-05', 'Member Role Isolation', 'Sign in as Regular Member (Ananya)', 'Only 3 tabs visible; no Admin/NLP UI', '3 tabs rendered; Admin hidden', 'PASS'],
            ['TC-06', 'Admin Console Access', 'Sign in as Admin (Gavin Paul P)', '4th tab (Admin Console) unlocked', 'Full Admin Console accessible', 'PASS'],
            ['TC-07', 'Temporary Soft-Ban', 'Admin soft-bans Karthik for 60 mins', 'User signed out & blocked until expiry', 'HTTP 403 with expiry timestamp', 'PASS'],
            ['TC-08', 'Permanent Account Ban', 'Admin permanently bans user', 'Blocked from login & hidden in Discover', 'User blocked & excluded from feed', 'PASS'],
            ['TC-09', 'Lift Ban / Restore', 'Admin clicks "Lift Ban / Restore"', 'Account status restored to "active"', 'User can log in and chat normally', 'PASS'],
            ['TC-10', 'Cascading User Delete', 'Admin deletes test account', 'User, matches & messages removed', 'All linked records deleted in Atlas', 'PASS']
          ]
        }
      }
    ]
  },
  {
    number: '7',
    title: 'WORKING MODEL WALKTHROUGH & OUTPUT SCREENS',
    sections: [
      {
        code: '7.1',
        heading: 'Backend Server & MongoDB Atlas Cloud Connection',
        paragraphs: [
          'The working model is launched via the Node.js application server (`node server.js` or the one-click `start.bat` launcher). Upon startup, the server loads environment credentials from `backend/.env`, establishes a TLS connection to the MongoDB Atlas cluster (`matching_app`), verifies role assignments across seeded profiles, and initializes the Socket.IO real-time messaging layer on port 5000.'
        ],
        image: {
          file: 'screenshots/screen_00_terminal.png',
          caption: 'Figure 7.1: Live Windows Terminal Output Showing Backend Startup & MongoDB Atlas Connection'
        }
      },
      {
        code: '7.2',
        heading: 'Authentication Screen & Quick Role Switcher',
        paragraphs: [
          'When visiting `http://localhost:5000`, users are greeted by the Kindred authentication interface. The screen uses warm, natural language ("Meet people who share your passions") without any intimidating technical jargon. For rapid demonstration and grading, the bottom panel provides one-click switching between pre-seeded Administrator accounts (`Gavin Paul P`, `Rohith Kumar`) and Regular Member accounts (`Ananya Sharma`, `Karthik Rajan`, `Meera Nair`).'
        ],
        images: [
          {
            file: 'screenshots/screen_01_login.png',
            caption: 'Figure 7.2: Sign In Screen with Admin and Member Quick-Switch Profiles'
          },
          {
            file: 'screenshots/screen_02_register.png',
            caption: 'Figure 7.3: New Community Member Registration Screen'
          }
        ]
      },
      {
        code: '7.3',
        heading: 'Regular Member Experience: "My Interests" & "Discover People"',
        paragraphs: [
          'When signed in as a Regular Member (such as Ananya Sharma), the navigation bar displays strictly three tabs: `My Interests`, `Discover`, and `Messages`.',
          '• On the "My Interests" screen (Figure 7.4), members can add custom topics or toggle curated topics across categories. Clicking "Save My Interests & Update Matches" triggers the backend NLP pipeline transparently without exposing raw token arrays to the user.',
          '• On the "Discover" screen (Figure 7.5), members view compatible peers ranked by match percentage (e.g., Gavin Paul P at 86% Match), see shared interests highlighted under "In common", and can jump directly into a conversation. As requested, regular members do not see the internal NLP Cosine Similarity Verifier or evaluation metrics.'
        ],
        images: [
          {
            file: 'screenshots/screen_03_member_interests.png',
            caption: 'Figure 7.4: Regular Member View — "My Interests" Topic Selection Dashboard'
          },
          {
            file: 'screenshots/screen_04_member_discover.png',
            caption: 'Figure 7.5: Regular Member View — "Discover People" Ranked Match Feed'
          }
        ]
      },
      {
        code: '7.4',
        heading: 'Real-Time Messaging Interface',
        paragraphs: [
          'Clicking "Message" on any match card opens the Real-Time Messaging screen (Figure 7.6). Users can switch between active conversations using the top ribbon, see their partner\'s online status (`Online`) and compatibility percentage, click one-tap Conversation Starters ("Say hello!", "Ask about Artificial Intelligence"), and exchange instant messages persisted in MongoDB Atlas.'
        ],
        image: {
          file: 'screenshots/screen_05_member_chat.png',
          caption: 'Figure 7.6: Real-Time Messaging Interface with Conversation Starters and Live Status'
        }
      },
      {
        code: '7.5',
        heading: 'Administrator Experience: Admin Control Center, Bans & Soft-Bans',
        paragraphs: [
          'When signed in as an Administrator (`Gavin Paul P` or `Rohith Kumar`), a fourth navigation tab—`🛡 Admin Console`—is unlocked. As shown in Figure 7.7, administrators have complete visibility over platform metrics and the Member Directory.',
          'From this console, an administrator can promote a member to Admin (`Make Admin`), apply a time-bounded Temporary Soft-Ban (`⏳ Soft-Ban`), enforce a Permanent Ban (`🚫 Ban`), restore a restricted user (`✓ Lift Ban / Restore`), or permanently delete an account (`🗑 Delete`).',
          'Figure 7.8 shows the Soft-Ban configuration modal where an admin selects the suspension duration (15 Minutes, 1 Hour, 24 Hours, or 7 Days) and enters a reason for the member. Figure 7.9 demonstrates the restriction alert displayed when a soft-banned member attempts to sign in before their cooldown expires. Finally, Figure 7.10 shows the Admin Match Simulator, Automated Health Checks table (`TC-01` to `TC-04`), and live MongoDB Atlas connection manager.'
        ],
        images: [
          {
            file: 'screenshots/screen_06_admin_directory.png',
            caption: 'Figure 7.7: Admin Control Center — Member Directory, Role Management & Ban Controls'
          },
          {
            file: 'screenshots/screen_07_admin_softban_modal.png',
            caption: 'Figure 7.8: Admin Temporary Soft-Ban Modal (Duration & Reason Selection)'
          },
          {
            file: 'screenshots/screen_08_banned_login_notice.png',
            caption: 'Figure 7.9: User-Facing Suspension Notice Displayed to a Soft-Banned Account'
          },
          {
            file: 'screenshots/screen_09_admin_tools.png',
            caption: 'Figure 7.10: Admin Match Simulator, Automated Health Checks & MongoDB Atlas Status'
          }
        ]
      }
    ]
  },
  {
    number: '8',
    title: 'CONCLUSIONS, LIMITATIONS & FUTURE ENHANCEMENTS',
    sections: [
      {
        code: '8.1',
        heading: 'Summary of Work',
        paragraphs: [
          'The "Algorithm-Based Networking Platform to Mitigate Social Isolation" project successfully demonstrates how modern Natural Language Processing, vector space similarity modeling, and real-time WebSocket communication can be combined to foster genuine human connection. By replacing passive media feeds with intentional interest-based discovery—and by refining the user experience with natural, human-friendly language alongside role-based administrative moderation—the platform provides a practical, scalable blueprint for healthier digital communities.'
        ]
      },
      {
        code: '8.2',
        heading: 'System Limitations',
        paragraphs: [
          '• Pairwise Computational Scaling: Computing pairwise TF-IDF and Cosine Similarity vectors dynamically scales as O(N) per user update (and O(N^2) across the entire user base), which may require approximate nearest-neighbor (ANN) vector indexing (such as MongoDB Atlas Vector Search or FAISS) when scaling beyond 100,000 concurrent users.',
          '• Language Optimization: The current stop-word corpus and synonym dictionary are primarily optimized for English-language topics.',
          '• Lexical vs. Deep Contextual Semantics: While our synonym expansion dictionary accurately bridges common acronyms and phrases (e.g., "AI" and "Artificial Intelligence"), deeper conceptual relationships across unrelated words require pre-trained transformer embeddings.'
        ]
      },
      {
        code: '8.3',
        heading: 'Future Enhancements and Recommendations',
        paragraphs: [
          '• Transformer-Based Semantic Embeddings: Integrating Sentence-BERT (`all-MiniLM-L6-v2`) or MongoDB Atlas Vector Search to capture nuanced semantic similarity across free-form user bios and multi-sentence topic descriptions.',
          '• Rich Multimedia & WebRTC Rooms: Expanding the real-time communication module to support voice notes, screen sharing, and group study/interest rooms via WebRTC.',
          '• Automated AI Content Safety Assist: Assisting platform administrators by automatically flagging toxic chat messages for soft-ban review using sentiment and toxicity classification models.'
        ]
      }
    ]
  },
  {
    number: '9',
    title: 'REFERENCES & BIBLIOGRAPHY',
    sections: [
      {
        code: '9.1',
        heading: 'Academic Literature and Technical Documentation',
        paragraphs: [
          '1. Eisenstein, Jacob. Introduction to Natural Language Processing. MIT Press, Cambridge, MA, 2019.',
          '2. Salton, Gerard, and Christopher Buckley. "Term-weighting approaches in automatic text retrieval." Information Processing & Management, vol. 24, no. 5, pp. 513–523, 1988.',
          '3. Grinberg, Miguel. Flask Web Development: Developing Web Applications with Python. 2nd Edition, O\'Reilly Media, 2018.',
          '4. Haverbeke, Marijn. Eloquent JavaScript: A Modern Introduction to Programming. 3rd Edition, No Starch Press, 2018.',
          '5. Pedregosa, Fabian, et al. "Scikit-learn: Machine Learning in Python." Journal of Machine Learning Research (JMLR), vol. 12, pp. 2825–2830, 2011.',
          '6. Bird, Steven, Ewan Klein, and Edward Loper. Natural Language Processing with Python: Analyzing Text with the Natural Language Toolkit (NLTK). O\'Reilly Media, 2009.',
          '7. Meta Platforms, Inc. "React Native Official Documentation and Core Components Guide." Accessed 2026. https://reactnative.dev/docs/getting-started',
          '8. MongoDB, Inc. "MongoDB Atlas Cloud Database & Mongoose ODM Data Modeling Guide." Accessed 2026. https://learn.mongodb.com/',
          '9. Node.js Foundation. "Node.js v24.x Documentation: Building RESTful APIs with Express." Accessed 2026. https://nodejs.org/en/docs/',
          '10. Socket.IO Project. "Socket.IO v4 Official Documentation: Bidirectional and Low-Latency Communication." Accessed 2026. https://socket.io/docs/v4/'
        ]
      }
    ]
  }
];

const SOURCE_CODE_APPENDICES = [
  {
    code: 'A.1',
    title: 'Python NLP Matching Engine (nlp_engine/matching_engine.py)',
    description: 'Implements Class MatchingEngine, tokenization, stop-word removal, semantic synonym normalization, TF-IDF vectorization, and Cosine Similarity in Python using Scikit-Learn and NLTK.',
    content: readCodeFile('nlp_engine/matching_engine.py')
  },
  {
    code: 'A.2',
    title: 'Python Flask NLP Microservice API (nlp_engine/app.py)',
    description: 'Exposes REST endpoints (/health, /preprocess, /similarity, /rank-candidates) for cross-runtime invocation from the Node.js server.',
    content: readCodeFile('nlp_engine/app.py')
  },
  {
    code: 'A.3',
    title: 'MongoDB Mongoose User Schema with RBAC & Ban Fields (backend/models/User.js)',
    description: 'Defines the User schema including role ("user" | "admin"), accountStatus ("active" | "soft_banned" | "banned"), softBanUntil, and banReason.',
    content: readCodeFile('backend/models/User.js')
  },
  {
    code: 'A.4',
    title: 'MongoDB Topic, Match, and Message Schemas (backend/models/)',
    description: 'Defines the Mongoose schemas for Topics, pairwise Matches, and real-time Chat Messages stored in MongoDB Atlas.',
    content: [
      '// --- backend/models/Topic.js ---',
      readCodeFile('backend/models/Topic.js'),
      '\n// --- backend/models/Match.js ---',
      readCodeFile('backend/models/Match.js'),
      '\n// --- backend/models/Message.js ---',
      readCodeFile('backend/models/Message.js')
    ].join('\n')
  },
  {
    code: 'A.5',
    title: 'Node.js TF-IDF & Cosine Similarity Matching Engine (backend/services/MatchingEngine.js)',
    description: 'Implements preprocessText(), calculateSimilarity(), smooth TF-IDF vectorization, semantic synonym expansion, and interest clustering.',
    content: readCodeFile('backend/services/MatchingEngine.js')
  },
  {
    code: 'A.6',
    title: 'Real-Time WebSocket Communication Service (backend/services/ChatService.js)',
    description: 'Implements Class ChatService and Socket.IO event listeners (joinMatch, privateMessage, newMessage).',
    content: readCodeFile('backend/services/ChatService.js')
  },
  {
    code: 'A.7',
    title: 'Cloud Database Store & Moderation Persistence Layer (backend/services/DatabaseStore.js)',
    description: 'Manages MongoDB Atlas connection, automatic soft-ban expiration, user role management, cascading user deletion, and local fallback persistence.',
    content: readCodeFile('backend/services/DatabaseStore.js')
  },
  {
    code: 'A.8',
    title: 'Database Seeding & Demo Profile Initialization (backend/seed.js)',
    description: 'Seeds Admin accounts (Gavin Paul P, Rohith Kumar) and Member accounts (Ananya Sharma, Karthik Rajan, Meera Nair, Vikram Aditya), curated topics, and initial matches.',
    content: readCodeFile('backend/seed.js')
  },
  {
    code: 'A.9',
    title: 'Express Application Server, Auth, RBAC & Admin Moderation APIs (backend/server.js)',
    description: 'Complete backend server implementing authentication, ban enforcement, topic updates, match discovery, and admin moderation endpoints.',
    content: readCodeFile('backend/server.js')
  },
  {
    code: 'A.10',
    title: 'React Native (Expo) Cross-Platform Frontend Application (frontend/App.js)',
    description: 'Complete React Native frontend implementing role-based views for Regular Members and Administrators, natural UI copy, and real-time Socket.IO chat.',
    content: readCodeFile('frontend/App.js')
  }
];

module.exports = {
  REPORT_CHAPTERS,
  SOURCE_CODE_APPENDICES
};
