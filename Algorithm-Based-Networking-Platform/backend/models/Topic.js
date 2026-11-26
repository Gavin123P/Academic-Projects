const mongoose = require('mongoose');

// Table 6.2 & ER Diagram (Section 4.8): Topics and Interests Schema
const TopicSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  topic_name: { type: String, required: true, trim: true },
  category: { type: String, default: 'Technology' },
  topic_list: [{ type: String }], // List of strings representing user interests (Table 6.2)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topic', TopicSchema);
