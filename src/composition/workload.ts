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

import { DaemonSet } from '@/types/daemonset';
import { Deployment } from '@/types/deployment';
import { StatefulSet } from '@/types/statefulset';

export const useWorkloadStatus = (item: Deployment | StatefulSet | DaemonSet): string => {
  if (!item) return '';
  if (item.kind !== 'DaemonSet') {
    const resource = (item as Deployment) || (item as StatefulSet);
    if ((resource.status.availableReplicas || resource.status.readyReplicas || 0) < resource.spec.replicas) {
      return 'pending';
    } else {
      return 'ready';
    }
  } else {
    const resource = item as DaemonSet;
    if ((resource.status.numberReady || 0) < resource.status.currentNumberScheduled) {
      return 'pending';
    } else {
      return 'ready';
    }
  }
};
