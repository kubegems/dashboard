function stringifyExpression(expr) {
  const operator = expr.operator.toLocaleLowerCase();
  const key = expr.key;
  const values = expr.values;

  switch (operator) {
    case 'exists':
      return key;
    case 'doesnotexist':
      return `!${key}`;
    default:
  }

  return `${key} ${operator} (${values.join(',')})`;
}
export function stringifySelector(opts) {
  const matchLabels = opts.matchLabels || {};
  const matchExpressions = opts.matchExpressions || [];

  return Object.keys(matchLabels)
    .map((key) => `${key}=${matchLabels[key]}`)
    .concat(matchExpressions.map(stringifyExpression))
    .join(',');
}
