# NG Project Knowledge Base

Last updated: 2026-06-22

## Purpose
This file stores repository-level project knowledge collected during review and implementation discussions.
It is intended to reduce repeated context switching and keep architecture decisions visible in the codebase.

## Architecture Summary
- Entry: `src/index.ts` reads `--myconfig=<path>` and calls `NGenerator.generate(config)`.
- Orchestration: `src/ngenerator.ts` loads models, collects mapping records, sorts by `seq` then `scope`, then renders or copies outputs.
- User-controlled inputs:
  - Models: `models/`
  - Templates: `templates/`
  - Connector and runtime options: `config.js`
- Engine internals:
  - Model processing: `src/utils/modelLoader.ts`
  - Template engine pipeline: `src/templateEngine/` (lexer -> parser -> cleaner -> codeGen -> run)

## TypeScript Migration Status
- Source and tests are migrated to TypeScript (`src/**/*.ts`, `tests/**/*.ts`).
- Build emits to `dist/` using `tsconfig.json`.
- Runtime remains CommonJS-compatible.
- Current migration mode uses `// @ts-nocheck` in migrated files as a compatibility bridge.

## Confirmed Conventions
- Model reference key is `_ref`.
- Users should write `_ref` directly in model fields.
- The resolved reference is also kept in `_ref`.
- `noRender` behavior should stay async-copy and return quickly; waiting for copy completion is not required.
- Hot reload for model files is not required.

## Applied Changes (Current Iteration)
- Unified docs and sample model from `ref` to `_ref`:
  - `README.md`
  - `README.cn.md`
  - `models/order-manage/order-detail.js`

## Verification Snapshot
- Build command: `npm run build`
- Test command: `npm test`
- Latest result: `64 passing`

## Known Follow-up Item
- `src/templateEngine/nodes/blockDefineNode.ts` still uses module-level counter `KKK` to generate temporary variable names.
- This is intentionally unchanged in this iteration.

## Maintenance Notes
When adding new decisions:
1. Record the decision and scope in this file.
2. Add the related files affected.
3. Add quick verification evidence (command + result).
