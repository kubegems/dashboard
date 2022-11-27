import axios from 'axios';

import { ResourceRole, UserRole } from './role';
import { User } from './user';

export class Environment implements UserRole<Environment> {
  constructor(environment?: { [key: string]: any }) {
    Object.assign(this, environment);
  }

  ID: number;
  ClusterID: number;
  DeletePolicy: string;
  EnvironmentName: string;
  MetaType: string;
  Namespace: string;
  ProjectID: string;
  Remark: string;
  AllowEdgeRegistration: boolean;
  [others: string]: any;

  public async getEnvironmentList(params: KubePaginationRequest): Promise<KubePaginationResponse<Environment[]>> {
    const data: { [key: string]: any } = await axios(`project/${this.ProjectID}/project`, { params: params });
    return data as KubePaginationResponse<Environment[]>;
  }

  public async getEnvironment(params: KubeRequest): Promise<Environment> {
    const data: { [key: string]: any } = await axios(`environment/${this.ID}`, { params: params });
    return data as Environment;
  }

  public async addEnvironment(): Promise<Environment> {
    const data: { [key: string]: any } = await axios.post(`project/${this.ProjectID}/project`, this);
    return data as Environment;
  }

  public async updateEnvironment(): Promise<Environment> {
    const data: { [key: string]: any } = await axios.put(`environment/${this.ID}`, this);
    return data as Environment;
  }

  public async deleteEnvironment(): Promise<void> {
    await axios.delete(`environment/${this.ID}`);
  }

  // IUserRole
  public async getUserList(params: KubePaginationRequest): Promise<Environment[]> {
    const data: { [key: string]: any } = await axios(`environment/${this.ID}/user`, { params: params });
    return data as Environment[];
  }

  public async addUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      EnvironmentID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.post(`environment/${this.ID}/user`, body);
    return body;
  }

  public async updateUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      EnvironmentID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.put(`environment/${this.ID}/user/${user.ID}`, body);
    return body;
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`environment/${this.ID}/user/${user.ID}`);
  }
}
