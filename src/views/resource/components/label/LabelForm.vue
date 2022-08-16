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
              <span>{{ $root.$t('form.key_value') }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model.trim="obj.key"
                class="my-0"
                :label="$root.$t('form.key')"
                required
                :rules="objRules.keyRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="obj.value"
                class="my-0"
                :label="$root.$t('form.value')"
                required
                :rules="objRules.valueRule"
              />
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
  import { k8sLabel, k8sName, required } from '@/utils/rules';

  export default {
    name: 'LabelForm',
    mixins: [BaseResource],
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
        labelsCopy: {},
        obj: {
          key: '',
          value: '',
        },
        oldKey: null,
      };
    },
    computed: {
      objRules() {
        return {
          keyRule: [required, k8sName],
          valueRule: [required, k8sLabel],
        };
      },
    },
    watch: {
      data() {
        this.labelsCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.labelsCopy = deepCopy(this.data);
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
          if (!this.labelsCopy) this.labelsCopy = {};
          if (this.oldKey) this.$delete(this.labelsCopy, this.oldKey);
          this.labelsCopy[this.obj.key] = this.obj.value;
          this.$emit('addData', this.labelsCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.oldKey = null;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
