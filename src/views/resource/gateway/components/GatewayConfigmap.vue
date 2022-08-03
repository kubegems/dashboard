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
  <div>
    <v-flex v-for="(d, key) in data" :key="key">
      <v-card class="pa-4 mt-3" flat>
        <v-card-text class="pa-0">
          <BaseSubTitle color="primary" :divider="false" :title="key" />
          <pre class="kubegems__data-pre rounded">{{ d }}</pre>
        </v-card-text>
      </v-card>
    </v-flex>
  </div>
</template>

<script>
  export default {
    name: 'GatewayConfigmap',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        data: {},
      };
    },
    watch: {
      item() {
        this.data = this.item.spec.configMapData ? this.item.spec.configMapData : {};
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.data = this.item.spec.configMapData ? this.item.spec.configMapData : {};
      });
    },
  };
</script>
