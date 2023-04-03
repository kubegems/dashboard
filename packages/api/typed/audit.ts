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

export class Audit {
  constructor(auth?: { [key: string]: any }) {
    Object.assign(this, auth);
  }

  Action: string;
  ClientIP: string;
  CreatedAt: Date;
  DeletedAt: Date;
  ID: number;
  Labels: { [key: string]: any };
  Module: string;
  Name: string;
  RawData: { [key: string]: any };
  Success: boolean;
  Tenant: string;
  UpdatedAt: Date;
  Username: string;
  [others: string]: any;

  public async getAuditList(params: KubePaginationRequest): Promise<KubePaginationResponse<Audit[]>> {
    const data: { [key: string]: any } = await axios(`auditlog`, { params: params });
    return data as KubePaginationResponse<Audit[]>;
  }
}
