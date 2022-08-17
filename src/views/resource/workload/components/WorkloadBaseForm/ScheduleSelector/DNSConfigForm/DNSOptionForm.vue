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
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>dns option</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="obj.name"
                class="my-0"
                :label="$root.$t('form.name')"
                required
                :rules="objRules.nameRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="obj.value" class="my-0" :label="$root.$t('form.value')" required />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'DNSOptionForm',
    mixins: [BaseResource],
    props: {
      data: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        optionsCopy: [],
        obj: {
          name: '',
          value: '',
        },
        oldName: null,
      };
    },
    computed: {
      objRules() {
        return {
          nameRule: [required],
        };
      },
    },
    watch: {
      data() {
        this.optionsCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.optionsCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.obj = {
          name: data.name,
          value: data.value,
        };
        this.oldName = data.name;
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.optionsCopy) this.optionsCopy = [];
          if (this.oldName) {
            const index = this.optionsCopy.findIndex((o) => {
              return o.name === this.oldName;
            });
            if (index > -1) this.$delete(this.optionsCopy, index);
          }
          const index = this.optionsCopy.findIndex((o) => {
            return o.name === this.obj.name;
          });
          if (index === -1) {
            if (this.obj.value && this.obj.value.length === 0) {
              this.optionsCopy.push({ name: this.obj.name });
            } else {
              this.optionsCopy.push({
                name: this.obj.name,
                value: this.obj.value,
              });
            }
          }
          this.$emit('addData', this.optionsCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
