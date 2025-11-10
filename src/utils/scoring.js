export const computeScore = (row) => {
  const base = 0.2;
  const ageBonus = Math.min(0.3, (Number(row.age) || 0) / 200);
  const loanPenalty = row.loan === 'yes' ? -0.1 : 0.05;
  const jobBoost = (row.job || '').includes('technician') ? 0.05 : 0;
  const euribor = Number(row.euribor3m) || 0;
  const macroAdj = euribor > 2.0 ? 0.05 : 0;
  let score = base + ageBonus + loanPenalty + jobBoost + macroAdj;
  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
};
