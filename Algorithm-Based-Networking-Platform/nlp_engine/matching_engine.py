"""
Algorithm-Based Networking Platform to Mitigate Social Isolation
Modules 5.3 & 5.4: Data Preprocessing Module (NLP) & Matching Algorithm Module
Implements Class MatchingEngine and Appendix D.1 TF-IDF + Cosine Similarity logic.
"""

import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Optional NLTK import with graceful fallback to built-in stop words
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    try:
        STOP_WORDS = set(stopwords.words("english"))
    except LookupError:
        nltk.download("stopwords", quiet=True)
        nltk.download("punkt", quiet=True)
        STOP_WORDS = set(stopwords.words("english"))
except Exception:
    STOP_WORDS = {
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
        "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
        "to", "was", "were", "will", "with", "about", "into", "through"
    }

# Semantic synonym & acronym dictionary for NLP context recognition (Section 2.3 & TC-03)
SEMANTIC_SYNONYMS: Dict[str, str] = {
    "ai": "artificial intelligence ai",
    "artificial intelligence": "artificial intelligence ai",
    "ml": "machine learning ml",
    "machine learning": "machine learning ml",
    "dl": "deep learning dl neural networks",
    "deep learning": "deep learning dl neural networks",
    "nlp": "natural language processing nlp",
    "natural language processing": "natural language processing nlp",
    "js": "javascript js programming",
    "javascript": "javascript js programming",
    "ts": "typescript ts javascript programming",
    "react native": "react native mobile app development",
    "mobile dev": "react native mobile app development",
    "web dev": "web development frontend backend fullstack",
    "web development": "web development frontend backend fullstack",
    "coding": "coding programming software development",
    "programming": "coding programming software development",
    "ui": "ui ux design user interface",
    "ux": "ui ux design user experience",
    "ds": "data science analytics machine learning",
    "data science": "data science analytics machine learning",
    "cybersec": "cybersecurity infosec network security",
    "cybersecurity": "cybersecurity infosec network security",
    "cloud": "cloud computing aws azure devops",
    "cloud computing": "cloud computing aws azure devops",
}

THEME_CLUSTERS: Dict[str, List[str]] = {
    "AI & Data Science": ["ai", "artificial", "intelligence", "ml", "machine", "learning", "data", "nlp", "neural", "deep", "python"],
    "Software & Web Engineering": ["coding", "programming", "javascript", "java", "react", "node", "web", "fullstack", "spring", "boot", "software", "cloud"],
    "Creative Arts & Design": ["design", "ui", "ux", "photography", "music", "art", "writing", "creative", "film", "reading"],
    "Wellness & Outdoors": ["fitness", "yoga", "meditation", "hiking", "running", "mental", "health", "mindfulness", "nature", "travel"],
    "Gaming & Sci-Fi": ["gaming", "esports", "chess", "scifi", "board", "games", "anime", "vr", "robotics"]
}


class MatchingEngine:
    """
    Section 6.3.2.1 Class: MatchingEngine
    Handles the core logic for identifying similarities between users.
    """

    def __init__(self):
        self.stop_words = STOP_WORDS

    def preprocessText(self, rawText: str) -> List[str]:
        """
        Method: preprocessText(rawText)
        Description: Cleans raw user input by removing noise, expanding semantic synonyms,
                     tokenizing, and removing stop-words.
        Input: A raw string of user interests.
        Output: A list of filtered tokens.
        """
        if not rawText:
            return []

        text_lower = rawText.lower().strip()

        # Check phrase-level semantic synonyms first
        parts = [p.strip() for p in re.split(r"[,;|]+", text_lower) if p.strip()]
        expanded_parts = []
        for part in parts:
            if part in SEMANTIC_SYNONYMS:
                expanded_parts.append(SEMANTIC_SYNONYMS[part])
            else:
                expanded_parts.append(part)

        combined_text = " ".join(expanded_parts) if expanded_parts else text_lower

        # Tokenize into alphanumeric words
        tokens = re.findall(r"[a-z0-9]+", combined_text)

        # Token-level stop-word removal and deduplication
        filtered_tokens: List[str] = []
        for token in tokens:
            if token in self.stop_words:
                continue
            if token not in filtered_tokens:
                filtered_tokens.append(token)

        return filtered_tokens

    def calculateSimilarity(self, userVectorA: List[float], userVectorB: List[float]) -> float:
        """
        Method: calculateSimilarity(userVectorA, userVectorB)
        Description: Computes the cosine similarity between two vectorized sets of topics.
        Input: Two arrays of numerical vectors representing user interests.
        Output: A float value between 0 and 1 representing the similarity score.
        """
        if not userVectorA or not userVectorB:
            return 0.0
        score = cosine_similarity([userVectorA], [userVectorB])[0][0]
        return float(round(max(0.0, min(1.0, score)), 4))

    def assignCluster(self, tokens: List[str]) -> str:
        """
        Section 5.4 Alternative Techniques: Group users with broader shared themes.
        """
        best_cluster = "General Community"
        best_hits = 0
        token_set = set(tokens)
        for cluster_name, keywords in THEME_CLUSTERS.items():
            hits = sum(1 for kw in keywords if kw in token_set)
            if hits > best_hits:
                best_hits = hits
                best_cluster = cluster_name
        return best_cluster


def get_similarity_score(user_a_topics: str, user_b_topics: str) -> float:
    """
    Appendix D.1: Matching Logic (Python + Scikit-Learn)
    Uses TF-IDF Vectorization to turn text topics into numbers and
    Cosine Similarity to find the match percentage between two users.
    """
    engine = MatchingEngine()
    tokens_a = " ".join(engine.preprocessText(user_a_topics))
    tokens_b = " ".join(engine.preprocessText(user_b_topics))

    if not tokens_a or not tokens_b:
        return 0.0

    corpus = [tokens_a, tokens_b]

    # Initialize Vectorizer to convert text to numerical vectors
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Calculate Cosine Similarity
    score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return float(round(score[0][0], 4))


if __name__ == "__main__":
    # Example Usage from Appendix D.1 & System Test Log (Table 6.3)
    print(f"Match Accuracy (Java/Spring): {get_similarity_score('coding, java', 'java, spring boot')}")
    print(f"TC-02 (AI, ML): {get_similarity_score('AI, ML', 'AI, Machine Learning')}")
    print(f"TC-03 (AI vs Artificial Intelligence): {get_similarity_score('AI', 'Artificial Intelligence')}")
