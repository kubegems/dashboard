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
  <v-dialog v-model="Confirm.value" max-width="500" persistent scrollable>
    <v-card class="pa-0" flat>
      <v-sheet class="px-4 py-2 error--text text-h6">
        {{ Confirm.title }}
      </v-sheet>
      <v-divider />
      <v-sheet
        v-if="Confirm.content && (Confirm.content.type === 'delete' || Confirm.content.type === 'batch_delete')"
        class="px-4 py-4 confirm-size"
      >
        <v-alert
          border="left"
          class="rounded py-3"
          :color="(Confirm.content && Confirm.content.level) || 'warning'"
          colored-border
          elevation="1"
        >
          <template v-if="Confirm.content && Confirm.content.type === 'batch_delete'">
            <div class="text-subtitle-1 kubegems__text">
              {{ $t('tip.batch_delete_c', [Confirm.content.tip || $t('operate.delete')]) }}
            </div>
            <div
              v-for="(content, index) in Confirm.content ? Confirm.content.text.split(',') : []"
              :key="index"
              class="text-subtitle-1 kubegems__text kubegems__break-all"
            >
              {{ content }}
              <template v-if="Object.prototype.hasOwnProperty.call(Confirm.content.status, content)">
                <v-icon v-if="Confirm.content.status[content]" color="success" right small>mdi-check</v-icon>
                <v-icon v-else color="error" right small>mdi-close</v-icon>
              </template>
            </div>
          </template>
          <template v-if="Confirm.content && Confirm.content.type === 'delete'">
            <div
              v-for="(content, index) in Confirm.content ? Confirm.content.text.split(',') : []"
              :key="index"
              class="text-subtitle-1 kubegems__text kubegems__break-all"
              v-html="content"
            />
          </template>
        </v-alert>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-text-field
            v-if="Confirm.content.type === 'delete'"
            v-model="confirmData"
            class="my-0"
            :label="$t('confirm.tip')"
            required
            :rules="confirmDataRule"
            @keydown.enter="confirm"
          />
          <v-text-field
            v-else-if="Confirm.content.type === 'batch_delete'"
            v-model="confirmData"
            class="my-0"
            :label="`${
              Confirm.content.one
                ? `${$t('confirm.tip')}`
                : $t('tip.batch_confirm_c', [Confirm.content.tip || $t('tip.batch_delete')])
            }`"
            required
            :rules="confirmBacthDataRule"
            @keydown.enter="confirm"
          />
        </v-form>
      </v-sheet>
      <v-sheet v-else-if="Confirm.content" class="px-4 py-4 confirm-size">
        <v-flex class="text-subtitle-1 kubegems__text kubegems__break-all" v-html="Confirm.content.text" />
      </v-sheet>
      <div class="pb-3 pr-4">
        <v-btn class="float-right" color="primary" :loading="Circular" small text @click="confirm">
          {{ $t('operate.confirm') }}
        </v-btn>
        <v-btn class="float-right" color="error" small text @click="closeConfirmDialog">
          {{ $t('operate.cancel') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { required } from '@/utils/rules';

  export default {
    name: 'BaseConfirm',
    data() {
      return {
        valid: false,
        confirmData: '',
      };
    },
    computed: {
      ...mapState(['Confirm', 'Circular']),
      confirmDataRule() {
        return [required, (v) => !!(v === this.Confirm.content.name) || this.$t('ruler.not_match')];
      },
      confirmBacthDataRule() {
        if (this.Confirm.content.one) {
          return [required, (v) => !!(v === this.Confirm.content.one) || this.$t('ruler.not_match')];
        } else {
          return [
            required,
            (v) =>
              !!(v === this.$t('tip.batch_rule_c', [this.Confirm.content.tip || this.$t('tip.batch_delete')])) ||
              this.$t('ruler.not_match'),
          ];
        }
      },
    },
    methods: {
      async closeConfirmDialog() {
        await this.Confirm.doClose(this.Confirm.param);
        this.Confirm.value = false;
        this.confirmData = '';
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      },
      async confirm() {
        if (
          (['delete', 'batch_delete'].indexOf(this.Confirm.content.type) > -1 && this.$refs.form.validate(true)) ||
          ['delete', 'batch_delete'].indexOf(this.Confirm.content.type) === -1
        ) {
          await this.Confirm.doFunc(this.Confirm.param);
          if (!this.Confirm.content.status || Object.values(this.Confirm.content.status).indexOf(false) === -1) {
            this.Confirm.value = false;
          }
          this.confirmData = '';
          if (this.$refs.form) {
            this.$refs.form.resetValidation();
          }
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .confirm-size {
    max-height: 400px;
    overflow-y: auto;
  }
</style>
