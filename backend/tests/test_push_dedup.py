import os
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from flask import Flask

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from features.announcement.controller import send_broadcast_push
from shared.fcm import send_push_batch


class SendPushBatchDedupTest(unittest.TestCase):
    def test_send_push_batch_dedups_tokens_and_preserves_order(self):
        captured_tokens = []

        def fake_send_each_for_multicast(message):
            captured_tokens.extend(message.tokens)
            return SimpleNamespace(success_count=len(message.tokens), failure_count=0)

        with patch("shared.fcm.messaging.send_each_for_multicast", side_effect=fake_send_each_for_multicast):
            result = send_push_batch(
                [" token-a ", None, "", "token-b", "token-a", "token-c", "token-b"],
                "Judul",
                "Isi",
                {"type": "test"},
            )

        self.assertEqual(captured_tokens, ["token-a", "token-b", "token-c"])
        self.assertEqual(result, {"success": 3, "failure": 0})

    def test_send_push_batch_returns_zero_when_only_empty_tokens(self):
        with patch("shared.fcm.messaging.send_each_for_multicast") as send_each_for_multicast:
            result = send_push_batch([None, "", "   ", "\t"], "Judul", "Isi", {"type": "test"})

        send_each_for_multicast.assert_not_called()
        self.assertEqual(result, {"success": 0, "failure": 0})


class SendBroadcastPushDedupTest(unittest.TestCase):
    def test_send_broadcast_push_cleans_and_dedups_tokens_before_batch_send(self):
        app = Flask(__name__)
        captured_tokens = []

        fake_prefs = [
            {"fcm_token": " token-a "},
            {"fcm_token": None},
            {"fcm_token": ""},
            {"fcm_token": "token-b"},
            {"fcm_token": "token-a"},
            {"fcm_token": "token-c"},
            {"fcm_token": "token-b"},
            {"fcm_token": "   token-d   "},
        ]

        def fake_find(*args, **kwargs):
            return fake_prefs

        def fake_send_push_batch(tokens, title, body, data=None):
            captured_tokens.extend(tokens)
            return {"success": len(tokens), "failure": 0}

        controller_module = __import__("features.announcement.controller", fromlist=["mongo"])
        controller_module.mongo.db = SimpleNamespace(
            user_preferences=SimpleNamespace(find=fake_find)
        )

        with app.test_request_context(
            "/push",
            method="POST",
            json={"title": "Info", "body": "Pesan broadcast"},
        ), patch("features.announcement.controller.send_push_batch", side_effect=fake_send_push_batch):
            response = send_broadcast_push()

        flask_response, status_code = response

        self.assertEqual(captured_tokens, ["token-a", "token-b", "token-c", "token-d"])
        self.assertEqual(status_code, 200)
        self.assertEqual(flask_response.get_json()["tokens_sent"], 4)
        self.assertEqual(flask_response.get_json()["push_result"], {"success": 4, "failure": 0})


if __name__ == "__main__":
    unittest.main()
