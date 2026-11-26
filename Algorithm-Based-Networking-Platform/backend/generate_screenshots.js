const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'report_assets', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function browserFrame(urlText, innerSvg, height = 820) {
  return `<svg width="1280" height="${height}" viewBox="0 0 1280 ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        text { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; }
        .mono { font-family: Consolas, 'Courier New', monospace; }
      </style>
      <filter id="cardShadow" x="-2%" y="-2%" width="104%" height="108%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.06"/>
      </filter>
    </defs>
    <!-- Browser Window Background -->
    <rect width="1280" height="${height}" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <!-- Browser Top Chrome Bar -->
    <rect width="1280" height="46" rx="10" fill="#1E293B"/>
    <rect y="36" width="1280" height="10" fill="#1E293B"/>
    <circle cx="24" cy="23" r="6.5" fill="#EF4444"/>
    <circle cx="46" cy="23" r="6.5" fill="#F59E0B"/>
    <circle cx="68" cy="23" r="6.5" fill="#10B981"/>
    <!-- Address Bar -->
    <rect x="110" y="9" width="840" height="28" rx="6" fill="#0F172A"/>
    <text x="128" y="28" fill="#94A3B8" font-size="13" font-weight="500">🔒  ${esc(urlText)}</text>
    <text x="1130" y="28" fill="#CBD5E1" font-size="12" font-weight="600">Kindred v2.0</text>
    ${innerSvg}
  </svg>`;
}

function appHeaderAndTabs({ username, initials, avatarColor, isAdmin, cluster, activeTab, matchCount = 5 }) {
  const tabs = isAdmin
    ? [
        { id: 'topics', label: 'My Interests' },
        { id: 'matches', label: `Discover (${matchCount})` },
        { id: 'chat', label: 'Messages' },
        { id: 'admin', label: '🛡 Admin Console' }
      ]
    : [
        { id: 'topics', label: 'My Interests' },
        { id: 'matches', label: `Discover (${matchCount})` },
        { id: 'chat', label: 'Messages' }
      ];

  const tabWidth = isAdmin ? 242 : 326;
  const tabSvg = tabs
    .map((t, idx) => {
      const x = 148 + idx * (tabWidth + 10);
      const isAct = t.id === activeTab;
      return `
        <rect x="${x}" y="152" width="${tabWidth}" height="38" rx="10" fill="${isAct ? '#4F46E5' : t.id === 'admin' ? '#EEF2FF' : '#FFFFFF'}"/>
        <text x="${x + tabWidth / 2}" y="176" text-anchor="middle" fill="${isAct ? '#FFFFFF' : t.id === 'admin' ? '#4338CA' : '#475569'}" font-size="13" font-weight="700">${esc(t.label)}</text>
      `;
    })
    .join('');

  return `
    <!-- Top User Header Card -->
    <rect x="140" y="66" width="1000" height="70" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <circle cx="180" cy="101" r="22" fill="${avatarColor}"/>
    <text x="180" y="107" text-anchor="middle" fill="#FFFFFF" font-size="17" font-weight="800">${esc(initials)}</text>
    <text x="214" y="96" fill="#0F172A" font-size="16" font-weight="800">${esc(username)}</text>
    <rect x="${214 + username.length * 9.5 + 8}" y="81" width="${isAdmin ? 76 : 68}" height="20" rx="10" fill="${isAdmin ? '#E0E7FF' : '#F1F5F9'}"/>
    <text x="${214 + username.length * 9.5 + (isAdmin ? 46 : 42)}" y="95" text-anchor="middle" fill="${isAdmin ? '#3730A3' : '#475569'}" font-size="11" font-weight="700">${isAdmin ? '🛡 Admin' : 'Member'}</text>
    <circle cx="220" cy="115" r="4" fill="#10B981"/>
    <text x="230" y="119" fill="#64748B" font-size="12" font-weight="500">Online  •  Community: <tspan fill="#4F46E5" font-weight="700">${esc(cluster)}</tspan></text>
    <rect x="1036" y="85" width="84" height="32" rx="10" fill="#F1F5F9"/>
    <text x="1078" y="105" text-anchor="middle" fill="#334155" font-size="12" font-weight="700">Sign Out</text>

    <!-- Navigation Tabs Bar -->
    <rect x="140" y="146" width="1000" height="50" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
    ${tabSvg}
  `;
}

async function generateAllScreenshots() {
  // 1. SCREEN 01: SIGN IN & QUICK SWITCH ACCOUNTS
  const svgLogin = browserFrame(
    'http://localhost:5000',
    `
    <rect x="370" y="70" width="540" height="715" rx="24" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <circle cx="412" cy="108" r="6" fill="#4F46E5"/>
    <text x="426" y="112" fill="#4F46E5" font-size="11" font-weight="800" letter-spacing="1">KINDRED COMMUNITY</text>
    <text x="406" y="146" fill="#0F172A" font-size="23" font-weight="800">Meet people who share your passions.</text>
    <text x="406" y="170" fill="#64748B" font-size="13">Skip the endless feed scrolling. Pick the topics you care about and</text>
    <text x="406" y="188" fill="#64748B" font-size="13">start real conversations with like-minded people.</text>

    <!-- Mode Switcher -->
    <rect x="406" y="206" width="468" height="40" rx="12" fill="#F1F5F9"/>
    <rect x="410" y="210" width="230" height="32" rx="9" fill="#FFFFFF"/>
    <text x="525" y="231" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">Sign In</text>
    <text x="755" y="231" text-anchor="middle" fill="#64748B" font-size="13" font-weight="700">Create Account</text>

    <!-- Inputs -->
    <text x="406" y="272" fill="#334155" font-size="12" font-weight="700">Email Address</text>
    <rect x="406" y="280" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="305" fill="#0F172A" font-size="14">gavin@srmist.edu.in</text>

    <text x="406" y="342" fill="#334155" font-size="12" font-weight="700">Password</text>
    <rect x="406" y="350" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="375" fill="#0F172A" font-size="16">•••••••••••</text>

    <rect x="406" y="406" width="468" height="44" rx="12" fill="#4F46E5"/>
    <text x="640" y="433" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700">Sign In</text>

    <line x1="406" y1="472" x2="874" y2="472" stroke="#E2E8F0" stroke-width="1"/>
    <text x="406" y="495" fill="#475569" font-size="12" font-weight="700">Quick Switch Accounts (For Testing Admin vs Member Views)</text>

    ${[
      { name: 'Gavin Paul P', role: 'admin', color: '#4F46E5', topics: 'AI • ML • Natural Language Processing • React Native' },
      { name: 'Ananya Sharma', role: 'user', color: '#0EA5E9', topics: 'Artificial Intelligence • Machine Learning • NLP • Python' },
      { name: 'Rohith Kumar', role: 'admin', color: '#10B981', topics: 'React Native • Node.js • JavaScript • Cloud Computing' },
      { name: 'Karthik Rajan', role: 'user', color: '#F59E0B', topics: 'Coding • Java • Spring Boot • Cloud Computing' },
      { name: 'Meera Nair', role: 'user', color: '#EC4899', topics: 'UI/UX Design • Photography • Mindfulness • Reading' }
    ]
      .map((u, i) => {
        const y = 510 + i * 52;
        return `
        <rect x="406" y="${y}" width="468" height="44" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
        <circle cx="430" cy="${y + 22}" r="15" fill="${u.color}"/>
        <text x="430" y="${y + 27}" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">${u.name[0]}</text>
        <text x="454" y="${y + 19}" fill="#0F172A" font-size="12" font-weight="700">${u.name}</text>
        <rect x="${454 + u.name.length * 7.2 + 8}" y="${y + 7}" width="${u.role === 'admin' ? 58 : 54}" height="16" rx="8" fill="${u.role === 'admin' ? '#E0E7FF' : '#E2E8F0'}"/>
        <text x="${454 + u.name.length * 7.2 + (u.role === 'admin' ? 37 : 35)}" y="${y + 18}" text-anchor="middle" fill="${u.role === 'admin' ? '#3730A3' : '#475569'}" font-size="9.5" font-weight="700">${u.role === 'admin' ? '🛡 Admin' : 'Member'}</text>
        <text x="454" y="${y + 35}" fill="#64748B" font-size="11">${u.topics}</text>
        <text x="856" y="${y + 26}" text-anchor="end" fill="#4F46E5" font-size="11" font-weight="700">Sign in →</text>
      `;
      })
      .join('')}
    `
  );
  await sharp(Buffer.from(svgLogin)).png().toFile(path.join(OUT_DIR, 'screen_01_login.png'));

  // 2. SCREEN 02: CREATE ACCOUNT / REGISTRATION
  const svgRegister = browserFrame(
    'http://localhost:5000',
    `
    <rect x="370" y="80" width="540" height="640" rx="24" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <circle cx="412" cy="118" r="6" fill="#4F46E5"/>
    <text x="426" y="122" fill="#4F46E5" font-size="11" font-weight="800" letter-spacing="1">KINDRED COMMUNITY</text>
    <text x="406" y="156" fill="#0F172A" font-size="23" font-weight="800">Create your community profile.</text>
    <text x="406" y="180" fill="#64748B" font-size="13">Join a space designed for genuine, interest-driven conversations.</text>

    <rect x="406" y="204" width="468" height="40" rx="12" fill="#F1F5F9"/>
    <text x="525" y="229" text-anchor="middle" fill="#64748B" font-size="13" font-weight="700">Sign In</text>
    <rect x="640" y="208" width="230" height="32" rx="9" fill="#FFFFFF"/>
    <text x="755" y="229" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">Create Account</text>

    <text x="406" y="272" fill="#334155" font-size="12" font-weight="700">Your Name</text>
    <rect x="406" y="280" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="305" fill="#0F172A" font-size="14">Siddharth Menon</text>

    <text x="406" y="342" fill="#334155" font-size="12" font-weight="700">Email Address</text>
    <rect x="406" y="350" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="375" fill="#0F172A" font-size="14">siddharth.m@srmist.edu.in</text>

    <text x="406" y="412" fill="#334155" font-size="12" font-weight="700">Password</text>
    <rect x="406" y="420" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="445" fill="#0F172A" font-size="16">•••••••••••</text>

    <text x="406" y="482" fill="#334155" font-size="12" font-weight="700">About You</text>
    <rect x="406" y="490" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="515" fill="#0F172A" font-size="13">Interested in Machine Learning, Cloud Architecture, and Chess.</text>

    <rect x="406" y="555" width="468" height="46" rx="12" fill="#4F46E5"/>
    <text x="640" y="583" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700">Join Kindred</text>
    `
  );
  await sharp(Buffer.from(svgRegister)).png().toFile(path.join(OUT_DIR, 'screen_02_register.png'));

  // 3. SCREEN 03: REGULAR MEMBER — MY INTERESTS DASHBOARD
  const svgMemberInterests = browserFrame(
    'http://localhost:5000',
    `
    ${appHeaderAndTabs({
      username: 'Ananya Sharma',
      initials: 'A',
      avatarColor: '#0EA5E9',
      isAdmin: false,
      cluster: 'AI & Data Science',
      activeTab: 'topics',
      matchCount: 5
    })}

    <!-- Main Interests Card -->
    <rect x="140" y="212" width="1000" height="330" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="248" fill="#0F172A" font-size="18" font-weight="800">What are you passionate about?</text>
    <text x="168" y="270" fill="#64748B" font-size="13">Add your favorite topics or pick from the list below. We use your interests to introduce you to people who care about the same things.</text>

    <rect x="168" y="288" width="790" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="184" y="314" fill="#94A3B8" font-size="13">Add a custom interest (e.g., Indie Games, Astrophotography, AI)...</text>
    <rect x="970" y="288" width="142" height="42" rx="10" fill="#EEF2FF" stroke="#C7D2FE"/>
    <text x="1041" y="314" text-anchor="middle" fill="#4338CA" font-size="13" font-weight="700">+ Add Interest</text>

    <text x="168" y="358" fill="#334155" font-size="13" font-weight="700">Your Selected Interests (4)</text>
    <!-- Selected Pills -->
    <rect x="168" y="370" width="185" height="34" rx="17" fill="#4F46E5"/>
    <text x="260" y="392" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">Artificial Intelligence   ✕</text>

    <rect x="363" y="370" width="160" height="34" rx="17" fill="#4F46E5"/>
    <text x="443" y="392" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">Machine Learning   ✕</text>

    <rect x="533" y="370" width="84" height="34" rx="17" fill="#4F46E5"/>
    <text x="575" y="392" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">NLP   ✕</text>

    <rect x="627" y="370" width="98" height="34" rx="17" fill="#4F46E5"/>
    <text x="676" y="392" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">Python   ✕</text>

    <!-- Success Banner -->
    <rect x="168" y="420" width="944" height="38" rx="10" fill="#DCFCE7" stroke="#86EFAC"/>
    <text x="186" y="444" fill="#166534" font-size="13" font-weight="700">✨ Your interests have been saved and your matches are updated!</text>

    <rect x="168" y="472" width="944" height="46" rx="12" fill="#4F46E5"/>
    <text x="640" y="500" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700">Save My Interests &amp; Update Matches</text>

    <!-- Catalog Card -->
    <rect x="140" y="558" width="1000" height="225" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="592" fill="#0F172A" font-size="16" font-weight="800">Explore Popular Topics</text>
    <text x="168" y="612" fill="#64748B" font-size="12">Tap any topic to add or remove it from your profile.</text>

    ${[
      { label: '✓ Artificial Intelligence • AI & Data Science', sel: true, x: 168, y: 630, w: 280 },
      { label: '✓ Machine Learning • AI & Data Science', sel: true, x: 458, y: 630, w: 265 },
      { label: '+ Data Science • AI & Data Science', sel: false, x: 733, y: 630, w: 235 },
      { label: '+ React Native • Software Engineering', sel: false, x: 168, y: 676, w: 250 },
      { label: '+ Cloud Computing • Software Engineering', sel: false, x: 428, y: 676, w: 270 },
      { label: '+ UI/UX Design • Creative Arts', sel: false, x: 708, y: 676, w: 215 },
      { label: '+ Photography • Creative Arts', sel: false, x: 168, y: 722, w: 210 },
      { label: '+ Mindfulness & Meditation • Wellness', sel: false, x: 388, y: 722, w: 255 },
      { label: '+ Chess & Strategy • Gaming', sel: false, x: 653, y: 722, w: 210 }
    ]
      .map(
        (p) => `
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="34" rx="17" fill="${p.sel ? '#4F46E5' : '#F8FAFC'}" stroke="${p.sel ? '#4F46E5' : '#CBD5E1'}"/>
      <text x="${p.x + p.w / 2}" y="${p.y + 22}" text-anchor="middle" fill="${p.sel ? '#FFFFFF' : '#334155'}" font-size="12" font-weight="600">${esc(p.label)}</text>
    `
      )
      .join('')}
    `
  );
  await sharp(Buffer.from(svgMemberInterests)).png().toFile(path.join(OUT_DIR, 'screen_03_member_interests.png'));

  // 4. SCREEN 04: REGULAR MEMBER — DISCOVER PEOPLE PAGE (Clean, No NLP Verifier)
  const svgMemberDiscover = browserFrame(
    'http://localhost:5000',
    `
    ${appHeaderAndTabs({
      username: 'Ananya Sharma',
      initials: 'A',
      avatarColor: '#0EA5E9',
      isAdmin: false,
      cluster: 'AI & Data Science',
      activeTab: 'matches',
      matchCount: 5
    })}

    <rect x="140" y="212" width="1000" height="575" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="248" fill="#0F172A" font-size="18" font-weight="800">People You Might Click With</text>
    <text x="168" y="268" fill="#64748B" font-size="12">Based on your shared interests in <tspan font-weight="700" fill="#334155">Artificial Intelligence, Machine Learning, NLP, Python</tspan></text>
    <rect x="1024" y="230" width="88" height="32" rx="10" fill="#EEF2FF"/>
    <text x="1068" y="251" text-anchor="middle" fill="#4338CA" font-size="12" font-weight="700">↻ Refresh</text>

    <!-- Match Card 1: Gavin Paul P -->
    <rect x="168" y="286" width="944" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
    <circle cx="204" cy="322" r="22" fill="#4F46E5"/>
    <text x="204" y="328" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="800">G</text>
    <text x="238" y="315" fill="#0F172A" font-size="15" font-weight="800">Gavin Paul P</text>
    <rect x="342" y="301" width="124" height="20" rx="10" fill="#E0F2FE"/>
    <text x="404" y="315" text-anchor="middle" fill="#0369A1" font-size="11" font-weight="700">AI &amp; Data Science</text>
    <text x="238" y="336" fill="#475569" font-size="12">Building thoughtful communities and exploring AI, mobile apps, and human-centered tech.</text>

    <rect x="1014" y="298" width="82" height="48" rx="12" fill="#DCFCE7" stroke="#86EFAC"/>
    <text x="1055" y="322" text-anchor="middle" fill="#14532D" font-size="16" font-weight="800">86%</text>
    <text x="1055" y="338" text-anchor="middle" fill="#166534" font-size="10" font-weight="700">Match</text>

    <text x="184" y="370" fill="#475569" font-size="12" font-weight="700">Interests:</text>
    <rect x="248" y="354" width="44" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="270" y="369" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">AI</text>
    <rect x="300" y="354" width="46" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="323" y="369" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">ML</text>
    <rect x="354" y="354" width="190" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="449" y="369" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">Natural Language Processing</text>
    <rect x="552" y="354" width="96" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="600" y="369" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">React Native</text>

    <rect x="184" y="390" width="540" height="28" rx="8" fill="#EEF2FF"/>
    <text x="196" y="408" fill="#4338CA" font-size="12" font-weight="600">✨ In common: ai, artificial, intelligence, learning, machine, ml, natural, nlp</text>

    <rect x="964" y="390" width="132" height="32" rx="10" fill="#4F46E5"/>
    <text x="1030" y="410" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">💬 Message Gavin</text>

    <!-- Match Card 2: Vikram Aditya -->
    <rect x="168" y="450" width="944" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
    <circle cx="204" cy="486" r="22" fill="#8B5CF6"/>
    <text x="204" y="492" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="800">V</text>
    <text x="238" y="479" fill="#0F172A" font-size="15" font-weight="800">Vikram Aditya</text>
    <rect x="348" y="465" width="124" height="20" rx="10" fill="#E0F2FE"/>
    <text x="410" y="479" text-anchor="middle" fill="#0369A1" font-size="11" font-weight="700">AI &amp; Data Science</text>
    <text x="238" y="500" fill="#475569" font-size="12">Data scientist who spends weekends playing chess and discovering new hiking trails.</text>

    <rect x="1014" y="462" width="82" height="48" rx="12" fill="#FEF3C7" stroke="#FDE68A"/>
    <text x="1055" y="486" text-anchor="middle" fill="#78350F" font-size="16" font-weight="800">52%</text>
    <text x="1055" y="502" text-anchor="middle" fill="#92400E" font-size="10" font-weight="700">Match</text>

    <text x="184" y="534" fill="#475569" font-size="12" font-weight="700">Interests:</text>
    <rect x="248" y="518" width="146" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="321" y="533" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">Artificial Intelligence</text>
    <rect x="402" y="518" width="96" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="450" y="533" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">Data Science</text>
    <rect x="506" y="518" width="60" height="22" rx="11" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="536" y="533" text-anchor="middle" fill="#334155" font-size="11" font-weight="600">Chess</text>

    <rect x="184" y="554" width="380" height="28" rx="8" fill="#EEF2FF"/>
    <text x="196" y="572" fill="#4338CA" font-size="12" font-weight="600">✨ In common: ai, artificial, intelligence</text>

    <rect x="960" y="554" width="136" height="32" rx="10" fill="#4F46E5"/>
    <text x="1028" y="574" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">💬 Message Vikram</text>

    <!-- Match Card 3: Rohith Kumar -->
    <rect x="168" y="614" width="944" height="150" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
    <circle cx="204" cy="650" r="22" fill="#10B981"/>
    <text x="204" y="656" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="800">R</text>
    <text x="238" y="643" fill="#0F172A" font-size="15" font-weight="800">Rohith Kumar</text>
    <rect x="348" y="629" width="176" height="20" rx="10" fill="#E0F2FE"/>
    <text x="436" y="643" text-anchor="middle" fill="#0369A1" font-size="11" font-weight="700">Software &amp; Web Engineering</text>
    <text x="238" y="664" fill="#475569" font-size="12">Full-stack architect who enjoys mentoring developers, cloud architecture, and coffee chats.</text>

    <rect x="1014" y="626" width="82" height="48" rx="12" fill="#FEF3C7" stroke="#FDE68A"/>
    <text x="1055" y="650" text-anchor="middle" fill="#78350F" font-size="16" font-weight="800">41%</text>
    <text x="1055" y="666" text-anchor="middle" fill="#92400E" font-size="10" font-weight="700">Match</text>

    <rect x="184" y="718" width="380" height="28" rx="8" fill="#EEF2FF"/>
    <text x="196" y="736" fill="#4338CA" font-size="12" font-weight="600">✨ In common: ai, artificial, intelligence</text>

    <rect x="960" y="718" width="136" height="32" rx="10" fill="#4F46E5"/>
    <text x="1028" y="738" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">💬 Message Rohith</text>
    `
  );
  await sharp(Buffer.from(svgMemberDiscover)).png().toFile(path.join(OUT_DIR, 'screen_04_member_discover.png'));

  // 5. SCREEN 05: REAL-TIME CHAT INTERFACE
  const svgChat = browserFrame(
    'http://localhost:5000',
    `
    ${appHeaderAndTabs({
      username: 'Gavin Paul P',
      initials: 'G',
      avatarColor: '#4F46E5',
      isAdmin: true,
      cluster: 'AI & Data Science',
      activeTab: 'chat',
      matchCount: 5
    })}

    <rect x="140" y="212" width="1000" height="575" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <!-- Match Ribbon -->
    <rect x="140" y="212" width="1000" height="54" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>
    <rect x="158" y="223" width="180" height="32" rx="16" fill="#4F46E5"/>
    <text x="248" y="244" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">Ananya Sharma • 86%</text>

    <rect x="348" y="223" width="170" height="32" rx="16" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="433" y="244" text-anchor="middle" fill="#334155" font-size="12" font-weight="700">Rohith Kumar • 68%</text>

    <rect x="528" y="223" width="170" height="32" rx="16" fill="#FFFFFF" stroke="#CBD5E1"/>
    <text x="613" y="244" text-anchor="middle" fill="#334155" font-size="12" font-weight="700">Vikram Aditya • 52%</text>

    <!-- Partner Header -->
    <line x1="140" y1="266" x2="1140" y2="266" stroke="#E2E8F0"/>
    <circle cx="176" cy="296" r="18" fill="#0EA5E9"/>
    <text x="176" y="302" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="800">A</text>
    <text x="204" y="293" fill="#0F172A" font-size="15" font-weight="800">Ananya Sharma</text>
    <text x="204" y="311" fill="#64748B" font-size="11">86% Compatibility  •  Artificial Intelligence, Machine Learning, NLP</text>

    <rect x="1030" y="282" width="86" height="26" rx="13" fill="#DCFCE7" stroke="#86EFAC"/>
    <circle cx="1048" cy="295" r="4" fill="#10B981"/>
    <text x="1080" y="299" text-anchor="middle" fill="#166534" font-size="11" font-weight="700">Online</text>

    <!-- Conversation Starters Bar -->
    <rect x="141" y="325" width="998" height="38" fill="#EEF2FF"/>
    <text x="160" y="348" fill="#4338CA" font-size="11" font-weight="700">Conversation Starters:</text>
    <rect x="296" y="332" width="120" height="24" rx="12" fill="#FFFFFF" stroke="#C7D2FE"/>
    <text x="356" y="348" text-anchor="middle" fill="#4338CA" font-size="11" font-weight="600">👋 Say hello!</text>
    <rect x="426" y="332" width="235" height="24" rx="12" fill="#FFFFFF" stroke="#C7D2FE"/>
    <text x="543" y="348" text-anchor="middle" fill="#4338CA" font-size="11" font-weight="600">✨ Ask about Artificial Intelligence</text>

    <!-- Chat Messages Feed -->
    <rect x="164" y="382" width="520" height="74" rx="16" fill="#F1F5F9" stroke="#E2E8F0"/>
    <text x="182" y="402" fill="#64748B" font-size="10" font-weight="700">Ananya Sharma</text>
    <text x="182" y="422" fill="#0F172A" font-size="13">Hi Gavin! Saw we share a bunch of interests around AI and language</text>
    <text x="182" y="440" fill="#0F172A" font-size="13">models—great to connect!</text>
    <text x="666" y="448" text-anchor="end" fill="#94A3B8" font-size="10">01:35 PM</text>

    <rect x="596" y="472" width="520" height="74" rx="16" fill="#4F46E5"/>
    <text x="614" y="492" fill="#C7D2FE" font-size="10" font-weight="700">You</text>
    <text x="614" y="512" fill="#FFFFFF" font-size="13">Hey Ananya! Likewise! What kind of AI projects have you been</text>
    <text x="614" y="530" fill="#FFFFFF" font-size="13">exploring lately?</text>
    <text x="1098" y="538" text-anchor="end" fill="#C7D2FE" font-size="10">01:36 PM</text>

    <rect x="164" y="562" width="540" height="74" rx="16" fill="#F1F5F9" stroke="#E2E8F0"/>
    <text x="182" y="582" fill="#64748B" font-size="10" font-weight="700">Ananya Sharma</text>
    <text x="182" y="602" fill="#0F172A" font-size="13">I've been building a semantic topic clustering pipeline in Python</text>
    <text x="182" y="620" fill="#0F172A" font-size="13">to match students for study groups!</text>
    <text x="686" y="628" text-anchor="end" fill="#94A3B8" font-size="10">01:38 PM</text>

    <!-- Input Box -->
    <line x1="140" y1="718" x2="1140" y2="718" stroke="#E2E8F0"/>
    <rect x="158" y="730" width="874" height="42" rx="12" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="176" y="756" fill="#94A3B8" font-size="13">Write a message...</text>
    <rect x="1042" y="730" width="80" height="42" rx="12" fill="#4F46E5"/>
    <text x="1082" y="756" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700">Send</text>
    `
  );
  await sharp(Buffer.from(svgChat)).png().toFile(path.join(OUT_DIR, 'screen_05_member_chat.png'));

  // 6. SCREEN 06: ADMIN CONTROL CENTER — MEMBER DIRECTORY & MODERATION
  const svgAdminDir = browserFrame(
    'http://localhost:5000',
    `
    ${appHeaderAndTabs({
      username: 'Gavin Paul P',
      initials: 'G',
      avatarColor: '#4F46E5',
      isAdmin: true,
      cluster: 'AI & Data Science',
      activeTab: 'admin',
      matchCount: 5
    })}

    <!-- Overview Stats Card -->
    <rect x="140" y="210" width="1000" height="162" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="244" fill="#0F172A" font-size="18" font-weight="800">🛡 Admin Control Center</text>
    <text x="168" y="264" fill="#64748B" font-size="12">Manage members, enforce soft-bans or permanent bans, moderate messages, and inspect platform health.</text>

    <rect x="756" y="226" width="356" height="34" rx="10" fill="#F1F5F9"/>
    <rect x="760" y="230" width="116" height="26" rx="7" fill="#FFFFFF"/>
    <text x="818" y="247" text-anchor="middle" fill="#0F172A" font-size="11" font-weight="700">Members &amp; Bans</text>
    <text x="936" y="247" text-anchor="middle" fill="#475569" font-size="11" font-weight="700">Chat Moderation</text>
    <text x="1052" y="247" text-anchor="middle" fill="#475569" font-size="11" font-weight="700">Matching Lab &amp; DB</text>

    ${[
      { val: '6', label: 'Total Members', color: '#4F46E5', x: 168 },
      { val: '15', label: 'Active Connections', color: '#4F46E5', x: 408 },
      { val: '24', label: 'Messages Sent', color: '#4F46E5', x: 648 },
      { val: '14.2 ms', label: 'Server Response', color: '#10B981', x: 888 }
    ]
      .map(
        (s) => `
      <rect x="${s.x}" y="280" width="224" height="74" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="${s.x + 112}" y="315" text-anchor="middle" fill="${s.color}" font-size="22" font-weight="800">${s.val}</text>
      <text x="${s.x + 112}" y="338" text-anchor="middle" fill="#64748B" font-size="11" font-weight="600">${s.label}</text>
    `
      )
      .join('')}

    <!-- Member Moderation List -->
    <rect x="140" y="386" width="1000" height="404" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="418" fill="#0F172A" font-size="16" font-weight="800">Member Directory &amp; Moderation</text>
    <text x="168" y="436" fill="#64748B" font-size="12">Promote/demote admins, apply temporary soft-bans, permanently ban accounts, or delete users from the database.</text>

    ${[
      { name: 'Gavin Paul P', email: 'gavin@srmist.edu.in', role: 'admin', status: 'Active', color: '#4F46E5', self: true },
      { name: 'Ananya Sharma', email: 'ananya.ai@srmist.edu.in', role: 'user', status: 'Active', color: '#0EA5E9', self: false },
      { name: 'Rohith Kumar', email: 'rohith@vtsenterprises.com', role: 'admin', status: 'Active', color: '#10B981', self: false },
      { name: 'Karthik Rajan', email: 'karthik.dev@gmail.com', role: 'user', status: 'Soft-Banned (until 02:45 PM)', color: '#F59E0B', self: false },
      { name: 'Meera Nair', email: 'meera.design@gmail.com', role: 'user', status: 'Active', color: '#EC4899', self: false }
    ]
      .map((u, idx) => {
        const y = 452 + idx * 64;
        const isSoftBanned = u.status.startsWith('Soft-Banned');
        return `
        <rect x="168" y="${y}" width="944" height="54" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
        <circle cx="196" cy="${y + 27}" r="16" fill="${u.color}"/>
        <text x="196" y="${y + 32}" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700">${u.name[0]}</text>
        <text x="224" y="${y + 23}" fill="#0F172A" font-size="13" font-weight="800">${u.name}</text>
        <text x="${224 + u.name.length * 7.8 + 8}" y="${y + 23}" fill="#94A3B8" font-size="11">${u.email}</text>

        <rect x="224" y="${y + 30}" width="${u.role === 'admin' ? 58 : 54}" height="16" rx="8" fill="${u.role === 'admin' ? '#E0E7FF' : '#E2E8F0'}"/>
        <text x="${224 + (u.role === 'admin' ? 29 : 27)}" y="${y + 41}" text-anchor="middle" fill="${u.role === 'admin' ? '#3730A3' : '#475569'}" font-size="9.5" font-weight="700">${u.role === 'admin' ? '🛡 Admin' : 'Member'}</text>

        <rect x="290" y="${y + 30}" width="${isSoftBanned ? 160 : 50}" height="16" rx="8" fill="${isSoftBanned ? '#FEF3C7' : '#DCFCE7'}"/>
        <text x="${290 + (isSoftBanned ? 80 : 25)}" y="${y + 41}" text-anchor="middle" fill="${isSoftBanned ? '#92400E' : '#166534'}" font-size="9.5" font-weight="700">${u.status}</text>

        ${
          u.self
            ? `<text x="1090" y="${y + 31}" text-anchor="end" fill="#94A3B8" font-size="12" font-style="italic" font-weight="600">Your Account</text>`
            : `
          <rect x="720" y="${y + 13}" width="92" height="28" rx="8" fill="#FFFFFF" stroke="#CBD5E1"/>
          <text x="766" y="${y + 31}" text-anchor="middle" fill="#334155" font-size="11" font-weight="700">${u.role === 'admin' ? 'Make Member' : 'Make Admin'}</text>

          ${
            isSoftBanned
              ? `
            <rect x="820" y="${y + 13}" width="194" height="28" rx="8" fill="#059669"/>
            <text x="917" y="${y + 31}" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700">✓ Lift Ban / Restore</text>
          `
              : `
            <rect x="820" y="${y + 13}" width="98" height="28" rx="8" fill="#FEF3C7" stroke="#FDE68A"/>
            <text x="869" y="${y + 31}" text-anchor="middle" fill="#92400E" font-size="11" font-weight="700">⏳ Soft-Ban</text>

            <rect x="926" y="${y + 13}" width="88" height="28" rx="8" fill="#FEE2E2" stroke="#FECACA"/>
            <text x="970" y="${y + 31}" text-anchor="middle" fill="#B91C1C" font-size="11" font-weight="700">🚫 Ban</text>
          `
          }

          <rect x="1022" y="${y + 13}" width="76" height="28" rx="8" fill="#E2E8F0"/>
          <text x="1060" y="${y + 31}" text-anchor="middle" fill="#334155" font-size="11" font-weight="700">🗑 Delete</text>
        `
        }
      `;
      })
      .join('')}
    `
  );
  await sharp(Buffer.from(svgAdminDir)).png().toFile(path.join(OUT_DIR, 'screen_06_admin_directory.png'));

  // 7. SCREEN 07: ADMIN TEMPORARY SOFT-BAN MODAL
  const svgSoftBanModal = browserFrame(
    'http://localhost:5000',
    `
    ${appHeaderAndTabs({
      username: 'Gavin Paul P',
      initials: 'G',
      avatarColor: '#4F46E5',
      isAdmin: true,
      cluster: 'AI & Data Science',
      activeTab: 'admin',
      matchCount: 5
    })}
    <!-- Dimmed Backdrop -->
    <rect x="0" y="46" width="1280" height="774" fill="#0F172A" fill-opacity="0.55"/>

    <!-- Modal Card -->
    <rect x="410" y="220" width="460" height="360" rx="20" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="440" y="262" fill="#0F172A" font-size="19" font-weight="800">Soft-Ban Karthik Rajan</text>
    <text x="440" y="286" fill="#64748B" font-size="12">Temporarily restrict this member from signing in, updating</text>
    <text x="440" y="302" fill="#64748B" font-size="12">interests, or sending messages.</text>

    <text x="440" y="338" fill="#334155" font-size="12" font-weight="700">Suspension Duration</text>
    <rect x="440" y="348" width="400" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="456" y="374" fill="#0F172A" font-size="14" font-weight="600">1 Hour (60 Minutes)</text>
    <text x="816" y="374" fill="#64748B" font-size="12">▼</text>

    <text x="440" y="418" fill="#334155" font-size="12" font-weight="700">Reason / Note for Member</text>
    <rect x="440" y="428" width="400" height="42" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="456" y="454" fill="#0F172A" font-size="13">Please keep community discussions on-topic and respectful.</text>

    <rect x="556" y="510" width="90" height="40" rx="10" fill="#F1F5F9"/>
    <text x="601" y="535" text-anchor="middle" fill="#334155" font-size="12" font-weight="700">Cancel</text>

    <rect x="658" y="510" width="182" height="40" rx="10" fill="#D97706"/>
    <text x="749" y="535" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">Apply Temporary Soft-Ban</text>
    `
  );
  await sharp(Buffer.from(svgSoftBanModal)).png().toFile(path.join(OUT_DIR, 'screen_07_admin_softban_modal.png'));

  // 8. SCREEN 08: SOFT-BANNED USER LOGIN RESTRICTION NOTICE
  const svgBannedLogin = browserFrame(
    'http://localhost:5000',
    `
    <rect x="370" y="110" width="540" height="560" rx="24" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <circle cx="412" cy="148" r="6" fill="#4F46E5"/>
    <text x="426" y="152" fill="#4F46E5" font-size="11" font-weight="800" letter-spacing="1">KINDRED COMMUNITY</text>
    <text x="406" y="186" fill="#0F172A" font-size="23" font-weight="800">Meet people who share your passions.</text>
    <text x="406" y="210" fill="#64748B" font-size="13">Sign in to access your interests, matches, and messages.</text>

    <text x="406" y="256" fill="#334155" font-size="12" font-weight="700">Email Address</text>
    <rect x="406" y="264" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="289" fill="#0F172A" font-size="14">karthik.dev@gmail.com</text>

    <text x="406" y="326" fill="#334155" font-size="12" font-weight="700">Password</text>
    <rect x="406" y="334" width="468" height="40" rx="10" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="420" y="359" fill="#0F172A" font-size="16">•••••••••••</text>

    <!-- Restriction Alert Box -->
    <rect x="406" y="392" width="468" height="72" rx="12" fill="#FEF2F2" stroke="#FECACA"/>
    <text x="424" y="416" fill="#B91C1C" font-size="12" font-weight="700">⚠️ This account is temporarily suspended until 11/5/2026, 2:45:00 PM.</text>
    <text x="424" y="436" fill="#991B1B" font-size="12" font-weight="600">Reason: Please keep community discussions on-topic and</text>
    <text x="424" y="452" fill="#991B1B" font-size="12" font-weight="600">respectful.</text>

    <rect x="406" y="484" width="468" height="44" rx="12" fill="#4F46E5"/>
    <text x="640" y="511" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700">Sign In</text>
    `
  );
  await sharp(Buffer.from(svgBannedLogin)).png().toFile(path.join(OUT_DIR, 'screen_08_banned_login_notice.png'));

  // 9. SCREEN 09: ADMIN MATCHING LAB, AUTOMATED HEALTH CHECKS & MONGODB ATLAS
  const svgAdminTools = browserFrame(
    'http://localhost:5000',
    `
    ${appHeaderAndTabs({
      username: 'Gavin Paul P',
      initials: 'G',
      avatarColor: '#4F46E5',
      isAdmin: true,
      cluster: 'AI & Data Science',
      activeTab: 'admin',
      matchCount: 5
    })}

    <!-- Match Simulator Card -->
    <rect x="140" y="210" width="1000" height="205" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="242" fill="#0F172A" font-size="16" font-weight="800">🔬 Admin Match &amp; Semantic Similarity Sandbox</text>
    <text x="168" y="262" fill="#64748B" font-size="12">Test how the matching engine scores any two sets of interests (including synonyms like "AI" vs "Artificial Intelligence").</text>

    <text x="168" y="288" fill="#334155" font-size="11" font-weight="700">First Interest Set</text>
    <rect x="168" y="295" width="455" height="36" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="182" y="318" fill="#0F172A" font-size="13">AI, ML</text>

    <text x="645" y="288" fill="#334155" font-size="11" font-weight="700">Second Interest Set</text>
    <rect x="645" y="295" width="465" height="36" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="659" y="318" fill="#0F172A" font-size="13">Artificial Intelligence, Machine Learning</text>

    <rect x="168" y="344" width="942" height="54" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="184" y="368" fill="#4338CA" font-size="13" font-weight="800">Compatibility Score: 100% (1.0)  —  Semantic Synonym Match Verified</text>
    <text x="184" y="388" fill="#475569" font-size="12">Normalized Keywords: ai, artificial, intelligence, learning, machine, ml</text>

    <!-- Automated System Health Checks -->
    <rect x="140" y="428" width="1000" height="250" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="460" fill="#0F172A" font-size="16" font-weight="800">Automated System Health Checks</text>
    <text x="168" y="478" fill="#64748B" font-size="12">Verify registration, matching accuracy, semantic synonym recognition, and live messaging.</text>
    <rect x="956" y="442" width="154" height="34" rx="10" fill="#4F46E5"/>
    <text x="1033" y="464" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">▶ Run Health Checks</text>

    <!-- Table Header -->
    <rect x="168" y="494" width="942" height="30" rx="6" fill="#F1F5F9"/>
    <text x="184" y="514" fill="#334155" font-size="11" font-weight="700">Check</text>
    <text x="270" y="514" fill="#334155" font-size="11" font-weight="700">Feature</text>
    <text x="480" y="514" fill="#334155" font-size="11" font-weight="700">Sample Input</text>
    <text x="740" y="514" fill="#334155" font-size="11" font-weight="700">Result</text>
    <text x="1030" y="514" fill="#334155" font-size="11" font-weight="700">Status</text>

    ${[
      { id: 'TC-01', feat: 'Account Registration', inp: 'Valid Email & Password', out: 'User account created' },
      { id: 'TC-02', feat: 'Interest Matching', inp: 'Topics: "AI", "ML"', out: 'Match score: 1.0 (> 0.8)' },
      { id: 'TC-03', feat: 'Semantic Synonym Recognition', inp: '"AI" vs "Artificial Intelligence"', out: 'Match identified (Score: 1.0)' },
      { id: 'TC-04', feat: 'Instant Messaging', inp: 'Live chat message', out: 'Message delivered' }
    ]
      .map((r, i) => {
        const y = 528 + i * 34;
        return `
        <line x1="168" y1="${y}" x2="1110" y2="${y}" stroke="#E2E8F0"/>
        <text x="184" y="${y + 22}" fill="#0F172A" font-size="12" font-weight="700">${r.id}</text>
        <text x="270" y="${y + 22}" fill="#334155" font-size="12">${r.feat}</text>
        <text x="480" y="${y + 22}" fill="#475569" font-size="11" class="mono">${esc(r.inp)}</text>
        <text x="740" y="${y + 22}" fill="#4338CA" font-size="12" font-weight="700">${esc(r.out)}</text>
        <rect x="1026" y="${y + 7}" width="52" height="20" rx="6" fill="#DCFCE7"/>
        <text x="1052" y="${y + 21}" text-anchor="middle" fill="#166534" font-size="11" font-weight="700">Pass</text>
      `;
      })
      .join('')}

    <!-- MongoDB Atlas Status Bar -->
    <rect x="140" y="692" width="1000" height="96" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#cardShadow)"/>
    <text x="168" y="724" fill="#0F172A" font-size="15" font-weight="800">🗄️ Database Connection (Admin Only)</text>
    <text x="168" y="744" fill="#64748B" font-size="12">Status: <tspan fill="#059669" font-weight="700">Connected to MongoDB Atlas (cluster0.j340nle.mongodb.net/matching_app)</tspan></text>
    <rect x="168" y="754" width="820" height="24" rx="6" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="180" y="770" fill="#64748B" font-size="11" class="mono">mongodb+srv://AppAdmin:••••••••@cluster0.j340nle.mongodb.net/matching_app?retryWrites=true&amp;w=majority</text>
    <rect x="1000" y="750" width="110" height="28" rx="8" fill="#4F46E5"/>
    <text x="1055" y="768" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700">Connected ✓</text>
    `
  );
  await sharp(Buffer.from(svgAdminTools)).png().toFile(path.join(OUT_DIR, 'screen_09_admin_tools.png'));

  // 10. SYSTEM ARCHITECTURE & RBAC DIAGRAM
  const svgArch = `<svg width="1200" height="680" viewBox="0 0 1200 680" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        text { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      </style>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4F46E5"/>
      </marker>
    </defs>
    <rect width="1200" height="680" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    <text x="600" y="48" text-anchor="middle" fill="#0F172A" font-size="22" font-weight="800">4-Tier System Architecture &amp; Role-Based Access Control (RBAC)</text>
    <text x="600" y="72" text-anchor="middle" fill="#64748B" font-size="13">Algorithm-Based Networking Platform to Mitigate Social Isolation</text>

    <!-- Tier 1: Presentation Layer -->
    <rect x="50" y="110" width="240" height="510" rx="14" fill="#EEF2FF" stroke="#818CF8" stroke-width="2"/>
    <text x="170" y="144" text-anchor="middle" fill="#312E81" font-size="16" font-weight="800">1. Client Presentation</text>
    <text x="170" y="164" text-anchor="middle" fill="#4338CA" font-size="12" font-weight="600">React Native (Expo) &amp; Web</text>

    <rect x="74" y="190" width="192" height="80" rx="10" fill="#FFFFFF" stroke="#C7D2FE"/>
    <text x="170" y="218" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">Member Interface</text>
    <text x="170" y="238" text-anchor="middle" fill="#64748B" font-size="11">• My Interests Dashboard</text>
    <text x="170" y="254" text-anchor="middle" fill="#64748B" font-size="11">• Discover People (Matches)</text>

    <rect x="74" y="290" width="192" height="80" rx="10" fill="#FFFFFF" stroke="#C7D2FE"/>
    <text x="170" y="318" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">Real-Time Chat UI</text>
    <text x="170" y="338" text-anchor="middle" fill="#64748B" font-size="11">• Instant Messaging Rooms</text>
    <text x="170" y="354" text-anchor="middle" fill="#64748B" font-size="11">• Conversation Starters</text>

    <rect x="74" y="390" width="192" height="100" rx="10" fill="#E0E7FF" stroke="#6366F1"/>
    <text x="170" y="418" text-anchor="middle" fill="#312E81" font-size="13" font-weight="800">🛡 Admin Console UI</text>
    <text x="170" y="438" text-anchor="middle" fill="#3730A3" font-size="11">• Member Ban / Soft-Ban</text>
    <text x="170" y="454" text-anchor="middle" fill="#3730A3" font-size="11">• Role Promotion &amp; Delete</text>
    <text x="170" y="470" text-anchor="middle" fill="#3730A3" font-size="11">• Match Sandbox &amp; Health</text>

    <!-- Tier 2: Application & Real-Time Layer -->
    <rect x="360" y="110" width="260" height="510" rx="14" fill="#F0FDF4" stroke="#34D399" stroke-width="2"/>
    <text x="490" y="144" text-anchor="middle" fill="#064E3B" font-size="16" font-weight="800">2. Application Server</text>
    <text x="490" y="164" text-anchor="middle" fill="#047857" font-size="12" font-weight="600">Node.js + Express.js + Socket.IO</text>

    <rect x="384" y="190" width="212" height="80" rx="10" fill="#FFFFFF" stroke="#A7F3D0"/>
    <text x="490" y="218" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">Auth &amp; RBAC Guard</text>
    <text x="490" y="238" text-anchor="middle" fill="#64748B" font-size="11">• JWT + Bcrypt Hashing</text>
    <text x="490" y="254" text-anchor="middle" fill="#64748B" font-size="11">• Ban &amp; Soft-Ban Enforcer</text>

    <rect x="384" y="290" width="212" height="80" rx="10" fill="#FFFFFF" stroke="#A7F3D0"/>
    <text x="490" y="318" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">REST API Controllers</text>
    <text x="490" y="338" text-anchor="middle" fill="#64748B" font-size="11">• /api/topics &amp; /api/matches</text>
    <text x="490" y="354" text-anchor="middle" fill="#64748B" font-size="11">• /api/admin/users/:id/moderate</text>

    <rect x="384" y="390" width="212" height="100" rx="10" fill="#FFFFFF" stroke="#A7F3D0"/>
    <text x="490" y="418" text-anchor="middle" fill="#0F172A" font-size="13" font-weight="700">ChatService (WebSockets)</text>
    <text x="490" y="438" text-anchor="middle" fill="#64748B" font-size="11">• joinMatch(matchId)</text>
    <text x="490" y="454" text-anchor="middle" fill="#64748B" font-size="11">• privateMessage / newMessage</text>
    <text x="490" y="470" text-anchor="middle" fill="#64748B" font-size="11">• Real-Time Ban Push Events</text>

    <!-- Tier 3: AI / NLP Analytical Layer -->
    <rect x="690" y="110" width="220" height="240" rx="14" fill="#FEF3C7" stroke="#FBBF24" stroke-width="2"/>
    <text x="800" y="144" text-anchor="middle" fill="#78350F" font-size="16" font-weight="800">3. AI / NLP Engine</text>
    <text x="800" y="164" text-anchor="middle" fill="#B45309" font-size="12" font-weight="600">Python + Scikit-Learn + NLTK</text>

    <rect x="710" y="182" width="180" height="68" rx="10" fill="#FFFFFF" stroke="#FDE68A"/>
    <text x="800" y="206" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="700">preprocessText(rawText)</text>
    <text x="800" y="224" text-anchor="middle" fill="#64748B" font-size="10.5">Tokenization, Stop-Words,</text>
    <text x="800" y="238" text-anchor="middle" fill="#64748B" font-size="10.5">Synonym Expansion (AI ↔ Artificial)</text>

    <rect x="710" y="262" width="180" height="68" rx="10" fill="#FFFFFF" stroke="#FDE68A"/>
    <text x="800" y="286" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="700">calculateSimilarity(A, B)</text>
    <text x="800" y="304" text-anchor="middle" fill="#64748B" font-size="10.5">TF-IDF Matrix Vectorization</text>
    <text x="800" y="318" text-anchor="middle" fill="#64748B" font-size="10.5">&amp; Cosine Similarity Scoring</text>

    <!-- Tier 4: Cloud Database Layer -->
    <rect x="690" y="380" width="460" height="240" rx="14" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2"/>
    <text x="920" y="414" text-anchor="middle" fill="#0C4A6E" font-size="16" font-weight="800">4. Cloud Database Layer (MongoDB Atlas)</text>
    <text x="920" y="434" text-anchor="middle" fill="#0369A1" font-size="12" font-weight="600">Mongoose ODM  •  Database: matching_app</text>

    <rect x="714" y="454" width="196" height="64" rx="10" fill="#FFFFFF" stroke="#BAE6FD"/>
    <text x="812" y="478" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="700">users Collection</text>
    <text x="812" y="496" text-anchor="middle" fill="#64748B" font-size="10.5">role (admin/user), topics,</text>
    <text x="812" y="510" text-anchor="middle" fill="#64748B" font-size="10.5">accountStatus, softBanUntil</text>

    <rect x="930" y="454" width="196" height="64" rx="10" fill="#FFFFFF" stroke="#BAE6FD"/>
    <text x="1028" y="478" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="700">topics Collection</text>
    <text x="1028" y="496" text-anchor="middle" fill="#64748B" font-size="10.5">topic_id, user_id,</text>
    <text x="1028" y="510" text-anchor="middle" fill="#64748B" font-size="10.5">topic_name, category</text>

    <rect x="714" y="534" width="196" height="64" rx="10" fill="#FFFFFF" stroke="#BAE6FD"/>
    <text x="812" y="558" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="700">matches Collection</text>
    <text x="812" y="576" text-anchor="middle" fill="#64748B" font-size="10.5">user1_id, user2_id,</text>
    <text x="812" y="590" text-anchor="middle" fill="#64748B" font-size="10.5">similarityScore, sharedTopics</text>

    <rect x="930" y="534" width="196" height="64" rx="10" fill="#FFFFFF" stroke="#BAE6FD"/>
    <text x="1028" y="558" text-anchor="middle" fill="#0F172A" font-size="12" font-weight="700">messages Collection</text>
    <text x="1028" y="576" text-anchor="middle" fill="#64748B" font-size="10.5">match_id, senderId,</text>
    <text x="1028" y="590" text-anchor="middle" fill="#64748B" font-size="10.5">content, timestamp</text>

    <!-- Connectors -->
    <line x1="290" y1="240" x2="358" y2="240" stroke="#4F46E5" stroke-width="2.5" marker-end="url(#arrow)"/>
    <line x1="290" y1="430" x2="358" y2="430" stroke="#4F46E5" stroke-width="2.5" marker-end="url(#arrow)"/>
    <line x1="620" y1="230" x2="688" y2="230" stroke="#4F46E5" stroke-width="2.5" marker-end="url(#arrow)"/>
    <line x1="620" y1="480" x2="688" y2="480" stroke="#4F46E5" stroke-width="2.5" marker-end="url(#arrow)"/>
  </svg>`;
  await sharp(Buffer.from(svgArch)).png().toFile(path.join(OUT_DIR, 'diagram_system_architecture.png'));

  console.log('✅ All 10 high-resolution UI screenshots and architecture diagrams generated!');
}

generateAllScreenshots().catch((err) => {
  console.error(err);
  process.exit(1);
});
