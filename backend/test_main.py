import asyncio
import io
from types import SimpleNamespace
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient
from PIL import Image

from backend import main


class FakeRestorer:
    def predict(self, image, batch_size):
        assert batch_size == 1
        return image.resize((image.width * 4, image.height * 4))


class FakeModel:
    def register_forward_hook(self, callback):
        self.callback = callback
        return SimpleNamespace(remove=lambda: None)

    def finish_patch(self):
        self.callback(self, (SimpleNamespace(shape=(1,)),), None)


class ProgressRestorer:
    def __init__(self):
        self.model = FakeModel()

    def predict(self, image, batch_size):
        assert batch_size == 1
        for _ in range(4):
            self.model.finish_patch()
        return image


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


def test_predict_reports_completed_model_patches():
    restorer = ProgressRestorer()
    progress = []

    result = main.predict_with_progress(
        restorer,
        Image.new("RGB", (256, 256)),
        batch_size=1,
        on_progress=lambda completed, total: progress.append((completed, total)),
    )

    assert result.size == (256, 256)
    assert progress == [(1, 4), (2, 4), (3, 4), (4, 4)]


def test_restore_progress_reports_active_request():
    request_id = "8f0c67f6-91f7-4e16-b9f0-e9ac38e5161a"

    async def send_request():
        with patch.object(main, "load_restorer", return_value=(FakeRestorer(), "cpu")):
            async with main.lifespan(main.app):
                main.app.state.restoration_progress[request_id] = 37
                async with AsyncClient(
                    transport=ASGITransport(app=main.app),
                    base_url="http://test",
                ) as client:
                    return await client.get(f"/api/restore/progress/{request_id}")

    response = asyncio.run(send_request())

    assert response.status_code == 200
    assert response.json() == {"progress": 37}


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
