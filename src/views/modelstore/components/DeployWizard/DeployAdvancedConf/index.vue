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
    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="部署类型" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="deployType"
            :items="typeItems"
            label="部署类型"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
            :rules="objRules.imageRules"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>

    <component :is="deployType" />

    <ResourceConf ref="resourceConf" :base="base" :spec="spec" />
  </v-form>
</template>

<script>
  import ModelDeploy from './ModelDeploy';
  import ResourceConf from './ResourceConf';
  import SeldonDeploy from './SeldonDeploy';
  import { required } from '@/utils/rules';

  export default {
    name: 'DeployAdvancedConf',
    components: {
      ModelDeploy,
      ResourceConf,
      SeldonDeploy,
    },
    props: {
      base: {
        type: Object,
        default: () => null,
      },
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
        deployType: 'SeldonDeploy',
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
    computed: {
      typeItems() {
        if (this.$route.query.online === 'true') {
          return [{ text: 'Seldon Deployment', value: 'SeldonDeploy' }];
        }
        return [
          { text: 'Model Deployment', value: 'ModelDeploy' },
          { text: 'Seldon Deployment', value: 'SeldonDeploy' },
        ];
      },
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
