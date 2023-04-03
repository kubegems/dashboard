/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

export class TemplateGraph {
  constructor(graph?: { [key: string]: any }) {
    Object.assign(this, graph);
  }

  name: string;
  targets: MonitorTarget[];
  unit: string;
}
