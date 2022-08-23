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
    <span>{{ $root.$t('resource.container') }}</span>
    <v-sheet v-if="containerStatusesCopy.length === 0" class="grey lighten-4 rounded my-1 py-6 text-center">
      {{ $root.$t('data.no_data') }}
    </v-sheet>
    <v-sheet v-for="(container, index) in containerStatusesCopy" :key="index" class="grey lighten-4 rounded my-1">
      <v-list-item two-line>
        <v-list-item-content class="py-0">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `515px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-icon class="float-left mt-1" color="primary" left small> mdi-cube </v-icon>
                  <v-flex class="float-left">
                    {{ container.name }}
                  </v-flex>
                  <v-icon
                    v-if="
                      (container.state && container.state.running !== undefined) ||
                      (item.metadata.deletionTimestamp ? 'Terminating' : item.status.phase) === 'Succeeded' ||
                      (container.state && container.state.waiting) ||
                      container.state.terminated
                    "
                    class="kubegems__pointer"
                    color="primary float-left"
                    right
                    small
                    @click="containerLog(container.name, item)"
                  >
                    mdi-file-document
                  </v-icon>
                  <v-icon
                    v-if="m_permisson_resourceAllow && container.state && container.state.running !== undefined"
                    class="kubegems__pointer"
                    color="primary float-left"
                    right
                    small
                    @click="containerShell(container.name, item)"
                  >
                    mdi-console
                  </v-icon>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ container.image }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span
                    :class="`v-avatar mr-2 ${
                      getContainerStatus(container) === 'Waiting' ? 'kubegems__waiting-flashing' : ''
                    }`"
                    :style="{
                      height: '10px',
                      minWidth: '10px',
                      width: '10px',
                      backgroundColor: `${$CONTAINER_STATUS_COLOR[getContainerStatus(container)]}`,
                    }"
                  />
                  <span v-if="container.state.running"> Running </span>
                  <span v-else-if="container.state.terminated">
                    Terminated({{ container.state.terminated.reason }})
                  </span>
                  <span v-else-if="container.state.waiting"> Waiting({{ container.state.waiting.reason }}) </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('table.status') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-flex
                    v-for="(probe, index) in getContainerProbes(item, container)"
                    :key="index"
                    class="float-left mr-2"
                  >
                    <ProbeTip :item="probe.probe" :title="probe.title" />
                  </v-flex>
                  <v-flex v-if="getContainerProbes(item, container).length === 0" class="float-left mr-1">
                    {{ $root.$t('data.no_data') }}
                  </v-flex>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.probe') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ container.restartCount }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('table.restart_count') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span v-if="container.state.running">
                    {{
                      container.state.running.startedAt
                        ? $moment(container.state.running.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                        : ''
                    }}
                  </span>
                  <span v-else-if="container.state.terminated">
                    {{
                      container.state.terminated.startedAt
                        ? $moment(container.state.terminated.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                        : $root.$t('data.unknown')
                    }}
                  </span>
                  <span v-else>{{ $root.$t('data.no_data') }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> Age </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{
                    container.resources && container.resources.limits
                      ? container.resources.limits.cpu
                      : $t('tip.no_limit')
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> limits.cpu </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{
                    container.resources && container.resources.limits
                      ? container.resources.limits.memory
                      : $t('tip.no_limit')
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> limits.memory </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
      </v-list-item>
    </v-sheet>

    <ContainerLog ref="containerLog" />
    <Terminal ref="terminal" />
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import ContainerLog from '@/views/resource/components/common/ContainerLog';
  import ProbeTip from '@/views/resource/components/common/ProbeTip';
  import Terminal from '@/views/resource/components/common/Terminal';

  export default {
    name: 'ContainerItems',
    i18n: {
      messages: messages,
    },
    components: {
      ContainerLog,
      ProbeTip,
      Terminal,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
      containerStatuses: {
        type: Array,
        default: () => [],
      },
      item: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        containerStatusesCopy: [],
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
    },
    watch: {
      containerStatuses: {
        handler() {
          this.containerStatusesCopy = deepCopy(this.containerStatuses);
          this.containers.forEach((c) => {
            const index = this.containerStatusesCopy.findIndex((s) => {
              return s.name === c.name;
            });
            if (index > -1) {
              const container = this.containerStatusesCopy[index];
              container.image = c.image;
              container.resources = c.resources;
              this.$set(this.containerStatusesCopy, index, container);
            }
          });
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      getContainerStatus(item) {
        if (item.state) {
          if (item.state.running) return 'Running';
          if (item.state.terminated) return 'Terminated';
          if (item.state.waiting) return 'Waiting';
        } else return 'Failed';
      },
      getContainerProbes(item, container) {
        const probes = [];
        const spec = item.spec.containers.find((c) => {
          return (c.name = container.name);
        });
        if (spec) {
          if (spec.livenessProbe) {
            probes.push({ title: this.$t('tip.live_probe'), probe: spec.livenessProbe });
          }
          if (spec.readinessProbe) {
            probes.push({ title: this.$t('tip.read_probe'), probe: spec.readinessProbe });
          }
          if (spec.startupProbe) {
            probes.push({ title: this.$t('tip.start_probe'), probe: spec.startupProbe });
          }
        }
        return probes;
      },
      containerLog(container, pod) {
        const item = {
          namespace: pod.metadata.namespace,
          name: pod.metadata.name,
          containers: pod.status.containerStatuses.concat(
            pod.spec.initContainers
              ? pod.spec.initContainers.map((i) => {
                  return { ...i, showName: `${i.name} (init)` };
                })
              : [],
          ),
        };
        this.$refs.containerLog.init(container, item);
        this.$refs.containerLog.open();
      },
      containerShell(container, pod) {
        const item = {
          namespace: pod.metadata.namespace,
          name: pod.metadata.name,
          containers: pod.status.containerStatuses,
        };
        this.$refs.terminal.init(container, item, 'shell');
        this.$refs.terminal.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .icon-height {
    height: 16px;
  }
</style>
