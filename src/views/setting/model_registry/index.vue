<template>
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto registry__pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-card-text>
              <div class="registry__title">
                <div class="mr-4 float-left">
                  <img height="40" :src="item.imgSrc" />
                </div>
                <a class="mr-4 float-left" :href="item.address" target="_blank">{{ item.address }}</a>
                <div class="mr-4 float-left">
                  <template v-if="item.status === 'success'">
                    <v-icon color="success" small>mdi-check-circle</v-icon>
                    同步成功
                  </template>
                  <template v-else-if="item.status === 'failed'">
                    <v-icon color="success" small>mdi-close-circle</v-icon>
                    同步失败
                  </template>
                  <template v-else-if="item.status === 'running'">
                    <span
                      class="v-avatar mr-2 kubegems__waiting-flashing"
                      :style="{ height: '12px', minWidth: '12px', width: '12px', backgroundColor: '#fb8c00' }"
                    />
                    正在同步: {{ item.progress }}
                  </template>
                  {{ $moment(item.startedAt).format('lll') }}
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-body-2 registry__action">
                <div class="mr-4 float-left registry__desc"> {{ item.tip }} </div>
                <div class="mr-4 float-left registry__stat text-subtitle-2">
                  Models: {{ item ? item.count.modelsCount : 0 }}
                </div>
                <div class="mr-4 float-left registry__stat text-subtitle-2">
                  Images: {{ item ? item.images.length : 0 }}
                </div>
                <div class="mr-4 float-right">
                  <v-btn :color="item.status === 'running' ? `error` : 'primary'" text @click="syncRegistry(item)">
                    {{ item.status === 'running' ? '终止同步' : '同步' }}
                  </v-btn>
                  <v-btn color="primary" text @click="editRegistry(item)">编辑</v-btn>
                  <v-btn :color="item.enabled ? 'error' : 'primary'" text @click="toggleActiveRegistry(item)">
                    {{ item.enabled ? '禁用' : '激活' }}
                  </v-btn>
                  <v-btn v-if="!item.builtIn" color="error" text @click="removeRegistry(item)">删除</v-btn>
                </div>
                <div class="kubegems__clear-float" />
              </div>
            </v-card-text>

            <template v-if="item.builtIn">
              <v-flex class="registry__watermarkbg" />
              <v-flex class="registry__watermark font-weight-medium"> 内置商店 </v-flex>
            </template>
          </v-card>
        </v-hover>
      </v-col>

      <v-col class="pt-0 pb-3" cols="12">
        <v-card class="kubegems__full-height" flat min-height="123">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn
                  class="text-h6 kubegems__full-center"
                  color="primary"
                  max-width="200"
                  text
                  @click="addModelRegitry"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  添加算法商店
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddModelRegistry ref="addModelRegitry" @refresh="modelRegistryList" />
    <UpdateModelRegistry ref="updateModelRegistry" @refresh="modelRegistryList" />
  </v-container>
</template>

<script>
  import AddModelRegistry from './components/AddModelRegistry';
  import UpdateModelRegistry from './components/UpdateModelRegistry';
  import {
    getModelSourceList,
    deleteModelSource,
    putModelSource,
    getModelStoreSync,
    postModelStoreSync,
    deleteModelStoreSync,
  } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ModelRegistrySetting',
    components: {
      AddModelRegistry,
      UpdateModelRegistry,
    },
    data() {
      return {
        items: [],
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.modelRegistryList();
      });
    },
    methods: {
      async modelRegistryList() {
        const data = await getModelSourceList({ count: true, size: 1000 });
        this.items = data.list.map((d) => {
          return {
            ...d,
            ...this.getRegistryMeta(d),
          };
        });
        this.items.forEach(async (item, index) => {
          const statusData = await getModelStoreSync(item.name, { noprocessing: true });
          this.$set(this.items, index, { ...item, ...statusData });
        });
      },
      addModelRegitry() {
        this.$refs.addModelRegitry.open();
      },
      syncRegistry(item) {
        this.$store.commit('SET_CONFIRM', {
          title: item.status === 'running' ? `终止同步模型仓库` : `同步模型仓库`,
          content: {
            text: item.status === 'running' ? `终止同步模型仓库 ${item.name}` : `同步模型仓库 ${item.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.status === 'running') {
              await deleteModelStoreSync(param.item.name);
            } else {
              await postModelStoreSync(param.item.name);
            }
            this.modelRegistryList();
          },
        });
      },
      toggleActiveRegistry(item) {
        this.$store.commit('SET_CONFIRM', {
          title: item.enabled ? `禁用模型仓库` : `激活模型仓库`,
          content: {
            text: item.enabled ? `禁用模型仓库 ${item.name}` : `激活模型仓库 ${item.name}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            const data = deepCopy(param.item);
            data.enabled = !data.enabled;
            await putModelSource(data.name, data);
            this.modelRegistryList();
          },
        });
      },
      editRegistry(item) {
        this.$refs.updateModelRegistry.init(item);
        this.$refs.updateModelRegistry.open();
      },
      removeRegistry(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除模型仓库`,
          content: {
            text: `删除模型仓库 ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteModelSource(param.item.name);
            this.modelRegistryList();
          },
        });
      },
      getRegistryMeta(item) {
        switch (item.name) {
          case 'huggingface':
            return {
              imgSrc: '/icon/hugging-face.png',
              tip: '全球大型开源社区,专注于NLP技术。',
              address: 'https://huggingface.co/',
            };
          case 'openmmlab':
            return {
              imgSrc: '/icon/openmmlab.png',
              tip: '深度学习时代最完整的计算机视觉开源算法体系。',
              address: 'https://openmmlab.com/',
            };
          case 'tensorflow':
            return {
              imgSrc: '/icon/tensorflow.png',
              tip: '一个核心开源库，可以帮助您开发和训练机器学习模型。',
              address: 'https://www.tensorflow.org/',
            };
          case 'pytorch':
            return {
              imgSrc: '/icon/pytorch.jpeg',
              tip: '发现模型并将其发布到专为研究探索而设计的预训练模型存储库。',
              address: 'https://pytorch.org/',
            };
          default:
            return {
              imgSrc: '/logo-about.svg',
              tip: 'Kubegems内置模型商店。',
              address: '',
            };
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .registry {
    &__title {
      line-height: 40px;
    }

    &__desc {
      width: 600px;
    }

    &__stat {
      width: 100px;
    }

    &__action,
    &__action div {
      line-height: 34px;
    }

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermarkbg {
      position: absolute;
      width: 120px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: #1e88e5;
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 14px;
      right: -1px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
