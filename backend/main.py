import asyncio
import io
import logging
import math
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Any, Callable
from uuid import UUID

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger("revive")

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 128 * 1024
MAX_IMAGE_PIXELS = 3_000_000
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
MODEL_PATCH_SIZE = 192
MODEL_EDGE_PADDING = 15


def predict_with_progress(
    restorer: Any,
    image: Image.Image,
    batch_size: int,
    on_progress: Callable[[int, int], None],
) -> Image.Image:
    model = getattr(restorer, "model", None)
    if model is None:
        return restorer.predict(image, batch_size=batch_size)

    width, height = image.size
    total_patches = math.ceil(
        (height + MODEL_EDGE_PADDING * 2) / MODEL_PATCH_SIZE
    ) * math.ceil((width + MODEL_EDGE_PADDING * 2) / MODEL_PATCH_SIZE)
    completed_patches = 0

    def report_batch(*hook_args: Any):
        nonlocal completed_patches
        inputs = hook_args[1]
        completed_patches += inputs[0].shape[0]
        on_progress(completed_patches, total_patches)

    hook = model.register_forward_hook(report_batch)
    try:
        return restorer.predict(image, batch_size=batch_size)
    finally:
        hook.remove()


class RequestBodyLimitMiddleware:
    def __init__(self, app, max_body_bytes: int):
        self.app = app
        self.max_body_bytes = max_body_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")
        if content_length:
            try:
                if int(content_length) > self.max_body_bytes:
                    await self._reject(send)
                    return
            except ValueError:
                await self._reject(send)
                return

        received_bytes = 0

        async def limited_receive():
            nonlocal received_bytes
            message = await receive()
            if message["type"] == "http.request":
                received_bytes += len(message.get("body", b""))
                if received_bytes > self.max_body_bytes:
                    raise RequestBodyTooLarge
            return message

        try:
            await self.app(scope, limited_receive, send)
        except RequestBodyTooLarge:
            await self._reject(send)

    async def _reject(self, send):
        body = b'{"detail":"Request body exceeds the allowed size."}'
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode("ascii")),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})


class RequestBodyTooLarge(Exception):
    pass


def load_restorer():
    import torch
    from huggingface_hub import hf_hub_download
    from RealESRGAN import RealESRGAN

    requested_device = os.getenv("REAL_ESRGAN_DEVICE", "auto").lower()
    if requested_device not in {"auto", "cpu", "cuda"}:
        raise RuntimeError("REAL_ESRGAN_DEVICE must be auto, cpu, or cuda.")
    if requested_device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA was requested but no CUDA device is available.")

    device_name = (
        "cuda"
        if requested_device == "cuda"
        or (requested_device == "auto" and torch.cuda.is_available())
        else "cpu"
    )
    cache_dir = Path(os.getenv("MODEL_CACHE_DIR", Path.home() / ".cache" / "revive"))
    cache_dir.mkdir(parents=True, exist_ok=True)
    weight_path = hf_hub_download(
        repo_id="ai-forever/Real-ESRGAN",
        filename="RealESRGAN_x4.pth",
        revision=os.getenv(
            "REAL_ESRGAN_REVISION",
            "8110204ebf8d25c031b66c26c2d1098aa831157e",
        ),
        cache_dir=str(cache_dir),
    )

    restorer = RealESRGAN(torch.device(device_name), scale=4)
    restorer.load_weights(weight_path, download=False)
    logger.info("Loaded ai-forever/Real-ESRGAN x4 on %s", device_name)
    return restorer, device_name


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.restorer, app.state.device = await run_in_threadpool(load_restorer)
    app.state.inference_lock = asyncio.Semaphore(1)
    app.state.restoration_progress = {}
    yield


app = FastAPI(title="Revive image restoration API", lifespan=lifespan)
app.add_middleware(RequestBodyLimitMiddleware, max_body_bytes=MAX_REQUEST_BYTES)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Request-ID"],
)


@app.get("/api/health")
async def health(request: Request):
    return {
        "status": "ready",
        "model": "ai-forever/Real-ESRGAN",
        "scale": 4,
        "device": request.app.state.device,
    }


@app.get("/api/restore/progress/{request_id}")
async def restore_progress(request_id: UUID, request: Request):
    progress = request.app.state.restoration_progress.get(str(request_id))
    if progress is None:
        raise HTTPException(status_code=404, detail="Restoration progress is unavailable.")
    return {"progress": progress}


def decode_image(data: bytes):
    try:
        with Image.open(io.BytesIO(data)) as image:
            if image.format not in ALLOWED_FORMATS:
                raise HTTPException(
                    status_code=415,
                    detail="Use a JPEG, PNG, or WebP image.",
                )
            width, height = image.size
            if width < 1 or height < 1 or width * height > MAX_IMAGE_PIXELS:
                raise HTTPException(
                    status_code=413,
                    detail="Images must be no larger than 3 megapixels.",
                )
            image.verify()

        with Image.open(io.BytesIO(data)) as image:
            return image.convert("RGB")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid supported image.",
        ) from error


@app.post("/api/restore")
async def restore_image(
    request: Request,
    file: Annotated[UploadFile, File(description="JPEG, PNG, or WebP image")],
    request_id: Annotated[UUID | None, Header(alias="X-Request-ID")] = None,
):
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()
    if not data:
        raise HTTPException(status_code=400, detail="Choose an image to restore.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller.")

    image = decode_image(data)
    try:
        request_id_string = str(request_id) if request_id else None
        if request_id_string:
            request.app.state.restoration_progress[request_id_string] = 0
        loop = asyncio.get_running_loop()

        def update_progress(completed: int, total: int):
            if request_id_string:
                progress = min(99, int(completed / total * 100))
                loop.call_soon_threadsafe(
                    request.app.state.restoration_progress.__setitem__,
                    request_id_string,
                    progress,
                )

        async with request.app.state.inference_lock:
            result = await run_in_threadpool(
                predict_with_progress,
                request.app.state.restorer,
                image,
                1,
                update_progress,
            )
    except Exception as error:
        logger.exception("Real-ESRGAN inference failed")
        raise HTTPException(
            status_code=503,
            detail="Restoration failed. Please try again.",
        ) from error
    finally:
        if request_id:
            request.app.state.restoration_progress.pop(str(request_id), None)

    output = io.BytesIO()
    result.save(output, format="WEBP", quality=90, method=4)
    return Response(
        content=output.getvalue(),
        media_type="image/webp",
        headers={
            "Content-Disposition": 'attachment; filename="revived.webp"',
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )
