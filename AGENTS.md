# AGENTS.md

## Project overview

This repository is for a long-term, top-down farming and social RPG inspired by games such as *Harvest Moon: Friends of Mineral Town*, where the player develops a farm to earn money and materials, builds relationships and discovers information through NPC interactions, and uses those relationships and discoveries to unlock and advance storylines. The planned stack is Phaser, Electron, TypeScript, and the Pi SDK. Pi provides the agent loop for NPC dialogue and decisions; it is not the game engine and must not own authoritative game state.

The core architectural rule is:

```text
Phaser renderer -> Game Domain <- Pi agent runtime
                       ^
Electron main/preload + validated IPC
```

- Phaser is the presentation and interaction layer: scenes, tilemaps, sprites, animation, input, camera, audio, and UI.
- The Game Domain is the authority for rules and state: world state, quests, inventory, relationships, combat, NPC memory, and saves.
- Pi is a decision layer. It may inspect or request changes only through narrow, typed game tools.
- Electron main or a dedicated Node worker hosts privileged services such as Pi sessions, persistence, and external model access.
- Electron renderer code must not import Pi, access model credentials, or mutate persistent state directly.

Preserve these boundaries even when a shortcut would be convenient. The game should remain playable and testable without an active LLM connection, using deterministic dialogue or a test agent where needed.

## Repository state and setup

The repository may initially contain only this file. Do not assume the application scaffold, dependencies, or npm scripts already exist.

When creating the initial scaffold:

- Use a single TypeScript workspace unless a concrete need for multiple packages appears.
- Prefer npm and commit `package-lock.json`. Do not add a second package-manager lockfile.
- Use the current supported Node.js LTS release and record it in `.nvmrc` or the `engines` field.
- Use Vite for the Phaser renderer and a maintained Electron build/package workflow.
- Keep Electron main, preload, renderer, domain, and agent code in visibly separate modules.
- Pin important runtime dependencies to intentional versions; do not silently switch Pi SDK packages or APIs.
- Before choosing or upgrading Phaser, Electron, Pi SDK, or packaging APIs, verify their current official documentation.

Once the corresponding scripts exist, the standard commands should be:

- Install dependencies: `npm ci` (use `npm install` only when intentionally changing dependencies).
- Start development: `npm run dev`.
- Type-check: `npm run typecheck`.
- Lint: `npm run lint`.
- Run tests: `npm test`.
- Create a production build: `npm run build`.

If a command is not yet present, add the smallest appropriate configuration as part of the feature that needs it. Do not claim a check passed when its script or tooling does not exist.

## Suggested source layout

Treat this as the intended separation of concerns, not a demand to create empty directories:

```text
src/
  domain/          Pure game rules, entities, state transitions, and ports
  game/            Phaser scenes, objects, input, rendering, and UI
  agent/           Pi session adapters, NPC prompts, memory policy, game tools
  electron/
    main/           Electron main process and privileged services
    preload/        Minimal typed contextBridge API
  shared/          IPC contracts and genuinely cross-boundary value types
tests/              Cross-module and integration tests when colocating is unsuitable
assets/             Source-controlled game assets and attribution metadata
```

Prefer feature-focused subdirectories as systems grow. Do not create a broad `utils` dumping ground. A module should expose a small public interface and keep storage, framework, and SDK details private.

## Architecture rules

### Game Domain

- Keep domain code framework-independent TypeScript. It must not import Phaser, Electron, or Pi SDK types.
- Model state changes as explicit commands or domain operations with typed results.
- Keep one authoritative state path. Phaser displays state; Pi proposes actions; domain services validate and apply them.
- Inject time, randomness, persistence, and agent responses so tests can be deterministic.
- Version save data and provide migrations when persisted schemas change.
- Prefer stable IDs over display names for players, NPCs, items, quests, maps, and dialogue facts.

### Phaser renderer

- Keep rules out of Phaser scenes and sprites. They translate input into domain/application commands and render resulting state.
- Avoid global mutable registries. Pass dependencies through explicit constructors, scene data, or a small composition root.
- Keep scenes focused (for example boot, world, battle, menu, and dialogue) and extract reusable systems before a scene becomes a coordinator for everything.
- Do not block the render loop on LLM or filesystem work. Show cancellable progress and handle timeouts or unavailable-agent fallbacks.

### Electron boundary

- Keep `contextIsolation` enabled and `nodeIntegration` disabled in renderer windows.
- Expose the smallest possible API through `contextBridge`; never expose raw `ipcRenderer`, filesystem access, environment variables, or arbitrary command execution.
- Define typed request/response contracts and validate all IPC payloads at runtime on the privileged side.
- Treat renderer messages, save files, imported content, and deep links as untrusted input.
- Keep secrets and model credentials out of renderer bundles, logs, save games, fixtures, and Git.

### Pi agent runtime

- Wrap the Pi SDK behind a project-owned interface so the domain and game layers do not depend on SDK-specific session types.
- Create purpose-specific tools such as `get_player_state`, `get_quest_state`, `give_item`, or `change_relationship`.
- Never give an in-game agent shell, arbitrary filesystem, arbitrary network, source-editing, or JavaScript-evaluation tools.
- Validate tool arguments, re-check domain permissions, constrain affected entity IDs and numeric ranges, and return structured results.
- LLM output and tool calls are untrusted proposals. The domain layer decides whether an action is legal.
- Separate observations from mutations. Make mutations auditable and, where retries are possible, idempotent.
- Bound turns, token usage, tool-call counts, timeouts, and memory size. Support cancellation when a dialogue closes or the game exits.
- Store durable NPC facts as structured game data. Do not rely on an ever-growing raw conversation transcript as canonical memory.
- Prompts must not contain secrets. Prompt text is versioned project content and should be reviewed like code.
- Tests and offline development must use a fake agent adapter; normal unit tests must not call paid or remote models.

## TypeScript and code style

- Enable TypeScript strict mode. Do not weaken compiler checks to make a change pass.
- Prefer precise domain types, discriminated unions, and `unknown` plus validation at trust boundaries. Avoid `any`; document an unavoidable use.
- Use explicit return types on exported functions and all IPC/tool handlers.
- Prefer small pure functions and composition over inheritance, except where a Phaser API requires a class.
- Use `async`/`await`; always handle rejected promises at process and UI boundaries.
- Follow the repository's formatter and linter once configured. Until then, use two-space indentation, single quotes, semicolons, and trailing commas where TypeScript permits.
- Keep filenames and code identifiers in English. User-facing game text may be localized and must not be used as a stable identifier.
- Comments should explain constraints or intent, not restate the code.

## Testing instructions

- Add or update tests for every behavior change, especially domain rules, tool authorization, IPC validation, save migrations, and agent fallbacks.
- Prefer unit tests for pure domain logic and contract tests for adapters.
- Include negative tests proving an agent cannot perform forbidden or invalid state changes.
- Use deterministic seeds/fakes for time, randomness, persistence, and agent replies.
- Keep a small end-to-end smoke test for Electron startup and the renderer-to-domain-to-agent boundary when the scaffold supports it.
- Do not make the default test suite depend on network access, API keys, a live LLM, or timing-sensitive model output.
- Before finishing a change, run the most focused relevant test first, then `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` when those scripts exist and the scope warrants them.

## Assets and generated files

- Do not commit secrets, local saves, logs, caches, coverage output, packaged Electron artifacts, or generated model transcripts.
- Commit asset source and license/attribution information when required.
- Avoid large binary replacements unless requested. Preserve import settings and verify that referenced asset keys and paths still resolve.
- Generated dialogue, maps, or other AI-assisted content must be reviewed before becoming canonical project data.

## Change discipline

- Inspect existing code and nearby conventions before editing. Make the smallest coherent change that preserves the architecture above.
- Do not mix unrelated refactors, dependency upgrades, or mass formatting into a feature or bug fix.
- Do not bypass a domain API from Phaser, Electron IPC, or an agent tool just to make a feature work.
- Update documentation and example configuration when setup, architecture, IPC, save formats, or required environment variables change.
- Never delete or overwrite user-created assets or saves as part of cleanup or migration without explicit authorization and a recovery path.

## Commits and pull requests

- Use short, imperative commit subjects. Conventional Commit prefixes such as `feat:`, `fix:`, `test:`, `docs:`, and `chore:` are preferred.
- Keep commits focused and do not commit unrelated working-tree changes.
- In a pull request, summarize player-visible behavior, architectural impact, tests run, and any migration or asset implications.
- Call out changes to agent permissions, prompts, tool schemas, IPC exposure, credentials, or save compatibility as security-sensitive review areas.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical triage labels, plus `completed` for completed work. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Definition of done

A change is complete when its behavior is implemented through the correct layer, relevant tests cover success and failure paths, available checks pass, no privileged capability leaks into the renderer or Pi tools, and documentation is updated for any changed developer workflow or public contract.
