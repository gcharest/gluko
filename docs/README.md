# Gluko Documentation

Welcome to the Gluko documentation. This directory contains all project documentation organized by purpose and audience.

## Quick Navigation

### For Everyone

- **[Product Vision & Goals](PRODUCT.md)** — What Gluko is, why it exists, and how success is measured
- **[Technical Architecture](ARCHITECTURE.md)** — High-level overview of how the app works (tech stack, data flow, PWA design)

### For Product Managers & Planners

- **[Release Planning](releases/)** — Roadmap and planning documents for upcoming releases

### For Engineers

- **[Implementation Details](implementation/)** — Technical specifications, APIs, tasks, and acceptance criteria
- **[Architecture Decisions](adr/)** — Record of significant architectural choices and their rationale

## Reading Order for New Contributors

**First time here?** Read these in order:

1. [../README.md](../README.md) — Project overview and how to set up locally
2. [PRODUCT.md](PRODUCT.md) — Understand the vision and who we're building for
3. [ARCHITECTURE.md](ARCHITECTURE.md) — Get the mental model of how everything fits together
4. [releases/](releases/) — See what's being planned next

## Documentation Structure

### Strategic Documents (Stable, rarely change)

- `PRODUCT.md` — Vision, target users, goals, and success metrics

### Planning Documents (One per release)

- `releases/` — Goals, constraints, and options for each release (without implementation details)

### Implementation Documents

- `implementation/` — Detailed technical specifications and implementation guides
- `adr/` — Architecture Decision Records

## Documentation Principles

1. **Concise at the top**: Strategic documents are short and stable
2. **Separation of concerns**: Planning doesn't include implementation; implementation links back to planning
3. **One source of truth**: Each topic has one authoritative document
4. **Discoverable**: Clear navigation and index every level
5. **Status clear**: Documents are marked Current/Exploratory/Superseded/Archived

## Adding New Documentation

### Creating a Release Plan

When planning a new release:

1. Create a new file in `releases/` following the naming convention: `v{N}.{N}-{feature}.md`
2. Use this structure:
   - Goals
   - Constraints specific to this release
   - Options considered (with pros/cons for each)
   - Selected option with rationale
   - Dependencies
   - Success criteria
   - Risks & mitigations
   - Out of scope

3. See `releases/README.md` for examples and full template

### Creating Implementation Documentation

When starting implementation:

1. Create a file in `implementation/` with a descriptive name
2. Link back to the release document
3. Include:
   - Overview and connection to product goals
   - Architecture/data flow diagrams
   - API specifications
   - Task breakdown with acceptance criteria
   - Testing strategy
   - Deployment steps
   - Rollback procedures

### Recording Architectural Decisions

For significant technical decisions:

1. Create an ADR in `adr/` following the [ADR template](adr/)
2. Link the ADR from relevant implementation or release docs
3. Document the decision, context, options considered, and consequences

## Questions?

- Check if someone has already documented your question in one of these files
- Look at recent ADRs to understand past decisions
- Ask in code reviews about undocumented decisions (they may need an ADR)

## Documentation Status

| Document        | Purpose                       | Status         |
| --------------- | ----------------------------- | -------------- |
| PRODUCT.md      | Product vision & goals        | Current ✅     |
| ARCHITECTURE.md | High-level technical overview | Current ✅     |
| releases/       | Release planning (TBD)        | In progress 🔄 |
| implementation/ | Implementation details (TBD)  | In progress 🔄 |
| adr/            | Architecture decisions        | Current ✅     |
