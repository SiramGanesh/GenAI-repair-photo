# Revive design system

## Brand

Warm, considered photo-preservation experience. Match the existing Revive landing page and shared navigation/footer; do not invent a separate visual language or imply model capabilities that do not exist.

## Tokens

| Token | Value |
|---|---|
| Primary | `#c44536` |
| Primary deep | `#772e25` |
| Warm accent | `#f9ebe0` |
| Paper | `#fcf9f7` |
| Ink | `#24211f` |
| Muted text | `#716b67` |
| Border | `#eee5df` |
| Display font | DM Serif Display |
| Body font | Plus Jakarta Sans |
| Main content max width | 1160px |
| Desktop / tablet / mobile breakpoints | 900px / 680px / 380px |

Headings use a restrained serif with tight tracking; body copy uses clean sans serif. Use roomy layouts, soft warm borders, rounded cards, subtle shadows, and muted photography. The shared navbar is translucent, sticky, and 76px high (66px on mobile). Primary actions use the Revive red. Keep focus states visible and respect reduced motion.

## Product truth

The app uses `ai-forever/Real-ESRGAN` at 4×. It upscales and enhances image detail / common artifacts; it is not dedicated scratch removal or black-and-white colorization. Do not promise those capabilities.

## Source tokens

The canonical complete CSS source and responsive rules are `frontend/src/styles.css`; pass that file as context for generated pages.
