"""
RIZVIWORLD — LAN production server entry point.
চালাতে:  python run_server.py
সব ল্যাপটপ/ফোন/ট্যাব/Smart TV browser থেকে:  http://<এই-কম্পিউটারের-LAN-IP>:8000
"""
import os
import socket
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rizviworld_site.settings")

import django
django.setup()

from waitress import serve
from rizviworld_site.wsgi import application


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    ip = lan_ip()
    print("=" * 60)
    print("RIZVIWORLD সার্ভার চালু হচ্ছে...")
    print(f"এই কম্পিউটারে:      http://127.0.0.1:8000")
    print(f"ফ্যাক্টরির যেকোনো ডিভাইস থেকে (একই WiFi/LAN-এ):  http://{ip}:8000")
    print("বন্ধ করতে Ctrl+C চাপুন")
    print("=" * 60)
    serve(application, host="0.0.0.0", port=8000, threads=16)
