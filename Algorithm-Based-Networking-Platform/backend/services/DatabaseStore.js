const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Topic = require('../models/Topic');
const Match = require('../models/Match');
const Message = require('../models/Message');

const LOCAL_DATA_FILE = path.join(__dirname, '..', 'data', 'local_store.json');

class DatabaseStore {
  constructor() {
    this.isMongoConnected = false;
    this.mongoUri = process.env.MONGODB_URI || '';
    this.connectionStatus = 'Standby';
    this.memory = {
      users: [],
      topics: [],
      matches: [],
      messages: []
    };
    this.loadLocalBackup();
  }

  loadLocalBackup() {
    try {
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          this.memory = {
            users: parsed.users || [],
            topics: parsed.topics || [],
            matches: parsed.matches || [],
            messages: parsed.messages || []
          };
        }
      }
    } catch (_) {}
  }

  saveLocalBackup() {
    try {
      const dir = path.dirname(LOCAL_DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(this.memory, null, 2), 'utf8');
    } catch (_) {}
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  async connect(uri = process.env.MONGODB_URI) {
    const cleanUri = (uri || '').trim();
    if (!cleanUri) {
      this.isMongoConnected = false;
      this.connectionStatus = 'Local Storage Mode';
      return { connected: false, mode: 'local_fallback', status: this.connectionStatus };
    }

    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      await mongoose.connect(cleanUri, {
        serverSelectionTimeoutMS: 8000
      });
      this.isMongoConnected = true;
      this.mongoUri = cleanUri;
      this.connectionStatus = 'Connected to MongoDB Atlas';
      return { connected: true, mode: 'mongodb_atlas', status: this.connectionStatus };
    } catch (err) {
      this.isMongoConnected = false;
      this.connectionStatus = `Local Storage Mode (Atlas unreachable: ${err.message})`;
      return { connected: false, mode: 'local_fallback', error: err.message, status: this.connectionStatus };
    }
  }

  getStatus() {
    return {
      isMongoConnected: this.isMongoConnected,
      status: this.connectionStatus,
      hasMongoUri: Boolean(this.mongoUri)
    };
  }

  // Automatically lift expired soft-bans
  async normalizeUserBan(user) {
    if (!user) return null;
    if (
      user.accountStatus === 'soft_banned' &&
      user.softBanUntil &&
      new Date(user.softBanUntil) <= new Date()
    ) {
      return await this.updateUserModeration(user._id, {
        accountStatus: 'active',
        softBanUntil: null,
        banReason: ''
      });
    }
    return user;
  }

  // Upgrade existing seeded users so Gavin & Rohith are 'admin' and others are 'user'
  async ensureRoleDefaults() {
    const adminEmails = ['gavin@srmist.edu.in', 'rohith@vtsenterprises.com'];
    if (this.isMongoConnected) {
      await User.updateMany(
        { email: { $in: adminEmails } },
        { $set: { role: 'admin' } }
      );
      await User.updateMany(
        { email: { $nin: adminEmails }, role: { $nin: ['user', 'admin'] } },
        { $set: { role: 'user' } }
      );
      await User.updateMany(
        { accountStatus: { $exists: false } },
        { $set: { accountStatus: 'active', softBanUntil: null, banReason: '' } }
      );
    } else {
      this.memory.users = this.memory.users.map((u) => {
        const isDefaultAdmin = adminEmails.includes((u.email || '').toLowerCase());
        const validRole = u.role === 'admin' || u.role === 'user' ? u.role : (isDefaultAdmin ? 'admin' : 'user');
        return {
          ...u,
          role: isDefaultAdmin ? 'admin' : validRole,
          accountStatus: u.accountStatus || 'active',
          softBanUntil: u.softBanUntil || null,
          banReason: u.banReason || ''
        };
      });
      this.saveLocalBackup();
    }
  }

  // USERS
  async findUsers() {
    let list = [];
    if (this.isMongoConnected) {
      list = await User.find().sort({ createdAt: 1 }).lean();
    } else {
      list = [...this.memory.users];
    }
    const normalized = [];
    for (const u of list) {
      normalized.push(await this.normalizeUserBan(u));
    }
    return normalized;
  }

  async findUserById(id) {
    if (!id) return null;
    let user = null;
    if (this.isMongoConnected && mongoose.Types.ObjectId.isValid(String(id))) {
      user = await User.findById(id).lean();
    } else {
      user = this.memory.users.find((u) => String(u._id) === String(id)) || null;
    }
    return await this.normalizeUserBan(user);
  }

  async findUserByEmailOrUsername(email, username) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanUsername = (username || '').trim();
    let user = null;
    if (this.isMongoConnected) {
      const conditions = [];
      if (cleanEmail) conditions.push({ email: cleanEmail });
      if (cleanUsername) conditions.push({ username: cleanUsername });
      if (conditions.length === 0) return null;
      user = await User.findOne({ $or: conditions }).lean();
    } else {
      user =
        this.memory.users.find(
          (u) =>
            (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
            (cleanUsername && u.username.toLowerCase() === cleanUsername.toLowerCase())
        ) || null;
    }
    return await this.normalizeUserBan(user);
  }

  async createUser(userData) {
    const payload = {
      ...userData,
      role: userData.role === 'admin' ? 'admin' : 'user',
      title: userData.title || (userData.role === 'admin' ? 'Platform Admin' : 'Community Member'),
      accountStatus: userData.accountStatus || 'active',
      softBanUntil: userData.softBanUntil || null,
      banReason: userData.banReason || ''
    };
    if (this.isMongoConnected) {
      const created = await User.create(payload);
      return created.toObject();
    }
    const doc = {
      _id: payload._id || this.generateId(),
      username: payload.username,
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      bio: payload.bio || 'Passionate about meaningful conversations and shared interests.',
      role: payload.role,
      title: payload.title,
      avatarColor: payload.avatarColor || '#6366F1',
      topics: Array.isArray(payload.topics) ? payload.topics : [],
      clusterTheme: payload.clusterTheme || 'General Community',
      accountStatus: payload.accountStatus,
      softBanUntil: payload.softBanUntil,
      banReason: payload.banReason,
      createdAt: new Date()
    };
    this.memory.users.push(doc);
    this.saveLocalBackup();
    return doc;
  }

  async updateUserModeration(userId, updates) {
    const allowed = {};
    if (updates.role !== undefined) allowed.role = updates.role;
    if (updates.accountStatus !== undefined) allowed.accountStatus = updates.accountStatus;
    if (updates.softBanUntil !== undefined) allowed.softBanUntil = updates.softBanUntil;
    if (updates.banReason !== undefined) allowed.banReason = updates.banReason;
    if (updates.bio !== undefined) allowed.bio = updates.bio;
    if (updates.username !== undefined) allowed.username = updates.username;

    if (this.isMongoConnected && mongoose.Types.ObjectId.isValid(String(userId))) {
      return await User.findByIdAndUpdate(userId, { $set: allowed }, { new: true }).lean();
    }
    const idx = this.memory.users.findIndex((u) => String(u._id) === String(userId));
    if (idx === -1) return null;
    this.memory.users[idx] = { ...this.memory.users[idx], ...allowed };
    this.saveLocalBackup();
    return this.memory.users[idx];
  }

  async deleteUser(userId) {
    if (this.isMongoConnected && mongoose.Types.ObjectId.isValid(String(userId))) {
      await User.findByIdAndDelete(userId);
      await Match.deleteMany({ $or: [{ user1_id: userId }, { user2_id: userId }] });
      await Message.deleteMany({ $or: [{ senderId: String(userId) }, { receiverId: String(userId) }] });
      return true;
    }
    const before = this.memory.users.length;
    this.memory.users = this.memory.users.filter((u) => String(u._id) !== String(userId));
    this.memory.matches = this.memory.matches.filter(
      (m) => String(m.user1_id) !== String(userId) && String(m.user2_id) !== String(userId)
    );
    this.memory.messages = this.memory.messages.filter(
      (m) => String(m.senderId) !== String(userId) && String(m.receiverId) !== String(userId)
    );
    this.saveLocalBackup();
    return this.memory.users.length < before;
  }

  async updateUserTopics(userId, topics, clusterTheme) {
    if (this.isMongoConnected && mongoose.Types.ObjectId.isValid(String(userId))) {
      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: { topics, clusterTheme } },
        { new: true }
      ).lean();

      await Topic.findOneAndUpdate(
        { user_id: userId },
        {
          $set: {
            user_id: userId,
            topic_name: topics[0] || 'General Interests',
            category: clusterTheme || 'General',
            topic_list: topics
          }
        },
        { upsert: true, new: true }
      );
      return updated;
    }

    const idx = this.memory.users.findIndex((u) => String(u._id) === String(userId));
    if (idx === -1) return null;
    this.memory.users[idx].topics = topics;
    if (clusterTheme) {
      this.memory.users[idx].clusterTheme = clusterTheme;
    }
    this.saveLocalBackup();
    return this.memory.users[idx];
  }

  // TOPICS CATALOG
  async findTopics() {
    if (this.isMongoConnected) {
      return await Topic.find().sort({ createdAt: -1 }).lean();
    }
    return [...this.memory.topics];
  }

  async createTopic(topicData) {
    if (this.isMongoConnected) {
      const payload = { ...topicData };
      if (!payload.user_id || !mongoose.Types.ObjectId.isValid(String(payload.user_id))) {
        delete payload.user_id;
      }
      const created = await Topic.create(payload);
      return created.toObject();
    }
    const doc = {
      _id: this.generateId(),
      user_id: topicData.user_id || null,
      topic_name: topicData.topic_name,
      category: topicData.category || 'Community',
      topic_list: topicData.topic_list || [topicData.topic_name],
      createdAt: new Date()
    };
    this.memory.topics.push(doc);
    this.saveLocalBackup();
    return doc;
  }

  async deleteTopic(topicId) {
    if (this.isMongoConnected && mongoose.Types.ObjectId.isValid(String(topicId))) {
      await Topic.findByIdAndDelete(topicId);
      return true;
    }
    this.memory.topics = this.memory.topics.filter((t) => String(t._id) !== String(topicId));
    this.saveLocalBackup();
    return true;
  }

  // MATCHES
  async upsertMatch(user1Id, user2Id, similarityScore, sharedTopics, clusterTheme) {
    const score = Number(similarityScore);
    if (
      this.isMongoConnected &&
      mongoose.Types.ObjectId.isValid(String(user1Id)) &&
      mongoose.Types.ObjectId.isValid(String(user2Id))
    ) {
      return await Match.findOneAndUpdate(
        {
          $or: [
            { user1_id: user1Id, user2_id: user2Id },
            { user1_id: user2Id, user2_id: user1Id }
          ]
        },
        {
          $set: {
            user1_id: user1Id,
            user2_id: user2Id,
            similarityScore: score,
            score: score,
            sharedTopics: sharedTopics || [],
            clusterTheme: clusterTheme || 'General Community'
          }
        },
        { upsert: true, new: true }
      ).lean();
    }

    const existingIdx = this.memory.matches.findIndex(
      (m) =>
        (String(m.user1_id) === String(user1Id) && String(m.user2_id) === String(user2Id)) ||
        (String(m.user1_id) === String(user2Id) && String(m.user2_id) === String(user1Id))
    );
    const record = {
      _id: existingIdx >= 0 ? this.memory.matches[existingIdx]._id : this.generateId(),
      user1_id: String(user1Id),
      user2_id: String(user2Id),
      similarityScore: score,
      score: score,
      sharedTopics: sharedTopics || [],
      clusterTheme: clusterTheme || 'General Community',
      createdAt: new Date()
    };
    if (existingIdx >= 0) {
      this.memory.matches[existingIdx] = record;
    } else {
      this.memory.matches.push(record);
    }
    this.saveLocalBackup();
    return record;
  }

  async findMatches() {
    if (this.isMongoConnected) {
      return await Match.find().sort({ similarityScore: -1 }).lean();
    }
    return [...this.memory.matches].sort((a, b) => b.similarityScore - a.similarityScore);
  }

  // MESSAGES
  async createMessage(msgData) {
    if (this.isMongoConnected) {
      const created = await Message.create(msgData);
      return created.toObject();
    }
    const doc = {
      _id: this.generateId(),
      match_id: msgData.match_id,
      senderId: String(msgData.senderId),
      senderName: msgData.senderName || 'Member',
      receiverId: String(msgData.receiverId),
      content: msgData.content || msgData.message,
      message: msgData.message || msgData.content,
      timestamp: msgData.timestamp || new Date()
    };
    this.memory.messages.push(doc);
    this.saveLocalBackup();
    return doc;
  }

  async findMessagesByMatchId(matchId) {
    if (this.isMongoConnected) {
      return await Message.find({ match_id: String(matchId) }).sort({ timestamp: 1 }).lean();
    }
    return this.memory.messages
      .filter((m) => String(m.match_id) === String(matchId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async findAllMessages(limit = 50) {
    if (this.isMongoConnected) {
      return await Message.find().sort({ timestamp: -1 }).limit(limit).lean();
    }
    return [...this.memory.messages]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async deleteMessage(messageId) {
    if (this.isMongoConnected && mongoose.Types.ObjectId.isValid(String(messageId))) {
      await Message.findByIdAndDelete(messageId);
      return true;
    }
    this.memory.messages = this.memory.messages.filter((m) => String(m._id) !== String(messageId));
    this.saveLocalBackup();
    return true;
  }

  async countStats() {
    if (this.isMongoConnected) {
      const [usersCount, topicsCount, matchesCount, messagesCount] = await Promise.all([
        User.countDocuments(),
        Topic.countDocuments(),
        Match.countDocuments(),
        Message.countDocuments()
      ]);
      return { usersCount, topicsCount, matchesCount, messagesCount };
    }
    return {
      usersCount: this.memory.users.length,
      topicsCount: this.memory.topics.length,
      matchesCount: this.memory.matches.length,
      messagesCount: this.memory.messages.length
    };
  }
}

module.exports = DatabaseStore;
