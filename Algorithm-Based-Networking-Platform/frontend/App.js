import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { io } from 'socket.io-client';
import { API_BASE_URL, apiRequest } from './src/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('gavin@srmist.edu.in');
  const [password, setPassword] = useState('password123');
  const [bio, setBio] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  // Tabs: 'topics' | 'matches' | 'chat' | 'admin' (admin only)
  const [activeTab, setActiveTab] = useState('matches');

  // Interests
  const [catalogTopics, setCatalogTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [clusterTheme, setClusterTheme] = useState('Community');
  const [savingTopics, setSavingTopics] = useState(false);
  const [topicSaveBanner, setTopicSaveBanner] = useState('');

  // Matches
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Chat
  const [activeChatMatch, setActiveChatMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Admin Console State
  const [adminOverview, setAdminOverview] = useState(null);
  const [labTopicA, setLabTopicA] = useState('AI, ML');
  const [labTopicB, setLabTopicB] = useState('Artificial Intelligence, Machine Learning');
  const [labResult, setLabResult] = useState(null);

  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [usersList, topicsData] = await Promise.all([
        apiRequest('/api/users'),
        apiRequest('/api/topics')
      ]);
      setDemoUsers(usersList || []);
      setCatalogTopics(topicsData.catalog || []);
    } catch (_) {}
  }

  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketConnected(false);
      return;
    }

    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('newMessage', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });

    socket.on('userModerated', (payload) => {
      if (String(currentUser._id) === String(payload.userId)) {
        if (payload.accountStatus === 'banned' || payload.accountStatus === 'soft_banned') {
          setCurrentUser(null);
          setAuthError(
            payload.accountStatus === 'banned'
              ? `Your account has been suspended by an administrator. ${payload.banReason || ''}`
              : `Your account is temporarily restricted until ${new Date(payload.softBanUntil).toLocaleString()}.`
          );
        }
      }
    });

    socket.on('userDeleted', (payload) => {
      if (String(currentUser._id) === String(payload.userId)) {
        setCurrentUser(null);
        setAuthError('Your account has been removed by an administrator.');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setSelectedTopics(currentUser.topics || []);
      loadMatchesForUser(currentUser._id);
      if (currentUser.role === 'admin') {
        loadAdminData();
      }
    }
  }, [currentUser]);

  async function loadMatchesForUser(userId) {
    setLoadingMatches(true);
    try {
      const data = await apiRequest(`/api/matches/${userId}`);
      setMatches(data.recommendations || []);
      setClusterTheme(data.clusterTheme || 'Community');
      if (!activeChatMatch && data.recommendations && data.recommendations.length > 0) {
        setActiveChatMatch(data.recommendations[0]);
      }
    } catch (_) {
    } finally {
      setLoadingMatches(false);
    }
  }

  async function loadAdminData() {
    try {
      const data = await apiRequest('/api/admin/overview');
      setAdminOverview(data);
      setDemoUsers(data.users || []);
    } catch (_) {}
  }

  async function handleAuthSubmit() {
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setCurrentUser(res.user);
        setActiveTab('matches');
      } else {
        const res = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            email,
            password,
            bio: bio || 'Excited to connect over shared interests and meaningful conversations.',
            topics: ['Artificial Intelligence', 'Photography']
          })
        });
        setCurrentUser(res.user);
        setActiveTab('topics');
        fetchInitialData();
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleQuickDemoLogin(demoEmail) {
    setEmail(demoEmail);
    setPassword('password123');
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: demoEmail, password: 'password123' })
      });
      setCurrentUser(res.user);
      setActiveChatMatch(null);
      setActiveTab('matches');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function toggleTopicSelection(topicName) {
    setTopicSaveBanner('');
    setSelectedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName]
    );
  }

  function handleAddCustomTopic() {
    const clean = customTopicInput.trim();
    if (!clean) return;
    if (!selectedTopics.includes(clean)) {
      setSelectedTopics((prev) => [...prev, clean]);
    }
    setCustomTopicInput('');
  }

  async function handleSaveTopics() {
    if (!currentUser) return;
    setSavingTopics(true);
    setTopicSaveBanner('');
    try {
      const res = await apiRequest('/api/topics', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser._id,
          topics: selectedTopics
        })
      });
      setCurrentUser(res.user);
      setMatches(res.matches || []);
      setTopicSaveBanner('✨ Your interests have been saved and your matches are updated!');
    } catch (err) {
      setTopicSaveBanner(err.message);
    } finally {
      setSavingTopics(false);
    }
  }

  async function openChatWithMatch(matchItem) {
    setActiveChatMatch(matchItem);
    setActiveTab('chat');
    if (socketRef.current && matchItem.matchId) {
      socketRef.current.emit('joinMatch', matchItem.matchId);
    }
    try {
      const history = await apiRequest(`/api/messages/${matchItem.matchId}`);
      setMessages(history || []);
    } catch (_) {
      setMessages([]);
    }
  }

  async function handleSendMessage(customText = null) {
    const textToSend = customText !== null ? customText : messageInput;
    if (!textToSend || !textToSend.trim() || !currentUser || !activeChatMatch) return;

    const cleanMsg = textToSend.trim();
    if (customText === null) setMessageInput('');

    const payload = {
      matchId: activeChatMatch.matchId,
      senderId: currentUser._id,
      senderName: currentUser.username,
      receiverId: activeChatMatch.user._id,
      message: cleanMsg
    };

    try {
      const saved = await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(saved._id))) return prev;
        return [...prev, saved];
      });
    } catch (err) {
      alert(err.message);
    }
  }

  // Admin Moderation Handlers
  async function handleAdminModerate(userId, action, durationMinutes = 60, reason = '') {
    try {
      await apiRequest(`/api/admin/users/${userId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ action, durationMinutes, reason })
      });
      loadAdminData();
      loadMatchesForUser(currentUser._id);
    } catch (_) {}
  }

  async function handleAdminRoleToggle(userId, currentRole) {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await apiRequest(`/api/admin/users/${userId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole })
      });
      loadAdminData();
    } catch (_) {}
  }

  async function handleAdminDeleteUser(userId) {
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
      loadAdminData();
      loadMatchesForUser(currentUser._id);
    } catch (_) {}
  }

  async function handleRunSimilarityLab() {
    try {
      const res = await apiRequest('/api/nlp/similarity', {
        method: 'POST',
        body: JSON.stringify({
          user_a_topics: labTopicA,
          user_b_topics: labTopicB
        })
      });
      setLabResult(res);
    } catch (_) {}
  }

  // ==========================================================================
  // SIGN IN / CREATE ACCOUNT SCREEN
  // ==========================================================================
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.rootContainer}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <View style={styles.brandBadgeRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandBadgeText}>KINDRED COMMUNITY</Text>
            </View>
            <Text style={styles.authTitle}>Meet people who share your passions.</Text>
            <Text style={styles.authSubtitle}>
              Skip the endless scrolling. Pick the topics you care about and start real conversations with like-minded people.
            </Text>

            <View style={styles.modeSwitchRow}>
              <TouchableOpacity
                style={[styles.modeBtn, authMode === 'login' && styles.modeBtnActive]}
                onPress={() => { setAuthMode('login'); setAuthError(''); }}
              >
                <Text style={[styles.modeBtnText, authMode === 'login' && styles.modeBtnTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, authMode === 'register' && styles.modeBtnActive]}
                onPress={() => { setAuthMode('register'); setAuthError(''); }}
              >
                <Text style={[styles.modeBtnText, authMode === 'register' && styles.modeBtnTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Alex Rivera"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About You</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell others what you love talking about..."
                  value={bio}
                  onChangeText={setBio}
                />
              </View>
            )}

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleAuthSubmit}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {authMode === 'login' ? 'Sign In' : 'Join Kindred'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.demoSection}>
              <Text style={styles.demoSectionTitle}>
                Quick Switch Accounts (Test Admin vs Member Experience)
              </Text>
              <View style={styles.demoGrid}>
                {demoUsers.map((u) => (
                  <TouchableOpacity
                    key={u._id}
                    style={styles.demoChip}
                    onPress={() => handleQuickDemoLogin(u.email)}
                  >
                    <View style={[styles.avatarMini, { backgroundColor: u.avatarColor || '#4F46E5' }]}>
                      <Text style={styles.avatarMiniText}>
                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.demoChipName}>{u.username}</Text>
                        <View style={[styles.roleBadge, u.role === 'admin' ? styles.roleAdmin : styles.roleMember]}>
                          <Text style={[styles.roleBadgeText, u.role === 'admin' ? styles.roleAdminText : styles.roleMemberText]}>
                            {u.role === 'admin' ? '🛡 Admin' : 'Member'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.demoChipTopics} numberOfLines={1}>
                        {(u.topics || []).join(' • ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: currentUser.avatarColor || '#4F46E5' }]}>
            <Text style={styles.avatarText}>
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.headerTitle}>{currentUser.username}</Text>
              <View style={[styles.roleBadge, isAdmin ? styles.roleAdmin : styles.roleMember]}>
                <Text style={[styles.roleBadgeText, isAdmin ? styles.roleAdminText : styles.roleMemberText]}>
                  {isAdmin ? '🛡 Admin' : 'Member'}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: socketConnected ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.headerSub}>
                {socketConnected ? 'Online' : 'Connecting...'} • {clusterTheme}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            setCurrentUser(null);
            fetchInitialData();
          }}
        >
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Role-Based Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'topics' && styles.navTabActive]}
          onPress={() => setActiveTab('topics')}
        >
          <Text style={[styles.navTabText, activeTab === 'topics' && styles.navTabTextActive]}>
            My Interests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'matches' && styles.navTabActive]}
          onPress={() => {
            setActiveTab('matches');
            loadMatchesForUser(currentUser._id);
          }}
        >
          <Text style={[styles.navTabText, activeTab === 'matches' && styles.navTabTextActive]}>
            Discover ({matches.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'chat' && styles.navTabActive]}
          onPress={() => {
            if (!activeChatMatch && matches.length > 0) {
              openChatWithMatch(matches[0]);
            } else {
              setActiveTab('chat');
            }
          }}
        >
          <Text style={[styles.navTabText, activeTab === 'chat' && styles.navTabTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.navTab, activeTab === 'admin' && styles.navTabActive]}
            onPress={() => {
              setActiveTab('admin');
              loadAdminData();
            }}
          >
            <Text style={[styles.navTabText, activeTab === 'admin' && styles.navTabTextActive]}>
              🛡 Admin Console
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TAB 1: MY INTERESTS */}
      {activeTab === 'topics' && (
        <ScrollView contentContainerStyle={styles.screenContent}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What are you passionate about?</Text>
            <Text style={styles.sectionDesc}>
              Add your favorite topics or pick from the list below. We use your interests to introduce you to people who care about the same things.
            </Text>

            <View style={styles.addTopicRow}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                placeholder="Add a custom interest (e.g., Indie Games, AI)..."
                value={customTopicInput}
                onChangeText={setCustomTopicInput}
              />
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddCustomTopic}>
                <Text style={styles.secondaryBtnText}>+ Add Interest</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subHeading}>Your Selected Interests ({selectedTopics.length})</Text>
            <View style={styles.pillsWrap}>
              {selectedTopics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[styles.topicPill, styles.topicPillSelected]}
                  onPress={() => toggleTopicSelection(topic)}
                >
                  <Text style={styles.topicPillTextSelected}>{topic}  ✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            {topicSaveBanner ? (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>{topicSaveBanner}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveTopics}
              disabled={savingTopics}
            >
              {savingTopics ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Save My Interests & Update Matches</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Explore Popular Topics</Text>
            <View style={styles.pillsWrap}>
              {catalogTopics.map((item) => {
                const isSelected = selectedTopics.includes(item.topic_name);
                return (
                  <TouchableOpacity
                    key={item.topic_name}
                    style={[styles.topicPill, isSelected && styles.topicPillSelected]}
                    onPress={() => toggleTopicSelection(item.topic_name)}
                  >
                    <Text style={[styles.topicPillText, isSelected && styles.topicPillTextSelected]}>
                      {isSelected ? '✓ ' : '+ '}
                      {item.topic_name} • {item.category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* TAB 2: DISCOVER PEOPLE (Clean for regular users, no NLP Verifier shown here) */}
      {activeTab === 'matches' && (
        <ScrollView contentContainerStyle={styles.screenContent}>
          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>People You Might Click With</Text>
                <Text style={styles.sectionDesc}>
                  Based on your shared interests in {(currentUser.topics || []).join(', ')}.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => loadMatchesForUser(currentUser._id)}
              >
                <Text style={styles.secondaryBtnText}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>

            {loadingMatches ? (
              <ActivityIndicator size="large" color="#4F46E5" style={{ marginVertical: 24 }} />
            ) : (
              matches.map((item) => (
                <View key={item.user._id} style={styles.matchCard}>
                  <View style={styles.matchCardTop}>
                    <View style={[styles.avatarCircle, { backgroundColor: item.user.avatarColor || '#0EA5E9' }]}>
                      <Text style={styles.avatarText}>
                        {item.user.username ? item.user.username.charAt(0).toUpperCase() : 'M'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={styles.matchNameRow}>
                        <Text style={styles.matchName}>{item.user.username}</Text>
                        <View style={styles.clusterPill}>
                          <Text style={styles.clusterPillText}>{item.clusterTheme}</Text>
                        </View>
                      </View>
                      <Text style={styles.matchBio}>{item.user.bio}</Text>
                    </View>

                    <View style={[
                      styles.scoreBadge,
                      item.similarityScore >= 0.7 ? styles.scoreHigh : item.similarityScore >= 0.35 ? styles.scoreMed : styles.scoreLow
                    ]}>
                      <Text style={styles.scorePercentText}>{item.matchPercentage}%</Text>
                      <Text style={styles.scoreSubText}>Match</Text>
                    </View>
                  </View>

                  <View style={styles.matchTopicsRow}>
                    <Text style={styles.matchLabel}>Interests: </Text>
                    {(item.user.topics || []).map((t) => (
                      <View key={t} style={styles.miniTopicChip}>
                        <Text style={styles.miniTopicChipText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  {item.sharedTokens && item.sharedTokens.length > 0 && (
                    <View style={styles.sharedBox}>
                      <Text style={styles.sharedText}>
                        ✨ In common: {item.sharedTokens.join(', ')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.matchFooter}>
                    <TouchableOpacity
                      style={styles.chatActionBtn}
                      onPress={() => openChatWithMatch(item)}
                    >
                      <Text style={styles.chatActionBtnText}>💬 Message {item.user.username.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* TAB 3: MESSAGES */}
      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <View style={styles.chatMatchRibbon}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {matches.map((m) => {
                const isSelected = activeChatMatch && activeChatMatch.user._id === m.user._id;
                return (
                  <TouchableOpacity
                    key={m.user._id}
                    style={[styles.ribbonItem, isSelected && styles.ribbonItemActive]}
                    onPress={() => openChatWithMatch(m)}
                  >
                    <Text style={[styles.ribbonName, isSelected && styles.ribbonNameActive]}>
                      {m.user.username} • {m.matchPercentage}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {activeChatMatch ? (
            <View style={styles.chatWindow}>
              <View style={styles.chatHeaderBanner}>
                <View>
                  <Text style={styles.chatPartnerName}>{activeChatMatch.user.username}</Text>
                  <Text style={styles.chatPartnerMeta}>
                    {activeChatMatch.matchPercentage}% Compatibility • {(activeChatMatch.user.topics || []).slice(0, 3).join(', ')}
                  </Text>
                </View>
                <View style={styles.wsBadge}>
                  <Text style={styles.wsBadgeText}>● Online</Text>
                </View>
              </View>

              <View style={styles.icebreakerBar}>
                <Text style={styles.icebreakerLabel}>Conversation Starters:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={styles.icebreakerChip}
                    onPress={() => handleSendMessage(`Hey ${activeChatMatch.user.username.split(' ')[0]}! How is your week going?`)}
                  >
                    <Text style={styles.icebreakerChipText}>👋 Say hello!</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.icebreakerChip}
                    onPress={() => handleSendMessage(`Saw we both enjoy ${(activeChatMatch.user.topics || ['similar topics'])[0]}—what got you into it?`)}
                  >
                    <Text style={styles.icebreakerChipText}>✨ Ask about interests</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <ScrollView contentContainerStyle={styles.messagesFeed}>
                {messages.length === 0 ? (
                  <Text style={styles.emptyChatText}>
                    No messages yet. Say hello to start the conversation!
                  </Text>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = String(msg.senderId) === String(currentUser._id);
                    return (
                      <View
                        key={msg._id || index}
                        style={[styles.msgBubbleWrap, isMe ? styles.msgRight : styles.msgLeft]}
                      >
                        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
                          <Text style={[styles.msgSender, isMe && { color: '#E0E7FF' }]}>
                            {isMe ? 'You' : msg.senderName || activeChatMatch.user.username}
                          </Text>
                          <Text style={[styles.msgText, isMe && { color: '#FFFFFF' }]}>
                            {msg.message || msg.content}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.chatInputBar}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder="Write a message..."
                  value={messageInput}
                  onChangeText={setMessageInput}
                  onSubmitEditing={() => handleSendMessage()}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendMessage()}>
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              <Text>Pick someone from your Discover tab to start chatting.</Text>
            </View>
          )}
        </View>
      )}

      {/* TAB 4: ADMIN CONSOLE (Admins Only) */}
      {activeTab === 'admin' && isAdmin && (
        <ScrollView contentContainerStyle={styles.screenContent}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🛡 Admin Control Center</Text>
            <Text style={styles.sectionDesc}>
              Manage members, promote admins, or apply temporary soft-bans, permanent bans, or account deletions.
            </Text>

            {(adminOverview ? adminOverview.users : demoUsers).map((u) => {
              const isSelf = String(u._id) === String(currentUser._id);
              return (
                <View key={u._id} style={styles.matchCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.matchName}>
                        {u.username} ({u.role === 'admin' ? 'Admin' : 'Member'}) — Status: {u.accountStatus || 'active'}
                      </Text>
                      <Text style={styles.matchBio}>{u.email}</Text>
                    </View>
                  </View>

                  {!isSelf && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => handleAdminRoleToggle(u._id, u.role)}
                      >
                        <Text style={styles.secondaryBtnText}>
                          {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                        </Text>
                      </TouchableOpacity>

                      {u.accountStatus === 'active' ? (
                        <>
                          <TouchableOpacity
                            style={[styles.secondaryBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                            onPress={() => handleAdminModerate(u._id, 'soft_ban', 60, '1-hour cooldown')}
                          >
                            <Text style={{ color: '#92400E', fontWeight: '700', fontSize: 12 }}>⏳ Soft-Ban (1h)</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.secondaryBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
                            onPress={() => handleAdminModerate(u._id, 'ban', 0, 'Suspended by admin')}
                          >
                            <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 12 }}>🚫 Ban</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={[styles.secondaryBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}
                          onPress={() => handleAdminModerate(u._id, 'unban')}
                        >
                          <Text style={{ color: '#166534', fontWeight: '700', fontSize: 12 }}>✓ Lift Ban</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.secondaryBtn, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}
                        onPress={() => handleAdminDeleteUser(u._id)}
                      >
                        <Text style={{ color: '#475569', fontWeight: '700', fontSize: 12 }}>🗑 Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🔬 Admin Match Simulator</Text>
            <Text style={styles.sectionDesc}>
              Test how any two interest sets match (Admin-only diagnostic tool).
            </Text>
            <TextInput style={styles.textInput} value={labTopicA} onChangeText={setLabTopicA} />
            <TextInput style={styles.textInput} value={labTopicB} onChangeText={setLabTopicB} />
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleRunSimilarityLab}>
              <Text style={styles.secondaryBtnText}>Test Compatibility</Text>
            </TouchableOpacity>
            {labResult && (
              <View style={styles.sharedBox}>
                <Text style={styles.sharedText}>
                  Compatibility: {Math.round(labResult.similarityScore * 100)}% • Shared: {(labResult.sharedTokens || []).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  authScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  authCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  brandBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5', marginRight: 8 },
  brandBadgeText: { fontSize: 11, fontWeight: '800', color: '#4F46E5', letterSpacing: 0.8 },
  authTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  authSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 20 },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 18
  },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: '#FFFFFF' },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  modeBtnTextActive: { color: '#0F172A', fontWeight: '700' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 6 },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginTop: 6
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryBtnText: { color: '#4338CA', fontSize: 12, fontWeight: '700' },
  errorText: { color: '#DC2626', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  demoSection: { marginTop: 24, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  demoSectionTitle: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 12 },
  demoGrid: { gap: 8 },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6
  },
  avatarMini: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarMiniText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  demoChipName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  demoChipTopics: { fontSize: 11, color: '#64748B' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  roleAdmin: { backgroundColor: '#E0E7FF' },
  roleMember: { backgroundColor: '#F1F5F9' },
  roleBadgeText: { fontSize: 10, fontWeight: '700' },
  roleAdminText: { color: '#3730A3' },
  roleMemberText: { color: '#475569' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  headerSub: { fontSize: 12, color: '#64748B' },
  logoutBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12
  },
  navTab: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  navTabActive: { borderBottomColor: '#4F46E5' },
  navTabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  navTabTextActive: { color: '#4F46E5', fontWeight: '700' },
  screenContent: { padding: 18, maxWidth: 960, width: '100%', alignSelf: 'center' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 19 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  addTopicRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  subHeading: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 10 },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  topicPill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  topicPillSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  topicPillText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  topicPillTextSelected: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  successBanner: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC', padding: 10, borderRadius: 8, marginBottom: 10 },
  successBannerText: { color: '#166534', fontSize: 13, fontWeight: '600' },
  matchCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  matchCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  matchNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  matchName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  clusterPill: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  clusterPillText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  matchBio: { fontSize: 12, color: '#475569', lineHeight: 17 },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center', minWidth: 74 },
  scoreHigh: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' },
  scoreMed: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A' },
  scoreLow: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  scorePercentText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  scoreSubText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  matchTopicsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 10 },
  matchLabel: { fontSize: 12, fontWeight: '700', color: '#475569' },
  miniTopicChip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  miniTopicChipText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  sharedBox: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  sharedText: { fontSize: 12, fontWeight: '600', color: '#4338CA' },
  matchFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
  chatActionBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  chatActionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  chatContainer: { flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', padding: 14 },
  chatMatchRibbon: { marginBottom: 10 },
  ribbonItem: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  ribbonItemActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  ribbonName: { fontSize: 12, fontWeight: '700', color: '#334155' },
  ribbonNameActive: { color: '#FFFFFF' },
  chatWindow: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  chatHeaderBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  chatPartnerName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  chatPartnerMeta: { fontSize: 11, color: '#64748B', marginTop: 2 },
  wsBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  wsBadgeText: { fontSize: 11, fontWeight: '700', color: '#166534' },
  icebreakerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#EEF2FF', borderBottomWidth: 1, borderBottomColor: '#E0E7FF' },
  icebreakerLabel: { fontSize: 11, fontWeight: '700', color: '#4338CA', marginRight: 8 },
  icebreakerChip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, marginRight: 8 },
  icebreakerChipText: { fontSize: 11, fontWeight: '600', color: '#4338CA' },
  messagesFeed: { padding: 16, flexGrow: 1 },
  emptyChatText: { textAlign: 'center', color: '#94A3B8', marginTop: 40, fontSize: 13 },
  msgBubbleWrap: { marginBottom: 12, flexDirection: 'row' },
  msgRight: { justifyContent: 'flex-end' },
  msgLeft: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '78%', padding: 12, borderRadius: 14 },
  msgBubbleMe: { backgroundColor: '#4F46E5', borderBottomRightRadius: 2 },
  msgBubbleOther: { backgroundColor: '#F1F5F9', borderBottomLeftRadius: 2 },
  msgSender: { fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 3 },
  msgText: { fontSize: 14, color: '#0F172A', lineHeight: 20 },
  chatInputBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#F8FAFC', gap: 10 },
  chatTextInput: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sendBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 }
});
