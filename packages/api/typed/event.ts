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

export class Event {
  constructor(event?: { [key: string]: any }) {
    Object.assign(this, event);
  }

  [others: string]: any;

  public async getEventList(
    cluster: string,
    namespace: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<Event[]>> {
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/custom/core/v1/namespaces/${namespace}/events`,
      { params: params },
    );
    return data as KubePaginationResponse<Event[]>;
  }
}
