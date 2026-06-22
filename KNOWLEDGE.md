# NG Project Knowledge Base

Last updated: 2026-06-22

## Purpose
This file stores repository-level project knowledge collected during review and implementation discussions.
It is intended to reduce repeated context switching and keep architecture decisions visible in the codebase.

## Architecture Summary
- Entry: `src/index.js` reads `--myconfig=<path>` and calls `NGenerator.generate(config)`.
- Orchestration: `src/ngenerator.js` loads models, collects mapping records, sorts by `seq` then `scope`, then renders or copies outputs.
- User-controlled inputs:
  - Models: `models/`
  - Templates: `templates/`
  - Connector and runtime options: `config.js`
- Engine internals:
  - Model processing: `src/utils/modelLoader.js`
  - Template engine pipeline: `src/templateEngine/` (lexer -> parser -> cleaner -> codeGen -> run)

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
- Test command: `npx mocha ./tests/**/*.js`
- Latest result: `64 passing`

## Known Follow-up Item
- `src/templateEngine/nodes/blockDefineNode.js` still uses module-level counter `KKK` to generate temporary variable names.
- This is intentionally unchanged in this iteration.

## Maintenance Notes
When adding new decisions:
1. Record the decision and scope in this file.
2. Add the related files affected.
3. Add quick verification evidence (command + result).
