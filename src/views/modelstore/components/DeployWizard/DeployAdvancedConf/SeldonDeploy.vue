<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "Licens");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->
<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="部署信息" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="obj.model.image"
            :items="item ? getImages() : []"
            label="Protocol"
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

          <v-autocomplete
            v-model="obj.model.image"
            :items="runtimeItems"
            label="运行时"
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
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { required } from '@/utils/rules';

  export default {
    name: 'ModelDeploy',
    props: {
      // base: {
      //   type: Object,
      //   default: () => null,
      // },
      // item: {
      //   type: Object,
      //   default: () => null,
      // },
      spec: {
        type: Object,
        default: () => null,
      },
    },
    data: function () {
      return {
        valid: false,
        runtimeItems: [
          { text: 'huggingface', value: 'huggingface' },
          { text: 'tensorflow Server', value: 'tensorflow' },
          { text: 'mlflow Server', value: 'mlflow' },
          { text: 'triton interface (ONNX, Pytorch, Tensorflow, TensorRt)', value: 'triton' },
          { text: 'SKLeaern Server', value: 'skleaern' },
          { text: 'Tempo Server', value: 'tempo' },
          { text: 'XGBoost Server', value: 'xgboost' },
        ],
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
