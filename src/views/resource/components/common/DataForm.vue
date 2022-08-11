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
    <v-expand-transition>
      <v-card v-show="expand" class="mb-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-4">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $t('form.key_value') }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="obj.key"
                class="my-0"
                :label="$t('form.key')"
                required
                :rules="objRules.keyRule"
                @keydown.enter.prevent
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
          <v-sheet class="px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="ml-2">
              <ACEEditor
                v-model="obj.value"
                :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded mb-4`"
                height="200"
                lang="yaml"
                :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
                theme="chrome"
                @init="$aceinit"
                @keydown.stop
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'DataForm',
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        dataCopy: {},
        obj: {
          key: '',
          value: '',
        },
        objRules: {
          keyRule: [required],
          valueRule: [required],
        },
        oldKey: null,
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      data() {
        this.dataCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.dataCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.obj = {
          key: data.key,
          value: data.value,
        };
        this.oldKey = data.key;
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.dataCopy) this.dataCopy = {};
          if (this.oldKey) this.$delete(this.dataCopy, this.oldKey);
          this.dataCopy[this.obj.key] = this.obj.value.replaceAll('\r', '');
          this.$emit('addData', this.dataCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.obj.value = '';
        this.oldKey = null;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
