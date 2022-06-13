<template>
  <v-flex>
    <v-card class="mt-6">
      <BaseSubTitle title="环境" :divider="false">
        <template #action>
          <v-btn v-if="m_permisson_virtualSpaceAllow" text small color="primary" class="mr-1" @click="linkEnvironment">
            <v-icon left>mdi-link</v-icon>
            关联环境
          </v-btn>
        </template>
      </BaseSubTitle>

      <v-card-text class="pa-3">
        <v-data-table
          disable-sort
          :headers="headers"
          :items="virtualspace ? virtualspace.Environments : []"
          no-data-text="暂无数据"
          hide-default-footer
          :items-per-page="500"
        >
          <template #[`item.environmentName`]="{ item }">
            <a class="text-subtitle-2" @click="environmentDetail(item)">
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
            <v-menu left :attach="`#r${item.ID}`">
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="error" text small @click="removeVirtualSpaceEnvironment(item)"> 删除 </v-btn>
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
  import AddEnvironment from './AddEnvironment';
  import { deleteVirtualSpaceEnvironment } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EnvironmentList',
    components: { AddEnvironment },
    mixins: [BaseResource, BasePermission, BaseSelect],
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
            text: '环境空间',
            value: 'environmentName',
            align: 'start',
            width: 180,
          },
          { text: '备注', value: 'remark', align: 'start' },
          { text: '环境类型', value: 'metaType', align: 'start' },
          { text: '命名空间', value: 'namespace', align: 'start' },
          { text: '集群', value: 'cluster', align: 'start' },
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
          title: `删除虚拟空间关联环境`,
          content: {
            text: `删除虚拟空间关联环境 ${item.EnvironmentName}`,
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
