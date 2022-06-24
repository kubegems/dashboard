<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <template v-if="m_permisson_projectAllow">
            <v-btn class="primary--text" small text @click="scaleResource">
              <v-icon left small> mdi-scale </v-icon>
              调整资源限制
            </v-btn>
            <v-btn class="primary--text" small text @click="manageUser">
              <v-icon left small> mdi-account-settings </v-icon>
              环境成员
            </v-btn>
            <v-btn class="primary--text" small text @click="resourceUsage">
              <v-icon left small> mdi-view-list </v-icon>
              资源使用清单
            </v-btn>
            <v-menu left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateEnvironment"> 编辑 </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeEnvironment"> 删除 </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-row class="mt-3 mb-0">
      <v-col class="py-0" cols="9">
        <ResourceQuota ref="resourceQuota" @ready="ready = true" />

        <ResourceMonitor :ready="ready" />
      </v-col>

      <v-col class="py-0" cols="3">
        <TopNResourceUsage />
      </v-col>
    </v-row>

    <ScaleResource ref="scaleResource" @refresh="environmentQuota" />
    <ManageUser ref="manageUser" />
    <UpdateEnvironment ref="updateEnvironment" @refresh="environmentDetail" />
    <ResourceUseList ref="resourceUseList" title="环境资源使用清单" type="env" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ManageUser from './components/ManageUser';
  import ResourceMonitor from './components/ResourceMonitor';
  import ResourceQuota from './components/ResourceQuota';
  import ResourceUseList from './components/ResourceUseList';
  import ScaleResource from './components/ScaleResource';
  import TopNResourceUsage from './components/TopNResourceUsage';
  import UpdateEnvironment from './components/UpdateEnvironment';
  import { deleteEnvironment, getEnvironmentDetail } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EnvironmentDetail',
    components: {
      ManageUser,
      ResourceMonitor,
      ResourceQuota,
      ResourceUseList,
      ScaleResource,
      TopNResourceUsage,
      UpdateEnvironment,
    },
    mixins: [BasePermission, BaseResource, BaseSelect],
    data: () => ({
      environment: null,
      ready: false,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Environment', 'Project']),
    },
    async mounted() {
      if (this.JWT) {
        this.$store.commit('CLEAR_PLUGINS_INTERVAL');
        this.environmentDetail();
      }
    },
    methods: {
      async environmentDetail() {
        const data = await getEnvironmentDetail(this.Environment().ID);
        this.environment = data;
      },
      manageUser() {
        this.$refs.manageUser.init();
        this.$refs.manageUser.open();
      },
      scaleResource() {
        this.$refs.scaleResource.init(this.environment);
        this.$refs.scaleResource.open();
      },
      updateEnvironment() {
        this.$refs.updateEnvironment.init(this.environment);
        this.$refs.updateEnvironment.open();
      },
      removeEnvironment() {
        const item = this.environment;
        this.$store.commit('SET_CONFIRM', {
          title: `删除环境`,
          content: {
            text: `删除环境 ${item.EnvironmentName} ，${
              item.DeletePolicy === 'delLabels'
                ? '当前删除策略为 delLabels，该策略仅删除关联'
                : '当前删除策略为 delNamespace，该策略会删除整个命名空间，请谨慎操作'
            }`,
            type: 'delete',
            name: item.EnvironmentName,
            level: item.DeletePolicy === 'delLabels' ? 'warning' : 'error',
          },
          param: { item },
          doFunc: async (param) => {
            await deleteEnvironment(param.item.ID);
            this.$store.commit('CLEAR_RESOURCE');
            this.$router.push({
              name: 'resource-dashboard',
              params: this.$route.params,
            });
          },
        });
      },
      resourceUsage() {
        this.$refs.resourceUseList.init();
        this.$refs.resourceUseList.open();
      },
      environmentQuota() {
        this.$refs.resourceQuota.environmentQuota();
      },
    },
  };
</script>
