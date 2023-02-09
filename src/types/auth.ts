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

import { User } from './user';

interface AccessTokenOperator {
  getAccessTokenList(params: KubePaginationRequest): Promise<KubePaginationResponse<AccessToken[]>>;
  removeAccesstoken(token: AccessToken): Promise<void>;
  generateAccessToken(params: KubeRequest): Promise<AccessToken>;
}

export class Auth implements AccessTokenOperator {
  constructor(auth?: { [key: string]: any }) {
    Object.assign(this, auth);
  }

  [others: string]: any;

  public async getLoginUser(): Promise<User> {
    const data: { [key: string]: any } = await axios(`my/info`);
    return data as User;
  }

  public async resetPasswd(body: KubeRequest): Promise<void> {
    await axios.post(`my/reset_password`, body);
  }

  // AccessTokenOperator
  public async getAccessTokenList(params: KubePaginationRequest): Promise<KubePaginationResponse<AccessToken[]>> {
    const data: { [key: string]: any } = await axios(`oauth/token`, { params: params });
    return data as KubePaginationResponse<AccessToken[]>;
  }

  public async removeAccesstoken(token: AccessToken): Promise<void> {
    await axios.delete(`oauth/token/${token.id}`);
  }

  public async generateAccessToken(params: KubeRequest): Promise<AccessToken> {
    const data: { [key: string]: any } = await axios.post(`oauth/token`, {}, { params: params });
    return data as AccessToken;
  }

  public async getCallbackToken(params: KubeRequest): Promise<any> {
    const data: { [key: string]: any } = await axios(`/oauth/callback`, { params: params });
    return data;
  }
}

export class AccessToken {
  constructor(token?: { [key: string]: any }) {
    Object.assign(this, token);
  }

  id: number;
  createdAt: Date;
  expireAt: Date;
  expired: boolean;
  grantType: string;
  scope: string;
  token: string;
  userID: number;
  [others: string]: any;
}
