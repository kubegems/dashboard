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
    <v-card class="mt-6" flat>
      <BaseSubTitle :divider="false" :title="$root.$t('resource.environment')">
        <template #action>
          <v-btn v-if="m_permisson_virtualSpaceAllow" class="mr-1" color="primary" small text @click="linkEnvironment">
            <v-icon left>mdi-link</v-icon>
            {{ $t('operate.link_c', [$root.$t('resource.mesh')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>

      <v-card-text class="pa-3">
        <v-data-table
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="virtualspace ? virtualspace.Environments : []"
          :items-per-page="500"
          :no-data-text="$root.$t('data.no_data')"
        >
          <template #[`item.environmentName`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="environmentDetail(item)">
              {{ item.EnvironmentName }}
            </a>
          </template>
          <template #[`item.cluster`]="{ item }">
            {{ item.Cluster.ClusterName }}
          </template>
          <template #[`item.remark`]="{ item }">
            {{ item.Remark }}
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.Namespace }}
          </template>
          <template #[`item.metaType`]="{ item }">
            {{ item.MetaType }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.ID}`" />
            <v-menu :attach="`#r${item.ID}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="error" small text @click="removeVirtualSpaceEnvironment(item)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <AddEnvironment ref="addEnvironment" @refresh="refresh" />
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import AddEnvironment from './AddEnvironment';
  import { deleteVirtualSpaceEnvironment } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EnvironmentList',
    i18n: {
      messages: messages,
    },
    components: {
      AddEnvironment,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    props: {
      virtualspace: {
        type: Object,
        default: () => {},
      },
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['VirtualSpace']),
      headers() {
        const items = [
          {
            text: this.$root.$t('resource.environment'),
            value: 'environmentName',
            align: 'start',
            width: 180,
          },
          { text: this.$t('table.remark'), value: 'remark', align: 'start' },
          { text: this.$t('table.environment_type'), value: 'metaType', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$root.$t('resource.cluster'), value: 'cluster', align: 'start' },
        ];
        if (this.m_permisson_virtualSpaceAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
    },
    methods: {
      async environmentDetail(item) {
        this.$store.commit('SET_NAMESPACE_FILTER', {
          Namespace: item.Namespace,
          Mounted: true,
        });
        this.$store.commit('SET_ENVIRONMENT_FILTER', {
          text: item.EnvironmentName,
          value: item.ID,
          namespace: item.Namespace,
          cluster: item.Cluster.ClusterName,
          clusterid: item.Cluster.ID,
        });
        this.$router.push({
          name: 'microworkload-list',
          params: {
            virtualspace: this.VirtualSpace().VirtualSpaceName,
          },
        });
      },
      async removeVirtualSpaceEnvironment(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.delete_linked_env'),
          content: {
            text: `${this.$t('operate.delete_linked_env')} ${item.EnvironmentName}`,
            type: 'delete',
            name: item.EnvironmentName,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.EnvironmentName.length > 0) {
              await deleteVirtualSpaceEnvironment(this.VirtualSpace().ID, param.item.ID);
              this.$emit('refresh');
            }
          },
        });
      },
      linkEnvironment() {
        this.$refs.addEnvironment.open();
      },
      refresh() {
        this.$emit('refresh');
      },
    },
  };
</script>
