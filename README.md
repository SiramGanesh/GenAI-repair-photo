# Revive

Revive is a React + Vite photo upscaling frontend backed by the upstream PyTorch implementation of [ai-forever/Real-ESRGAN](https://huggingface.co/ai-forever/Real-ESRGAN). The backend uses the model's 4× checkpoint, downloaded from Hugging Face on first startup and cached locally.

The model performs super-resolution and can reduce common image artifacts; it does not specifically repair scratches or colorize black-and-white photos.

## Requirements

- Node.js 18 or newer.
- Python 3.11–3.13 recommended.
- A CUDA-capable GPU is recommended. CPU inference is supported but can be slow.
- On CPU, full-resolution restoration can take several minutes, especially for large images. For practical processing times, run the backend with a CUDA-enabled PyTorch build and GPU.
- The initial backend startup downloads the model checkpoint (approximately 68 MB) from the pinned Hugging Face model revision.

## Run locally

From the repository root, install the CPU version of PyTorch and backend dependencies:

```powershell
py -3.13 -m venv backend\.venv
backend\.venv\Scripts\python -m pip install --upgrade pip
backend\.venv\Scripts\python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
backend\.venv\Scripts\python -m pip install "setuptools<81"
backend\.venv\Scripts\python -m pip install --no-build-isolation -r backend\requirements.txt
backend\.venv\Scripts\python -m uvicorn backend.main:app --reload
```

Run backend API tests (optional):

```powershell
backend\.venv\Scripts\python -m pip install "setuptools<81"
backend\.venv\Scripts\python -m pip install --no-build-isolation -r backend\requirements-dev.txt
backend\.venv\Scripts\python -m pytest backend\test_main.py
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). Vite proxies `/api` requests to the backend at `http://127.0.0.1:8000`.

For GPU inference, install the PyTorch/torchvision build matching your CUDA version instead of the CPU-wheel command. The backend automatically uses CUDA when available; set `REAL_ESRGAN_DEVICE=cpu`, `cuda`, or `auto` to override. Set `MODEL_CACHE_DIR` to change the weight cache, `REAL_ESRGAN_REVISION` to select another model commit, and `ALLOWED_ORIGINS` to a comma-separated origin list when deploying.

Create a production frontend build with `npm run build` in `frontend/`; preview it with `npm run preview`. In production, route `/api` to the backend using the deployment's reverse proxy.

## API

- `GET /api/health` — model readiness, device, and scale.
- `POST /api/restore` — multipart form field `file` with JPEG, PNG, or WebP (up to 8 MB and 3 megapixels); returns an upscaled WebP image. Send an `X-Request-ID` UUID to track progress.
- `GET /api/restore/progress/{request_id}` — percentage of model tiles completed for an active restoration request.

Uploads are validated and processed for each request; the application does not persist the source or result images. The multipart framework may temporarily spool upload data before the endpoint closes it. The backend serializes inference to limit model memory use. Before public deployment, add suitable authentication or rate limiting and configure proxy request-size and timeout limits to accommodate image uploads and model inference.

## Pages

- `/restore` — restoration tool and model information (default page). `/` redirects here.
- `/pricing` — illustrative, non-purchasable plan preview.
- `/showcase` — sample photos with illustrative comparison sliders and category filters.

Login, checkout, dedicated scratch repair, and colorization are not implemented. See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for remaining production decisions.
