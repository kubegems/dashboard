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
    <BaseSubTitle title="模型商店定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="registry"
            class="my-0"
            color="primary"
            hide-selected
            :items="registryItems"
            label="模型商店来源"
            no-data-text="暂无可选数据"
            :readonly="edit"
            :rules="objRules.registryRules"
            @change="onRegistryChange"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col v-if="registry === 'modelx'" cols="6">
          <v-icon class="mt-6" color="orange" small>mdi-help-circle</v-icon>
          <v-btn class="mt-5" color="orange" small text> 下载ModelX Client </v-btn>
        </v-col>
        <template v-if="registry === 'modelx'">
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              label="商店名称"
              :readonly="edit"
              required
              :rules="objRules.nameRules"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
    <template v-if="registry === 'modelx'">
      <BaseSubTitle title="模型存储定义" />
      <v-tabs v-model="tab" class="px-2 mt-2 mb-3 rounded-t" height="30">
        <v-tab v-for="item in tabItems" :key="item.value">
          {{ item.text }}
        </v-tab>
      </v-tabs>

      <S3Conf @updateComponentData="updateComponentData" />
    </template>
  </v-form>
</template>

<script>
  import S3Conf from './S3Conf';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ModelBaseInfo',
    components: {
      S3Conf,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        registry: '',
        registryItems: [
          { text: 'huggingface', value: 'huggingface' },
          { text: 'openmmlab', value: 'openmmlab' },
          // { text: 'tensorflow', value: 'tensorflow' },
          // { text: 'pytorch', value: 'pytorch' },
          { text: 'modelx', value: 'modelx' },
        ],
        obj: {
          name: '',
          online: true,
        },
        objRules: {
          nameRules: [required],
          registryRules: [required],
          imagesRules: [required],
          addressRules: [required],
        },
        tab: 0,
        tabItems: [
          { text: 'aws s3', value: 'aws' },
          { text: 'idoe dft', value: 'idoe' },
          { text: 'oss', value: 'oss' },
          { text: 'azure', value: 'azure' },
          { text: 'gcs', value: 'gcs' },
          { text: 'tos', value: 'tos' },
        ],
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.obj = deepCopy(newValue);
            this.imageItems = this.obj.images
              ? this.obj.images.map((i) => {
                  return { text: i, value: i };
                })
              : [];
            this.getRegistry();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
        this.registry = '';
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
          this.getRegistry();
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
          this.getRegistry();
        });
      },
      getRegistry() {
        if (
          this.registryItems.some((r) => {
            return r.value === this.obj.name;
          })
        ) {
          this.registry = this.obj.name;
        } else {
          this.registry = 'modelx';
          this.$emit('changeStep', 2);
        }
      },
      onRegistryChange() {
        if (this.registry !== 'modelx') {
          this.obj.name = this.registry;
          this.obj.online = false;
          this.$emit('changeStep', 1);
        } else {
          this.obj.online = true;
          this.obj.name = '';
          this.$emit('changeStep', 2);
        }
      },
      updateComponentData() {},
    },
  };
</script>
