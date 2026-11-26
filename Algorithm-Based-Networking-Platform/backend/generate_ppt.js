const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_EXTRACTED = path.join(ROOT_DIR, 'report_assets', 'model_pptx', 'extracted');
const CUSTOM_PPTX_DIR = path.join(ROOT_DIR, 'report_assets', 'custom_pptx');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'report_assets', 'screenshots');
const OUTPUT_PPTX = path.join(ROOT_DIR, 'Algorithm_Based_Networking_Platform_Presentation.pptx');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function xmlUnescape(str) {
  return String(str)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Replaces paragraph text inside <a:p>...</a:p> while preserving all <a:pPr>, <a:rPr>, <a:br>, and <a:endParaRPr> formatting.
 * Each item in replacements is [oldParagraphText, newTextOrArrayOfRuns].
 * If newTextOrArrayOfRuns is a string, the first <a:r>'s <a:t> is set to the string and subsequent <a:r> elements in that <a:p> are removed.
 * If newTextOrArrayOfRuns is an array [run0Text, run1Text, ...], the first N <a:r> elements get those texts and any extra <a:r> elements are removed.
 */
function replaceParagraphsInXml(filePath, replacements) {
  let xml = fs.readFileSync(filePath, 'utf8');

  for (const [oldParaText, newReplacement] of replacements) {
    let matched = false;
    xml = xml.replace(/<a:p\b[^>]*>[\s\S]*?<\/a:p>/g, (pBlock) => {
      if (matched) return pBlock;
      const tMatches = [...pBlock.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)];
      if (tMatches.length === 0) return pBlock;
      const fullText = xmlUnescape(tMatches.map((m) => m[1]).join(''));

      if (fullText.trim() === oldParaText.trim()) {
        matched = true;
        const desiredRuns = Array.isArray(newReplacement) ? newReplacement : [newReplacement];
        let runIndex = 0;
        return pBlock.replace(/<a:r>[\s\S]*?<\/a:r>/g, (rBlock) => {
          if (runIndex < desiredRuns.length) {
            const updatedText = xmlEscape(desiredRuns[runIndex]);
            runIndex++;
            return rBlock.replace(/<a:t>[\s\S]*?<\/a:t>/, `<a:t>${updatedText}</a:t>`);
          }
          return '';
        });
      }
      return pBlock;
    });

    if (!matched) {
      throw new Error(`Could not find paragraph "${oldParaText}" in ${path.basename(filePath)}`);
    }
  }

  fs.writeFileSync(filePath, xml, 'utf8');
}

async function generateMediaImages(mediaDir) {
  // 1. image16.png (1640 x 300) - High-Level DFD (Context Diagram - Level 0)
  const svg16 = `
  <svg width="1640" height="300" viewBox="0 0 1640 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="1640" height="300" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#04345C"/>
      </marker>
      <marker id="arrowTeal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0D9488"/>
      </marker>
    </defs>

    <!-- Left Entity: Regular Member -->
    <rect x="40" y="55" width="280" height="190" rx="10" fill="#F0FDFA" stroke="#0D9488" stroke-width="3"/>
    <rect x="40" y="55" width="280" height="44" rx="8" fill="#0D9488"/>
    <text x="180" y="83" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">EXTERNAL ENTITY: MEMBER</text>
    <text x="180" y="130" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#04345C" text-anchor="middle">Regular Platform User</text>
    <text x="180" y="160" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">• Curates Interest Topics</text>
    <text x="180" y="185" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">• Views Ranked Peer Matches</text>
    <text x="180" y="210" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">• Chats in Real-Time Rooms</text>

    <!-- Arrows Member <-> Platform -->
    <line x1="320" y1="110" x2="555" y2="110" stroke="#04345C" stroke-width="2.5" marker-end="url(#arrow)"/>
    <text x="438" y="98" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="bold" fill="#04345C" text-anchor="middle">Profile, Topics &amp; Chat Msgs</text>

    <line x1="555" y1="190" x2="320" y2="190" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrowTeal)"/>
    <text x="438" y="178" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="bold" fill="#0D9488" text-anchor="middle">Ranked Matches &amp; Live Events</text>

    <!-- Center Process 0.0 -->
    <rect x="560" y="30" width="520" height="240" rx="24" fill="#04345C" stroke="#57B6B7" stroke-width="4"/>
    <rect x="740" y="46" width="160" height="28" rx="14" fill="#57B6B7"/>
    <text x="820" y="65" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#04345C" text-anchor="middle">PROCESS 0.0</text>
    <text x="820" y="105" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Algorithm-Based Networking</text>
    <text x="820" y="133" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="bold" fill="#6BD4CD" text-anchor="middle">Platform (Kindred Engine)</text>
    <text x="820" y="168" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#E2E8F0" text-anchor="middle">• NLP Preprocessing &amp; 50+ Synonym Expansion</text>
    <text x="820" y="194" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#E2E8F0" text-anchor="middle">• TF-IDF Vectorization &amp; Cosine Similarity Engine</text>
    <text x="820" y="220" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#E2E8F0" text-anchor="middle">• Role-Based Access Control &amp; Socket.IO Server</text>
    <text x="820" y="246" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="bold" fill="#FFC000" text-anchor="middle">MongoDB Atlas Cloud Persistence</text>

    <!-- Arrows Platform <-> Admin -->
    <line x1="1320" y1="110" x2="1085" y2="110" stroke="#04345C" stroke-width="2.5" marker-end="url(#arrow)"/>
    <text x="1202" y="98" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="bold" fill="#04345C" text-anchor="middle">Ban / Soft-Ban / Role Rules</text>

    <line x1="1085" y1="190" x2="1320" y2="190" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrowTeal)"/>
    <text x="1202" y="178" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="bold" fill="#0D9488" text-anchor="middle">System Metrics &amp; Audit Logs</text>

    <!-- Right Entity: Administrator -->
    <rect x="1320" y="55" width="280" height="190" rx="10" fill="#EFF6FF" stroke="#04345C" stroke-width="3"/>
    <rect x="1320" y="55" width="280" height="44" rx="8" fill="#04345C"/>
    <text x="1460" y="83" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">EXTERNAL ENTITY: ADMIN</text>
    <text x="1460" y="130" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#04345C" text-anchor="middle">Platform Administrator</text>
    <text x="1460" y="160" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">• Full Directory Moderation</text>
    <text x="1460" y="185" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">• Temporary Soft-Ban &amp; Ban</text>
    <text x="1460" y="210" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">• Live Similarity Evaluation</text>
  </svg>`;
  await sharp(Buffer.from(svg16)).png().toFile(path.join(mediaDir, 'image16.png'));

  // 2. image17.png (1700 x 495) - Detail Level DFD (Level 1)
  const svg17 = `
  <svg width="1700" height="495" viewBox="0 0 1700 495" xmlns="http://www.w3.org/2000/svg">
    <rect width="1700" height="495" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#04345C"/>
      </marker>
      <marker id="arrDb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0D9488"/>
      </marker>
    </defs>

    <!-- Top Row: 5 Core Processes -->
    <rect x="45" y="45" width="280" height="175" rx="16" fill="#04345C" stroke="#57B6B7" stroke-width="3"/>
    <text x="185" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFC000" text-anchor="middle">PROCESS 1.0</text>
    <text x="185" y="106" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Auth &amp; Role-Based</text>
    <text x="185" y="128" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#6BD4CD" text-anchor="middle">Access Control (RBAC)</text>
    <text x="185" y="158" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• JWT &amp; Bcrypt Password Hash</text>
    <text x="185" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Member vs Admin Guard</text>
    <text x="185" y="202" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Ban &amp; Soft-Ban Check</text>

    <line x1="325" y1="132" x2="375" y2="132" stroke="#04345C" stroke-width="2.5" marker-end="url(#arr)"/>

    <rect x="380" y="45" width="280" height="175" rx="16" fill="#04345C" stroke="#57B6B7" stroke-width="3"/>
    <text x="520" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFC000" text-anchor="middle">PROCESS 2.0</text>
    <text x="520" y="106" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Interest Curation &amp;</text>
    <text x="520" y="128" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#6BD4CD" text-anchor="middle">NLP Preprocessing</text>
    <text x="520" y="158" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Lowercase &amp; Regex Cleaning</text>
    <text x="520" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Stop-Word Filtering</text>
    <text x="520" y="202" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• 50+ Synonym Normalization</text>

    <line x1="660" y1="132" x2="710" y2="132" stroke="#04345C" stroke-width="2.5" marker-end="url(#arr)"/>

    <rect x="715" y="45" width="280" height="175" rx="16" fill="#04345C" stroke="#57B6B7" stroke-width="3"/>
    <text x="855" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFC000" text-anchor="middle">PROCESS 3.0</text>
    <text x="855" y="106" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TF-IDF Vectorizer &amp;</text>
    <text x="855" y="128" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#6BD4CD" text-anchor="middle">Cosine Similarity</text>
    <text x="855" y="158" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Sublinear TF-IDF Weighting</text>
    <text x="855" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Cosine Dot-Product Engine</text>
    <text x="855" y="202" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Ranked Peer Match Output</text>

    <line x1="995" y1="132" x2="1045" y2="132" stroke="#04345C" stroke-width="2.5" marker-end="url(#arr)"/>

    <rect x="1050" y="45" width="280" height="175" rx="16" fill="#04345C" stroke="#57B6B7" stroke-width="3"/>
    <text x="1190" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFC000" text-anchor="middle">PROCESS 4.0</text>
    <text x="1190" y="106" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Real-Time WebSocket</text>
    <text x="1190" y="128" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#6BD4CD" text-anchor="middle">Chat (Socket.IO)</text>
    <text x="1190" y="158" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Deterministic Room IDs</text>
    <text x="1190" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Bi-Directional Event Stream</text>
    <text x="1190" y="202" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Live Soft-Ban Enforcement</text>

    <line x1="1330" y1="132" x2="1375" y2="132" stroke="#04345C" stroke-width="2.5" marker-end="url(#arr)"/>

    <rect x="1380" y="45" width="275" height="175" rx="16" fill="#04345C" stroke="#57B6B7" stroke-width="3"/>
    <text x="1517" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFC000" text-anchor="middle">PROCESS 5.0</text>
    <text x="1517" y="106" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Admin Moderation &amp;</text>
    <text x="1517" y="128" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#6BD4CD" text-anchor="middle">Evaluation Suite</text>
    <text x="1517" y="158" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Permanent Ban &amp; Lift Ban</text>
    <text x="1517" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Timed Soft-Ban &amp; Delete</text>
    <text x="1517" y="202" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#E2E8F0" text-anchor="middle">• Precision/Recall Benchmarks</text>

    <!-- Vertical Data Flow Arrows to MongoDB Atlas Data Stores -->
    <line x1="185" y1="220" x2="185" y2="325" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrDb)"/>
    <text x="245" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#04345C">User &amp; Role Docs</text>

    <line x1="520" y1="220" x2="520" y2="325" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrDb)"/>
    <text x="585" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#04345C">Normalized Topics</text>

    <line x1="855" y1="220" x2="855" y2="325" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrDb)"/>
    <text x="920" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#04345C">Ranked Match Scores</text>

    <line x1="1190" y1="220" x2="1190" y2="325" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrDb)"/>
    <text x="1250" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#04345C">Chat History Logs</text>

    <line x1="1517" y1="220" x2="1517" y2="325" stroke="#0D9488" stroke-width="2.5" marker-end="url(#arrDb)"/>
    <text x="1445" y="278" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#04345C">Moderation State</text>

    <!-- Bottom Row: MongoDB Atlas Cloud Data Stores -->
    <rect x="45" y="330" width="360" height="125" rx="8" fill="#F0FDFA" stroke="#0D9488" stroke-width="3"/>
    <rect x="45" y="330" width="70" height="125" rx="6" fill="#0D9488"/>
    <text x="80" y="398" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">D1</text>
    <text x="255" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#04345C" text-anchor="middle">users (MongoDB Atlas)</text>
    <text x="255" y="396" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">username, email, passwordHash, role</text>
    <text x="255" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">status, softBanUntil, banReason</text>

    <rect x="445" y="330" width="360" height="125" rx="8" fill="#F0FDFA" stroke="#0D9488" stroke-width="3"/>
    <rect x="445" y="330" width="70" height="125" rx="6" fill="#0D9488"/>
    <text x="480" y="398" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">D2</text>
    <text x="655" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#04345C" text-anchor="middle">topics (MongoDB Atlas)</text>
    <text x="655" y="396" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">topicId, name, category, description</text>
    <text x="655" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">normalizedTokens, synonymTags</text>

    <rect x="845" y="330" width="380" height="125" rx="8" fill="#F0FDFA" stroke="#0D9488" stroke-width="3"/>
    <rect x="845" y="330" width="70" height="125" rx="6" fill="#0D9488"/>
    <text x="880" y="398" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">D3</text>
    <text x="1065" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#04345C" text-anchor="middle">matches (MongoDB Atlas)</text>
    <text x="1065" y="396" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">user1Id, user2Id, similarityScore</text>
    <text x="1065" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">commonTopics[], matchedTokens[]</text>

    <rect x="1265" y="330" width="390" height="125" rx="8" fill="#F0FDFA" stroke="#0D9488" stroke-width="3"/>
    <rect x="1265" y="330" width="70" height="125" rx="6" fill="#0D9488"/>
    <text x="1300" y="398" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">D4</text>
    <text x="1490" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="bold" fill="#04345C" text-anchor="middle">messages (MongoDB Atlas)</text>
    <text x="1490" y="396" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">roomId, senderId, receiverId</text>
    <text x="1490" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#334155" text-anchor="middle">content, timestamp, deliveryStatus</text>
  </svg>`;
  await sharp(Buffer.from(svg17)).png().toFile(path.join(mediaDir, 'image17.png'));

  // 3. image18.png (1280 x 1000) - UML Domain & Entity Class Diagram (Slide 16)
  const svg18 = `
  <svg width="1280" height="1000" viewBox="0 0 1280 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="1000" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>
    <text x="640" y="48" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="bold" fill="#04345C" text-anchor="middle">UML DOMAIN &amp; PERSISTENCE CLASS DIAGRAM (MONGODB ATLAS ODM)</text>

    <!-- Class 1: User (Top Left) -->
    <rect x="60" y="85" width="500" height="380" rx="10" fill="#FFFFFF" stroke="#04345C" stroke-width="3"/>
    <rect x="60" y="85" width="500" height="54" rx="8" fill="#04345C"/>
    <text x="310" y="120" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">User (Mongoose Schema)</text>
    <line x1="60" y1="320" x2="560" y2="320" stroke="#04345C" stroke-width="2"/>
    <text x="85" y="168" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ _id : ObjectId</text>
    <text x="85" y="196" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ username : String [unique]</text>
    <text x="85" y="224" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ email : String [unique]</text>
    <text x="85" y="252" font-family="Consolas, monospace" font-size="16" fill="#0D9488" font-weight="bold">+ role : Enum ['user', 'admin']</text>
    <text x="85" y="280" font-family="Consolas, monospace" font-size="16" fill="#DC2626" font-weight="bold">+ status : Enum ['active','soft_banned','banned']</text>
    <text x="85" y="308" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ interests : Array&lt;ObjectId (Topic)&gt;</text>
    <text x="85" y="352" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ authenticate(password) : Boolean</text>
    <text x="85" y="382" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ updateInterests(topicIds[]) : User</text>
    <text x="85" y="412" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ isRestrictionExpired() : Boolean</text>
    <text x="85" y="442" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ toPublicProfile() : Object</text>

    <!-- Class 2: Topic (Top Right) -->
    <rect x="720" y="85" width="500" height="380" rx="10" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
    <rect x="720" y="85" width="500" height="54" rx="8" fill="#0D9488"/>
    <text x="970" y="120" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Topic (Interest Catalog)</text>
    <line x1="720" y1="320" x2="1220" y2="320" stroke="#0D9488" stroke-width="2"/>
    <text x="745" y="168" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ _id : ObjectId</text>
    <text x="745" y="198" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ name : String [unique]</text>
    <text x="745" y="228" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ category : String</text>
    <text x="745" y="258" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ description : String</text>
    <text x="745" y="288" font-family="Consolas, monospace" font-size="16" fill="#0D9488" font-weight="bold">+ normalizedTokens : Array&lt;String&gt;</text>
    <text x="745" y="355" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ createTopic(name, category) : Topic</text>
    <text x="745" y="390" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ getCorpusDocument() : String</text>
    <text x="745" y="425" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ expandCanonicalSynonyms() : Array</text>

    <!-- Association User <-> Topic -->
    <line x1="560" y1="265" x2="720" y2="265" stroke="#04345C" stroke-width="3"/>
    <text x="585" y="252" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#04345C">0..*</text>
    <text x="675" y="252" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#04345C">1..*</text>
    <text x="640" y="292" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#0D9488" text-anchor="middle">curates &gt;</text>

    <!-- Class 3: Match (Bottom Left) -->
    <rect x="60" y="555" width="500" height="390" rx="10" fill="#FFFFFF" stroke="#04345C" stroke-width="3"/>
    <rect x="60" y="555" width="500" height="54" rx="8" fill="#04345C"/>
    <text x="310" y="590" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Match (Cosine Similarity Result)</text>
    <line x1="60" y1="785" x2="560" y2="785" stroke="#04345C" stroke-width="2"/>
    <text x="85" y="640" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ _id : ObjectId</text>
    <text x="85" y="670" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ user1Id : ObjectId (ref: User)</text>
    <text x="85" y="700" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ user2Id : ObjectId (ref: User)</text>
    <text x="85" y="730" font-family="Consolas, monospace" font-size="16" fill="#0D9488" font-weight="bold">+ similarityScore : Float [0.0 .. 1.0]</text>
    <text x="85" y="760" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ commonTopics : Array&lt;String&gt;</text>
    <text x="85" y="820" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ calculatePercentage() : Number</text>
    <text x="85" y="855" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ getSharedTopicLabels() : Array</text>
    <text x="85" y="890" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ rankByThreshold(minScore) : Array</text>

    <!-- Class 4: Message (Bottom Right) -->
    <rect x="720" y="555" width="500" height="390" rx="10" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
    <rect x="720" y="555" width="500" height="54" rx="8" fill="#0D9488"/>
    <text x="970" y="590" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Message (Socket.IO Chat Log)</text>
    <line x1="720" y1="785" x2="1220" y2="785" stroke="#0D9488" stroke-width="2"/>
    <text x="745" y="640" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ _id : ObjectId</text>
    <text x="745" y="670" font-family="Consolas, monospace" font-size="16" fill="#0D9488" font-weight="bold">+ roomId : String [sorted_u1_u2]</text>
    <text x="745" y="700" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ senderId : ObjectId (ref: User)</text>
    <text x="745" y="730" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ content : String</text>
    <text x="745" y="760" font-family="Consolas, monospace" font-size="16" fill="#1E293B">+ createdAt : ISODate</text>
    <text x="745" y="820" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ persistMessage(payload) : Message</text>
    <text x="745" y="855" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ getRoomHistory(roomId) : Array</text>
    <text x="745" y="890" font-family="Consolas, monospace" font-size="16" fill="#04345C" font-weight="bold">+ broadcastToRoom(io) : Void</text>

    <!-- Vertical Associations -->
    <line x1="310" y1="465" x2="310" y2="555" stroke="#04345C" stroke-width="3"/>
    <text x="325" y="492" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#04345C">1</text>
    <text x="325" y="542" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#04345C">0..*</text>
    <text x="230" y="518" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#0D9488">discovers v</text>

    <line x1="560" y1="420" x2="720" y2="610" stroke="#04345C" stroke-width="3" stroke-dasharray="8,5"/>
    <text x="665" y="505" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#04345C">sends 0..* &gt;</text>

    <line x1="560" y1="740" x2="720" y2="740" stroke="#0D9488" stroke-width="3"/>
    <text x="640" y="725" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="bold" fill="#0D9488" text-anchor="middle">unlocks room &gt;</text>
  </svg>`;
  await sharp(Buffer.from(svg18)).png().toFile(path.join(mediaDir, 'image18.png'));

  // 4. image19.png (1680 x 540) - UML Service & Engine Class Diagram (Slide 17)
  const svg19 = `
  <svg width="1680" height="540" viewBox="0 0 1680 540" xmlns="http://www.w3.org/2000/svg">
    <rect width="1680" height="540" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>
    <text x="840" y="42" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="bold" fill="#04345C" text-anchor="middle">SERVICE LAYER &amp; NLP MATCHING ENGINE ARCHITECTURE (STRATEGY &amp; SINGLETON PATTERNS)</text>

    <!-- Service 1: MatchingEngine -->
    <rect x="45" y="70" width="510" height="435" rx="10" fill="#FFFFFF" stroke="#04345C" stroke-width="3"/>
    <rect x="45" y="70" width="510" height="52" rx="8" fill="#04345C"/>
    <text x="300" y="103" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">&lt;&lt;Service&gt;&gt; MatchingEngine</text>
    <line x1="45" y1="245" x2="555" y2="245" stroke="#04345C" stroke-width="2"/>
    <text x="68" y="152" font-family="Consolas, monospace" font-size="15" fill="#1E293B">- STOP_WORDS : Set&lt;String&gt; (85+ words)</text>
    <text x="68" y="182" font-family="Consolas, monospace" font-size="15" fill="#0D9488" font-weight="bold">- SYNONYM_MAP : Map&lt;String, String&gt; (50+)</text>
    <text x="68" y="212" font-family="Consolas, monospace" font-size="15" fill="#1E293B">- similarityThreshold : Float = 0.05</text>
    <text x="68" y="280" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ preprocessText(rawText) : Array&lt;String&gt;</text>
    <text x="68" y="314" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ expandSynonyms(tokens) : Array&lt;String&gt;</text>
    <text x="68" y="348" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ computeTfidfVectors(docs) : Matrix</text>
    <text x="68" y="382" font-family="Consolas, monospace" font-size="15" fill="#0D9488" font-weight="bold">+ calculateCosineSimilarity(v1, v2) : Float</text>
    <text x="68" y="416" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ getMatchesForUser(userId) : Array&lt;Match&gt;</text>
    <text x="68" y="450" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ evaluatePrecisionRecall() : Metrics</text>

    <line x1="555" y1="285" x2="605" y2="285" stroke="#04345C" stroke-width="3"/>

    <!-- Service 2: ChatService -->
    <rect x="605" y="70" width="490" height="435" rx="10" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
    <rect x="605" y="70" width="490" height="52" rx="8" fill="#0D9488"/>
    <text x="850" y="103" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">&lt;&lt;WebSocket&gt;&gt; ChatService</text>
    <line x1="605" y1="245" x2="1095" y2="245" stroke="#0D9488" stroke-width="2"/>
    <text x="628" y="152" font-family="Consolas, monospace" font-size="15" fill="#1E293B">- io : SocketIO.Server</text>
    <text x="628" y="182" font-family="Consolas, monospace" font-size="15" fill="#1E293B">- activeRooms : Map&lt;String, Set&lt;SocketId&gt;&gt;</text>
    <text x="628" y="212" font-family="Consolas, monospace" font-size="15" fill="#0D9488" font-weight="bold">- dbStore : DatabaseStore</text>
    <text x="628" y="280" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ getDeterministicRoomId(u1, u2) : String</text>
    <text x="628" y="314" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ handleJoinRoom(socket, payload) : Void</text>
    <text x="628" y="348" font-family="Consolas, monospace" font-size="15" fill="#DC2626" font-weight="bold">+ verifySenderNotRestricted(userId) : Bool</text>
    <text x="628" y="382" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ handleSendMessage(socket, msg) : Message</text>
    <text x="628" y="416" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ emitReceiveMessage(roomId, msg) : Void</text>
    <text x="628" y="450" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ fetchRoomHistory(u1, u2) : Array&lt;Message&gt;</text>

    <line x1="1095" y1="285" x2="1145" y2="285" stroke="#04345C" stroke-width="3"/>

    <!-- Service 3: AdminModerationController -->
    <rect x="1145" y="70" width="490" height="435" rx="10" fill="#FFFFFF" stroke="#04345C" stroke-width="3"/>
    <rect x="1145" y="70" width="490" height="52" rx="8" fill="#04345C"/>
    <text x="1390" y="103" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">&lt;&lt;Controller&gt;&gt; AdminModeration</text>
    <line x1="1145" y1="245" x2="1635" y2="245" stroke="#04345C" stroke-width="2"/>
    <text x="1168" y="152" font-family="Consolas, monospace" font-size="15" fill="#1E293B">- requireAdmin : Middleware</text>
    <text x="1168" y="182" font-family="Consolas, monospace" font-size="15" fill="#0D9488" font-weight="bold">- softBanPresets : [15m, 1h, 24h, 7d]</text>
    <text x="1168" y="212" font-family="Consolas, monospace" font-size="15" fill="#1E293B">- auditLogger : AuditService</text>
    <text x="1168" y="280" font-family="Consolas, monospace" font-size="15" fill="#DC2626" font-weight="bold">+ banUserPermanently(userId, reason) : User</text>
    <text x="1168" y="314" font-family="Consolas, monospace" font-size="15" fill="#D97706" font-weight="bold">+ applyTemporarySoftBan(id, mins) : User</text>
    <text x="1168" y="348" font-family="Consolas, monospace" font-size="15" fill="#0D9488" font-weight="bold">+ liftUserRestriction(userId) : User</text>
    <text x="1168" y="382" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ deleteUserCascade(userId) : Boolean</text>
    <text x="1168" y="416" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ updateUserRole(userId, newRole) : User</text>
    <text x="1168" y="450" font-family="Consolas, monospace" font-size="15" fill="#04345C" font-weight="bold">+ runLiveSimilarityPairTest(t1, t2) : Score</text>
  </svg>`;
  await sharp(Buffer.from(svg19)).png().toFile(path.join(mediaDir, 'image19.png'));

  // 5. image20.png (1840 x 800) - Composite of Member Interests & Ranked Match Discovery (Slide 18)
  const imgInterests = await sharp(path.join(SCREENSHOTS_DIR, 'screen_03_member_interests.png'))
    .resize(890, 740, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();
  const imgDiscover = await sharp(path.join(SCREENSHOTS_DIR, 'screen_04_member_discover.png'))
    .resize(890, 740, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();

  const header20Svg = `
  <svg width="1840" height="800" xmlns="http://www.w3.org/2000/svg">
    <rect width="1840" height="800" fill="#0F172A"/>
    <rect x="15" y="10" width="890" height="36" rx="6" fill="#0D9488"/>
    <text x="460" y="34" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">1. Regular Member View — Curating Personal Interest Topics</text>
    <rect x="935" y="10" width="890" height="36" rx="6" fill="#04345C" stroke="#57B6B7" stroke-width="1.5"/>
    <text x="1380" y="34" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="bold" fill="#6BD4CD" text-anchor="middle">2. Ranked Peer Match Discovery (Cosine Similarity % &amp; Shared Topics)</text>
  </svg>`;

  await sharp(Buffer.from(header20Svg))
    .composite([
      { input: imgInterests, left: 15, top: 52 },
      { input: imgDiscover, left: 935, top: 52 },
    ])
    .png()
    .toFile(path.join(mediaDir, 'image20.png'));

  // 6. image21.png (1500 x 900) - Composite of Real-Time Chat & Admin Control Center (Slide 19)
  const imgChat = await sharp(path.join(SCREENSHOTS_DIR, 'screen_05_member_chat.png'))
    .resize(725, 395, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();
  const imgAdminDir = await sharp(path.join(SCREENSHOTS_DIR, 'screen_06_admin_directory.png'))
    .resize(725, 395, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();
  const imgSoftBan = await sharp(path.join(SCREENSHOTS_DIR, 'screen_07_admin_softban_modal.png'))
    .resize(725, 395, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();
  const imgAdminTools = await sharp(path.join(SCREENSHOTS_DIR, 'screen_09_admin_tools.png'))
    .resize(725, 395, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
    .toBuffer();

  const header21Svg = `
  <svg width="1500" height="900" xmlns="http://www.w3.org/2000/svg">
    <rect width="1500" height="900" fill="#0F172A"/>
    <rect x="15" y="8" width="725" height="32" rx="5" fill="#0D9488"/>
    <text x="377" y="29" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">A. Real-Time Bi-Directional Chat Room (Socket.IO)</text>

    <rect x="760" y="8" width="725" height="32" rx="5" fill="#04345C" stroke="#57B6B7" stroke-width="1.5"/>
    <text x="1122" y="29" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#6BD4CD" text-anchor="middle">B. Admin Member Directory (Role Toggle, Soft-Ban, Ban, Delete)</text>

    <rect x="15" y="455" width="725" height="32" rx="5" fill="#D97706"/>
    <text x="377" y="476" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">C. Graduated Temporary Soft-Ban Modal (15m / 1h / 24h / 7d)</text>

    <rect x="760" y="455" width="725" height="32" rx="5" fill="#04345C" stroke="#57B6B7" stroke-width="1.5"/>
    <text x="1122" y="476" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="bold" fill="#6BD4CD" text-anchor="middle">D. Admin NLP Similarity Checker &amp; Benchmark Analytics</text>
  </svg>`;

  await sharp(Buffer.from(header21Svg))
    .composite([
      { input: imgChat, left: 15, top: 44 },
      { input: imgAdminDir, left: 760, top: 44 },
      { input: imgSoftBan, left: 15, top: 492 },
      { input: imgAdminTools, left: 760, top: 492 },
    ])
    .png()
    .toFile(path.join(mediaDir, 'image21.png'));
}

async function main() {
  console.log('1. Cloning extracted model PPTX structure...');
  if (fs.existsSync(CUSTOM_PPTX_DIR)) {
    fs.rmSync(CUSTOM_PPTX_DIR, { recursive: true, force: true });
  }
  copyDirSync(SRC_EXTRACTED, CUSTOM_PPTX_DIR);

  const slidesDir = path.join(CUSTOM_PPTX_DIR, 'ppt', 'slides');
  const diagramsDir = path.join(CUSTOM_PPTX_DIR, 'ppt', 'diagrams');
  const mediaDir = path.join(CUSTOM_PPTX_DIR, 'ppt', 'media');

  console.log('2. Generating high-resolution DFD, UML Class Diagrams & Output Screenshots...');
  await generateMediaImages(mediaDir);

  console.log('3. Updating all 24 slides and SmartArt diagrams while keeping exact theme...');

  // SLIDE 1: Student Enrolment Number & Name
  replaceParagraphsInXml(path.join(slidesDir, 'slide1.xml'), [
    ['ENROLMENT NUMBER : EC25656567676767', 'ENROLMENT NUMBER : EC2532251010259'],
    ['NAME OF STUDENT:   RAMAN', 'NAME OF STUDENT:   GAVIN PAUL P'],
  ]);

  // SLIDE 2: Project Title & Guide
  replaceParagraphsInXml(path.join(slidesDir, 'slide2.xml'), [
    ['Financial Regulations Notification System', 'Algorithm-Based Networking Platform to Mitigate Social Isolation'],
  ]);

  // SLIDE 3: ABSTRACT
  replaceParagraphsInXml(path.join(slidesDir, 'slide3.xml'), [
    [
      'The financial regulatory bodies around the world such as Reserve Bank of India (RBI), MAS Singapore, etc. routinely publish important information for the Banking and Financial Institutions (FI) to adhere to. These publications include:',
      'Modern social platforms rely on passive scrolling and vanity metrics, leaving students and remote professionals socially isolated. This project presents Kindred, an Algorithm-Based Networking Platform featuring:',
    ],
    ['Rules, Regulations and Guidelines', 'Curated Interest Topic Selection & Custom Community Tagging'],
    ['Monetary Policy Statements', 'NLP Preprocessing Pipeline (Tokenization, Stop-Words & 50+ Synonym Map)'],
    ['Circulars', 'TF-IDF Vectorization & Cosine Similarity Compatibility Ranking'],
    ['Compliance Toolkits', 'Role-Based Access Control (Regular Member vs Administrator Views)'],
    ['Press Releases and Media Notifications', 'Real-Time Socket.IO Chat & Graduated Moderation (Ban / Timed Soft-Ban)'],
    [
      'These notifications are of great significance to banks and other financial institutions for they have to comply, and operate accordingly in timely fashion. The banks employ certain teams to watch the regulatory websites for relevant publications. Once they find a new publication, the team will manually extract and publish the details to relevant teams for further actions.',
      'When a member selects or creates interest topics, the NLP engine normalizes synonyms (e.g., "AI" and "Artificial Intelligence") and computes pairwise Cosine Similarity across TF-IDF vectors to surface compatible peers.',
    ],
    [
      'This project will solve this problem by automating the extraction and notification process via a Java application.',
      'Regular members experience a clean, human-centric interface for discovering compatible peers and chatting in real time via Socket.IO without intimidating mathematical jargon.',
    ],
    [
      'This project will add value to the banks by proactively detecting and notifying the published regulations and help to implement them in timely planned manner. The error prone manual process is also removed and FTE is reduced resulting in cost savings to the bank.',
      'Administrators have full governance over the MongoDB Atlas cloud database, including user role management, permanent bans, temporary timed soft-bans, and live NLP similarity benchmarks.',
    ],
  ]);

  // SLIDE 4: INTRODUCTION (Part 1)
  replaceParagraphsInXml(path.join(slidesDir, 'slide4.xml'), [
    [
      'Banking regulatory bodies, such as Reserve Bank of India (RBI), Monetary Authority of Singapore (MAS), etc. routinely publish important information for the Banking and Financial Institutions (FI).',
      'In academic and remote work environments, individuals struggle to find peers who share specific niche passions and academic interests.',
    ],
    ['These publications include:', 'Key interest categories supported include:'],
    ['Rules, Regulations and Guidelines', 'Technology, AI & Software Engineering'],
    ['Monetary Policy Statements', 'Academic Research & Competitive Coding'],
    ['Circulars, Compliance Toolkits', 'Creative Arts, Music & Digital Design'],
    ['Press Releases and Media Notifications', 'Fitness, Wellness & Outdoor Sports'],
    ['Reports (Annual, Half yearly, Quarterly, etc.)', 'Literature, Philosophy & Community Clubs'],
    [
      'These notifications are of great significance to Banks and other Financial Institutions',
      'Conventional platforms fail to mitigate social isolation because they prioritize passive feeds over intentional peer connection:',
    ],
    [
      'Have to comply, and operate accordingly in timely fashion.',
      'Literal keyword search fails when users describe the same interest differently ("ML" vs "Machine Learning").',
    ],
    [
      'Changes to be planned and implemented within the prescribed datelines.',
      'Our platform bridges this gap using a 50+ Synonym NLP Pipeline + TF-IDF Cosine Similarity engine.',
    ],
    [
      'Any non-compliance could result into penalties or loss of business.',
      'Matched peers connect immediately in real-time Socket.IO chat rooms protected by Role-Based Access Control.',
    ],
  ]);

  // SLIDE 5: INTRODUCTION (Part 2)
  replaceParagraphsInXml(path.join(slidesDir, 'slide5.xml'), [
    [
      'To accomplish this, the Banks use manual process:',
      'Conventional feed-based social networks suffer from critical limitations:',
    ],
    [
      'Employ persons/teams to watch the regulatory websites for relevant publications.',
      'Passive infinite scrolling replaces genuine two-way human conversation.',
    ],
    [
      'Manually extract and publish the details to the relevant teams for further actions.',
      'Exact keyword matching misses semantic synonyms ("AI" vs "Artificial Intelligence").',
    ],
    [
      'There are multiple countries the banks have business and multiple regulatory boards in each country.',
      'Cluttered technical interfaces overwhelm regular users with raw system metrics.',
    ],
    [
      'Painfully tedious and prone to human errors.',
      'Binary moderation lacks graduated interventions like temporary timed soft-bans.',
    ],
    [
      'In this project we aim to automate the above manual process as follows :',
      'In this project we mitigate social isolation through an intelligent full-stack platform:',
    ],
    [
      'Create a Java application.',
      'Curate & normalize user interests with a 50+ domain synonym NLP pipeline.',
    ],
    [
      'Iterate into the list of all regulatory websites and its publications.',
      'Vectorize profiles using TF-IDF and rank peer compatibility via Cosine Similarity.',
    ],
    [
      'Extract the published information with all details incrementally.',
      'Separate Regular Member discovery views from the Admin Control Center (RBAC).',
    ],
    [
      'Email the extracted information to the respective division stakeholders for further actions.',
      'Provide instant bi-directional messaging via Socket.IO WebSocket chat rooms.',
    ],
    [
      'The automation can be scheduled or initiated by the user.',
      'Empower admins with Delete, Permanent Ban, and Timed Soft-Ban moderation.',
    ],
    [
      'Audit logs and monitoring features to be available.',
      'Persist all users, topics, matches, and chat logs in MongoDB Atlas Cloud.',
    ],
  ]);

  // SLIDE 6: FEATURES (Part 1)
  replaceParagraphsInXml(path.join(slidesDir, 'slide6.xml'), [
    ['Template based extendable design', 'NLP Synonym & Text Normalization Pipeline'],
    [
      'Closed for modifications and open for extensions.',
      'Overcomes vocabulary mismatch across user profiles automatically.',
    ],
    [
      'Each website is aligned to a template which has an extraction logic. Even though the publications vary for different regulatory bodies or within the same regulator, the extraction logic is simply extended by creating a new template class. This is accomplished by using ‘Strategy’ design pattern.',
      'User interest topics and descriptions are tokenized, stripped of 85+ English stop-words, and mapped through a 50+ domain synonym dictionary (normalizing "AI" to "artificial intelligence", "ML" to "machine learning", "JS" to "javascript") before vectorization.',
    ],
    ['Configuration driven', 'TF-IDF & Cosine Similarity Ranking'],
    [
      'Website extraction aspects are not hardcoded, instead they are represented in the configurations. The configuration data is stored in the property files or in the database for easy maintenance.',
      'Converts normalized user interest corpora into sublinear TF-IDF vectors and computes pairwise Cosine Similarity scores (0% to 100%), surfacing top peer matches along with transparent shared topic badges.',
    ],
    ['Easy and flexible scheduling', 'Role-Based Access Control (Member vs Admin)'],
    [
      'The processing is done by an enterprise grade schedular which allows versatile and flexible scheduling capabilities via Cron expression.',
      'Provides a tailored, human-friendly experience for Regular Members (Interests, Match Discovery, Live Chat) while granting Administrators a dedicated Control Center.',
    ],
    [
      'User can also initiate the processing manually as well.',
      'All technical diagnostics and NLP benchmarks are isolated strictly to Admin views.',
    ],
  ]);

  // SLIDE 7: FEATURES (Part 2)
  replaceParagraphsInXml(path.join(slidesDir, 'slide7.xml'), [
    ['Monitoring', 'Graduated Admin Moderation (Ban & Soft-Ban)'],
    [
      'The processing of schedule job can be monitored via a monitoring screen.',
      'Admins can permanently ban abusive accounts, issue temporary timed soft-bans (15m, 1h, 24h, 7d) that restrict chat while preserving read access, lift restrictions early, or delete users.',
    ],
    ['Audit Logs', 'Real-Time Socket.IO WebSocket Chat Rooms'],
    [
      'All extraction process is logged and available for audit purposes.',
      'Matched peers join deterministic WebSocket rooms for instant bi-directional messaging with live delivery updates and automatic soft-ban enforcement.',
    ],
    ['Utilize public cloud service for email', 'MongoDB Atlas Cloud Database Persistence'],
    [
      'Uses Google email web service for sending emails.',
      'All users, custom topics, similarity matches, moderation states, and chat histories are persisted in real time on a live MongoDB Atlas cloud cluster (matching_app).',
    ],
  ]);

  // SLIDE 8: SYSTEM REQUIREMENTS
  replaceParagraphsInXml(path.join(slidesDir, 'slide8.xml'), [
    ['Intel Core i5 or more', 'Intel Core i5 / AMD Ryzen 5 or higher'],
    ['16 GB Or more', '8 GB RAM (16 GB Recommended)'],
    ['20 GB or more', '20 GB free SSD storage or more'],
    [
      'Connected to internet directly or via proxy server. Internet bandwidth of at least 100 Mbps.',
      'Active broadband connection for MongoDB Atlas Cloud & WebSocket sync.',
    ],
    [
      'Able to connection to Google email services.',
      'Local / LAN port access (Ports 5000 & 19006) for API and Web Client.',
    ],
    ['Windows 10 or higher', 'Windows 10 / 11 (64-bit) or Linux / macOS'],
    ['Java version 1.8 or more', 'JavaScript (Node.js v24) & Python 3.11'],
    ['MySQL Server', 'MongoDB Atlas (Cloud NoSQL Cluster)'],
    ['Google chrome (other browsers not supported readily)', 'Google Chrome, Microsoft Edge, or Firefox'],
    ['SPRING 5', 'React Native (Expo Web) Frontend UI'],
    ['SELENIUM 4.19', 'Node.js & Express.js REST API'],
    ['Google Chrome Web driver (for browser automation)', 'Socket.IO Real-Time WebSocket Engine'],
    ['JDBC drivers for MySQL', 'Mongoose ODM for MongoDB Atlas'],
    ['Spring JPA', 'Python Scikit-Learn & NLTK (TF-IDF / NLP)'],
    ['Quartz Scheduler', 'JWT & Bcryptjs Role Authentication'],
    ['IntelliJ IDEA (for development)', 'Visual Studio Code & Postman'],
  ]);

  // SLIDE 9: EXISTING SYSTEM + SmartArt data1.xml & drawing1.xml
  replaceParagraphsInXml(path.join(slidesDir, 'slide9.xml'), [
    ['Manual Process', 'Passive Feed-Based Social Networks'],
    [
      'Human error prone process',
      'Prioritizes engagement-driven infinite scrolling over intentional peer connection.',
    ],
    [
      'Need to handle multiple Regulatory bodies across multiple countries.',
      'Users must manually search noisy public groups to find peers with shared niche interests.',
    ],
    [
      'Each country has around 5 to 15 Regulatory / Banking related bodies.',
      'Literal keyword search fails to recognize synonyms ("AI" vs "Artificial Intelligence").',
    ],
    [
      'Roughly 10 publications per body.',
      'Superficial follower counts create cold-start anxiety for isolated students and remote workers.',
    ],
    [
      'Increased FTE. Cost to the organization.',
      'Lack of transparent compatibility scores leaves users unsure who shares their passions.',
    ],
    [
      'Can result into poor forward planning of actions.',
      'Binary moderation lacks graduated temporary soft-ban tools to handle minor infractions.',
    ],
    [
      'If missed, can result into poor forward planning of actions.',
      'Result: High screen time but persistent real-world social isolation.',
    ],
  ]);

  const smartArt1Replacements = [
    ['Bank Operations', 'Passive Feeds'],
    ['Monitor Regulatory web sites', 'Infinite ad-driven scrolling'],
    ['Look for new publications', 'Superficial vanity metrics'],
    ['Extract Publications', 'Keyword Mismatch'],
    ['Download contents', 'No synonym recognition'],
    ['Download attachments', 'Misses AI vs Artificial Intelligence'],
    ['Notify Business Stakeholders', 'Weak Governance'],
    ['Send email to business staff', 'Cluttered UI & cold-start friction'],
    ['Maintain mailing lists for different content types', 'No temporary soft-ban controls'],
  ];
  replaceParagraphsInXml(path.join(diagramsDir, 'data1.xml'), smartArt1Replacements);
  replaceParagraphsInXml(path.join(diagramsDir, 'drawing1.xml'), smartArt1Replacements);

  // SLIDE 10: PROPOSED SYSTEM + SmartArt data2.xml & drawing2.xml
  replaceParagraphsInXml(path.join(slidesDir, 'slide10.xml'), [
    ['Fully Automated Process', 'Algorithm-Based Networking Platform'],
    [
      'A fully automated software process will navigate to the websites and prune through all the published contents.',
      'Users curate interest topics on a clean dashboard; the NLP engine normalizes 50+ domain synonyms automatically.',
    ],
    ['If any new publications found,', 'To connect compatible peers seamlessly:'],
    ['navigate to details page', 'Vectorize profiles with TF-IDF & rank via Cosine Similarity'],
    ['extract all contents and attachments', 'Connect matched peers in real-time Socket.IO chat rooms'],
    [
      'Send Email to the concerned stakeholders.',
      'Enforce Role-Based Access Control (Member vs Admin) & Timed Soft-Bans.',
    ],
  ]);

  const smartArt2Replacements = [
    ['Automate', 'Curate'],
    ['Monitor Publications', 'Select or Add Interest Topics'],
    ['Identify New Publications', 'NLP 50+ Synonym Normalization'],
    ['Extract', 'Match'],
    ['Web Scrape', 'TF-IDF Vectorization'],
    ['Extract Titles, Content and Attachments', 'Cosine Similarity Ranking'],
    ['Notify', 'Connect'],
    ['Package All new Contents', 'Real-Time Socket.IO Chat'],
    ['End Email to Stakeholders', 'Admin RBAC & Soft-Ban Safety'],
  ];
  replaceParagraphsInXml(path.join(diagramsDir, 'data2.xml'), smartArt2Replacements);
  replaceParagraphsInXml(path.join(diagramsDir, 'drawing2.xml'), smartArt2Replacements);

  // SLIDE 11: MODULE DESCRIPTION (Overview Table + Module 1)
  replaceParagraphsInXml(path.join(slidesDir, 'slide11.xml'), [
    [
      'Following are the modules and work involved in each module. In this project the modules correspond to the use cases of this project.',
      'The platform is architected into six cohesive modules spanning authentication, NLP preprocessing, TF-IDF matching, real-time chat, and admin governance:',
    ],
    ['Read Websites Configurations', 'User Management & Role-Based Access Control (RBAC)'],
    ['Extract Summary Page', 'Interest & Topic Curation Module'],
    ['Extract Details', 'NLP Preprocessing & Synonym Normalization Module'],
    ['Send Email', 'TF-IDF & Cosine Similarity Matching Engine'],
    ['Manage Automation', 'Real-Time WebSocket Chat Module (Socket.IO)'],
    ['Schedule Process', 'Admin Moderation (Ban / Soft-Ban) & Evaluation'],
    ['Read Websites Configurations:', '1. User Management & Role-Based Access Control (RBAC):'],
    [
      'The list of regulator websites, from which the extraction is to be done, are configured in a database table.',
      'Handles secure registration, Bcrypt password hashing, and JWT session issuance for Regular Members and Administrators.',
    ],
    [
      'Store website template configuration, last published date which was extracted.',
      'Enforces role-based UI routing (hiding internal NLP tools from normal users) and blocks banned accounts at login.',
    ],
    [
      'These configurations are to be read and used for the automation process.',
      'Automatically checks and expires temporary soft-ban timers (softBanUntil) across API and WebSocket layers.',
    ],
  ]);

  // SLIDE 12: MODULE DESCRIPTION (Modules 1, 2, 3)
  replaceParagraphsInXml(path.join(slidesDir, 'slide12.xml'), [
    ['Read Websites Configurations:', 'User Management & Role-Based Access Control (Module 1):'],
    [
      'The list of regulator websites, from which the extraction is to be done, are configured in a database table.',
      'Stores user profiles, credentials, roles (user vs admin), and moderation flags in the MongoDB Atlas users collection.',
    ],
    [
      'Store website template configuration, last published date which was extracted',
      'Provides middleware guards (requireAuth, requireAdmin) to protect administrative endpoints from regular users.',
    ],
    [
      'These configurations are to be read and used for the automation process',
      'Displays a natural, welcoming interface to regular members while unlocking full directory controls for admins.',
    ],
    ['Extract Summary Page:', 'Interest & Topic Curation Module (Module 2):'],
    [
      'Navigate to Summary Page of the publications',
      'Allows members to browse categorized interest chips (Technology, Arts, Fitness, Academics, etc.) and toggle selections.',
    ],
    [
      'Read the titles and the publication date one by one in the summary list',
      'Supports real-time creation of custom community topics with descriptions that immediately enter the global catalog.',
    ],
    [
      'if there are new publications since last extraction, then proceed to the extraction of the details.',
      'Triggers instant recalculation of peer compatibility scores whenever a member updates their interest profile.',
    ],
    ['Extract Details Page:', 'NLP Preprocessing & Synonym Engine (Module 3):'],
    [
      'Navigate to the detail page simulating user click on the title heading',
      'Executes lowercase conversion, regex punctuation stripping, whitespace tokenization, and 85+ stop-word removal.',
    ],
    [
      'Extract detail text along with its formatting information, as much as possible.',
      'Maps 50+ domain abbreviations and synonyms (e.g., "AI" -> "artificial intelligence", "ML" -> "machine learning") to canonical roots.',
    ],
  ]);

  // SLIDE 13: MODULE DESCRIPTION (Modules 4 & 5)
  replaceParagraphsInXml(path.join(slidesDir, 'slide13.xml'), [
    ['Extract Details (Attachments) :', 'TF-IDF & Cosine Similarity Matching Engine (Module 4):'],
    [
      'Some publications could include attachments as part of the details.',
      'Constructs a dynamic vocabulary across all active users and computes sublinear TF-IDF weight vectors for each profile.',
    ],
    [
      'Extract the downloadable attachment(s) whenever possible.',
      'Applies the Cosine Similarity dot-product formula cos(θ) = (A · B) / (||A|| ||B||) to score peer affinity from 0% to 100%.',
    ],
    [
      'If the attachment is not downloadable then extract the download URL, which will be embedded in the email',
      'Filters out self-matches and banned accounts, returning a ranked list of compatible peers with shared topic badges.',
    ],
    ['Send Email:', 'Real-Time WebSocket Chat Service (Module 5):'],
    [
      'Once the details are extracted. Create Email content.',
      'Generates deterministic room identifiers (sorted user IDs) so matched peers join the exact same private conversation.',
    ],
    [
      'The email body should contain the title, the details and the attachment information if any.',
      'Broadcasts messages instantaneously over Socket.IO (join_room, send_message, receive_message) with sub-50ms latency.',
    ],
    [
      'Send email to the user list configured.',
      'Persists every chat message in the MongoDB Atlas messages collection for seamless conversation history retrieval.',
    ],
    [
      'The ‘send To’ email addresses should be configurable and stored in the database.',
      'Blocks message transmission in real time if an administrator places a user under a temporary soft-ban.',
    ],
    ['Manage Automation:', 'Dual-Engine Cross-Verification (Node.js + Python):'],
    [
      'System should provide an ability to view, monitor or manage the ongoing activities.',
      'Maintains mathematical parity between the live Node.js MatchingEngine and the Python Scikit-Learn / NLTK microservice.',
    ],
    [
      'Should allow the users to initiate an extraction process and view the progress',
      'Provides real-time cosine similarity verification for administrators without exposing raw formulas to regular users.',
    ],
  ]);

  // SLIDE 14: MODULE DESCRIPTION (Module 6)
  replaceParagraphsInXml(path.join(slidesDir, 'slide14.xml'), [
    ['Schedule Process :', 'Admin Moderation & System Evaluation Module (Module 6):'],
    [
      'Extraction and email notification should be run automatically as a batch job.',
      'Equips administrators with graduated moderation: Permanent Ban (blocks login), Temporary Soft-Ban (15m, 1h, 24h, 7d — blocks chat & topic creation), Lift Restriction, Role Toggle (Member <-> Admin), and Cascade Delete.',
    ],
    [
      'A full feature schedular to used to schedule the batch job',
      'Includes an Admin-only Similarity Checker & Evaluation Suite computing Precision (88.9%), Recall (100%), F1-Score (94.1%), and Latency (<15ms).',
    ],
    [
      'The job run timings and periodicity should be configurable',
      'All moderation actions and evaluation runs are synchronized live with the MongoDB Atlas cloud database.',
    ],
  ]);

  // SLIDE 15: DATA FLOW DIAGRAM (DFD)
  replaceParagraphsInXml(path.join(slidesDir, 'slide15.xml'), [
    ['High Level DFD – Context Diagram', 'High-Level DFD – Context Diagram (Level 0)'],
    ['Detail Level DFD', 'Detail-Level DFD – System Decomposition (Level 1)'],
  ]);

  // SLIDE 16: CLASS DIAGRAM (Part 1 - Domain Entities)
  replaceParagraphsInXml(path.join(slidesDir, 'slide16.xml'), [
    ['Extract and Send email – All Services', 'Domain & Persistence Entities – MongoDB Atlas ODM'],
    [
      'The application is based on highly extensible design.',
      'The platform models four primary domain collections in MongoDB Atlas:',
    ],
    [
      'Extraction flows are not hardcoded.',
      'User Schema stores credentials, role (user vs admin), and moderation state.',
    ],
    [
      'The extraction process is extensible based on configurations.',
      'Automatically validates whether a temporary soft-ban window (softBanUntil) has expired.',
    ],
    [
      'This extraction design is based on the template driven design.',
      'Topic Schema stores curated interest tags and normalized NLP synonym tokens.',
    ],
    [
      'The template, of a particular site is identified by the ‘template_id’ column. Each template is associated with a pre-defined ExtractionService which handles respective extraction process.',
      'Match Schema stores pairwise Cosine Similarity scores (0.0 to 1.0) and shared topic labels.',
    ],
    [
      'A factory method in PubExtractionService.java creates the respective Extraction Service. Eg. If template id = “RBI1” then “RBI1ExtractionService.java” is used for that website. In this project we define template for one kind of website which is RBI.',
      'Message Schema persists real-time Socket.IO chat history indexed by deterministic roomId (sorted_user1_user2) for instant retrieval.',
    ],
  ]);

  // SLIDE 17: CLASS DIAGRAM (Part 2 - Service & Engine Layer)
  replaceParagraphsInXml(path.join(slidesDir, 'slide17.xml'), [
    ['Schedule Process', 'NLP Matching Engine, Socket.IO Chat & RBAC Controllers'],
    [
      'Use Java based embedded Quartz schedular',
      'MatchingEngine executes text preprocessing, 50+ synonym expansion, TF-IDF vectorization, and Cosine Similarity ranking.',
    ],
    [
      'Quartz job invokes the same classes for processing as invoked from the online monitoring',
      'ChatService & AdminModeration enforce real-time WebSocket room messaging, Permanent Ban, Timed Soft-Ban (15m–7d), and Role Toggle.',
    ],
  ]);

  // SLIDE 18: OUTPUT SCREENSHOTS (Part 1)
  replaceParagraphsInXml(path.join(slidesDir, 'slide18.xml'), [
    [
      'Output: Extraction Process in Action - Screenshot',
      'Output: Regular Member View — Interest Curation & Ranked Peer Match Discovery',
    ],
  ]);

  // SLIDE 19: OUTPUT SCREENSHOTS (Part 2)
  replaceParagraphsInXml(path.join(slidesDir, 'slide19.xml'), [
    ['Output:', 'Output: Live Chat & Admin Governance'],
    [
      'Email Sent by the System with Extracted details and attachments',
      'Real-Time Socket.IO Chat Room, Admin Member Directory, Graduated Soft-Ban Modal & NLP Evaluator',
    ],
  ]);

  // SLIDE 20: SOURCE CODE LOCATION & REPOSITORY
  replaceParagraphsInXml(path.join(slidesDir, 'slide20.xml'), [
    [
      'The Complete Source code is found in the following GitHub location:',
      'The Complete Full-Stack Source Code (Node.js Backend, React Native/Expo Frontend & Python NLP Engine):',
    ],
    [
      'https://github.com/murali-murugan/regnotificationsystem/',
      'https://github.com/gavinpaul-mca/algorithm-based-networking-platform',
    ],
    ['OR', 'CORE MODULES INCLUDED IN WORKSPACE'],
    [
      'SAMPLE CODE',
      'backend/ (Express + Socket.IO + MongoDB Atlas) | frontend/ (Expo Web UI) | nlp_engine/ (Python TF-IDF)',
    ],
  ]);

  // Update hyperlink target in slide20.xml.rels & slide23.xml.rels
  for (const relFile of ['slide20.xml.rels', 'slide23.xml.rels']) {
    const relPath = path.join(slidesDir, '_rels', relFile);
    let relXml = fs.readFileSync(relPath, 'utf8');
    relXml = relXml.replace(
      /https:\/\/github\.com\/murali-murugan\/regnotificationsystem\/?/g,
      'https://github.com/gavinpaul-mca/algorithm-based-networking-platform'
    );
    fs.writeFileSync(relPath, relXml, 'utf8');
  }

  // SLIDE 21: CONCLUSION
  replaceParagraphsInXml(path.join(slidesDir, 'slide21.xml'), [
    [
      'Financial Regulations Notification System aims to notify the banking user about new regulatory directions.',
      [
        'Algorithm-Based Networking Platform (Kindred) ',
        'mitigates social isolation by connecting individuals through shared semantic interests rather than passive feeds.',
      ],
    ],
    [
      'It provides information in advance which helps the bank to take appropriate actions and handle the directions set.',
      'By combining NLP synonym normalization with TF-IDF and Cosine Similarity, the platform achieves 94.1% F1 matching accuracy.',
    ],
    [
      "Throughout the project's journey, several key highlights and conclusions have emerged.",
      'Throughout the design, implementation, and evaluation of the working model, several key achievements stand out:',
    ],
    [
      'Extensible and Template Driven Design:',
      ['Semantic NLP & TF-IDF Cosine Similarity Engine', ':'],
    ],
    [
      'The application is based on highly extensible design. There extraction flows are not hardcoded.',
      'Overcomes literal keyword mismatch via a 50+ domain synonym dictionary and 85+ stop-word filter.',
    ],
    [
      'The extraction process is extensible based on configurations.',
      'Sublinear TF-IDF weighting ensures rare, high-signal interests carry greater weight than generic hobbies.',
    ],
    [
      'The application can be easily extended by using the existing Extraction Service or creating a specific sub class to handle the variation.',
      'Pairwise Cosine Similarity ranks peer compatibility in under 15 milliseconds per query.',
    ],
    ['OOAD Approach:', 'Role-Based Access Control (RBAC) & Natural UI:'],
    [
      'Object oriented analysis and design methodology is being followed in the development on this application.',
      'Regular members enjoy a jargon-free interface while Administrators govern the platform via a dedicated Control Center.',
    ],
    ['Design Patterns:', 'Graduated Community Moderation (Ban & Soft-Ban):'],
    [
      '“Factory Method” pattern is used for creating of specific ExtractionService class for a given template.',
      [
        'Empowers administrators with Permanent Ban, Timed Soft-Ban (15m to 7d) enforced in ',
        'ChatService',
        ', Role Toggle, and User Deletion.',
      ],
    ],
    [
      '“Template Method” pattern has been used to abstract the implementation of a template specific logic.',
      'Soft-banned users retain read access while their chat and topic creation privileges automatically restore upon expiry.',
    ],
    ['Google’s Gmail web service:', 'Real-Time Socket.IO & MongoDB Atlas Cloud Persistence:'],
    [
      'Googles Gmail webservice is being used to send emails.',
      'Matched peers converse live via Socket.IO rooms backed by persistent cloud storage on MongoDB Atlas.',
    ],
    [
      'This service offers OAuth2 base authenticated invocation of webservices to send mails',
      'One-click launcher (start.bat) starts both the MongoDB Atlas backend and web client seamlessly.',
    ],
  ]);

  // SLIDE 22: FUTURE ENHANCEMENTS
  replaceParagraphsInXml(path.join(slidesDir, 'slide22.xml'), [
    ['1)\tImprove Scalability', '1)\tTransformer-Based Deep Semantic Embeddings'],
    [
      '•\tIncorporate muti-threaded processing to perform parallel extraction and notifications of jobs.',
      '•\tIntegrate pre-trained Sentence-BERT (SBERT) transformer embeddings alongside TF-IDF to capture deep contextual meaning across long-form user biographies.',
    ],
    [
      '•\tUse mix of technologies like Python/BeautifulSoup to perform extractions. This will help to overcome the limitations of multi-instance Chrome or Edge drivers.',
      [
        '•\tIncorporate Approximate Nearest Neighbor (',
        'FAISS / HNSW',
        ') vector indexing to scale sub-millisecond similarity search to millions of concurrent profiles.',
      ],
    ],
    ['2)\tAbility to run extraction process fine grained', '2)\tMultimedia Group Rooms & Icebreaker Prompts'],
    [
      '•\tUsers or the Batch job should be able to run the extraction process in multiple groups. Eg. Ability to run at the country level or certain groups.',
      [
        '•\tExpand 1-on-1 Socket.IO chat rooms into topic-based group lounges with WebRTC voice/video study rooms. ',
        'E.g.,',
        ' dynamic AI-generated conversation starters tailored to shared topics.',
      ],
    ],
    [
      '•\tThe job groups can run at different scheduled times.',
      '•\tAdd collaborative event scheduling and campus/organization sub-communities.',
    ],
    ['3)\tApply ML / NLP', '3)\tAutomated AI Content Safety & Mobile Push'],
    [
      '•\tClassify content for compliance, financial data, service regulations, etc.',
      '•\tDeploy an automated NLP toxicity classifier to flag abusive chat messages and recommend graduated soft-bans to administrators.',
    ],
    [
      '•\tIndentify severity.',
      [
        '•\t',
        'Deliver',
        ' native iOS & Android push notifications via Expo Notifications when high-affinity peers join.',
      ],
    ],
    [
      'Identify datelines of implementation.',
      'Provide privacy-preserving location proximity filters for local study and hobby meetups.',
    ],
    [
      '•\tAffected organizations and divisions.',
      '•\tSupport federated single sign-on (SSO) for universities and enterprise wellness programs.',
    ],
  ]);

  // SLIDE 23: REFERENCES
  replaceParagraphsInXml(path.join(slidesDir, 'slide23.xml'), [
    ['Reserve Bank of India(RBI) notification sites', 'Core NLP, Vector Space & Full-Stack Documentation'],
    [
      'Reserve Bank of India Master Circulars - Banker and Debt Manager to Government, https://www.rbi.org.in/Scripts/BS_ViewMasterCirculardetails.aspx?did=334',
      'Scikit-Learn TfidfVectorizer & Cosine Similarity Official Documentation, https://scikit-learn.org/stable/modules/feature_extraction.html',
    ],
    [
      'Reserve Bank of India Master Circulars - Financial Inclusion and Development, https://www.rbi.org.in/Scripts/BS_ViewMasterCirculardetails.aspx?did=343',
      'Natural Language Toolkit (NLTK) Tokenization & Stop-Word Corpus Guides, https://www.nltk.org/',
    ],
    [
      'Reserve Bank of India Master Circulars - Commercial Banking, https://www.rbi.org.in/Scripts/BS_ViewMasterCirculardetails.aspx?did=342',
      'MongoDB Atlas Cloud Database & Mongoose ODM Schema Reference, https://www.mongodb.com/docs/atlas/',
    ],
    [
      'Reserve Bank of India Master Circulars - Co-operative Banking, https://www.rbi.org.in/Scripts/BS_ViewMasterCirculardetails.aspx?did=340',
      'Socket.IO v4 Bi-Directional WebSocket Rooms & Event Broadcasting Guide, https://socket.io/docs/v4/',
    ],
    [
      'Reserve Bank of India Master Directions - Commercial Banking, https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx?did=342',
      'React Native & Expo Cross-Platform Web Application Framework, https://docs.expo.dev/',
    ],
    [
      'Reserve Bank of India Notifications, https://www.rbi.org.in/Scripts/NotificationUser.aspx',
      'Express.js REST API Routing & Role-Based Authentication Middleware, https://expressjs.com/',
    ],
    [
      'Reserve Bank of India Press Releases, https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
      'JSON Web Tokens (JWT) RFC 7519 Security Specification, https://jwt.io/introduction',
    ],
    ['https://www.selenium.dev/', 'https://nodejs.org/en/docs/'],
    ['https://developers.google.com/gmail/api/guides', 'https://www.mongodb.com/atlas'],
    ['https://www.oracle.com/java/', 'https://socket.io/docs/v4/'],
    ['https://spring.io/projects/spring-framework/', 'https://reactnative.dev/docs/getting-started'],
    ['https://spring.io/projects/spring-data-jpa', 'https://mongoosejs.com/docs/guide.html'],
    ['https://projectlombok.org/', 'https://scikit-learn.org/stable/'],
    ['https://www.mysql.com/', 'https://www.nltk.org/'],
    ['https://www.geeksforgeeks.org/software-design-patterns/', 'https://expressjs.com/en/guide/routing.html'],
    ['https://www.geeksforgeeks.org/object-oriented-analysis-and-design/', 'https://docs.expo.dev/workflow/web/'],
    [
      'https://github.com/murali-murugan/regnotificationsystem',
      'https://github.com/gavinpaul-mca/algorithm-based-networking-platform',
    ],
    [
      '[1] Gamma, Erich; Helm, Richard; Johnson, Ralph (22 October 2009). "Design Patterns 15 Years Later: An Interview with Erich Gamma, Richard Helm, and Ralph Johnson". InformIT (Interview). Interviewed by Larry O\'Brien. Archived from the original on 20 February 2019. Retrieved 1 September 2019.',
      [
        '[1] Salton, G., & Buckley, C. (1988). "Term-weighting approaches in automatic text retrieval". ',
        'Information Processing & Management',
        ', Vol. 24(5), pp. 513–523. (Foundation of TF-IDF & Cosine Similarity).',
      ],
    ],
    [
      '[2] Harrop, Rob; Machacek, Jan (January 31, 2005). Pro Spring (First ed.). Apress. p. 832. ISBN 1-59059-461-4.',
      [
        '[2] Eisenstein, Jacob (2019). ',
        'Introduction to Natural Language Processing',
        '. MIT Press, Cambridge, MA. ',
        'ISBN 978-0-262-04284-0',
        '.',
      ],
    ],
    [
      '[3] Walls, Craig (Jan 3, 2016). Spring Boot in Action. Manning. ISBN 978-1-61729-254-5.',
      '[3] Pedregosa, F. et al. (2011). "Scikit-learn: Machine Learning in Python". Journal of Machine Learning Research, 12, pp. 2825–2830.',
    ],
    [
      '[4] Java Platform, Enterprise Edition (Java EE)". Oracle Technology Network. Oracle. Archived from the original on December 17, 2014. Retrieved December 18, 2014.',
      "[4] Bird, S., Klein, E., & Loper, E. (2009). Natural Language Processing with Python. O'Reilly Media. ISBN 978-0-596-51649-9.",
    ],
  ]);

  // SLIDE 24: THANK YOU
  replaceParagraphsInXml(path.join(slidesDir, 'slide24.xml'), [
    ['ENROLMENT NUMBER : EC25656567676767', 'ENROLMENT NUMBER : EC2532251010259'],
    ['NAME OF STUDENT:   RAMAN', 'NAME OF STUDENT:   GAVIN PAUL P'],
  ]);

  // Update docProps/app.xml and docProps/core.xml metadata
  const appXmlPath = path.join(CUSTOM_PPTX_DIR, 'docProps', 'app.xml');
  let appXml = fs.readFileSync(appXmlPath, 'utf8');
  appXml = appXml.replace(
    'Financial Regulations Notification System ',
    'Algorithm-Based Networking Platform to Mitigate Social Isolation'
  );
  fs.writeFileSync(appXmlPath, appXml, 'utf8');

  const coreXmlPath = path.join(CUSTOM_PPTX_DIR, 'docProps', 'core.xml');
  let coreXml = fs.readFileSync(coreXmlPath, 'utf8');
  coreXml = coreXml
    .replace('<dc:title>Project</dc:title>', '<dc:title>Algorithm-Based Networking Platform to Mitigate Social Isolation</dc:title>')
    .replace('<dc:creator>Aadhan Navilan</dc:creator>', '<dc:creator>Gavin Paul P (EC2532251010259)</dc:creator>')
    .replace('<cp:lastModifiedBy>Mr Doggy</cp:lastModifiedBy>', '<cp:lastModifiedBy>Gavin Paul P</cp:lastModifiedBy>');
  fs.writeFileSync(coreXmlPath, coreXml, 'utf8');

  console.log('4. Packaging OpenXML archive into Algorithm_Based_Networking_Platform_Presentation.pptx...');
  const zlib = require('zlib');

  // Pure Node.js ZIP writer with forward-slash entry names (OpenXML compliant)
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function collectFiles(dir, baseDir = dir, list = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(full, baseDir, list);
      } else {
        const rel = path.relative(baseDir, full).split(path.sep).join('/');
        list.push({ fullPath: full, relPath: rel });
      }
    }
    return list;
  }

  const allFiles = collectFiles(CUSTOM_PPTX_DIR);
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const file of allFiles) {
    const rawData = fs.readFileSync(file.fullPath);
    const compressedData = zlib.deflateRawSync(rawData, { level: 6 });
    const fileCrc = crc32(rawData);
    const nameBuf = Buffer.from(file.relPath, 'utf8');

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(8, 8); // compression method: deflate
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0x5421, 12); // mod date
    localHeader.writeUInt32LE(fileCrc, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(rawData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra len

    localChunks.push(localHeader, nameBuf, compressedData);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(8, 10); // compression method: deflate
    centralHeader.writeUInt16LE(0, 12); // mod time
    centralHeader.writeUInt16LE(0x5421, 14); // mod date
    centralHeader.writeUInt32LE(fileCrc, 16);
    centralHeader.writeUInt32LE(compressedData.length, 20);
    centralHeader.writeUInt32LE(rawData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra len
    centralHeader.writeUInt16LE(0, 32); // comment len
    centralHeader.writeUInt16LE(0, 34); // disk number
    centralHeader.writeUInt16LE(0, 36); // internal attrs
    centralHeader.writeUInt32LE(0, 38); // external attrs
    centralHeader.writeUInt32LE(offset, 42); // local header offset

    centralChunks.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressedData.length;
  }

  const centralDirSize = centralChunks.reduce((acc, b) => acc + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(allFiles.length, 8);
  eocd.writeUInt16LE(allFiles.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  const zipBuffer = Buffer.concat([...localChunks, ...centralChunks, eocd]);
  fs.writeFileSync(OUTPUT_PPTX, zipBuffer);
  console.log(`Successfully packaged: ${OUTPUT_PPTX} (${(zipBuffer.length / (1024 * 1024)).toFixed(2)} MB, ${allFiles.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
