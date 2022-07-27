<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-form ref="form" v-model="valid" class="mb-2" lazy-validation @submit.prevent>
    <v-sheet class="pt-2 px-2">
      <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
        <span>镜像定义</span>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__long-width">
        <v-text-field v-model="obj.image" class="my-0" label="镜像地址" required :rules="objRules.imageRule" />
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
        <span />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field v-model="obj.name" label="容器名称" :readonly="edit" required :rules="objRules.nameRule" />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="containerType"
          color="primary"
          hide-selected
          :items="containerTypes"
          label="容器类型"
          no-data-text="暂无可选数据"
          :readonly="edit"
          :rules="objRules.containerTypeRule"
          @change="onContainerTypeChange"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
        <span />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="imageRegistry"
          color="primary"
          hide-selected
          item-text="value"
          :items="m_select_registryItems"
          label="镜像密钥"
          no-data-text="暂无可选数据"
          @change="onRegistryChange"
          @focus="onRegistrySelectFocus"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['value'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="obj.imagePullPolicy"
          color="primary"
          hide-selected
          :items="imagePullPolicys"
          label="镜像策略"
          no-data-text="暂无可选数据"
          :rules="objRules.imagePullPolicyRule"
        >
          <template #selection="{ item }">
            <v-chip class="mx-1" color="primary" small>
              {{ item['text'] }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
  </v-form>
</template>

<script>
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ContainerImageSelect',
    mixins: [BaseSelect],
    props: {
      container: {
        type: Object,
        default: () => null,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      imagePullSecret: {
        type: String,
        default: () => 'default',
      },
      type: {
        type: String,
        default: () => 'worker',
      },
    },
    data() {
      return {
        valid: false,
        containerTypes: [
          { text: '工作容器', value: 'worker' },
          { text: '初始化容器', value: 'init' },
        ],
        containerType: 'worker',
        imagePullPolicys: [
          { text: '尝试重新下载镜像', value: 'Always' },
          { text: '优先使用本地镜', value: 'IfNotPresent' },
          { text: '仅使用本地镜像', value: 'Never' },
        ],
        imageRegistry: '',
        obj: {
          name: '',
          imagePullPolicy: 'IfNotPresent',
          image: '',
        },
        objRules: {
          imageRule: [required],
          nameRule: [required],
          imagePullPolicyRule: [required],
          containerTypeRule: [required],
        },
      };
    },
    watch: {
      container: {
        handler() {
          this.init();
        },
        deep: true,
      },
      imagePullSecret() {
        this.imageRegistry = this.imagePullSecret;
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.m_select_registrySelectData();
      });
    },
    methods: {
      init() {
        if (!this.container) {
          this.$refs.form.resetValidation();
          this.containerType = 'worker';
          this.obj = deepCopy(this.$options.data().obj);
        } else {
          this.obj = this.$_.mergeWith(this.obj, deepCopy(this.container), (objValue, srcValue) => {
            if (this.$_.isArray(objValue)) {
              return srcValue;
            }
          });
        }
        this.containerType = this.type;
      },
      onContainerTypeChange() {
        this.$emit('updateType', this.containerType);
      },
      onRegistryChange() {
        this.$emit('updateRegistry', this.imageRegistry);
      },
      reset() {
        this.$refs.form.resetValidation();
        this.containerType = 'worker';
        this.obj = deepCopy(this.$options.data().obj);
      },
      onRegistrySelectFocus() {
        this.m_select_registrySelectData();
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
