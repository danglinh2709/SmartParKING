from flask import Flask, request, jsonify
from plate_ocr import read_plate

app = Flask(__name__)

@app.route("/ocr", methods=["POST"])
def ocr_plate():
    try:
        data = request.get_json(force=True, silent=True)
        if not data or "image" not in data:
            return jsonify({ "text": "" })

        text = read_plate(data["image"])
        return jsonify({ "text": text })

    except Exception as e:
        print("❌ FLASK ROUTE ERROR:", str(e))
        return jsonify({ "text": "" })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000)
