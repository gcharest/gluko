I'll create a concise, tracked todo list for the refactor plan so we can iterate and mark progress. Then I'll return the analysis and the detailed step-by-step plan with test updates.

Created 7 todos

Progress update — todos created and initial analysis steps marked done. Next I'll present a focused analysis of candidate functions to extract and a detailed implementation plan including exact test changes.

## High-level analysis (what I looked at)
From the provided cnf-fcen-etl.js ESM copy (and the test files in test), the file mixes:
- small generic utilities (string/ID/size helpers, merging),
- CSV read/stream helpers,
- domain loaders (loadNutrientName, loadFoodNames, loadConversionFactors),
- update appliers (applyNutrientNameUpdates, applyFoodNameUpdates, applyConversionFactorUpdates, applyNutrientAmountUpdates),
- the main ETL flow (run, parseCli),
- streaming logic (streamNutrientAmounts),
- writer classes (ProvenanceWriter, ShardWriter),
- a few pure-computation helpers (computeFctGluc),
- formatters/serialization is delegated to `formatters.js` (already separated).

That creates a single large file with multiple responsibilities. Extracting cohesive groups will increase maintainability and make tests easier to target.

## Candidate functions/classes to extract (grouped by module)
Below are the suggested modules with the functions/classes to move. For each I include a short rationale.

1) lib/utils.js (general small helpers — low risk)
- safeTrimId
- normalizeProvKeys
- mergeNonEmpty
- makeProvEvent
- makeNutrientProvKeys
- parseSizeToBytes
- safe logging helper createLogger (or keep in main but better in utils)
Rationale: these are small pure helpers reused across modules; grouping makes tests easier.

2) lib/csv.js (I/O helpers)
- csvStream
- updateCsvStream
- existsInUpdateDir
- maybe ensureDir (or utils)
Rationale: centralize CSV/FS read helpers, easier to unit test by mocking filesystem.

3) lib/compute.js (pure computation)
- computeFctGluc
Rationale: small pure function, simple unit tests.

4) lib/loaders.js
- loadNutrientName
- loadFoodNames
- loadConversionFactors
- streamNutrientAmounts
Rationale: these parse CSV streams into in-memory maps or call a callback; grouping loaders separates I/O/parsing from ETL orchestration.

5) lib/appliers.js (update appliers)
- applyNutrientNameUpdates
- applyFoodNameUpdates
- applyConversionFactorUpdates
- applyNutrientAmountUpdates
Rationale: these implement business rules applying CSV updates; isolating them simplifies focused tests and easier mocking of CSV streams.

6) lib/writers.js
- ProvenanceWriter
- ShardWriter
Rationale: classes that manage files and gzip; moving them isolates filesystem side-effects and makes tests easier (can inject temp dirs).

7) entrypoint (cnf-fcen-etl.js)
- parseCli
- run
- export public APIs (re-export selected functions for tests)
Rationale: the main file becomes orchestrator and re-exports pieces for backwards compatibility with tests that import from the original path.

Notes:
- Keep `formatters.js` as-is — it's already separate.
- Keep the CLI guard and parseCli in the entry file.
- Keep logger creation either in utils or in the entry file but allow injection of a logger into modules where logging is used (or export createLogger).

## Detailed step-by-step implementation plan

Assumptions:
- We'll place new files under `scripts/lib/` so tests and code remain local to the ESM copy and relative imports are simple.
- Existing tests import functions from cnf-fcen-etl.js. We can keep those imports working by re-exporting moved functions from the entry file (short-term). Alternatively update tests to import the new modules directly (preferred for clarity). I'll propose exact test edits below.
- We won't change runtime behavior; we only move functions and wire imports/exports.

Step 0 — Preparation
- Create `scripts/lib/` directory.
- Add minimal index files in each lib module exporting moved functions.
- Keep code style exactly as in the original file (same indentation, same exports) to reduce diffs.

Step 1 — Extract utils
- Create `scripts/lib/utils.js` (or .mjs if preferred by repo) and move:
  - safeTrimId
  - normalizeProvKeys
  - mergeNonEmpty
  - makeProvEvent
  - makeNutrientProvKeys
  - parseSizeToBytes
  - ensureDir (or keep in csv / writers if used there)
  - createLogger (optionally)
- Export these functions.

Step 2 — Extract csv/FS helpers
- Create `scripts/lib/csv.js` and move:
  - csvStream
  - updateCsvStream
  - existsInUpdateDir
- Import `parse` dynamically inside csv.js as before.
- Export them.

Step 3 — Extract compute
- Create `scripts/lib/compute.js` and move `computeFctGluc`.
- Export it.

Step 4 — Extract loaders
- Create `scripts/lib/loaders.js` and move:
  - loadNutrientName
  - loadFoodNames
  - loadConversionFactors
  - streamNutrientAmounts
- Replace internal calls to `csvStream`/`updateCsvStream` with imports from `lib/csv.js`.
- Import utils where needed (safeTrimId, normalizeProvKeys).
- Export the loader functions.

Step 5 — Extract appliers
- Create `scripts/lib/appliers.js` and move:
  - applyNutrientNameUpdates
  - applyFoodNameUpdates
  - applyConversionFactorUpdates
  - applyNutrientAmountUpdates
- These functions rely on csv streams and utils; import those dependencies.
- Keep the same signature so entrypoint `run()` only changes imports.

Step 6 — Extract writers
- Create `scripts/lib/writers.js` and move:
  - ProvenanceWriter
  - ShardWriter
  - ensureDir if used here
- Export classes.

Step 7 — Update cnf-fcen-etl.js (entrypoint)
- Remove implementations moved to lib files.
- Add imports at top:
  - import * as utils from './lib/utils.js'
  - import * as csv from './lib/csv.js'
  - import * as loaders from './lib/loaders.js'
  - import * as appliers from './lib/appliers.js'
  - import * as writers from './lib/writers.js'
  - import { computeFctGluc } from './lib/compute.js'
- Keep `run()` and `parseCli()` functions but wire to the imported functions.
- Re-export key functions/classes for backwards compatibility (so tests that still import from cnf-fcen-etl.js continue to work) — e.g., export { loadNutrientName, applyNutrientNameUpdates, ProvenanceWriter, ShardWriter, computeFctGluc, safeTrimId, parseSizeToBytes, streamNutrientAmounts }.
- Keep CLI guard unchanged.

Step 8 — Update tests
Two possible approaches:
A) Update tests to import the functions from their new module paths under `scripts/lib/` (preferred).
B) Or keep tests unchanged because the entrypoint re-exports the moved functions. This is the least invasive approach initially and allows incremental changes.

I recommend approach A for clarity, but to minimize churn we can do a mixed approach:
- For small modules with many tests (e.g., `formatters.test.mjs` already imports from `formatters.js`), update tests that reference moved internals to import directly from the new module.
- For tests already calling `run()` or `parseCli()` or expecting the full combined behavior (e.g., `run.dryrun.test.mjs`), keep imports from `cnf-fcen-etl.js` and ensure entrypoint re-exports remain.

Exact test updates:
- `test/applyConversionFactorUpdates.test.mjs` — change imports:
  - from: import { applyConversionFactorUpdates } from '../cnf-fcen-etl.js'
  - to: import { applyConversionFactorUpdates } from '../lib/appliers.js'
  (adjust path relative to test file; tests seem in test, so path might be `../lib/appliers.js`)
- `test/applyFoodNameUpdates.test.mjs` — same, import from lib/appliers.js
- `test/applyNutrientNameUpdates.test.mjs` — import from lib/appliers.js
- `test/loadConversionFactors.test.mjs`, `test/loadFoodNames.test.mjs`, `test/loadNutrientName.test.mjs` — import from lib/loaders.js
- `test/streamNutrientAmounts` or `stream` tests — import from lib/loaders.js
- `test/writers.test.mjs` — import from lib/writers.js
- `test/computeFctGluc.test.mjs` — import from lib/compute.js
- `test/helpers.test.mjs` and `test/merge.test.mjs` — import corresponding utils from lib/utils.js
- `test/run.dryrun.test.mjs` — likely keep import from `cnf-fcen-etl.js` (entrypoint still exports run)

In each test file, adjust the import path relative to test location. Provide example diffs (see below).

Step 9 — Run tests and iterate
- Run `npm test` or `npm run test` (resolve exact npm scripts by checking package.json if necessary).
- Fix any missing imports, circular dependencies, or minor name mismatches.
- If type/lint errors appear, fix them (usually minor).
- Ensure all tests pass.

Step 10 — Cleanup & optional improvements
- Add `scripts/lib/README.md` describing module boundaries.
- Add index export `scripts/lib/index.js` for convenience.
- Add new focused unit tests for modules that were previously only indirectly covered (especially writers, csv helpers).
- Consider moving these `lib/` modules into src when/if centralizing ETL logic for the main app.

## Exact changes needed in tests — examples

Example change 1 (applyConversionFactorUpdates.test.mjs)
- Before (approx):
  import { applyConversionFactorUpdates } from '../cnf-fcen-etl.js'
- After:
  import { applyConversionFactorUpdates } from '../lib/appliers.js'

Example change 2 (loadNutrientName.test.mjs)
- Before:
  import { loadNutrientName } from '../cnf-fcen-etl.js'
- After:
  import { loadNutrientName } from '../lib/loaders.js'

Example change 3 (writers.test.mjs)
- Before:
  import { ShardWriter, ProvenanceWriter } from '../cnf-fcen-etl.js'
- After:
  import { ShardWriter, ProvenanceWriter } from '../lib/writers.js'

Notes about relative paths:
- Tests are at `scripts/test/*.mjs`. From there, module paths should be `../lib/appliers.js`, `../lib/loaders.js`, etc. Verify exact relative paths in the repository when implementing.

If you prefer to keep tests unchanged while moving code, then ensure cnf-fcen-etl.js re-exports every function that any test imports. This reduces test edits but is more transitional; still recommended to update tests to import directly later.

## Edge cases, risk and mitigation
- Circular imports: ensure modules only import the minimum needed. For example, avoid appliers importing run or writers importing loaders. Keep a clear DAG: utils/csv -> loaders -> appliers -> entrypoint. Writers can be used by entrypoint and appliers only when writing out provenance (but appliers currently return events; writing is done by entrypoint).
- Dynamic csv parse import: keep dynamic import inside csv.js to preserve lazy-loading behavior.
- Tests that use filesystem fixtures: ensure relative `csvDir` and `updateDir` logic remains correct after moving csv helpers; tests may set `run.csvDir` or override module-level paths — keep those exportable or adjust tests accordingly.
- Exports and names must be identical — keep exact function names and behavior to avoid breaking tests.

## Verification steps (commands)
Run locally in the container (assuming repo root). Example commands (copyable):

```bash
# From repo root
cd scripts
npm test            # or `npm run test` depending on package.json
# If using vitest directly:
npx vitest run
```

If tests fail, run a single test file (for faster iteration):
```bash
npx vitest run test/applyConversionFactorUpdates.test.mjs
```

## Quality gates & PR checklist (what I'll validate)
- Unit tests: expect all tests in test to pass (or at least fail only for issues unrelated to refactor).
- Lint/typecheck: run ESLint / tsc if configured for scripts. If errors appear, fix small issues directly in modules.
- Keep diffs small and modular: one commit per extracted module is ideal (easier review).

## Suggested commit plan (small steps for easier review)
1. Create `scripts/lib/utils.js` and move utils; add tests imports update where trivial.
2. Create `scripts/lib/csv.js` and move csv helpers.
3. Create `scripts/lib/compute.js`.
4. Create `scripts/lib/loaders.js`.
5. Create `scripts/lib/appliers.js`.
6. Create `scripts/lib/writers.js`.
7. Update entrypoint `cnf-fcen-etl.js` to import & re-export; run tests & fix issues.
8. Update tests to import directly from `lib/` modules (one test-folder at a time) and remove re-exports where no longer needed.
9. Add README and optional additional small tests for the new modules.

Each step should be verified by running the subset of tests most affected by the change (e.g., after moving loaders, run loader-related tests).

## Small code contract / API notes (for each module)
- utils.js: pure functions; input strings/objects -> outputs; safe on undefined/null.
- csv.js: functions returning Node Readable streams or Promise of streams; must preserve dynamic csv-parse import.
- loaders.js: return Maps or call callbacks; preserve same signatures used by tests.
- appliers.js: accept maps and return events array; preserve side-effects (mutating maps) and same provenance events structure.
- writers.js: classes with same constructor signatures and methods write/close/closeAll returning metadata.

## Next steps I can do for you
- I can create the new modules and apply the refactor automatically with small, incremental patches, running the tests after each step, and provide the resulting diffs and test outputs. This will implement the plan end-to-end.
- Or, if you prefer, I can produce a PR-style patch with all file moves and updated tests in one sweep.

Which option would you like? If you want me to proceed with the refactor, tell me whether to:
- do it incrementally (recommended), running tests after each module extraction, or
- do it all at once (faster but higher risk).

I'll wait for your choice and then begin by creating the first module (I'll start with `utils.js`) and run the affected tests.