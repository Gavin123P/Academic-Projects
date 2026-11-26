const bcrypt = require('bcryptjs');

const DEFAULT_TOPIC_CATALOG = [
  { topic_name: 'Artificial Intelligence', category: 'AI & Data Science', topic_list: ['AI', 'Artificial Intelligence', 'Neural Networks'] },
  { topic_name: 'Machine Learning', category: 'AI & Data Science', topic_list: ['ML', 'Machine Learning', 'Scikit-Learn'] },
  { topic_name: 'Natural Language Processing', category: 'AI & Data Science', topic_list: ['NLP', 'Natural Language Processing', 'Text Mining'] },
  { topic_name: 'Data Science', category: 'AI & Data Science', topic_list: ['Data Science', 'Python', 'Analytics'] },
  { topic_name: 'React Native', category: 'Software & Web Engineering', topic_list: ['React Native', 'Mobile Development', 'JavaScript'] },
  { topic_name: 'Node.js & Express', category: 'Software & Web Engineering', topic_list: ['Node.js', 'Express.js', 'WebSockets'] },
  { topic_name: 'Java & Spring Boot', category: 'Software & Web Engineering', topic_list: ['Java', 'Spring Boot', 'Coding'] },
  { topic_name: 'Cloud Computing', category: 'Software & Web Engineering', topic_list: ['Cloud Computing', 'AWS', 'DevOps'] },
  { topic_name: 'UI/UX Design', category: 'Creative Arts & Design', topic_list: ['UI', 'UX', 'Design Systems'] },
  { topic_name: 'Photography & Visual Arts', category: 'Creative Arts & Design', topic_list: ['Photography', 'Visual Storytelling', 'Art'] },
  { topic_name: 'Creative Writing & Books', category: 'Creative Arts & Design', topic_list: ['Reading', 'Creative Writing', 'Literature'] },
  { topic_name: 'Mindfulness & Meditation', category: 'Wellness & Outdoors', topic_list: ['Mindfulness', 'Meditation', 'Mental Health'] },
  { topic_name: 'Hiking & Nature', category: 'Wellness & Outdoors', topic_list: ['Hiking', 'Nature', 'Travel'] },
  { topic_name: 'Chess & Strategy Games', category: 'Gaming & Sci-Fi', topic_list: ['Chess', 'Board Games', 'Sci-Fi'] }
];

const DEMO_USERS = [
  {
    username: 'Gavin Paul P',
    email: 'gavin@srmist.edu.in',
    passwordPlain: 'password123',
    bio: 'Building thoughtful communities and exploring AI, mobile apps, and human-centered tech.',
    role: 'admin',
    title: 'Founder & Admin',
    avatarColor: '#4F46E5',
    topics: ['AI', 'ML', 'Natural Language Processing', 'React Native', 'Node.js']
  },
  {
    username: 'Ananya Sharma',
    email: 'ananya.ai@srmist.edu.in',
    passwordPlain: 'password123',
    bio: 'Curious about ethical AI, language models, and meeting people who love learning new things.',
    role: 'user',
    title: 'AI Researcher',
    avatarColor: '#0EA5E9',
    topics: ['Artificial Intelligence', 'Machine Learning', 'NLP', 'Python']
  },
  {
    username: 'Rohith Kumar',
    email: 'rohith@vtsenterprises.com',
    passwordPlain: 'password123',
    bio: 'Full-stack architect who enjoys mentoring developers, cloud architecture, and weekend coffee chats.',
    role: 'admin',
    title: 'Community Admin',
    avatarColor: '#10B981',
    topics: ['React Native', 'Node.js', 'JavaScript', 'Cloud Computing', 'AI']
  },
  {
    username: 'Karthik Rajan',
    email: 'karthik.dev@gmail.com',
    passwordPlain: 'password123',
    bio: 'Backend developer working with Java and Spring Boot. Always up for discussing system design.',
    role: 'user',
    title: 'Software Engineer',
    avatarColor: '#F59E0B',
    topics: ['Coding', 'Java', 'Spring Boot', 'Cloud Computing']
  },
  {
    username: 'Meera Nair',
    email: 'meera.design@gmail.com',
    passwordPlain: 'password123',
    bio: 'Product designer, street photographer, and mindfulness enthusiast looking for creative friends.',
    role: 'user',
    title: 'Product Designer',
    avatarColor: '#EC4899',
    topics: ['UI/UX Design', 'Photography', 'Mindfulness', 'Reading']
  },
  {
    username: 'Vikram Aditya',
    email: 'vikram.ds@gmail.com',
    passwordPlain: 'password123',
    bio: 'Data scientist who spends weekends playing chess and discovering new hiking trails.',
    role: 'user',
    title: 'Data Scientist',
    avatarColor: '#8B5CF6',
    topics: ['Artificial Intelligence', 'Data Science', 'Chess', 'Hiking']
  }
];

async function seedDatabase(dbStore, matchingEngine) {
  await dbStore.ensureRoleDefaults();
  const existingUsers = await dbStore.findUsers();
  if (existingUsers.length > 0) {
    return { seeded: false, usersCount: existingUsers.length };
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const createdUsers = [];

  for (const u of DEMO_USERS) {
    const clusterTheme = matchingEngine.assignCluster(u.topics);
    const created = await dbStore.createUser({
      username: u.username,
      email: u.email,
      password: passwordHash,
      bio: u.bio,
      role: u.role,
      title: u.title,
      avatarColor: u.avatarColor,
      topics: u.topics,
      clusterTheme,
      accountStatus: 'active'
    });
    createdUsers.push(created);
  }

  for (const t of DEFAULT_TOPIC_CATALOG) {
    await dbStore.createTopic(t);
  }

  const primaryUser = createdUsers[0];
  for (let i = 1; i < createdUsers.length; i++) {
    const other = createdUsers[i];
    const sim = await matchingEngine.computeSimilarity(primaryUser.topics, other.topics);
    await dbStore.upsertMatch(
      primaryUser._id,
      other._id,
      sim.similarityScore,
      sim.sharedTokens,
      other.clusterTheme
    );
  }

  if (createdUsers.length >= 2) {
    const u1 = createdUsers[0];
    const u2 = createdUsers[1];
    const roomId = [String(u1._id), String(u2._id)].sort().join('_');

    await dbStore.createMessage({
      match_id: roomId,
      senderId: String(u2._id),
      senderName: u2.username,
      receiverId: String(u1._id),
      content: 'Hi Gavin! Saw we share a bunch of interests around AI and language models—great to connect!',
      message: 'Hi Gavin! Saw we share a bunch of interests around AI and language models—great to connect!',
      timestamp: new Date(Date.now() - 360000)
    });

    await dbStore.createMessage({
      match_id: roomId,
      senderId: String(u1._id),
      senderName: u1.username,
      receiverId: String(u2._id),
      content: 'Hey Ananya! Likewise! What kind of AI projects have you been exploring lately?',
      message: 'Hey Ananya! Likewise! What kind of AI projects have you been exploring lately?',
      timestamp: new Date(Date.now() - 180000)
    });
  }

  return { seeded: true, usersCount: createdUsers.length };
}

module.exports = {
  seedDatabase,
  DEFAULT_TOPIC_CATALOG,
  DEMO_USERS
};
