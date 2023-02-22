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
    <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('header.model_store')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.kind"
            class="my-0"
            color="primary"
            hide-selected
            :items="registryItems"
            :label="$t('tip.source')"
            :no-data-text="$root.$t('data.no_data')"
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
        <template v-if="obj.kind === 'modelx'">
          <v-col cols="6">
            <v-icon class="mt-6" color="orange" small>mdi-help-circle</v-icon>
            <v-btn class="mt-5" color="orange" small text @click="downloadClient">
              {{ $t('tip.download_modelx') }}
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.name"
              class="my-0"
              :label="$t('table.name')"
              :readonly="edit"
              required
              :rules="objRules.nameRules"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.address"
              class="my-0"
              :label="$t('tip.address')"
              required
              :rules="objRules.addressRules"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
    <template v-if="obj.kind === 'modelx'">
      <BaseSubTitle :title="$t('tip.auth')" />

      <Auth :data="obj" @updateComponentData="updateComponentData" />
    </template>
  </v-form>
</template>

<script>
  import messages from '../../../i18n';
  import Auth from './Auth';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ModelBaseInfo',
    i18n: {
      messages: messages,
    },
    components: {
      Auth,
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
        registryItems: [
          { text: 'huggingface', value: 'huggingface' },
          { text: 'openmmlab', value: 'openmmlab' },
          // { text: 'tensorflow', value: 'tensorflow' },
          // { text: 'pytorch', value: 'pytorch' },
          { text: 'modelx', value: 'modelx' },
        ],
        obj: {
          address: '',
          name: '',
          online: true,
          kind: '',
          auth: {
            password: '',
            token: '',
            username: '',
          },
          images: [],
        },
        objRules: {
          nameRules: [required],
          registryRules: [required],
          imagesRules: [required],
          addressRules: [required],
        },
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
          this.obj.kind = this.obj.name;
        } else {
          this.obj.kind = 'modelx';
        }
      },
      onRegistryChange() {
        if (this.obj.kind !== 'modelx') {
          this.obj.name = this.obj.kind;
          this.obj.online = true;
        } else {
          this.obj.online = false;
          this.obj.name = '';
        }
      },
      updateComponentData(data) {
        this.obj = data;
      },
      downloadClient() {
        window.open('https://github.com/kubegems/modelx/releases');
      },
    },
  };
</script>
