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

interface Operator {
  enablePlugin(cluster: string, name: string, body: KubeRequest): Promise<Plugin>;
  disablePlugin(cluster: string, name: string, body: KubeRequest): Promise<void>;
  checkUpdate(cluster: string, body: KubeRequest): Promise<Plugin[]>;
}

export class Plugin implements Operator {
  constructor(plugin?: { [key: string]: any }) {
    Object.assign(this, plugin);
  }

  [others: string]: any;

  public async getPluginList(cluster: string, params: KubeRequest): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/plugins`, { params: params });
    return data as { [key: string]: any };
  }

  public async getPlugin(cluster: string, name: string, params: KubeRequest): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/plugins/${name}`, { params: params });
    return data as { [key: string]: any };
  }

  public async getGlobalPluginList(params: KubeRequest): Promise<{ [key: string]: string | boolean }[]> {
    const data: { [key: string]: any } = await axios(`plugins`, { params: params });
    return data as { [key: string]: string | boolean }[];
  }

  //Operator
  public async enablePlugin(cluster: string, name: string, body: KubeRequest): Promise<Plugin> {
    const data: { [key: string]: any } = await axios.post(`proxy/cluster/${cluster}/plugins/${name}`, body);
    return data as Plugin;
  }

  public async disablePlugin(cluster: string, name: string, body: KubeRequest): Promise<void> {
    await axios.delete(`proxy/cluster/${cluster}/plugins/${name}`, body);
  }

  public async checkUpdate(cluster: string, body: KubeRequest): Promise<Plugin[]> {
    const data: { [key: string]: any } = await axios.post(`proxy/cluster/${cluster}/plugins:check-update`, body);
    return data as Plugin[];
  }
}
