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
import axios from 'axios';

export class Matrix {
  metric?: { [key: string]: string };
  values?: (number | string)[][];

  public async getMatrix(cluster: string, params: KubeRequest): Promise<Matrix[]> {
    const start = params.start;
    const end = params.end;

    if (start && end) {
      const millseconds = (new Date(end as string) as any) - (new Date(start as string) as any);
      if (millseconds < 1000 * 60 * 60 * 24) {
        params.step = millseconds / 1000 / 60;
      } else if (millseconds > 1000 * 60 * 60 * 24) {
        params.step = millseconds / 1000 / 900;
        if (params.step > 600) params.step = 600;
      } else {
        params.step = millseconds / 1000 / 300;
      }
    }
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/custom/prometheus/v1/matrix`, {
      params: params,
    });
    return data as Matrix[];
  }
}

export class Vector {
  metric?: { [key: string]: string };
  value?: (number | string)[];

  public async getVector(cluster: string, params: KubeRequest): Promise<Vector[]> {
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/custom/prometheus/v1/vector`, {
      params: params,
    });
    return data as Vector[];
  }
}
