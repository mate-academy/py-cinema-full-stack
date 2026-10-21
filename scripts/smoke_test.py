"""Check the real frontend proxy, authentication and uploaded-media origin."""
import json
import sys
import time
from urllib.error import URLError
from urllib.request import Request, urlopen

base_url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5173"
for attempt in range(60):
    try:
        with urlopen(base_url + "/api/schema/", timeout=3) as response:
            assert response.status == 200
        break
    except (URLError, TimeoutError, ConnectionError):
        time.sleep(1)
else:
    raise RuntimeError("Cinema API did not become ready")

if "--wait" not in sys.argv:
    payload = json.dumps({
        "email": "admin@example.com", "password": "Cinema-demo-2026!"
    }).encode()
    request = Request(base_url + "/api/user/token/", data=payload, headers={
        "Content-Type": "application/json"
    })
    with urlopen(request, timeout=5) as response:
        token = json.load(response)["access"]
    request = Request(base_url + "/api/cinema/movies/", headers={
        "Authorization": f"Bearer {token}"
    })
    with urlopen(request, timeout=5) as response:
        movies = json.load(response)
    assert len(movies) >= 3
    for movie in movies:
        assert movie["image"].startswith(base_url + "/media/")
        with urlopen(movie["image"], timeout=5) as response:
            assert response.status == 200
            assert response.headers["Content-Type"].startswith("image/")
    with urlopen(base_url, timeout=5) as response:
        assert response.status == 200
    print("Frontend proxy, JWT login, catalogue and poster serving passed.")
