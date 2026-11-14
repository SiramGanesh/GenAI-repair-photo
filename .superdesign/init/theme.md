# Theme and design tokens

## Compact token summary

- Primary `#c44536`; deep primary `#772e25`; warm accent `#f9ebe0`
- Background/paper `#fcf9f7`; ink `#24211f`; muted `#716b67`; border `#eee5df`
- Body: Plus Jakarta Sans; display: DM Serif Display
- Content width: 1160px; breakpoints: 900px tablet, 680px mobile, 380px small mobile
- Rounded cards and controls; warm thin borders; restrained shadows; visible focus ring `#e08b66`
- Respect `prefers-reduced-motion`; transitions are progressive enhancement.

## CSS source

The complete globals, component, page, and responsive stylesheet is `frontend/src/styles.css` and should be passed as the canonical source context for design generation.

## Font loading source

`frontend/src/main.jsx` imports local Latin subsets from `@fontsource/plus-jakarta-sans` weights 400, 500, 600, and 700, and `@fontsource/dm-serif-display` regular and italic.
