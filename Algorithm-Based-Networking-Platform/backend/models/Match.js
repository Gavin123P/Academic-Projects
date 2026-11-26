const mongoose = require('mongoose');

// ER Diagram (Section 4.8) & Appendix D.2: Match Schema
const MatchSchema = new mongoose.Schema({
  user1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  similarityScore: { type: Number, required: true },
  score: { type: Number, required: true }, // Alias matching ER Diagram 'score'
  sharedTopics: [{ type: String }],
  clusterTheme: { type: String, default: 'General Community' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);
