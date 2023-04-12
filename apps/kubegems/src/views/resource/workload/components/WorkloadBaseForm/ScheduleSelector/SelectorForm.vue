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
                v-model="obj.key"
                class="my-0"
                :label="$root.$t('form.key')"
                required
                :rules="objRules.keyRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.value"
                class="my-0"
                color="primary"
                hide-selected
                :items="nodeItems"
                :label="$root.$t('form.value')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="objRules.valueRule"
                :search-input.sync="valueText"
                @keyup.enter="inputValue"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
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
  import { getNodeList } from '@kubegems/api/direct';
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import BaseResource from '@kubegems/mixins/resource';

  import { convertResponse2List } from '@/types/base';

  export default {
    name: 'SelectorForm',
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
        selectorsCopy: {},
        obj: {
          key: 'kubernetes.io/hostname',
          value: '',
        },
        objRules: {
          keyRule: [required],
          valueRule: [required],
        },
        oldKey: null,
        nodeItems: [],
        valueText: '',
      };
    },
    watch: {
      data() {
        this.selectorsCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.selectorsCopy = deepCopy(this.data);
      }
      this.getNodeList();
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
          if (!this.selectorsCopy) this.selectorsCopy = {};
          if (this.oldKey) this.$delete(this.selectorsCopy, this.oldKey);
          this.selectorsCopy[this.obj.key] = this.obj.value;
          this.$emit('addData', this.selectorsCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.oldKey = null;
        this.$emit('closeOverlay');
      },
      getDistinctTaints(taints) {
        if (taints === undefined) return [];
        const t = [];
        taints.forEach((taint) => {
          if (t.indexOf(taint.effect) === -1) {
            t.push(taint.effect);
          }
        });
        return t;
      },
      async getNodeList() {
        const data = await getNodeList(this.ThisCluster);
        this.nodeItems = convertResponse2List(data).map((d) => {
          if (
            d.metadata?.labels?.[`node-role.kubernetes.io/master`] === undefined &&
            d.metadata?.labels?.[`kubernetes.io/role`] !== 'master' &&
            this.getDistinctTaints(d.spec?.taints).indexOf('NoSchedule') === -1
          ) {
            return { text: d.metadata.name, value: d.metadata.name };
          }
        });
      },
      inputValue() {
        if (
          this.nodeItems.findIndex((v) => {
            return v.value === this.valueText?.trim();
          }) === -1
        ) {
          this.nodeItems.push({
            text: this.valueText?.trim(),
            value: this.valueText?.trim(),
          });
          this.obj.value = this.valueText?.trim();
          this.valueText = '';
        }
      },
    },
  };
</script>
