<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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
  <div class="mt-6">
    <DashboardCard :item="item" />

    <v-card class="mt-3">
      <v-sheet class="pa-2">
        <BaseListItemForDetail title="API地址">
          <template #content>
            <v-chip color="primary" small>
              {{ item ? item.spec.host : '' }}
              <v-btn icon small @click="openAPIAddress(item.spec.host)">
                <v-icon color="white" small> mdi-open-in-new </v-icon>
              </v-btn>
            </v-chip>
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="内部地址">
          <template #content>
            {{ item ? item.spec.host : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>
  </div>
</template>

<script>
  import DashboardCard from './DashboardCard';

  export default {
    name: 'ModelResourceInfo',
    components: {
      DashboardCard,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    methods: {
      openAPIAddress(address) {
        window.open(`http://${address}`);
      },
    },
  };
</script>
