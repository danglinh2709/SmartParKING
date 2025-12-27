import easyocr
import cv2
import base64
import numpy as np

reader = easyocr.Reader(['en'], gpu=False)

def read_plate(base64_img):
    try:
        if not base64_img or "," not in base64_img:
            return ""

        b64 = base64_img.split(",", 1)[1]
        img_data = base64.b64decode(b64)

        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return ""

        # resize cho ổn định
        h, w = img.shape[:2]
        if max(h, w) > 800:
            scale = 800 / max(h, w)
            img = cv2.resize(img, None, fx=scale, fy=scale)

        results = reader.readtext(img, detail=0, paragraph=False)

        return "".join(results).upper()

    except Exception as e:
        print("❌ OCR ERROR:", e)
        return ""
