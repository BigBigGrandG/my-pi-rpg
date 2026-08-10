# Runtime asset sources

The high-resolution PNGs listed below are source artwork supplied for this
project. They are kept unchanged. The renderer consumes only the generated
files under `assets/game/runtime/`.

| Source | Runtime derivative | Normalization |
| --- | --- | --- |
| `terrain/grass-spring.png` | `runtime/grass-spring-tile.png` | Center crop, 32×32 reduction, and matching opposite borders for seamless tiling. |
| `terrain/road-dirt.png` | `runtime/road-dirt-tile.png` | Center crop, 32×32 reduction, and matching opposite borders for seamless tiling. |
| `characters/player-male.png` | `runtime/player-male-sheet.png` | 4×4 source grid reduced from 256×384 cells to 32×48 cells; each output pixel averages the high-opacity source pixels, and alpha below 240 is removed to clear the background glow. |
| `characters/npc-leah.png` | `runtime/npc-leah.png` | Trim the opaque artwork, remove alpha below 240, and scale it with nearest-neighbor sampling into a 32×48 transparent bottom-centered canvas. |
| `buildings/*.png` | `runtime/buildings/*.png` | Trim each south-facing source, remove the glow, and fit it with nearest-neighbor sampling into a 192×160 transparent bottom-centered canvas. |
| `environment/tree-spring.png` | `runtime/environment/tree-spring.png` | Fit the trimmed source into a 64×96 transparent bottom-centered canvas. |
| `environment/bush-spring.png` | `runtime/environment/bush-spring.png` | Fit the trimmed source into a 32×32 transparent bottom-centered canvas. |
| `environment/pond-spring.png` | `runtime/environment/pond-spring.png` | Fit the trimmed source into a 192×128 transparent bottom-centered canvas. |
| `environment/fence-horizontal.png` | `runtime/environment/fence-horizontal.png` | Fit the reusable horizontal segment into a 32×32 transparent bottom-centered canvas. |
| `environment/fence-vertical.png` | `runtime/environment/fence-vertical.png` | Fit the reusable vertical segment into a 32×32 transparent bottom-centered canvas. |

Run `npm run assets:normalize` to regenerate the derivatives after intentionally
updating one of these source files.
