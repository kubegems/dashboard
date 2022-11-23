import axios from 'axios';

export class Cluster {
  constructor(cluster?: { [key: string]: any }) {
    Object.assign(this, cluster);
  }

  ID: number;
  ClusterName: string;
  APIServer?: string;
  ClientCertExpireAt?: Date;
  KubeConfig?: any;
  Primary?: boolean;
  Version: string;
  AgentAddr?: string;
  OversoldConfig?: any;
  Upstream?: string;
  [others: string]: any;

  public async getClusterList(params: KubePaginationRequest): Promise<KubePaginationResponse<Cluster[]>> {
    const data: { [key: string]: any } = await axios(`cluster`, { params: params });
    return data as KubePaginationResponse<Cluster[]>;
  }

  public async getCluster(params: KubeRequest): Promise<Cluster> {
    const data: { [key: string]: any } = await axios(`cluster/${this.ID}`, { params: params });
    return data as Cluster;
  }

  public async addCluster(): Promise<Cluster> {
    const data: { [key: string]: any } = await axios.post(`cluster`, this);
    return data as Cluster;
  }

  public async updateCluster(): Promise<Cluster> {
    const data: { [key: string]: any } = await axios.put(`cluster/${this.ID}`, this);
    return data as Cluster;
  }

  public async deleteCluster(): Promise<void> {
    await axios.delete(`cluster/${this.ID}`);
  }
}
