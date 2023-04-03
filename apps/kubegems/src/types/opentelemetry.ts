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

  public async getTraceDetail(cluster: string, traceId: string, params: KubeRequest): Promise<Telemetry> {
    const data: { [key: string]: any } = await axios(`observability/cluster/${cluster}/traces/${traceId}`, {
      params: params,
    });
    return data as Telemetry;
  }
}
