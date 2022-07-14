<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="模型信息" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="obj.model.image"
            :items="item ? getImages() : []"
            label="Processor"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
            :rules="objRules.imageRules"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="2">
          <v-switch v-model="loadOnline" label="在线导入模型文件" readonly />
        </v-col>
        <v-col v-if="false" cols="4">
          <v-checkbox label="从 kubegems modelx 导入模型文件" />
        </v-col>
      </v-row>
    </v-card-text>

    <ResourceConf ref="resourceConf" :base="base" :spec="spec" />
  </v-form>
</template>

<script>
  import ResourceConf from './ResourceConf';
  import { required } from '@/utils/rules';

  export default {
    name: 'ModelDeploy',
    components: {
      ResourceConf,
    },
    props: {
      base: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
      spec: {
        type: Object,
        default: () => null,
      },
    },
    data: function () {
      return {
        valid: false,
        loadOnline: true,
        obj: {
          model: {
            image: '',
          },
          resources: {
            limits: {
              cpu: 0,
              memory: 0,
            },
          },
          replicas: 1,
        },
        objRules: {
          imageRules: [required],
        },
      };
    },
    watch: {
      spec: {
        handler(newValue) {
          if (newValue) {
            this.obj.model.image = newValue.model.image;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true) && this.$refs.resourceConf.validate();
      },
      getImages() {
        const images = this.$route.query.images;
        if (typeof images === 'string') {
          return [images];
        }
        return images;
      },
      getData() {
        const data = this.$refs.resourceConf.getData();
        return { ...this.obj, ...data };
      },
      reset() {
        this.$refs.form.resetValidation() && this.$refs.resourceConf.reset();
      },
    },
  };
</script>
