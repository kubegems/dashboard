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
  <v-menu v-model="menu" :position-x="left" :position-y="top">
    <v-card>
      <v-card-text class="pa-2">
        <v-flex>
          <v-btn color="primary" small text @click="download">
            {{ $root.$t('operate.download') }} <span class="grey--text">{{ getFile() }}</span>
          </v-btn>
        </v-flex>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'FileDownloader',
    props: {
      container: {
        type: String,
        default: '',
      },
      file: {
        type: String,
        default: '',
      },
      left: {
        type: Number,
        default: 0,
      },
      top: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        menu: false,
      };
    },
    computed: {
      ...mapState(['JWT', 'Edge']),
    },
    watch: {
      left: {
        handler(newValue) {
          if (newValue) {
            this.menu = true;
          }
        },
        deep: true,
      },
    },
    methods: {
      async download() {
        if (this.Edge) {
          window.open(
            `/api/v1/edge-clusters/${this.$route.query.t_cluster}/proxy/custom/core/v1/namespaces/${this.$route.query.t_namespace}/pods/${this.$route.query.t_pod}/actions/file?filename=${this.file}&token=${this.JWT}&container=${this.container}`,
          );
        } else {
          window.open(
            `/api/v1/proxy/cluster/${this.$route.query.t_cluster}/custom/core/v1/namespaces/${this.$route.query.t_namespace}/pods/${this.$route.query.t_pod}/actions/file?filename=${this.file}&token=${this.JWT}&container=${this.container}`,
          );
        }
      },
      getFile() {
        const index = this.file.lastIndexOf('/');
        if (index > -1) {
          return ` ${this.file.substr(index + 1)}`;
        }
        return ` ${this.file}`;
      },
    },
  };
</script>
