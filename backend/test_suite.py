from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)

    print("--- 1. Testing Health Endpoint ---")
    r1 = client.get('/health')
    assert r1.status_code == 200
    print("Health Status:", r1.json())

    print("\n--- 2. Testing Calm / Positive Text ---")
    r2 = client.post('/api/analyze', json={'text': 'Hello team, hope you are having a productive morning!'})
    assert r2.status_code == 200
    res2 = r2.json()
    print(f"Score: {res2['score']}, Level: {res2['level']}, Tone: {res2['primary_tone']}")
    assert res2['level'] == 'green'
    assert len(res2['suggestions']) == 0

    print("\n--- 3. Testing Passive-Aggressive Text ---")
    r3 = client.post('/api/analyze', json={'text': 'Per my last email, if you actually bothered to read the specs you would know this.'})
    assert r3.status_code == 200
    res3 = r3.json()
    print(f"Score: {res3['score']}, Level: {res3['level']}, Tone: {res3['primary_tone']}")
    print(f"Detected Triggers: {res3['triggers']}")
    assert res3['level'] == 'red'
    assert len(res3['suggestions']) >= 2
    for s in res3['suggestions']:
        print(f"  [{s['category']}] -> {s['text']}")

    print("\n--- 4. Testing Asynchronous WebSocket Tone Stream ---")
    with client.websocket_connect('/ws/tone') as ws:
        ws.send_text('{"text": "This is a complete waste of time!! Are you serious?"}')
        ws_data = ws.receive_json()
        print(f"WebSocket Result: Score={ws_data['score']}, Level={ws_data['level']}, Tone={ws_data['primary_tone']}")
        print(f"Triggers: {ws_data['triggers']}, Latency: {ws_data['latency_ms']}ms")
        assert ws_data['level'] == 'red'
        assert len(ws_data['suggestions']) >= 2

    print("\nALL BACKEND UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
