import axios from 'axios';

export class Matrix {
  metric?: { [key: string]: string };
  values?: (number | string)[][];

  public async getMatrix(cluster: string, params: KubeRequest): Promise<Matrix[]> {
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
