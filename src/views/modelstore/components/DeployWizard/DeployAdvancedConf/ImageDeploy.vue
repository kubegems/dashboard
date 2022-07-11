<template>
  <v-form lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="镜像信息" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-text-field label="镜像地址" />
        </v-col>
        <v-col cols="12">
          <v-text-field label="运行命令" />
        </v-col>
        <v-col cols="12">
          <v-text-field label="环境变量" />
        </v-col>
        <v-col cols="12">
          <v-text-field label="端口号" />
        </v-col>
        <v-col cols="12">
          <v-switch v-model="advanced" label="高级配置" />
        </v-col>
        <template v-if="advanced">
          <v-col cols="12">
            <v-text-field v-model="obj.modelPath" label="模型挂载路径" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="obj.host" label="访问域名" />
          </v-col>
        </template>
      </v-row>
    </v-card-text>

    <ResourceConf />
  </v-form>
</template>

<script>
  import ResourceConf from './ResourceConf';

  export default {
    name: 'ImageDeploy',
    components: {
      ResourceConf,
    },
    props: {
      // item: {
      //   type: Object,
      //   default: () => null,
      // },
      // spec: {
      //   type: Object,
      //   default: () => null,
      // },
    },
    data() {
      return {
        advanced: false,
        obj: {
          host: '',
          model: {
            framework: '',
            image: '',
            name: '',
            url: '',
            version: '',
          },
          modelPath: '',
          resources: {},
          replicas: 1,
        },
      };
    },
  };
</script>
