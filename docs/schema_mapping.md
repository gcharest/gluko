# Schema mapping — implemented ETL

Purpose: document the concrete, actual mapping implemented by the ETL that produces the flattened per-food JSON records and the sharded NDJSON outputs. This file describes the input tables used, the exact join patterns, normalization choices, output shape, derived fields, provenance output and sharding/manifest behaviour implemented by the `scripts/cnf-fcen-etl.js` pipeline.

## Inputs (CSV source)

- Location: `nutrient_file_raw/cnf-fcen-csv`

- Primary CSV files used by the ETL:

  - `FOOD NAME.csv` — food master (one row per FoodID)

  - `NUTRIENT AMOUNT.csv` — long-form nutrient values (FoodID, NutrientID)

  - `NUTRIENT NAME.csv` — nutrient metadata (NutrientID → Tagname, Unit, Code)

  - `CONVERSION FACTOR.csv` — conversion factors (FoodID, MeasureID)

  - `MEASURE NAME.csv` — human-readable measure descriptions (MeasureID)

  - `FOOD GROUP.csv` — FoodGroup metadata (FoodGroupID)

  - `FOOD SOURCE.csv` — FoodSource metadata (FoodSourceID)

## Join patterns (exact implementation)

- Base: `FOOD NAME` is the canonical food master. Each output record corresponds to one `FoodID` from this table.

- Nutrients: all rows from `NUTRIENT AMOUNT` with matching `FoodID` are associated with a food. For each nutrient row, the ETL joins `NUTRIENT NAME` on `NutrientID` to obtain `Tagname`, `NutrientCode`, `NutrientUnit` and `NutrientDecimals`.

- Conversion factors & measures: `CONVERSION FACTOR` rows for a FoodID are joined to `MEASURE NAME` on `MeasureID` to form a `Measures` array on the food record.

- Group/source: `FOOD GROUP` and `FOOD SOURCE` are joined by `FoodGroupID` and `FoodSourceID` to attach names/labels to the food record.

## Normalization and keys

- Primary key: `FoodID` (stable identifier used throughout the pipeline).

- Nutrients are stored canonically by numeric `NutrientID` in the output (this is the authoritative key for programmatic processing).

- Tagname mapping: the ETL includes a `TagIndex` mapping from `Tagname` → `NutrientID` so clients can resolve human-friendly tags to canonical IDs.

- Missing numeric nutrient values are represented as `null` in the flattened output (absence vs measured zero is preserved). Provenance fields (when available) are attached at the nutrient level.

## Output shape (flattened per-food record — factual)

- Each output food object produced by the ETL contains at least the following sections (field names shown as implemented):

  - `FoodID`, `FoodCode`, `FoodDescription`, `FoodGroupID`, `FoodSourceID`, `FoodDateOfEntry`, etc. (base food metadata from `FOOD NAME`).

  - `NutrientsById`: object keyed by numeric `NutrientID` (string) with values containing `{ tag, value, unit, decimals, provenance? }`. `value` is the canonical per-100g numeric value or `null` if absent.

  - `TagIndex`: object mapping `Tagname` → `NutrientID` (string).

  - Optionally a `NutrientsByTag` convenience mirror is produced in some output formats, but `NutrientsById` + `TagIndex` are authoritative.

  - `Measures`: array of measure entries for the food. Each entry includes `{ MeasureID, MeasureDescription, ConversionFactorValue, ConvFactorDateOfEntry, SourceID }` corresponding to rows from `CONVERSION FACTOR` joined to `MEASURE NAME`.

  - `Derived`: object containing derived fields computed by the ETL (see Derived fields below). Each derived value is accompanied by a short note of the inputs used.

  - `FoodGroupName`, `FoodSourceDescription`, and any other attached metadata from joined tables.

## Derived fields

- `FctGluc`: implemented and exported by the ETL. Computation used by the pipeline:

  - FctGluc = (Total Carbohydrate per 100g − Dietary Fiber per 100g) / 100

  - The ETL computes this from the canonical nutrient values present in `NutrientsById` (uses the nutrients identified by `TagIndex`/`NutrientID` for carbohydrates and fiber). The derived field is included under `Derived.FctGluc` with a reference to the nutrient IDs used.

## Conversion factor handling

- The ETL preserves conversion factor history for a (FoodID, MeasureID) pair. The `Measures` array keeps multiple rows if present.

- For clients that want a single preferred conversion factor, the pipeline exposes the `ConvFactorDateOfEntry` per row; consumers may choose the most recent entry as `preferredConversionFactor` (the ETL records the raw rows and dates; selection is left to consumers).

## Provenance and empty-record exports

- The ETL can export provenance events derived from the CSV updates and includes those in a separate provenance NDJSON export when requested (`--export-provenance`).

- Empty records (foods with no nutrient measurements) are collected and can be exported as a separate NDJSON file.

## Sharding and manifest (exact behaviour implemented)

- Sharding scheme: records are sharded by `FoodID` ranges. The pipeline uses the configured `shardSize` (default 10000) to compute shard assignment (numeric FoodID range buckets). This produces contiguous FoodID ranges per shard.

- Shard rotation: the CLI supports a `--max-shard-size` option (uncompressed bytes threshold) and an explicit `--shard-size`. The pipeline writes records into shard files and closes shards according to the configured thresholds.

- Compression: default output compression is Brotli (`br`). The CLI accepts `--compression` (`br` or `gzip`) so gzip output can be produced when requested.

- Manifest: the ETL writes a manifest JSON describing shards. Each shard entry in the manifest includes file name, record count, compressed bytes, SHA-256 checksum and min/max FoodID present in the shard. The manifest also references provenance and empty-record exports when produced.

## CLI and reproducibility

- Primary entrypoint: `scripts/cnf-fcen-etl.js` (CLI). The script accepts options used by the ETL:

  - `--out-dir` — output directory

  - `--shard-size` — numeric FoodIDs per shard (default 10000)

  - `--max-shard-size` — uncompressed size threshold in bytes (default 1MiB)

  - `--compression` — `br` or `gzip` (default `br`)

  - `--full` — process entire dataset

  - `--export-provenance` — emit provenance NDJSON

  - `--csv-dir` / `--update-dir` — override input directories

## Consistency rules implemented

- Nutrient numeric absence is `null` (not zero).

- All nutrient values in the flattened output are canonical per-100g values taken directly from `NUTRIENT AMOUNT` rows and expressed with units from `NUTRIENT NAME`.

- Conversion factors are preserved as recorded; the pipeline does not arbitrarily collapse or discard historical conversion-factor rows.

## Where to find the implementation

- ETL code lives under `scripts/` and `scripts/lib/`. The CLI entry is `scripts/cnf-fcen-etl.js` which imports helpers from `scripts/lib/*`.

## Notes

- This document describes the implementation as encoded in the ETL pipeline; it does not prescribe alternative partitioning or indexing strategies. Consumers should rely on `NutrientsById` and `TagIndex` for programmatic joins and lookups.
