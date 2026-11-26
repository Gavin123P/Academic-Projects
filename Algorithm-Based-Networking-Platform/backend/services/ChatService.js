/**
 * Section 5.6, 6.3.2.2 & Appendix D.3: Class ChatService
 * Manages the real-time communication layer using WebSockets (Socket.IO)
 * and persists chat history in MongoDB.
 */

class ChatService {
  constructor(io, dbStore) {
    this.io = io;
    this.dbStore = dbStore;
    this.activeSockets = new Map();
    this.setupSocketHandlers();
  }

  /**
   * Section 6.3.2.2 Method: sendMessage(senderId, receiverId, message, matchId, senderName)
   * Description: Transmits a message instantly to a specific matched user.
   * Input: senderId (String), receiverId (String), message (String).
   * Output: Boolean status of delivery success (and persisted message payload).
   */
  async sendMessage(senderId, receiverId, message, matchId = null, senderName = 'Member') {
    if (!senderId || !message || !String(message).trim()) {
      return { delivered: false, messageDoc: null };
    }

    const roomId = matchId || [String(senderId), String(receiverId)].sort().join('_');
    const timestamp = new Date();
    const cleanText = String(message).trim();

    const savedMsg = await this.dbStore.createMessage({
      match_id: roomId,
      senderId: String(senderId),
      senderName: senderName || 'Member',
      receiverId: String(receiverId || 'broadcast'),
      content: cleanText,
      message: cleanText,
      timestamp
    });

    const payload = {
      _id: savedMsg._id,
      matchId: roomId,
      match_id: roomId,
      senderId: String(senderId),
      senderName: senderName || 'Member',
      receiverId: String(receiverId || ''),
      content: cleanText,
      message: cleanText,
      timestamp: savedMsg.timestamp || timestamp
    };

    if (this.io) {
      // Appendix D.3: io.to(matchId).emit('newMessage', { senderId, message, timestamp })
      this.io.to(roomId).emit('newMessage', payload);
    }

    return { delivered: true, messageDoc: payload };
  }

  setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      this.activeSockets.set(socket.id, { connectedAt: new Date() });

      // Appendix D.3: Join a private room based on Match ID
      socket.on('joinMatch', (matchId) => {
        if (matchId) {
          socket.join(String(matchId));
          socket.emit('joinedMatch', { matchId: String(matchId), status: 'joined' });
        }
      });

      // Appendix D.3: Handle instant messaging
      socket.on('privateMessage', async ({ matchId, message, senderId, receiverId, senderName }, ack) => {
        try {
          const result = await this.sendMessage(senderId, receiverId, message, matchId, senderName);
          if (typeof ack === 'function') {
            ack({ ok: result.delivered, data: result.messageDoc });
          }
        } catch (err) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: err.message });
          }
        }
      });

      socket.on('disconnect', () => {
        this.activeSockets.delete(socket.id);
      });
    });
  }

  getActiveConnectionsCount() {
    return this.activeSockets.size;
  }
}

module.exports = ChatService;
