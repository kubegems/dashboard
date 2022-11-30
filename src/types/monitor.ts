export class PromqlGenerator {
  constructor(promqlGenerator?: { [key: string]: any }) {
    Object.assign(this, promqlGenerator);
  }

  scope = '';
  resource = '';
  rule = '';
  unit = '';
}

export class MonitorTarget {
  constructor(monitorTarget?: { [key: string]: any }) {
    Object.assign(this, monitorTarget);
  }

  expr = '';
  targetName = '';
  promqlGenerator: PromqlGenerator = new PromqlGenerator();
  unit = '';
  [others: string]: any;
}
