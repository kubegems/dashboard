<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
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
                  <v-btn color="primary" text small @click="updateSecret"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" text small @click="removeSecret"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="my-0">
      <v-col cols="2" class="py-0">
        <BasicResourceInfo :item="secret" />
      </v-col>
      <v-col cols="10" class="py-0">
        <v-card v-for="item in datas" :key="item.key" class="mb-3">
          <v-card-text>
            <BaseSubTitle :title="item.key" color="primary" :divider="false" height="36px">
              <template #action>
                <v-btn v-if="item.hide" small text color="white" class="float-right mr-2" @click="showSecret(item)">
                  <v-icon left small> mdi-eye </v-icon>
                  显示
                </v-btn>
                <v-btn v-else small text color="white" class="float-right mr-2" @click="hideSecret(item)">
                  <v-icon left small> mdi-eye-off </v-icon>
                  隐藏
                </v-btn>
              </template>
            </BaseSubTitle>
            <div :style="{ maxHeight: `${height}px`, overflowY: 'auto' }">
              <pre class="kubegems__data-pre rounded">{{ item.value }}</pre>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResourceYaml ref="resourceYaml" :item="secret" />
    <UpdateSecret ref="updateSecret" @refresh="secretDetail" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';
  import { Base64 } from 'js-base64';
  import UpdateSecret from './components/UpdateSecret';
  import { getSecretDetail, deleteSecret } from '@/api';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import BaseResource from '@/mixins/resource';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'SecretDetail',
    components: {
      ResourceYaml,
      BasicResourceInfo,
      UpdateSecret,
    },
    mixins: [BaseFilter, BaseResource, BasePermission],
    data: () => ({
      secret: null,
      datas: [],
    }),
    computed: {
      ...mapState(['JWT', 'Scale']),
      height() {
        return parseInt((window.innerHeight - 276) / this.Scale);
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.secretDetail();
        });
      }
    },
    methods: {
      async secretDetail() {
        const data = await getSecretDetail(this.ThisCluster, this.$route.query.namespace, this.$route.params.name);
        this.secret = data;
        this.datas = [];
        for (const secret in this.secret ? this.secret.data : []) {
          this.datas.push({
            key: secret,
            language: 'vim',
            hideVal: this.secret.data[secret].substr(0, 6) + '************',
            value: this.secret.data[secret],
            hide: true,
          });
        }
      },
      showSecret(item) {
        item.hide = false;
        item.value = Base64.atob(item.value);
      },
      hideSecret(item) {
        item.hide = true;
        item.value = Base64.btoa(item.value);
      },
      resourceYaml() {
        this.$refs.resourceYaml.open();
      },
      updateSecret() {
        this.$refs.updateSecret.init(this.secret);
        this.$refs.updateSecret.open();
      },
      removeSecret() {
        const item = this.secret;
        this.$store.commit('SET_CONFIRM', {
          title: `删除密钥`,
          content: {
            text: `删除密钥 ${item.metadata.name}`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteSecret(this.ThisCluster, this.$route.query.namespace, param.item.metadata.name);
            this.$router.push({ name: 'secret-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
