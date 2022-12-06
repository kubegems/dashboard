import axios from 'axios';

interface TelemetryForService {
  getRequest(cluster: string, namespace: string, service: string, params: KubeRequest): Promise<{ [key: string]: any }>;
  getOperation(
    cluster: string,
    namespace: string,
    service: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Telemetry[]>>;
  getTrace(
    cluster: string,
    namespace: string,
    service: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Telemetry[]>>;
}

export class Telemetry implements TelemetryForService {
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

  public async getOverview(
    cluster: string,
    namespace: string,
    params: KubeRequest = {},
  ): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${cluster}/namespaces/${namespace}/otel/appmonitor/overview`,
      { params: params },
    );
    return data as { [key: string]: any };
  }

  // TelemetryForService
  public async getRequest(
    cluster: string,
    namespace: string,
    service: string,
    params: KubeRequest = {},
  ): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${cluster}/namespaces/${namespace}/otel/appmonitor/services/${service}/requests`,
      { params: params },
    );
    return data as { [key: string]: any };
  }

  public async getOperation(
    cluster: string,
    namespace: string,
    service: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Telemetry[]>> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${cluster}/namespaces/${namespace}/otel/appmonitor/services/${service}/operations`,
      { params: params },
    );
    return data as KubePaginationResponse<Telemetry[]>;
  }

  public async getTrace(
    cluster: string,
    namespace: string,
    service: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Telemetry[]>> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${cluster}/namespaces/${namespace}/otel/appmonitor/services/${service}/traces`,
      { params: params },
    );
    return data as KubePaginationResponse<Telemetry[]>;
  }
}
