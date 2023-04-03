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

import { Pod } from '@/types/pod';

export const usePodStatus = (pod: Pod): string => {
  /*
      根据pod生命周期，pod的生命周期分为 Pending, Running, Succeeded, Failed, Unknow 五个大状态
      容器又分为三种大状态 Waiting, Running, Terminated
      以上，容器真实状态判断函数如下
      */
  if (pod.metadata.deletionTimestamp) {
    return 'Terminating';
  }
  if (!pod.status.containerStatuses) {
    return pod.status.reason ? pod.status.reason : pod.status.phase;
  }
  let st = 'Running';
  pod.status.containerStatuses.forEach((con) => {
    if (con.state.waiting) {
      st = con.state.waiting.reason;
    } else if (con.state.terminated) {
      st = con.state.terminated.reason;
    }
  });
  return st;
};
