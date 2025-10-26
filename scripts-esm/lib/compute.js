// Pure computation helpers for the ETL
export function computeFctGluc(s) {
  const chocdfId =
    s.TagIndex &&
    (s.TagIndex['CHOCDF'] || (Array.isArray(s.TagIndex['CHOCDF']) && s.TagIndex['CHOCDF'][0]))
  const fibtgId =
    s.TagIndex &&
    (s.TagIndex['FIBTG'] || (Array.isArray(s.TagIndex['FIBTG']) && s.TagIndex['FIBTG'][0]))
  const chocdf = chocdfId
    ? s.NutrientsById && s.NutrientsById[chocdfId] && s.NutrientsById[chocdfId].value
    : null
  const fibtg = fibtgId
    ? s.NutrientsById && s.NutrientsById[fibtgId] && s.NutrientsById[fibtgId].value
    : null
  if (chocdf === null || fibtg === null) return null
  return (chocdf - fibtg) / 100
}

export default { computeFctGluc }
