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
  <v-form ref="form" v-model="valid" class="mb-2" lazy-validation @submit.prevent>
    <v-sheet class="pt-2 px-2">
      <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
        <span>{{ $root.$t('form.definition', [$t('tip.image')]) }}</span>
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__long-width">
        <v-text-field
          v-model="obj.image"
          class="my-0"
          :label="$t('tip.image_address')"
          required
          :rules="objRules.imageRule"
          @keydown="updateImage"
        />
        <div class="kubegems__clear-float" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
        <span />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-model="obj.name"
          :label="$t('tip.container_name')"
          :readonly="edit"
          required
          :rules="objRules.nameRule"
        />
      </v-flex>
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-autocomplete
          v-model="containerType"
          color="primary"
          hide-selected
          :items="containerTypes"
          :label="$t('tip.container_type')"
          :no-data-text="$root.$t('data.no_data')"
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
          :label="$t('tip.image_secret')"
          :no-data-text="$root.$t('data.no_data')"
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
          :label="$t('tip.image_policy')"
          :no-data-text="$root.$t('data.no_data')"
          :rules="objRules.imagePullPolicyRule"
          @change="updateImage"
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
  import messages from '../../../i18n';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ContainerImageSelect',
    mixins: [BaseSelect],
    i18n: {
      messages: messages,
    },
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
        containerType: 'worker',
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
    computed: {
      containerTypes() {
        return [
          { text: this.$t('tip.worker_container'), value: 'worker' },
          { text: this.$t('tip.init_container'), value: 'init' },
        ];
      },
      imagePullPolicys() {
        return [
          { text: this.$t('tip.image_always'), value: 'Always' },
          { text: this.$t('tip.image_if_not_present'), value: 'IfNotPresent' },
          { text: this.$t('tip.image_never'), value: 'Never' },
        ];
      },
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
        this.updateImage();
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      updateImage() {
        this.$emit('updateImage', this.obj);
      },
    },
  };
</script>
