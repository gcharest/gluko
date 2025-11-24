# Release Planning

This directory contains planning documents for each Gluko release. Each release document defines goals, constraints, options considered, and success criteria—**without implementation details** (those go in `../implementation/`).

**See [RELEASE_TRACKER.md](RELEASE_TRACKER.md)** for a comprehensive view of all features across all releases with implementation status.

---

## Releases

| Release                                                  | Goal                                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [v0.1-mvp.md](v0.1-mvp.md)                               | Baseline offline-capable carb calculator with nutrient search and multi-subject tracking |
| [v0.2-pwa-installability.md](v0.2-pwa-installability.md) | Complete PWA implementation with quality gates and comprehensive testing                 |
| [v0.3-shard-loading.md](v0.3-shard-loading.md)           | Implement manifest-based dataset sharding for efficient updates                          |
| [v0.4-pwa-optimization.md](v0.4-pwa-optimization.md)     | Web Workers and performance optimization to achieve Web Vitals targets                   |
| [v0.5-ui-polish.md](v0.5-ui-polish.md)                   | UI refinement and WCAG AA accessibility compliance                                       |
| [v0.6-history-export.md](v0.6-history-export.md)         | Data portability with export/import functionality                                        |
| [v0.7-advanced-features.md](v0.7-advanced-features.md)   | Optional advanced features based on user feedback                                        |
| [v1.0-production-ready.md](v1.0-production-ready.md)     | Production-ready stable release with all features complete and validated                 |

---

## Versioning Strategy

Gluko uses **Semantic Versioning (SemVer)** with a focus on clarity:

- **MAJOR.MINOR.PATCH** (e.g., `1.0.0`, `1.1.2`)
- **MAJOR**: Breaking changes (rare; data format changes, major feature overhauls)
- **MINOR**: New features or significant improvements (PWA optimization, new calculator modes)
- **PATCH**: Bug fixes, small improvements, dependency updates

### Release Types

#### Feature Release (MINOR bump)

- New user-facing feature or significant improvement
- Create a release planning doc with naming: `v0.{N}-{feature}.md` (for v0.x) or `v{N}.0-{feature}.md` (for v1.0+)
- May include implementation doc(s)
- Examples: v0.2 (refinements), v1.0 (PWA optimization)

#### Bug Fix Release (PATCH bump)

- Bug fixes and small improvements
- No release planning doc needed (use GitHub issues)
- May update implementation docs if fix is significant
- Examples: v1.0.1, v1.0.2

#### Quick Fix / Hotfix (PATCH bump)

- Urgent fix (data corruption, critical bug, security issue)
- Merge directly to main if possible
- Update PATCH version
- Document in CHANGELOG.md

### Version Tracking

- Current version in `package.json` (key: `version`)
- All releases tagged in git: `git tag v1.0.0`
- Breaking changes or notable updates documented in `CHANGELOG.md` (at repo root)

### Branches

- **main**: Stable, releases only. Each release tagged.
- **feat/\***: Feature branches for MINOR releases
- **fix/\***: Bug fix branches for PATCH releases
- **hotfix/\***: Emergency fixes (merge to main immediately after testing)

## Release Document Template

Each release document should contain the following sections:

```markdown
# Release v{N}.{N}: {Feature Name} (for v0.x)
# Release v{N}.0: {Feature Name} (for v1.0+)

## Release Summary

One sentence: what this release delivers to users.

## Goals

What does this release achieve? How does it advance the product vision?

- Goal 1: [Clear outcome with user impact]
- Goal 2: [Clear outcome with user impact]

## Constraints Specific to This Release

What limits options? What must be respected?

- Technical: [e.g., must work with existing IndexedDB schema]
- Data: [e.g., dataset size limits, format compatibility]
- Timeline: [if self-imposed]

## Options Considered

Describe different approaches evaluated for this release.

### Option A: {Name}

**Approach**: [Brief description]

**Pros**: [bullets]  
**Cons**: [bullets]  
**Risk**: Low / Medium / High

---

### Option B: {Name}

[Same structure if needed...]

## Selected: Option {X}

**Why**: [1-2 sentence rationale]

## Success Criteria

How do you know this release succeeded?

- [ ] Criterion 1 (measurable)
- [ ] Criterion 2 (testable)

## Known Risks

What could go wrong?

- Risk: [Description] → Mitigation: [Strategy]

## Out of Scope

What is explicitly NOT in this release?

- [Feature or consideration deferred to future release]

## Related Documentation

- Product goals: [link to PRODUCT.md](../PRODUCT.md)
- Architecture: [link to ARCHITECTURE.md](../ARCHITECTURE.md)
- Implementation: [link to implementation doc when ready]
```

## CHANGELOG.md

Maintain a `CHANGELOG.md` at the repo root to track releases:

```markdown
# Changelog

## v1.1.0 - PWA Optimization (2025-11-XX)

### Added
- Manifest-based dataset versioning
- Streaming NDJSON import with chunked writes
- Service Worker caching for shards

### Improved
- LCP: 3.2s → 2.1s
- FCP: 2.5s → 1.5s

### Docs
- [Release plan](docs/releases/v1.1-pwa-optimization.md)
- [Implementation](docs/implementation/pwa-shard-ingestion.md)

## v1.0.0 - MVP (2025-10-XX)

### Added
- Nutrient search
- Multi-subject meal calculator
- Offline support via IndexedDB
- Bilingual interface (EN/FR)
```



## Release Sequence

Each release builds on the previous, from foundational features (v0.1) through production readiness (v1.0):

```text
v0.1 → v0.2 → v0.3 → v0.4 → v0.5 → v0.6 → v1.0
```

See individual release documents for goals, constraints, and success criteria.

---

## Related Documentation

- **[RELEASE_TRACKER.md](RELEASE_TRACKER.md)**: Feature mapping across all releases
- **[../PRODUCT.md](../PRODUCT.md)**: Product vision and goals
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)**: Technical architecture
