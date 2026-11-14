# Revive Frontend Implementation

## Design sources

- Landing page: Superdesign project `9f37ff7b-b2d0-4035-82fc-6789e5427142`, draft `909183a3-fb1d-4beb-8a7c-d765190a923b` (v3)
- How it works: Superdesign project `9f37ff7b-b2d0-4035-82fc-6789e5427142`, draft `9b88d509-9977-4158-b732-9acd70de08f7` (v8)
- Pricing: draft `61995580-b8d0-40d8-b1e0-59adbf16ccd7` (v1)
- Showcase: draft `a087f81e-061e-42d7-84fc-2af998851eb7` (v1)

## How it works page implementation plan

Update the existing `/how-it-works` page to reflect the fetched “How Revive Works - Factual Process Overview” draft (v8), while keeping the app's shared React shell and established design system.

1. **Page introduction:** Use the “Inside the engine” eyebrow, “Restoration simplified for modern archives” headline, and a short explanation of uploading, 4× Real-ESRGAN processing, comparing, and downloading.
2. **Three process cards:** Use “Choose your memory,” “The Revive engine,” and “Compare & Preserve” as the steps. State the supported JPEG, PNG, and WebP formats, 8 MB upload limit, 3-megapixel image limit, and WebP output where relevant.
3. **Capabilities and data handling:** Add the draft's two-column “Understanding Capabilities” and “Data Handling” section. Clarify that Real-ESRGAN upscales and enhances detail / common artifacts; it is not dedicated scratch removal or black-and-white colorization. Say images are processed per request and are not saved by this app.
4. **Restoration CTA:** Add the dark closing callout and link it to `/#restore`.
5. **Use existing app conventions:** Keep `Navigation` and `Footer` from the shared app shell; use the existing CSS tokens, local fonts, and `lucide-react` icons. Do not copy the draft's standalone navigation/footer markup or introduce Tailwind CDN, Iconify, or external font dependencies.

**Acceptance checks:** `/` redirects to the top of `/restore`; the Restore navigation item returns to the top while restoration CTAs target the uploader at `/restore#restore`; the navigation item opens `/how-it-works`; all process, capability, and privacy content renders at desktop and mobile widths; and the frontend production build succeeds. No backend changes are planned.

## Agreed scope

- Frontend: React + Vite.
- Pages: restore (`/restore`, default), how it works (`/how-it-works`), pricing (`/pricing`), showcase (`/showcase`). The root path redirects to `/restore`.
- Model: `ai-forever/Real-ESRGAN`, using the upstream PyTorch implementation pinned to a Git commit and the x4 checkpoint pinned to a Hugging Face model revision.

## Implemented

- Added the React/Vite entry point, shared navigation/footer, and the four responsive routes.
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
