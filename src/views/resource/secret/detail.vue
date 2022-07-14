<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
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
                  <v-btn color="primary" small text @click="updateSecret"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeSecret"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="my-0">
      <v-col class="py-0" cols="2">
        <BasicResourceInfo :item="secret" />
      </v-col>
      <v-col class="py-0" cols="10">
        <v-card v-for="item in datas" :key="item.key" class="mb-3" flat>
          <v-card-text>
            <BaseSubTitle color="primary" :divider="false" height="36px" :title="item.key">
              <template #action>
                <v-btn v-if="item.hide" class="float-right mr-2" color="white" small text @click="showSecret(item)">
                  <v-icon left small> mdi-eye </v-icon>
                  显示
                </v-btn>
                <v-btn v-else class="float-right mr-2" color="white" small text @click="hideSecret(item)">
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
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import UpdateSecret from './components/UpdateSecret';
  import { deleteSecret, getSecretDetail } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo';
  import ResourceYaml from '@/views/resource/components/common/ResourceYaml';

  export default {
    name: 'SecretDetail',
    components: {
      BasicResourceInfo,
      ResourceYaml,
      UpdateSecret,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
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
