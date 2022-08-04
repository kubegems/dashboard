<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
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
            hide-no-data
            hide-selected
            :items="imageItems"
            label="镜像"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
            :rules="objRules.imageRules"
          >
            <template #selection="{ item }">
              <v-chip class="my-1" color="primary" small text-color="white">
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>

          <v-switch v-model="advanced" label="高级配置" />

          <template v-if="advanced">
            <v-text-field v-model="obj.host" label="访问域名" />

            <v-autocomplete
              v-model="obj.args"
              hide-no-data
              hide-selected
              :items="argsItems"
              label="参数"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
              }"
              multiple
              :search-input.sync="argsText"
              @keydown.enter="createArgs"
            >
              <template #selection="{ item }">
                <v-chip
                  class="pa-1"
                  close
                  close-icon="mdi-close-circle"
                  color="primary"
                  small
                  @click:close="removeArgs(item)"
                >
                  <span>
                    {{ item.text }}
                  </span>
                </v-chip>
              </template>
            </v-autocomplete>

            <Env v-model="obj.env" />

            <Port v-model="obj.ports" />
          </template>
        </v-col>
      </v-row>
    </v-card-text>

    <ResourceConf ref="resourceConf" :base="base" :spec="spec" />
  </v-form>
</template>

<script>
  import Env from './Env';
  import Port from './Port';
  import ResourceConf from './ResourceConf';
  import { getModelSourceDetail } from '@/api';
  // import { required } from '@/utils/rules';

  export default {
    name: 'DeployAdvancedConf',
    components: {
      Env,
      Port,
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
        advanced: false,
        argsItems: [],
        imageItems: [],
        obj: {
          host: '',
          args: [],
          env: [],
          ports: [],
          backend: '',
          model: {
            framework: '',
            image: '',
            name: '',
            url: '',
            version: '',
          },
          resources: {
            limits: {
              cpu: 2,
              memory: '4Gi',
            },
          },
          replicas: 1,
        },
        objRules: {
          imageRules: [],
        },
        argsText: '',
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.modelSourceDetail();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelSourceDetail() {
        const data = await getModelSourceDetail(this.item.source);
        this.imageItems = data.images.map((i) => {
          return { text: i, value: i };
        });
      },
      validate() {
        return this.$refs.form.validate(true) && this.$refs.resourceConf.validate();
      },
      getData() {
        const data = this.$refs.resourceConf.getData();
        return { ...this.obj, ...data };
      },
      reset() {
        this.$refs.form.resetValidation() && this.$refs.resourceConf.reset();
      },
      createArgs() {
        if (!this.argsText) return;
        this.obj.args.push(this.argsText);
        this.argsItems.push({
          text: this.argsText,
          value: this.argsText,
        });
        this.argsText = '';
      },
      removeArgs(item) {
        const index = this.obj.args.findIndex((args) => {
          return args !== item.value;
        });
        if (index > -1) {
          this.obj.args.splice(index, 1);
        }
      },
    },
  };
</script>
