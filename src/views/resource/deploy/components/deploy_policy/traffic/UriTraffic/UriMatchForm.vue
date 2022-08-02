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
      <v-card v-show="expand" class="ma-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>匹配规则</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.match"
                class="my-0"
                color="primary"
                hide-selected
                :items="[
                  { text: 'exact', valeu: 'exact' },
                  { text: 'prefix', valeu: 'prefix' },
                  { text: 'regex', valeu: 'regex' },
                ]"
                label="match"
                no-data-text="暂无可选数据"
                :rules="objRules.matchRule"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="obj.value" class="my-0" label="value" required :rules="objRules.valueRule" />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-flex class="mx-2">
      <v-row v-if="JSON.stringify(labelsCopy) !== '{}'">
        <v-col class="pa-0">
          <v-flex class="grey lighten-4 rounded mt-3 mx-3">
            <v-list-item>
              <v-list-item-content class="py-2">
                <v-list-item-subtitle class="text-body-2 py-0">
                  <v-list-item class="float-left py-0 pl-0 kubegems__two-width" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-subtitle-2 py-1">
                        {{ getValue(labelsCopy) }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 py-1"> 匹配规则 </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-subtitle>
                <div class="kubegems__clear-float" />
              </v-list-item-content>

              <v-btn color="primary" dark fab right text x-small @click="updateLabels">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn color="error" dark fab right text x-small @click="removeLabels">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-flex>
        </v-col>
      </v-row>
      <v-flex v-else class="grey lighten-4 rounded mt-2">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="expandCard">
                <v-icon left small> mdi-tag-plus </v-icon>
                添加匹配
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </v-flex>
  </v-form>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'UriMatchForm',
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
          match: '',
          value: '',
        },
      };
    },
    computed: {
      objRules() {
        return {
          matchRule: [required],
          valueRule: [required],
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
      getValue(val) {
        if (val.exact) return `exact => ${val.exact}`;
        if (val.prefix) return `prefix => ${val.prefix}`;
        if (val.regex) return `regex => ${val.regex}`;
        return '';
      },
      getKeyValue(val) {
        if (val.exact) return { match: 'exact', value: val.exact };
        if (val.prefix) return { match: 'prefix', value: val.prefix };
        if (val.regex) return { match: 'regex', value: val.regex };
        return {};
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.labelsCopy) this.labelsCopy = {};
          this.labelsCopy[this.obj.match] = this.obj.value;
          this.$emit('addData', this.labelsCopy);
          this.closeCard();
        }
      },
      updateLabels() {
        const data = this.labelsCopy;
        this.obj = {
          ...this.getKeyValue(data),
        };
        this.expandCard();
      },
      removeLabels() {
        this.$set(this.labelsCopy, {});
        this.$emit('addData', this.labelsCopy);
      },
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$emit('closeOverlay');
      },
    },
  };
</script>
