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
  <BaseDialog v-model="dialog" icon="mdi-hexagon-multiple" :title="title" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$root.$t('header.app_store')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.ChartRepoName"
              class="my-0"
              :label="$t('form.name')"
              required
              :rules="objRules.chartRepoNameRules"
            />
            <v-text-field
              v-model="obj.URL"
              class="my-0 kubegems__long-width"
              :label="$t('form.address')"
              required
              :rules="objRules.urlRules"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="recreateRepository">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { postAddRepository } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'RepositoryInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    data: () => ({
      title: '',
      dialog: false,
      valid: false,
      obj: {
        ChartRepoName: '',
        URL: '',
      },
      objRules: {
        chartRepoNameRules: [required],
        urlRules: [required],
      },
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async recreateRepository() {
        if (this.$refs.form.validate(true)) {
          await postAddRepository(this.obj);
          this.reset();
          this.$emit('refresh');
        }
      },
      init(item) {
        this.obj = deepCopy(item);
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
      setTitle(data) {
        this.title = data;
      },
    },
  };
</script>
