import axios from 'axios';

export class Telemetry {
  constructor(telemetry?: { [key: string]: any }) {
    Object.assign(this, telemetry);
  }

  [others: string]: any;

  public async getServiceList(
    cluster: string,
    namespace: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Telemetry[]>> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${cluster}/namespaces/${namespace}/otel/appmonitor/services`,
      { params: params },
    );
    return data as KubePaginationResponse<Telemetry[]>;
  }

  public async getOverview(cluster: string, namespace: string, params: KubeRequest = {}): Promise<any> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${cluster}/namespaces/${namespace}/otel/appmonitor/overview`,
      { params: params },
    );
    return data;
  }
}
