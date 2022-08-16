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
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">{{ $t('table.container_name') }}</th>
          <th class="text-left" :style="{ width: `300px` }"> {{ $t('table.image') }} </th>
          <th class="text-left" :style="{ width: `120px` }"> {{ $t('table.probe') }} </th>
          <th class="text-left">{{ $t('table.container_port') }}</th>
          <th class="text-left" :style="{ width: `220px` }"> {{ $t('table.volume') }} </th>
          <th class="text-left">{{ $t('table.volume_mount') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in containers" :key="`${item.name}${i}`">
          <td>{{ item.showName || item.name }}</td>
          <td>{{ item.image }}</td>
          <td>
            <template v-if="item.livenessProbe">
              <ProbeTip :item="item.livenessProbe" :title="$t('tip.live_probe')" />
            </template>
            <template v-if="item.readinessProbe">
              <ProbeTip :item="item.readinessProbe" :title="$t('tip.read_probe')" />
            </template>
            <template v-if="item.startupProbe">
              <ProbeTip :item="item.startupProbe" :title="$t('tip.start_probe')" />
            </template>
          </td>
          <td>
            <BaseCollapseChips
              v-if="item"
              :id="`c_port_${i}`"
              :chips="ports[item.name] || []"
              icon="mdi-directions-fork"
              single-line
            />
          </td>
          <td>
            <v-flex v-for="(volume, index) in item.volumeMounts" :key="index" class="py-1">
              <div class="table__volume__height">{{ volume.name }}</div>
            </v-flex>
          </td>
          <td>
            <v-flex v-for="(volume, index) in item.volumeMounts" :key="index" class="py-1">
              <div class="table__volume__height">
                <span>{{ volume.mountPath }}</span>
                <span v-if="volume.subPath"> | {{ $t('tip.subpath') }} : {{ volume.subPath }} </span>
              </div>
            </v-flex>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
  import messages from '../i18n';
  import ProbeTip from './ProbeTip';

  export default {
    name: 'DetailContainer',
    i18n: {
      messages: messages,
    },
    components: {
      ProbeTip,
    },
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        ports: {},
      };
    },
    watch: {
      containers() {
        this.ports = {};
        this.containers.forEach((c) => {
          this.ports[c.name] = [];
          if (c.ports) {
            c.ports.forEach((p) => {
              this.ports[c.name].push(`${p.containerPort} | ${p.protocol}`);
            });
          }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .table {
    &__volume {
      &__height {
        height: 24px;
        overflow: auto;
        word-break: break-all;
        white-space: break-spaces;
      }
    }
  }
</style>
