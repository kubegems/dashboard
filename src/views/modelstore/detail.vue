<template>
  <v-container fluid>
    <Breadcrumb :hub="$route.query.registry">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="deployModel">
            <v-icon left small> mdi-rocket </v-icon>
            部署
          </v-btn>
          <v-btn class="primary--text" small text @click="returnModel">
            <v-icon left small>mdi-reply</v-icon>
            返回
          </v-btn>
        </v-flex>
      </template>
    </Breadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="3">
        <ModelInfo :item="item" />
      </v-col>
      <v-col class="pt-0" cols="9">
        <v-card flat>
          <v-card-text>
            <v-tabs v-model="tab" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component :is="currentComponent" :ref="tabItems[tab].value" :item="item" @refresh="refresh" />
      </v-col>
    </v-row>

    <Deploy ref="deploy" :item="item" />
  </v-container>
</template>

<script>
  import { Base64 } from 'js-base64';

  import Breadcrumb from './components/Breadcrumb';
  import Deploy from './components/Deploy';
  import Certificate from './components/detail_tabs/Certificate';
  import Comment from './components/detail_tabs/Comment';
  import Description from './components/detail_tabs/Description';
  import Files from './components/detail_tabs/Files';
  import Runtime from './components/detail_tabs/Runtime';
  import ModelInfo from './components/ModelInfo';
  import { getModelRate, getModelStoreDetail } from '@/api';

  export default {
    name: 'ModelStoreDetail',
    components: {
      Breadcrumb,
      Certificate,
      Comment,
      Deploy,
      Description,
      ModelInfo,
      Files,
      Runtime,
    },
    data() {
      this.tabMap = {
        description: 0,
        files: 1,
        comment: 2,
        runtime: 3,
        certificate: 4,
      };

      return {
        tab: this.tabMap[this.$route.query.tab] || 0,
        tabItems: [
          { text: '介绍', value: 'Description', tab: 'description' },
          { text: '文件', value: 'Files', tab: 'files' },
          { text: '讨论区', value: 'Comment', tab: 'comment' },
          { text: '运行实例', value: 'Runtime', tab: 'runtime' },
          // { text: '证书', value: 'Certificate', tab: 'certificate' },
        ],
        item: undefined,
      };
    },
    computed: {
      currentComponent() {
        return this.tabItems[this.tab].value;
      },
    },
    watch: {
      tab: {
        handler() {
          this.$router.replace({
            params: { ...this.$route.params },
            query: { ...this.$route.query, tab: this.tabItems[this.tab].tab },
          });
        },
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.modelDetail();
      });
    },
    methods: {
      async modelDetail() {
        const data = await getModelStoreDetail(this.$route.query.registry, Base64.encode(this.$route.params.name));
        const ratingData = await getModelRate(this.$route.query.registry, Base64.encode(this.$route.params.name));
        this.item = { ...data, rating: { ...ratingData } };
      },
      deployModel() {
        this.$refs.deploy.open();
      },
      refresh() {
        this.modelDetail();
      },
      returnModel() {
        this.$router.push({
          name: 'modelstore-center',
          query: {
            registry: this.$route.query.registry,
          },
        });
      },
    },
  };
</script>
