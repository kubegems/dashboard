export function stringifySelector(opts: any): string {
  const matchLabels: { [key: string]: any } = opts.matchLabels || {};
  const matchExpressions: { [key: string]: any } = opts.matchExpressions || [];

  return Object.keys(matchLabels)
    .map((key) => `${key}=${matchLabels[key]}`)
    .concat(
      matchExpressions.map((expr: { [key: string]: any }): string => {
        const operator: string = expr.operator.toLocaleLowerCase();
        const key: string = expr.key;
        const values: any = expr.values;

        switch (operator) {
          case 'exists':
            return key;
          case 'doesnotexist':
            return `!${key}`;
          default:
        }
        return `${key} ${operator} (${values.join(',')})`;
      }),
    )
    .join(',');
}
