import axios from 'axios';

export class Cluster {
  constructor(cluster?: { [key: string]: any }) {
    Object.assign(this, cluster);
  }

  ID = 0;
  ClusterName = '';
  APIServer?: string = '';
  ClientCertExpireAt?: Date = new Date();
  KubeConfig?: any;
  Primary?: boolean = false;
  Version = '';
  AgentAddr?: string = '';
  OversoldConfig?: any = {
    cpu: 1,
    memory: 1,
    storage: 1,
  };
  Upstream?: string = '';
  Status?: string = '';
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
