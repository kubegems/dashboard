import { V1CronJob } from '@kubernetes/client-node/dist/gen/model/v1CronJob';
import { V1CronJobSpec } from '@kubernetes/client-node/dist/gen/model/v1CronJobSpec';
import { V1CronJobStatus } from '@kubernetes/client-node/dist/gen/model/v1CronJobStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';
import { getApiVersion } from '@/utils/helpers';

export class CronJob extends V1CronJob {
  constructor(cronjob?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('cronjob');
    this.kind = 'CronJob';
    this.metadata = new Metadata();
    this.spec = initKModel<V1CronJobSpec>(V1CronJobSpec.attributeTypeMap);
    this.status = initKModel<V1CronJobStatus>(V1CronJobStatus.attributeTypeMap);

    if (cronjob) Object.assign(this, cronjob);
  }

  public async getCronJobList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<CronJob[]>> {
    const apiVersion: string = getApiVersion('cronjob');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<CronJob[]>;
  }

  public async getCronJob(cluster: string, params: KubeRequest): Promise<CronJob> {
    const apiVersion: string = getApiVersion('cronjob');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as CronJob;
  }

  public async addCronJob(cluster: string): Promise<CronJob> {
    const apiVersion: string = getApiVersion('cronjob');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs`,
      this,
    );
    return data as CronJob;
  }

  public async updateCronJob(cluster: string): Promise<CronJob> {
    const apiVersion: string = getApiVersion('cronjob');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
      this,
    );
    return data as CronJob;
  }

  public async deleteCronJob(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('cronjob');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
    );
  }
}
