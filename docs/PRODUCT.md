# Product Vision & Goals

## Vision

Gluko reduces the mental burden of carbohydrate counting for Type 1 diabetics and their caregivers by providing fast, accurate, and reliable access to Canadian Nutrient File data—especially critical when managing multiple people simultaneously or in situations where you need to quickly recall meal calculations without losing track.

The app addresses the cognitive load of constantly calculating carbs, recording values, verifying insulin dosages, and juggling multiple calculations at once—making a complex, exhausting daily task more manageable.

## Target Users

- **Type 1 diabetics** tracking their own carbohydrate intake for insulin dosing
- **Caregivers** (parents, family members) managing T1D for one or more people
- **Multi-person caregivers** who need to calculate and track meals for multiple individuals simultaneously
- Users requiring reliable offline access in any environment

## Primary Use Cases

1. **Individual tracking**: Person with T1D calculating their own meals
2. **Caregiver single-person**: Parent tracking meals for one child with T1D
3. **Caregiver multi-person**: Parent managing calculations for multiple children with T1D simultaneously
4. **Meal recall**: Quickly retrieving previously calculated meal values to avoid recalculating or forgetting dosages

## Core Goals

1. **Offline-first reliability**: App works fully after initial install, even with zero connectivity (target: 100% feature availability offline)
2. **Fast time-to-interactive**: Users can search and calculate meals quickly (target: LCP < 2.5s, FCP < 1.8s, TBT < 200ms)
3. **Accurate nutrient data**: Provide comprehensive, up-to-date Canadian Nutrient File data with full provenance
4. **Multi-subject support**: Track and calculate meals for multiple people without confusion or data loss
5. **History preservation**: Enable users to export/save their calculation history for backup or future reference
6. **Accessible and bilingual**: WCAG AA compliant, full English/French support

## Technical Constraints (Core Architecture)

- **No backend required**: All logic, data, and state management runs client-side for daily usage
- **PWA-only**: Must install and run as Progressive Web App
- **Mobile-first**: Primary usage on phones/tablets with limited storage and memory
- **Dataset stability**: Source data changes rarely (5-10 year update cadence)
- **Offline-capable with optional export**: 100% functional offline; history can be saved via export/import or future backend sync

## Current Scope

Features actively being developed or maintained:

- Offline nutrient database access
- Multi-subject meal tracking
- Carbohydrate and nutrient calculations
- Meal calculator with serving size conversions
- Search and recent items tracking
- Bilingual interface (EN/FR)
- History export/import (flatfile)

## Future Considerations

Features not currently in scope but potentially valuable:

- Backend services for automatic history backup
- User account management
- Real-time data synchronization across devices
- Integration with CGM or insulin pump data

These remain out of scope until core offline functionality is stable and well-tested.

## Out of Scope (Not Planned)

- Medical advice or treatment recommendations
- Automated meal planning or AI-suggested meals
- Integration with fitness trackers

## Success Metrics

- **Performance** (Web Vitals):
  - LCP < 2.5s (Good threshold per Google Core Web Vitals)
  - FCP < 1.8s (Good threshold)
  - TBT < 200ms (Good threshold)
  - Target: maintain "Good" rating across all metrics
- **Reliability**: 100% feature availability offline after initial dataset load
- **Accessibility**: Lighthouse accessibility score ≥ 95
- **Data freshness**: Dataset updated within 30 days of Health Canada releases
- **User engagement**: (TBD - future consideration once analytics added)

> **Note on performance metrics**: These targets align with Google's Core Web Vitals "Good" thresholds, representing the 75th percentile of real-world user experiences. They are industry-standard benchmarks for fast, responsive web applications.

## Related Documentation

- Technical architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Release planning: [docs/releases/](./releases/)
- Implementation details: [docs/implementation/](./implementation/)
- Architecture decisions: [docs/adr/](./adr/)
