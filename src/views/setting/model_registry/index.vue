<template>
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-0">
      <v-col v-for="(item, index) in items" :key="index" class="pt-0 pb-3" cols="12">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto registry__pos" :elevation="hover ? 5 : 0" height="100%">
            <v-card-text>
              <div class="registry__title">
                <div class="mr-4 float-left">
                  <img height="40" src="/icon/hugging-face.png" />
                </div>
                <div class="mr-4 float-left">https://hugging-face.io</div>
                <div class="mr-4 float-left">
                  <v-icon color="success" small>mdi-check-circle</v-icon>
                  同步成功:2022-12-12 11:23:12
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-body-2 registry__action">
                <div class="mr-4 float-left registry__desc"> 简介:全球大型开源社区,专注于NLP技术。 </div>
                <div class="mr-4 float-left registry__stat text-subtitle-2">Models: 1032</div>
                <div class="mr-4 float-left registry__stat text-subtitle-2">Images: 34</div>
                <div class="mr-4 float-right">
                  <v-btn color="primary" text>同步</v-btn>
                  <v-btn color="primary" text>激活</v-btn>
                  <v-btn color="primary" text>编辑</v-btn>
                  <v-btn color="error" text>删除</v-btn>
                </div>
                <div class="kubegems__clear-float" />
              </div>
            </v-card-text>

            <v-flex class="registry__watermarkbg" />
            <v-flex class="registry__watermark font-weight-medium"> 内置 </v-flex>
          </v-card>
        </v-hover>
      </v-col>

      <v-col class="pt-0 pb-3" cols="12">
        <v-card class="kubegems__full-height" min-height="123">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn block class="text-h6" color="primary" text @click="addModelRegitry">
                  <v-icon left>mdi-plus-box</v-icon>
                  添加模型商店
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddModelRegistryVue ref="addModelRegitry" @refresh="modelRegistryList" />
  </v-container>
</template>

<script>
  import AddModelRegistryVue from './components/AddModelRegistry';

  export default {
    name: 'ModelRegistrySetting',
    components: {
      AddModelRegistryVue,
    },
    data() {
      return {
        items: [{ id: 1 }],
      };
    },
    methods: {
      modelRegistryList() {},
      addModelRegitry() {
        this.$refs.addModelRegitry.open();
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
      top: 11px;
      right: 9px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
