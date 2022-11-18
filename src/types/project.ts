import axios from 'axios';

import { Environment } from './environment';
import { IUserRole, ResourceRole } from './role';
import { Tenant } from './tenant';
import { User } from './user';

export class Project implements IUserRole<Project> {
  constructor(project: { [key: string]: any }) {
    Object.assign(this, project);
  }

  ID: number;
  ProjectAlias: string;
  ProjectName: string;
  Remark: string;
  TenantID: number;
  CreatedAt: Date;
  Tenant: Tenant;
  Environments: Environment[];
  Users?: User[];
  ResourceQuota?: any;
  Applications?: any;
  Registries?: any;
  [others: string]: any;

  public async getProjectList(params: KubePaginationRequest): Promise<KubePaginationResponse<Project[]>> {
    const data: { [key: string]: any } = await axios(`tenant/${this.TenantID}/project`, { params: params });
    return data as KubePaginationResponse<Project[]>;
  }

  public async getProject(params: KubeRequest): Promise<Project> {
    const data: { [key: string]: any } = await axios(`project/${this.ID}`, { params: params });
    return data as Project;
  }

  public async addProject(): Promise<Project> {
    const data: { [key: string]: any } = await axios.post(`tenant/${this.TenantID}/project`, this);
    return data as Project;
  }

  public async updateProject(): Promise<Project> {
    const data: { [key: string]: any } = await axios.put(`project/${this.ID}`, this);
    return data as Project;
  }

  public async deleteProject(): Promise<void> {
    await axios.delete(`project/${this.ID}`);
  }

  // IUserRole
  public async getUserList(params: KubePaginationRequest): Promise<Project[]> {
    const data: { [key: string]: any } = await axios(`project/${this.ID}/user`, { params: params });
    return data as Project[];
  }

  public async addUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      ProjectID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.post(`project/${this.ID}/user`, body);
    return body;
  }

  public async updateUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      ProjectID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.put(`project/${this.ID}/user/${user.ID}`, body);
    return body;
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`project/${this.ID}/user/${user.ID}`);
  }
}
