# Revive Frontend Implementation

## Design sources

- Landing page: Superdesign project `9f37ff7b-b2d0-4035-82fc-6789e5427142`, draft `909183a3-fb1d-4beb-8a7c-d765190a923b` (v3)
- Pricing: draft `61995580-b8d0-40d8-b1e0-59adbf16ccd7` (v1)
- Showcase: draft `a087f81e-061e-42d7-84fc-2af998851eb7` (v1)

## Agreed scope

- Frontend: React + Vite.
- Pages: landing (`/`), pricing (`/pricing`), showcase (`/showcase`).
- Model: `ai-forever/Real-ESRGAN`, using the upstream PyTorch implementation pinned to a Git commit and the x4 checkpoint pinned to a Hugging Face model revision.

## Implemented

- Added the React/Vite entry point, shared navigation/footer, and the three responsive routes.
- Added the warm Revive design system, local Plus Jakarta Sans and DM Serif Display font packages, accessible navigation controls, and reduced-motion styling.
- Added keyboard- and pointer-operable comparison sliders and category filters on the showcase page.
- Added local showcase image assets based on the Superdesign draft references.
- Added same-origin route prefetching and progressive navigation view transitions, with reduced-motion overrides.
- Added a FastAPI backend with model startup/loading, health and image-upscale endpoints, JPEG/PNG/WebP validation, upload size and pixel limits, serialized inference, and configured CORS.
- Connected the landing page's upload flow to the backend; successful results can be compared and downloaded.
- Marked showcase comparison imagery as illustrative and pricing as a non-purchasable preview. Login, checkout, dedicated scratch repair, and colorization remain unavailable.
- Added API tests covering health, 4× response output, invalid formats/images, and upload limits.

## Remaining before production

1. Choose deployment hardware and install the matching PyTorch CPU/CUDA build. The model weights download from Hugging Face at first startup.
2. Provide the login/auth destination and checkout/contact destinations before enabling those actions.
3. Confirm or replace draft pricing, plan features, and showcase assets. Prices appear only with a preview disclaimer; unverified testimonials and usage statistics are omitted.
4. Configure production CORS, reverse proxy request-size/timeouts, and confirm data privacy and retention requirements.

## Verification checklist

- Rebuild the frontend after model/API updates.
- Backend tests pass, and the frontend production build succeeds. A real model load/inference could not run in this Windows environment because its application-control policy blocks PyTorch's `shm.dll`; test inference on the intended deployment host.
- Verify model weight download/cache behavior, upload validation, response type, concurrency, frontend error states, and mobile layouts.
