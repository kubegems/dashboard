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
  <BaseDialog v-model="dialog" icon="mdi-comment" :title="$t('tip.recomment')" :width="500" @reset="reset">
    <template #content>
      <v-flex>
        <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.recomment')])" />
        <v-card-text class="pa-2">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="obj.recomment"
                  :label="$t('tip.recomment')"
                  :rules="objRules.recommentRules"
                  type="number"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateRecomment">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { putAdminUpdateModel } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'Recommend',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        dialog: false,
        valid: false,
        obj: {
          recomment: 0,
        },
        objRules: {
          recommentRules: [required, positiveInteger, (v) => v <= 100 || this.$t('form.recomment_rule')],
        },
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateRecomment() {
        if (this.$refs.form.validate(true)) {
          const data = this.obj;
          await putAdminUpdateModel(this.$route.params.name, Base64.encode(data.name), data);
          this.reset();
          this.$emit('refresh');
        }
      },
      init(item) {
        this.obj = deepCopy(item);
      },
      reset() {
        this.dialog = false;
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
