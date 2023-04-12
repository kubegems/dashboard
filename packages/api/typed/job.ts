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
import { getApiVersion } from '@kubegems/libs/utils/helpers';
import { V1Job } from '@kubernetes/client-node/dist/gen/model/v1Job';
import { V1JobSpec } from '@kubernetes/client-node/dist/gen/model/v1JobSpec';
import { V1JobStatus } from '@kubernetes/client-node/dist/gen/model/v1JobStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';

export class Job extends V1Job {
  constructor(job?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('job', 'batch/v1');
    this.kind = 'Job';
    this.metadata = new Metadata();
    this.spec = initKModel<V1JobSpec>(V1JobSpec.attributeTypeMap);
    this.status = initKModel<V1JobStatus>(V1JobStatus.attributeTypeMap);

    if (job) Object.assign(this, job);
  }

  public async getJobList(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<Job[]>> {
    const apiVersion: string = getApiVersion('job', 'batch/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/jobs`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<Job[]>;
  }

  public async getJob(cluster: string, params: KubeRequest = {}): Promise<Job> {
    const apiVersion: string = getApiVersion('job', 'batch/v1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/jobs/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as Job;
  }

  public async addJob(cluster: string): Promise<Job> {
    const apiVersion: string = getApiVersion('job', 'batch/v1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/jobs/${this.metadata.name}`,
      this,
    );
    return data as Job;
  }

  public async updateJob(cluster: string): Promise<Job> {
    const apiVersion: string = getApiVersion('job', 'batch/v1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/jobs/${this.metadata.name}`,
      this,
    );
    return data as Job;
  }

  public async deleteJob(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('job', 'batch/v1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/jobs/${this.metadata.name}`,
    );
  }
}
