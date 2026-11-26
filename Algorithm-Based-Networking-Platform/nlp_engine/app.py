"""
Python NLP Microservice (Flask API)
Exposes REST endpoints for the Node.js Backend to invoke the MatchingEngine.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from matching_engine import MatchingEngine, get_similarity_score

app = Flask(__name__)
CORS(app)
engine = MatchingEngine()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "Python NLP Matching Engine",
        "algorithms": ["TF-IDF Vectorizer", "Cosine Similarity", "Tokenization & Stop-word Removal", "Semantic Synonym Normalization"]
    })


@app.route("/preprocess", methods=["POST"])
def preprocess():
    data = request.get_json(force=True) or {}
    raw_text = data.get("text", "")
    tokens = engine.preprocessText(raw_text)
    cluster = engine.assignCluster(tokens)
    return jsonify({
        "rawText": raw_text,
        "tokens": tokens,
        "clusterTheme": cluster
    })


@app.route("/similarity", methods=["POST"])
def similarity():
    data = request.get_json(force=True) or {}
    user_a = data.get("user_a_topics", "")
    user_b = data.get("user_b_topics", "")
    if isinstance(user_a, list):
        user_a = ", ".join(user_a)
    if isinstance(user_b, list):
        user_b = ", ".join(user_b)

    score = get_similarity_score(user_a, user_b)
    tokens_a = engine.preprocessText(user_a)
    tokens_b = engine.preprocessText(user_b)
    shared = sorted(list(set(tokens_a).intersection(set(tokens_b))))

    return jsonify({
        "similarityScore": score,
        "tokensA": tokens_a,
        "tokensB": tokens_b,
        "sharedTokens": shared,
        "semanticMatch": score > 0.5
    })


@app.route("/rank-candidates", methods=["POST"])
def rank_candidates():
    data = request.get_json(force=True) or {}
    target_topics = data.get("targetTopics", [])
    candidates = data.get("candidates", [])

    target_str = ", ".join(target_topics) if isinstance(target_topics, list) else str(target_topics)
    target_tokens = engine.preprocessText(target_str)

    results = []
    for cand in candidates:
        cand_topics = cand.get("topics", [])
        cand_str = ", ".join(cand_topics) if isinstance(cand_topics, list) else str(cand_topics)
        cand_tokens = engine.preprocessText(cand_str)
        score = get_similarity_score(target_str, cand_str)
        shared_tokens = sorted(list(set(target_tokens).intersection(set(cand_tokens))))
        results.append({
            "userId": cand.get("userId"),
            "similarityScore": score,
            "sharedTokens": shared_tokens,
            "clusterTheme": engine.assignCluster(cand_tokens)
        })

    results.sort(key=lambda x: x["similarityScore"], reverse=True)
    return jsonify({
        "targetCluster": engine.assignCluster(target_tokens),
        "targetTokens": target_tokens,
        "matches": results
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
