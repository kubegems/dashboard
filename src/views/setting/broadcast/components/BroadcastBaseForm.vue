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
  <v-flex>
    <BaseSubTitle :title="$root.$t('form.definition', [$t('resource.broadcast')])" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="obj.message"
              auto-grow
              class="my-0"
              :label="$t('table.message')"
              :readonly="edit"
              required
              :rules="objRules.messageRules"
            />
          </v-col>
          <v-col cols="12">
            <BaseDatetimePicker v-model="date" :default-value="30" in-form :offset-y="0" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'BroadcastBaseForm',
    i18n: {
      messages: messages,
    },
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      date: [],
      obj: {
        message: '',
        startAt: '',
        endAt: '',
        type: 'notice',
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          messageRules: [required],
        };
      },
    },
    methods: {
      reset() {
        this.$refs.form.reset();
      },
      setData(data) {
        this.obj = data;
        this.date = [Date.parse(data.startAt), Date.parse(data.endAt)];
      },
      getData() {
        const obj = deepCopy(this.obj);
        if (this.date?.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_datetime'),
            color: 'warning',
          });
          return;
        }
        obj.startAt = new Date(this.date[0]);
        obj.endAt = new Date(this.date[1]);
        return obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
