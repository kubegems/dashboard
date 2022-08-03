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
  <v-card class="pa-2" flat height="100%">
    <DeployTopology :app="app" :appname="appname" :tree="statusTree" @refresh="refresh" />
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import DeployTopology from './DeployTopology';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployStatus',
    components: {
      DeployTopology,
    },
    mixins: [BaseResource],
    props: {
      app: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      statusTree: [],
      appname: '',
      statusSSE: null,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Project', 'Tenant', 'Environment']),
    },
    watch: {
      app: {
        handler() {
          if (this.app) this.deployEnvironmentAppsLiveStatus();
        },
        immediate: true,
      },
    },
    created() {
      window.addEventListener('beforeunload', this.closeStatusSSE);
      window.addEventListener('unload', this.closeStatusSSE);
    },
    destroyed() {
      this.closeStatusSSE();
      window.removeEventListener('beforeunload', this.closeStatusSSE);
      window.removeEventListener('unload', this.closeStatusSSE);
    },
    methods: {
      deployEnvironmentAppsLiveStatus() {
        const url = `/api/v1/tenant/${this.Tenant().ID}/project/${this.Project().ID}/environment/${
          this.Environment().ID > 0 ? this.Environment().ID : this.$route.query.EnvironmentID
        }/applications/${this.app.name}/resourcetree?token=${this.JWT}&watch=true`;
        const vue = this;
        this.statusSSE = new EventSource(url, { withCredentials: true });
        this.statusSSE.onopen = () => {};
        this.statusSSE.addEventListener(
          'resourcetree',
          function (event) {
            if (event.data && event.data.length > 0) {
              const data = JSON.parse(event.data);
              const childrenTree = data;
              vue.appname = vue.app.name;
              const treeData = {
                kind: 'Application',
                name: vue.app.name,
                group: childrenTree.group,
                namespace: childrenTree.namespace,
                version: childrenTree.version,
                health: childrenTree.health,
                sync: childrenTree?.liveState?.status?.sync?.status,
                syncState: childrenTree?.liveState?.status?.operationState?.phase,
                createdAt: childrenTree.createdAt,
                children: childrenTree.children,
                conditions: childrenTree?.liveState?.status?.conditions,
              };
              vue.statusTree = [treeData];
            }
          },
          false,
        );
        this.statusSSE.onerror = () => {
          // this.$store.commit('SET_SNACKBAR', {
          //   text: `建立连接失败`,
          //   color: 'error',
          // })
        };
        this.statusSSE.addEventListener(
          'err',
          function () {
            vue.closeStatusSSE();
          },
          false,
        );
      },
      closeStatusSSE() {
        if (this.statusSSE) {
          this.statusSSE.close();
        }
      },
      refresh() {
        this.closeStatusSSE();
        this.deployEnvironmentAppsLiveStatus();
      },
    },
  };
</script>
