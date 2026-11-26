/**
 * Section 5.3, 5.4 & 6.3.2.1: Class MatchingEngine
 * Integrates with the Python NLP Microservice (when running on port 5001)
 * and provides an identical built-in TF-IDF + Cosine Similarity + NLP Preprocessing engine
 * so the platform functions reliably in all environments.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'about', 'into', 'through',
  'i', 'love', 'like', 'interested', 'in', 'exploring', 'learning'
]);

// Semantic Synonym & Acronym Mapping (Section 2.3, 4.3 & TC-03: "AI" vs "Artificial Intelligence")
const SEMANTIC_SYNONYMS = {
  'ai': 'artificial intelligence ai',
  'artificial intelligence': 'artificial intelligence ai',
  'ml': 'machine learning ml',
  'machine learning': 'machine learning ml',
  'dl': 'deep learning dl',
  'deep learning': 'deep learning dl',
  'nlp': 'natural language processing nlp',
  'natural language processing': 'natural language processing nlp',
  'js': 'javascript js',
  'javascript': 'javascript js',
  'ts': 'typescript ts',
  'react native': 'react native mobile',
  'mobile dev': 'react native mobile',
  'web dev': 'web development',
  'ui': 'ui ux design',
  'ux': 'ui ux design',
  'ds': 'data science ds',
  'data science': 'data science ds'
};

const THEME_CLUSTERS = {
  'AI & Data Science': ['ai', 'artificial', 'intelligence', 'ml', 'machine', 'learning', 'data', 'nlp', 'neural', 'deep', 'python'],
  'Software & Web Engineering': ['coding', 'programming', 'javascript', 'java', 'react', 'node', 'web', 'fullstack', 'spring', 'boot', 'software', 'cloud'],
  'Creative Arts & Design': ['design', 'ui', 'ux', 'photography', 'music', 'art', 'writing', 'creative', 'film', 'reading'],
  'Wellness & Outdoors': ['fitness', 'yoga', 'meditation', 'hiking', 'running', 'mental', 'health', 'mindfulness', 'nature', 'travel'],
  'Gaming & Sci-Fi': ['gaming', 'esports', 'chess', 'scifi', 'board', 'games', 'anime', 'vr', 'robotics']
};

class MatchingEngine {
  constructor(pythonServiceUrl = process.env.PYTHON_NLP_URL || 'http://localhost:5001') {
    this.pythonServiceUrl = pythonServiceUrl;
  }

  /**
   * Section 6.3.2.1 Method: preprocessText(rawText)
   * Description: Cleans raw user input by removing noise, stop-words, and expanding semantic synonyms.
   * Input: A raw string (or array) of user interests.
   * Output: A list of filtered tokens.
   */
  preprocessText(rawText) {
    if (!rawText) return [];
    const inputStr = Array.isArray(rawText) ? rawText.join(', ') : String(rawText);
    const lower = inputStr.toLowerCase().trim();

    // Phrase-level semantic normalization
    const phrases = lower
      .split(/[,;|]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const expandedPhrases = phrases.map((phrase) => {
      if (SEMANTIC_SYNONYMS[phrase]) {
        return SEMANTIC_SYNONYMS[phrase];
      }
      return phrase;
    });

    const combined = expandedPhrases.length > 0 ? expandedPhrases.join(' ') : lower;
    const rawTokens = combined.match(/[a-z0-9]+/g) || [];

    const filteredTokens = [];
    for (const token of rawTokens) {
      if (STOP_WORDS.has(token)) continue;
      if (!filteredTokens.includes(token)) {
        filteredTokens.push(token);
      }
    }

    return filteredTokens;
  }

  /**
   * Section 6.3.2.1 Method: calculateSimilarity(userVectorA, userVectorB)
   * Description: Computes the cosine similarity between two vectorized sets of topics.
   * Input: Two arrays of numerical vectors representing user interests.
   * Output: A float value between 0 and 1 representing the similarity score.
   */
  calculateSimilarity(userVectorA, userVectorB) {
    if (!Array.isArray(userVectorA) || !Array.isArray(userVectorB)) return 0;
    if (userVectorA.length === 0 || userVectorA.length !== userVectorB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < userVectorA.length; i++) {
      dotProduct += userVectorA[i] * userVectorB[i];
      normA += userVectorA[i] * userVectorA[i];
      normB += userVectorB[i] * userVectorB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    const score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Number(Math.max(0, Math.min(1, score)).toFixed(4));
  }

  /**
   * Builds TF-IDF vectors for two topic sets (matching Appendix D.1 TfidfVectorizer)
   * and computes Cosine Similarity via calculateSimilarity().
   */
  getSimilarityScoreLocal(userATopics, userBTopics) {
    const tokensA = this.preprocessText(userATopics);
    const tokensB = this.preprocessText(userBTopics);

    if (tokensA.length === 0 || tokensB.length === 0) {
      return {
        similarityScore: 0,
        tokensA,
        tokensB,
        sharedTokens: [],
        semanticMatch: false
      };
    }

    const vocab = Array.from(new Set([...tokensA, ...tokensB]));
    const docs = [tokensA, tokensB];
    const N = docs.length;

    // Scikit-Learn smooth_idf=True TF-IDF formula: idf(t) = log((1 + N) / (1 + df(t))) + 1
    const tfidfVectors = docs.map((docTokens) => {
      const tfMap = {};
      for (const t of docTokens) {
        tfMap[t] = (tfMap[t] || 0) + 1;
      }
      return vocab.map((term) => {
        const tf = tfMap[term] || 0;
        if (tf === 0) return 0;
        const df = docs.reduce((count, d) => count + (d.includes(term) ? 1 : 0), 0);
        const idf = Math.log((1 + N) / (1 + df)) + 1;
        return tf * idf;
      });
    });

    const similarityScore = this.calculateSimilarity(tfidfVectors[0], tfidfVectors[1]);
    const setB = new Set(tokensB);
    const sharedTokens = Array.from(new Set(tokensA.filter((t) => setB.has(t)))).sort();

    return {
      similarityScore,
      tokensA,
      tokensB,
      sharedTokens,
      semanticMatch: similarityScore >= 0.5
    };
  }

  /**
   * Calls the Python NLP Microservice if reachable, otherwise uses local TF-IDF + Cosine Similarity.
   */
  async computeSimilarity(userATopics, userBTopics) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600);
      const response = await fetch(`${this.pythonServiceUrl}/similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_a_topics: userATopics,
          user_b_topics: userBTopics
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        return { ...data, engineSource: 'Python Scikit-Learn NLP Microservice' };
      }
    } catch (_) {
      // Fallback to built-in TF-IDF + Cosine Similarity engine
    }

    const result = this.getSimilarityScoreLocal(userATopics, userBTopics);
    return { ...result, engineSource: 'TF-IDF & Cosine Similarity Engine' };
  }

  assignCluster(rawTopicsOrTokens) {
    const tokens = Array.isArray(rawTopicsOrTokens)
      ? this.preprocessText(rawTopicsOrTokens.join(', '))
      : this.preprocessText(rawTopicsOrTokens);
    const tokenSet = new Set(tokens);
    let bestCluster = 'General Community';
    let maxHits = 0;

    for (const [clusterName, keywords] of Object.entries(THEME_CLUSTERS)) {
      const hits = keywords.reduce((acc, kw) => acc + (tokenSet.has(kw) ? 1 : 0), 0);
      if (hits > maxHits) {
        maxHits = hits;
        bestCluster = clusterName;
      }
    }
    return bestCluster;
  }
}

module.exports = {
  MatchingEngine,
  SEMANTIC_SYNONYMS,
  THEME_CLUSTERS
};
