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
  <BaseDialog
    v-model="dialog"
    icon="mdi-wrench"
    :title="
      isCreate ? $root.$t('operate.create_c', [$t('tip.config')]) : $root.$t('operate.update_c', [$t('tip.config')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #action>
      <v-btn class="float-right" color="primary" text @click="submit"> {{ $root.$t('operate.confirm') }} </v-btn>
    </template>
    <template #header-action>
      <div class="white--text header ml-3">
        {{ $root.$t('resource.tenant') }}:{{ editItem.tenant }} {{ $root.$t('resource.project') }}:{{
          editItem.project
        }}
        {{ $root.$t('resource.environment') }}:{{ editItem.environment }}
      </div>
    </template>
    <template #content>
      <v-card flat>
        <v-card-text class="text-h5 card__title">
          <v-form ref="form" v-model="valid" class="pa-0" lazy-validation @submit.prevent>
            <v-row>
              <v-col class="py-0" cols="4">
                <v-text-field
                  v-model="editItem.key"
                  label="key"
                  :readonly="!isCreate"
                  :rules="keyRules"
                  @keyup="onKeyInput"
                />
              </v-col>
              <v-col class="py-0" cols="8">
                <v-radio-group v-model="suffix" class="mt-6" hide-details row>
                  <v-radio v-for="(t, index) in suffixItems" :key="index" :label="t.text" :value="t.value" />
                </v-radio-group>
              </v-col>
              <v-col v-if="more" class="py-0" cols="4">
                <v-text-field v-model="editItem.application" :label="$t('table.app')" />
              </v-col>
              <v-col class="py-0" cols="2">
                <v-switch v-model="more" class="mt-5" :label="$t('tip.more')" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <ACEEditor
          v-model="editItem.value"
          :class="`rounded-b mb-4 clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          :height="550"
          :lang="suffix"
          @init="$aceinit"
          @keydown.stop
        />
      </v-card>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { required } from '@/utils/rules';

  export default {
    name: 'ConfigeEditor',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => {
          return {
            tenant: '',
            project: '',
            environment: '',
            application: '',
            key: '',
            value: '',
          };
        },
      },
      showEditDialog: {
        type: Boolean,
        default: false,
      },
      isCreate: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      this.applicationRules = [required];
      this.keyRules = [required];

      return {
        dialog: false,
        valid: false,
        more: false,
        editItem: {
          tenant: '',
          project: '',
          environment: '',
          application: '',
          key: '',
          value: '',
        },
        suffix: '',
        suffixItems: [
          { text: 'text', value: 'text' },
          { text: 'json', value: 'json' },
          { text: 'xml', value: 'xml' },
          { text: 'yaml', value: 'yaml' },
          { text: 'html', value: 'html' },
          { text: 'ini', value: 'ini' },
          { text: 'properties', value: 'properties' },
        ],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      showEditDialog(val) {
        this.dialog = val;
      },
      item() {
        this.editItem = {
          tenant: this.item.tenant,
          project: this.item.project,
          environment: this.item.environment,
          application: this.item.application,
          key: this.item.key,
          value: this.item.value,
        };
        this.more = Boolean(this.item.application);
        this.matchSuffix();
      },
    },
    methods: {
      close() {
        this.$emit('close');
      },
      submit() {
        if (this.$refs.form.validate(true)) {
          this.$emit('submit', this.editItem, this.isCreate);
        }
      },
      reset() {
        this.close();
        this.$refs.form.reset();
      },
      matchSuffix() {
        if (this.editItem.key.indexOf('.') > -1) {
          const suffix = this.editItem.key.split('.').pop().toLowerCase();
          if (
            this.suffixItems.some((s) => {
              return s.value === suffix;
            })
          ) {
            this.suffix = suffix;
          }
        }
      },
      onKeyInput() {
        this.matchSuffix();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .card {
    &__title {
      background-color: #f6f6f6;
    }
  }
  .header {
    line-height: 40px;
  }
</style>
