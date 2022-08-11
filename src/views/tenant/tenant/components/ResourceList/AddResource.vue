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
  <BaseDialog
    v-model="dialog"
    icon="mdi-server-plus"
    :title="$root.$t('operate.create_c', [$t('resource.cluster')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <ResourceBaseForm ref="resource" :quota="quota" @clusterChange="onClusterChange" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTenantResourceQuota">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import ResourceBaseForm from './ResourceBaseForm';
  import { postAddTenantResourceQuota } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AddResource',
    i18n: {
      messages: messages,
    },
    components: {
      ResourceBaseForm,
    },
    mixins: [BaseResource],
    props: {
      clusters: {
        type: Array,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      item: null,
      quota: null,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTenantResourceQuota() {
        if (this.$refs.resource.validate()) {
          const data = deepCopy(this.$refs.resource.getData());
          if (
            this.clusters.some((c) => {
              return c.ClusterID === data.ClusterID;
            })
          ) {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('resource.tip.cluster_exist'),
              color: 'warning',
            });
            return;
          }
          data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`;
          data.Content[`requests.storage`] = `${data.Content[`requests.storage`]}Gi`;
          data.TenantID = this.item.ID;
          await postAddTenantResourceQuota(this.item.ID, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        this.item = deepCopy(item);
      },
      async onClusterChange(clusterId) {
        this.quota = await this.m_resource_clusterQuota(clusterId, {
          NowCpu: 0,
          NowMemory: 0,
          NowStorage: 0,
        });
      },
      reset() {
        this.dialog = false;
        this.$refs.resource.reset();
        this.quota = null;
      },
    },
  };
</script>
