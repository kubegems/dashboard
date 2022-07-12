<template>
  <v-container fluid>
    <BaseMicroServiceHeader v-if="module === 'microservice'" :selectable="false" />
    <BaseViewportHeader v-else :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="resourceYaml">
            <v-icon left small> fas fa-code </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateConfigMap"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeConfigMap"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="my-0">
      <v-col class="py-0" cols="2">
        <BasicResourceInfo :item="configmap" />
      </v-col>
      <v-col class="py-0" cols="10">
        <v-card v-for="(data, key) in configmap ? configmap.data : {}" :key="key" class="mb-3" flat>
          <v-card-text class="pa-4">
            <BaseSubTitle color="primary" :divider="false" :title="key" />
            <div :style="{ maxHeight: `${height}px`, overflowY: 'auto' }">
              <pre class="kubegems__data-pre rounded">{{ configmap.data[key] }}</pre>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="configmap" />
    <UpdateConfigMap ref="updateConfigMap" @refresh="configMapDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import UpdateConfigMap from './components/UpdateConfigMap';
  import { deleteConfigMap, getConfigMapDetail } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';

  export default {
    name: 'ConfigMapDetail',
    components: {
      BasicResourceInfo,
      ResourceYaml,
      UpdateConfigMap,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    data: () => ({
      configmap: null,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['VirtualSpace']),
      module() {
        return window.location.href.match(new RegExp('\\/(\\w+)\\/'))[1];
      },
      height() {
        return parseInt((window.innerHeight - 276) / this.Scale);
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.configMapDetail();
        });
      }
    },
    methods: {
      async configMapDetail() {
        const data = await getConfigMapDetail(
          this.$route.query.cluster || this.ThisCluster,
          this.$route.query.namespace,
          this.$route.params.name,
        );
        this.configmap = data;
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateConfigMap() {
        this.$refs.updateConfigMap.init(this.configmap);
        this.$refs.updateConfigMap.open();
      },
      removeConfigMap() {
        const item = this.configmap;
        this.$store.commit('SET_CONFIRM', {
          title: `删除配置`,
          content: {
            text: `删除配置 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteConfigMap(
              this.$route.query.cluster || this.ThisCluster,
              this.$route.query.namespace,
              param.item.metadata.name,
            );
            if (this.VirtualSpace().ID > 0) {
              this.$router.push({ name: 'microconfigmap-list', params: this.$route.params });
            } else {
              this.$router.push({ name: 'configmap-list', params: this.$route.params });
            }
          },
        });
      },
    },
  };
</script>
