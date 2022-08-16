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
    icon="mdi-tag-plus"
    :title="$root.$t('operate.add_c', [$t('table.taint')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('table.taint')])" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.key"
              class="my-0"
              :label="$root.$t('form.key')"
              required
              :rules="objRules.keyRules"
            />
            <v-text-field
              v-model="obj.value"
              class="my-0"
              :label="$root.$t('form.value')"
              required
              :rules="objRules.valueRules"
            />
            <v-autocomplete
              v-model="obj.effect"
              class="my-0"
              color="primary"
              hide-selected
              :items="effectSelect"
              :label="$t('tip.policy')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="objRules.effectRules"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addTaint">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { patchTaintNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'AddTaint',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      item: null,
      obj: {
        key: '',
        value: '',
        effect: '',
      },
      objRules: {
        keyRules: [required],
        valueRules: [required],
        effectRules: [required],
      },
      taints: [],
    }),
    computed: {
      ...mapState(['Circular']),
      effectSelect() {
        return [
          { text: this.$t('tip.no_schedule'), value: 'NoSchedule' },
          { text: this.$t('tip.prefer_no_schedule'), value: 'PreferNoSchedule' },
          { text: this.$t('tip.no_execute'), value: 'NoExecute' },
        ];
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async addTaint() {
        this.taints = deepCopy(this.item.spec.taints ? this.item.spec.taints : []);
        if (this.$refs.form.validate(true)) {
          this.taints.push(this.obj);
          await patchTaintNode(this.ThisCluster, this.item.metadata.name, {
            Taints: this.taints,
          });
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.taints = [];
      },
      setItem(data) {
        this.item = data;
      },
    },
  };
</script>
