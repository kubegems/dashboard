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

interface MessageOperator {
  readMessage(params: KubeRequest): Promise<Message>;
}

export class Message implements MessageOperator {
  constructor(message?: { [key: string]: any }) {
    Object.assign(this, message);
  }

  ID: number | string;
  Content: any;
  CreatedAt: Date;
  IsRead: boolean;
  MessageType: string;
  Title: string;
  [others: string]: any;

  public async getMessageList(params: KubePaginationRequest): Promise<KubePaginationResponse<Message[]>> {
    const data: { [key: string]: any } = await axios(`message`, { params: params });
    return data as KubePaginationResponse<Message[]>;
  }

  public async readMessage(params: KubeRequest = {}): Promise<Message> {
    const data: { [key: string]: any } = await axios.put(`message/${this.ID}`, {}, { params: params });
    return data as Message;
  }
}

interface ApproveOperator {
  passApprove(): Promise<void>;
  rejectApprove(): Promise<void>;
}

export class Approve implements ApproveOperator {
  constructor(approve?: { [key: string]: any }) {
    Object.assign(this, approve);
  }

  ClusterID: number;
  ClusterName: string;
  Content: any;
  CreatedAt: Date;
  ID: number;
  ResourceType: string;
  Status: string;
  TenantID: string;
  TenantName: string;
  Title: string;
  [others: string]: any;

  public async getApproveList(params: KubeRequest): Promise<Approve[]> {
    const data: { [key: string]: any } = await axios(`approve`, { params: params });
    return data as Approve[];
  }

  public async passApprove(): Promise<void> {
    await axios.post(`approve/${this.ID}/pass`);
  }

  public async rejectApprove(): Promise<void> {
    await axios.post(`approve/${this.ID}/reject`);
  }
}
