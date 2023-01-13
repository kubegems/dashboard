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
import { V1ContainerPort } from '@kubernetes/client-node/dist/gen/model/v1ContainerPort';
import { V1PodSpec } from '@kubernetes/client-node/dist/gen/model/v1PodSpec';
import axios from 'axios';

import { Metadata } from './kubernetes';

class Mount {
  constructor(mount?: { [key: string]: any }) {
    Object.assign(this, mount);
  }

  kind?: string;
  mountPath?: string;
  source?: string;

  [others: string]: any;
}

class Ingress {
  constructor(ingress?: { [key: string]: any }) {
    Object.assign(this, ingress);
  }

  host?: string;
  className?: string;
  gatewayName?: string;

  [others: string]: any;
}

class Server {
  constructor(server?: { [key: string]: any }) {
    Object.assign(this, server);
  }

  protocol?: string = 'v2';
  image?: string;
  kind?: string;
  storageInitializerImage?: string;
  parameters?: { [key: string]: any };
  mounts?: Mount[] = [];
  privileged?: boolean = false;
  ports?: V1ContainerPort[] = [];
  resources?: any;
  upgradeStrategy?: string;
  podSpec?: V1PodSpec;

  [others: string]: any;
}

class Model {
  constructor(model?: { [key: string]: any }) {
    Object.assign(this, model);
  }

  source?: string;
  name?: string;
  version?: string;
  url?: string;
  token?: string;
  task?: string;

  [others: string]: any;
}

class ModelSpec {
  constructor(spec?: { [key: string]: any }) {
    Object.assign(this, spec);
  }

  model?: Model = new Model();
  server?: Server = new Server();
  ingress?: Ingress = new Ingress();
  replicas?: number = 1;
}

class ModelStatus {
  constructor(status?: { [key: string]: any }) {
    Object.assign(this, status);
  }

  url?: string;
  phase?: string;
  rawStatus?: { [key: string]: any };
}

export class ModelDeployment {
  constructor(modelDeployment?: { [key: string]: any }) {
    this.apiVersion = 'models.kubegems.io/v1beta1';
    this.kind = 'ModelDeployment';
    this.metadata = new Metadata();

    if (modelDeployment) Object.assign(this, modelDeployment);
  }

  apiVersion?: string = 'models.kubegems.io/v1beta1';
  kind?: string = 'ModelDeployment';
  metadata?: Metadata = new Metadata();
  spec?: ModelSpec = new ModelSpec();
  status?: ModelStatus;

  public async getModelDeploymentList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<ModelDeployment[]>> {
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/models.kubegems.io/v1beta1/namespaces/${this.metadata.namespace}/modeldeployments`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<ModelDeployment[]>;
  }

  public async getModelDeployment(cluster: string, params: KubeRequest = {}): Promise<ModelDeployment> {
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/models.kubegems.io/v1beta1/namespaces/${this.metadata.namespace}/modeldeployments/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as ModelDeployment;
  }

  public async addModelDeployment(cluster: string): Promise<ModelDeployment> {
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/models.kubegems.io/v1beta1/namespaces/${this.metadata.namespace}/modeldeployments/${this.metadata.name}`,
      this,
    );
    return data as ModelDeployment;
  }

  public async updateModelDeployment(cluster: string): Promise<ModelDeployment> {
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/models.kubegems.io/v1beta1/namespaces/${this.metadata.namespace}/modeldeployments/${this.metadata.name}`,
      this,
    );
    return data as ModelDeployment;
  }

  public async deleteModelDeployment(cluster: string): Promise<void> {
    await axios.delete(
      `proxy/cluster/${cluster}/models.kubegems.io/v1beta1/namespaces/${this.metadata.namespace}/modeldeployments/${this.metadata.name}`,
    );
  }
}
