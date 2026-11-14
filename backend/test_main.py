import asyncio
import io
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient
from PIL import Image

from backend import main


class FakeRestorer:
    def predict(self, image, batch_size):
        assert batch_size == 1
        return image.resize((image.width * 4, image.height * 4))


def image_bytes(image_format="PNG", size=(20, 10)):
    image = Image.new("RGB", size, color=(90, 120, 150))
    data = io.BytesIO()
    image.save(data, format=image_format)
    return data.getvalue()


def api_request(method, path, *, files=None):
    async def send_request():
        async with main.lifespan(main.app):
            async with AsyncClient(
                transport=ASGITransport(app=main.app),
                base_url="http://test",
            ) as client:
                return await client.request(method, path, files=files)

    return asyncio.run(send_request())


def test_health_reports_loaded_model():
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request("GET", "/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "model": "ai-forever/Real-ESRGAN",
        "scale": 4,
        "device": "cpu",
    }


def test_restore_returns_four_times_webp():
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request(
            "POST",
            "/api/restore",
            files={"file": ("sample.png", image_bytes(), "image/png")},
        )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/webp"
    with Image.open(io.BytesIO(response.content)) as restored:
        assert restored.size == (80, 40)


def test_restore_rejects_unsupported_image_format():
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request(
            "POST",
            "/api/restore",
            files={"file": ("sample.gif", image_bytes("GIF"), "image/gif")},
        )

    assert response.status_code == 415


def test_restore_rejects_invalid_image():
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request(
            "POST",
            "/api/restore",
            files={"file": ("sample.png", b"not an image", "image/png")},
        )

    assert response.status_code == 400


def test_restore_rejects_images_over_pixel_limit():
    too_large_image = image_bytes(size=(2001, 1500))
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request(
            "POST",
            "/api/restore",
            files={"file": ("large.png", too_large_image, "image/png")},
        )

    assert response.status_code == 413


def test_restore_rejects_files_over_byte_limit():
    too_large_file = b"x" * (main.MAX_UPLOAD_BYTES + 1)
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request(
            "POST",
            "/api/restore",
            files={"file": ("large.png", too_large_file, "image/png")},
        )

    assert response.status_code == 413


def test_request_body_middleware_rejects_oversized_requests():
    oversized_file = b"x" * (main.MAX_REQUEST_BYTES + 1)
    with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
        response = api_request(
            "POST",
            "/api/restore",
            files={"file": ("large.png", oversized_file, "image/png")},
        )

    assert response.status_code == 413
