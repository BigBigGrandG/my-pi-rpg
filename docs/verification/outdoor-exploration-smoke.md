# Outdoor exploration vertical slice verification

验证日期：2026-08-11
验证环境：Windows desktop、Node.js 24、Electron Forge development runtime

## Automated gates

The following commands were run from the repository root:

| Check | Result |
| --- | --- |
| `npm run assets:normalize` | Pass; source PNGs remained separate from runtime derivatives |
| `npm test` | Pass; all domain, presentation, asset, and normalization tests passed |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass with no warnings |
| `npm run build` | Pass; Electron package output generated |

The public integration seams cover the 60×40 map, six road bands, all six
buildings, all environment placement IDs, runtime texture identities, and the
ordered ground-to-dialogue render layers in
`src/game/outdoor-slice-presentation.ts` and `src/game/render-depths.ts`.

## Desktop smoke record

Recorded on 2026-08-11 with `npm run dev` in the fixed 960×540 game viewport.
Each case below was executed against the desktop runtime and passed. A
temporary local spawn near Leah was used only to reach the dialogue path quickly;
the production southwest spawn was restored and rechecked before finishing.

| Area | Result and observed evidence |
| --- | --- |
| Initial map and layering | Pass — the southwest intersection showed the player, roads, grass, HUD, shadows, and static environment; the exploration views showed buildings, pond, trees, bushes, fences, and Leah above the road layer. |
| Exploration | Pass — arrow-key movement was observed; domain and presentation tests cover WASD, horizontal/vertical roads, intersections, diagonals, normalized speed, and animation only during actual displacement. |
| Road edges and camera | Pass — domain tests stopped the player at grass and world bounds; desktop exploration followed the player without revealing outside-map space. |
| Static village content | Pass — all six typed buildings are included in the integration render plan and remained non-interactive during the desktop run. |
| Leah collision | Pass — direct passage was blocked and diagonal contact slid on the free axis in the domain contract and desktop run. |
| Interaction eligibility | Pass — the bordered `J` prompt appeared after facing Leah within range and disappeared after dialogue opened; range and facing negatives are covered by domain tests. |
| Dialogue open | Pass — a fresh `J` press opened the bottom-centered dark panel with `莉亚` and `你好！今天也要精神满满地生活呀。`; the prompt hid and movement was locked. |
| Dialogue close | Pass — the next fresh `J` press closed the panel and restored the prompt/movement path; the edge detector test proves a held key cannot repeat the transition. |
| Ignored input | Pass — a mouse click left the prompt/dialogue state unchanged; unrelated keys are covered by the input contract. |
| Focus loss | Pass — the blur handler clears Phaser keys and both input histories; the focus-loss smoke step returned without a stuck movement or `J` state. |

Electron boundary inspection confirmed the fixed, non-resizable content window,
`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, an empty
preload bridge, and no new IPC surface.
