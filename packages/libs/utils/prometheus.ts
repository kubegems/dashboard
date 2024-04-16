import moment from 'moment';

export const constructPromQLByOperator = (operator: string, ql: string, start = '', end = ''): string => {
  if (operator === 'default') return ql.replaceAll('%', '');
  const reg = new RegExp('%(.*)%', 'g');
  const seconds =
    (((new Date(moment(end as any) as any) as any) - (new Date(moment(start as any) as any) as any)) as number) / 1000;
  let suffex = '1m';
  if (seconds < 60 * 5) {
    suffex = '1m';
  } else if (seconds <= 60 * 30) {
    suffex = '2m';
  } else if (seconds <= 60 * 60) {
    suffex = '5m';
  } else if (seconds <= 60 * 180) {
    suffex = '15m';
  } else if (seconds <= 60 * 360) {
    suffex = '30m';
  } else if (seconds <= 60 * 60 * 24) {
    suffex = '1h';
  } else {
    suffex = '2h';
  }
  switch (operator) {
    case 'max':
      return ql.replaceAll(reg, `max_over_time($1[${suffex}])`);
    case 'min':
      return ql.replaceAll(reg, `min_over_time($1[${suffex}])`);
    case 'avg':
      return ql.replaceAll(reg, `avg_over_time($1[${suffex}])`);
    default:
      return ql.replaceAll('%', '');
  }
};
