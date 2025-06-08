from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
from fuzzywuzzy import fuzz
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://cdsf-frontend.onrender.com"]}})

# Load the trained model
model_path = 'Newly_created_cdsf_Ai_model.pkl'
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file {model_path} not found.")
with open(model_path, 'rb') as f:
    cdsf_model = pickle.load(f)


@app.route('/lookup', methods=['POST'])
def lookup_word():
    data = request.get_json()
    word = data.get('word', '').lower().strip()
    if word in cdsf_model:
        return jsonify({'found': True, 'data': cdsf_model[word]})
    else:
        return jsonify({'found': False, 'message': f"Word '{word}' not found in the dataset."})


@app.route('/detect', methods=['POST'])
def detect_words():
    data = request.get_json()
    sentence = data.get('sentence', '').lower().strip()
    # Split sentence into words, removing punctuation
    words = re.findall(r'\b\w+\b', sentence)

    matches = []
    similarity_threshold = 90  # Stricter threshold to reduce false positives

    for word in words:
        # Prioritize exact matches
        if word in cdsf_model:
            matches.append({
                'word': word,
                'matched_word': word,
                'similarity': 100,
                'data': cdsf_model[word]
            })
        else:
            # Fuzzy matching for non-exact matches, with length filter
            best_match = {'word': word, 'matched_word': None, 'similarity': 0, 'data': None}
            for model_word in cdsf_model.keys():
                # Skip fuzzy matching for very short words (length < 3) unless exact
                if len(word) < 3:
                    continue
                similarity = fuzz.token_sort_ratio(word, model_word)
                if similarity >= similarity_threshold and similarity > best_match['similarity']:
                    best_match = {
                        'word': word,
                        'matched_word': model_word,
                        'similarity': similarity,
                        'data': cdsf_model[model_word]
                    }
            if best_match['matched_word']:
                matches.append(best_match)

    return jsonify({
        'sentence': sentence,
        'matches': matches
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
