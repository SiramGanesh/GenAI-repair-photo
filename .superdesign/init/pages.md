# Page dependency trees

## `/` — Home and restoration

- `frontend/src/pages/HomePage.jsx`
  - `frontend/src/components/ComparisonSlider.jsx`
  - `frontend/src/styles.css`
  - `frontend/public/images/portrait-01.jpg`
  - `frontend/src/App.jsx`
    - `frontend/src/components/Navigation.jsx`
    - `frontend/src/components/Footer.jsx`

## `/pricing`

- `frontend/src/pages/PricingPage.jsx`
  - `frontend/src/styles.css`
  - `frontend/src/App.jsx`
    - `frontend/src/components/Navigation.jsx`
    - `frontend/src/components/Footer.jsx`

## `/showcase`

- `frontend/src/pages/GalleryPage.jsx`
  - `frontend/src/components/ComparisonSlider.jsx`
  - `frontend/src/styles.css`
  - `frontend/public/images/`
  - `frontend/src/App.jsx`
    - `frontend/src/components/Navigation.jsx`
    - `frontend/src/components/Footer.jsx`

## New target: How it works

The `/how-it-works` route does not exist yet. Reuse the shared app shell and styles, using `/` as the closest style/content reference. Keep process claims accurate to `ai-forever/Real-ESRGAN`: choose a supported image; server performs 4× upscaling/artifact enhancement; preview and download the result. Do not imply dedicated scratch removal, colorization, persistent storage, or unsupported capabilities.
