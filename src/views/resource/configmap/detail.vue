<template>
  <v-container fluid>
    <BaseMicroServiceHeader v-if="module === 'microservice'" :selectable="false" />
    <BaseViewportHeader v-else :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn text small class="primary--text" @click="resourceYaml">
            <v-icon left small> fas fa-code </v-icon>
            YAML
          </v-btn>
          <v-menu v-if="m_permisson_resourceAllow" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" text small @click="updateConfigMap"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" text small @click="removeConfigMap"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="my-0">
      <v-col cols="2" class="py-0">
        <BasicResourceInfo :item="configmap" />
      </v-col>
      <v-col cols="10" class="py-0">
        <v-card v-for="(data, key) in configmap ? configmap.data : {}" :key="key" class="mb-3">
          <v-card-text class="pa-4">
            <BaseSubTitle :title="key" color="primary" :divider="false" />
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
  import { mapState } from 'vuex';
  import UpdateConfigMap from './components/UpdateConfigMap';
  import { getConfigMapDetail, deleteConfigMap } from '@/api';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import BaseFilter from '@/mixins/base_filter';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'ConfigMapDetail',
    components: {
      ResourceYaml,
      BasicResourceInfo,
      UpdateConfigMap,
    },
    mixins: [BaseFilter, BaseResource, BasePermission],
    data: () => ({
      configmap: null,
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
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
          this.ThisCluster || this.$route.query.cluster,
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
            await deleteConfigMap(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'configmap-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
