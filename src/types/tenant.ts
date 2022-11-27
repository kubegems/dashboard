import axios from 'axios';

import { ResourceRole, UserRole } from './role';
import { User } from './user';

export class Tenant implements UserRole<Tenant> {
  constructor(tenant?: { [key: string]: any }) {
    Object.assign(this, tenant);
  }

  ID: number;
  AllocatedResourcequota: any;
  ResourceQuotas: any;
  CreatedAt: Date;
  IsActive: boolean;
  Remark: string;
  TenantName: string;
  UpdatedAt: Date;
  Users: User[];
  [others: string]: any;

  public async getTenantList(params: KubePaginationRequest): Promise<KubePaginationResponse<Tenant[]>> {
    const data: { [key: string]: any } = await axios(`tenant`, { params: params });
    return data as KubePaginationResponse<Tenant[]>;
  }

  public async getTenant(params: KubeRequest): Promise<Tenant> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}`, { params: params });
    return data as Tenant;
  }

  public async addTenant(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.post(`tenant`, this);
    return data as Tenant;
  }

  public async updateTenant(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.put(`tenant/${this.ID}`, this);
    return data as Tenant;
  }

  public async deleteTenant(): Promise<void> {
    await axios.delete(`tenant/${this.ID}`);
  }

  // IUserRole
  public async getUserList(params: KubePaginationRequest): Promise<Tenant[]> {
    const data: { [key: string]: any } = await axios(`tenant/${this.ID}/user`, { params: params });
    return data as Tenant[];
  }

  public async addUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      TenantID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.post(`tenant/${this.ID}/user`, body);
    return body;
  }

  public async updateUser(user: User, role: ResourceRole): Promise<any> {
    const body = {
      TenantID: this.ID,
      UserID: user.ID,
      Role: role,
    };
    await axios.put(`tenant/${this.ID}/user/${user.ID}`, body);
    return body;
  }

  public async deleteUser(user: User): Promise<void> {
    await axios.delete(`tenant/${this.ID}/user/${user.ID}`);
  }
}
