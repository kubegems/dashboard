<!--
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
-->

<template>
  <v-flex>
    <span>{{ i18n.t('resource.pod') }}</span>
    <v-sheet v-if="podList.length === 0" class="grey lighten-4 rounded my-1 py-6 text-center">
      {{ i18n.t('data.no_data') }}
    </v-sheet>
    <v-sheet v-for="(pod, index) in podList" :key="index" class="grey lighten-4 rounded my-1">
      <v-list-item two-line>
        <v-list-item-content class="py-0">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `440px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-flex class="float-left">
                    <v-icon color="primary" small>mdi-microsoft</v-icon>
                    {{ pod.metadata.name }}
                    <v-btn color="primary" icon small @click="toPodDetail(pod)">
                      <v-icon color="primary" small>mdi-open-in-new</v-icon>
                    </v-btn>
                  </v-flex>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `250px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-flex :id="`e${pod.metadata.resourceVersion}`" />
                  <EventTip :item="pod" kind="Pod">
                    <template #trigger>
                      <span
                        :class="`v-avatar mr-2 ${
                          ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(
                            usePodStatus(pod),
                          ) > -1
                            ? 'kubegems__waiting-flashing'
                            : ''
                        }`"
                        :style="{
                          height: '10px',
                          minWidth: '10px',
                          width: '10px',
                          backgroundColor: `${
                            POD_STATUS_COLOR[usePodStatus(pod)] || config.theme.THEME_COLOR_EXTEND.error
                          }`,
                        }"
                      />
                      <span>
                        {{ usePodStatus(pod) }}
                      </span>
                      <span>
                        ({{
                          pod.status && pod.status.containerStatuses
                            ? pod.status.containerStatuses.filter((c) => {
                                return c.ready;
                              }).length
                            : 0
                        }}/{{ pod.spec.containers.length }})
                      </span>
                    </template>
                  </EventTip>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ i18nLocal.t('tip.status') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `220px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ pod.spec.containers.length }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ i18nLocal.t('tip.container_count') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `170px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span class="mr-1">{{ getRestart(pod.status.containerStatuses) }}</span>
                  <div v-if="getRestart(pod.status.containerStatuses) > 0" class="float-right">
                    <v-flex :id="`re${pod.metadata.resourceVersion}`" />
                    <RestartTip :item="pod">
                      <template #trigger>
                        <v-icon color="orange" small>mdi-alert-circle</v-icon>
                      </template>
                    </RestartTip>
                  </div>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ i18nLocal.t('tip.restart_count') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `170px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <RealDatetimeTip :datetime="pod.status.startTime ? pod.status.startTime.toString() : ''">
                    <template #trigger>
                      <span>
                        {{ pod.status.startTime ? moment(pod.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
                      </span>
                    </template>
                  </RealDatetimeTip>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> Age </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ pod.status.podIP }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> PodIP </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ pod.status.hostIP }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> NodeIP </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
      </v-list-item>
    </v-sheet>
  </v-flex>
</template>

<script lang="ts" setup>
  import { usePodStatus } from '@kubegems/api/hooks/pod';
  import { DaemonSet } from '@kubegems/api/typed/daemonset';
  import { Deployment } from '@kubegems/api/typed/deployment';
  import { Pod } from '@kubegems/api/typed/pod';
  import { StatefulSet } from '@kubegems/api/typed/statefulset';
  import { convertResponse2List } from '@kubegems/api/utils';
  import RealDatetimeTip from '@kubegems/components/logicComponents/RealDatetimeTip.vue';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { V1ContainerStatus } from '@kubernetes/client-node/dist/gen/model/v1ContainerStatus';
  import moment from 'moment';
  import { nextTick, ref } from 'vue';

  import config from '../../../../config.json';
  import { useI18n } from '../i18n';
  import EventTip from '@/views/resource/components/common/EventTip.vue';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const router = useRouter();
  const routeParams = useParams();

  const props = withDefaults(
    defineProps<{
      workload?: Deployment | StatefulSet | DaemonSet;
    }>(),
    {
      workload: undefined,
    },
  );

  const cluster =
    store.state.Edge ||
    (store.state.AdminViewport
      ? store.getters.Cluster().ClusterName || ''
      : store.getters.Environment().ClusterName || '');

  const podList = ref<Pod[]>([]);
  nextTick(async () => {
    const data = await new Pod({
      metadata: { namespace: props.workload.metadata.namespace },
    }).getPodListByResourceKind(cluster, {
      page: 1,
      size: 100,
      topkind: props.workload.kind,
      topname: props.workload.metadata.name,
      noprocessing: true,
    });
    podList.value = convertResponse2List(data);
  });

  const getRestart = (containerStatuses: V1ContainerStatus[]): number => {
    let sum = 0;
    if (containerStatuses) {
      containerStatuses.forEach((con) => {
        sum += con.restartCount;
      });
    }
    return sum;
  };

  const toPodDetail = (pod: Pod): void => {
    router.push({
      name: 'pod-detail',
      params: Object.assign(routeParams.value, {
        name: pod.metadata.name,
      }),
      query: {
        namespace: pod.metadata.namespace,
      },
    });
  };
</script>
