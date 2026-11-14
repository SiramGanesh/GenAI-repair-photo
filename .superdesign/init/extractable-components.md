# Extractable components

## Layout components

### Navigation

- Source: `frontend/src/components/Navigation.jsx`
- Category: layout
- Description: Responsive Revive navbar with mobile menu, route links, login button, and primary CTA.
- Extractable props: none in React; route state comes from React Router.
- Hardcoded: Brand mark and name, labels, Lucide icons, colors and styles.
- Superdesign project component already exists: `Navigation` (`18965e24-d2d7-4c4f-be4f-60de86053aaf`). Reuse it instead of creating a duplicate.

### Footer

- Source: `frontend/src/components/Footer.jsx`
- Category: layout
- Description: Shared brand footer with local route links and model attribution.
- Extractable props: none.
- Hardcoded: Brand mark, labels, icons, and styles.
- Superdesign project component already exists: `Footer` (`a234aa97-e885-4a3e-834d-7ab4d0ca896b`). Reuse it instead of creating a duplicate.

## Basic components

### ComparisonSlider

- Source: `frontend/src/components/ComparisonSlider.jsx`
- Category: basic
- Description: Accessible before/after image slider with pointer, touch, and keyboard support.
- Extractable props: `image`, `imageAlt`, `beforeImage`, `afterImage`, `initialPosition`, `compact`.
- Hardcoded: Lucide `ArrowLeftRight` icon and slider behavior.

No separate button/input/card primitive component directory is present; these are page-level styles.
