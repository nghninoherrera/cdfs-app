from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)