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
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $root.$t('form.definition', [$root.$t('resource.environment')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.projectid"
                class="my-0"
                color="primary"
                hide-selected
                :items="m_select_projectItems"
                :label="`${$root.$t('resource.tenant')}(${$root.$t('resource.project')})`"
                :no-data-text="$root.$t('data.no_data')"
                :rules="objRules.projectIDRules"
                @focus="onProjectSelectFocus"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.environmentid"
                class="my-0"
                color="primary"
                hide-selected
                :items="m_select_projectEnvironmentItems"
                :label="$root.$t('resource.environment')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="objRules.environmentIDRules"
                @focus="onProjectEnvironmentSelectFocus(obj.projectid, true)"
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
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'LinkEnvironmentForm',
    mixins: [BaseSelect],
    props: {
      data: {
        type: Array,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          index: -1,
          projectid: null,
          environmentid: null,
        },
        objRules: {
          projectIDRules: [required],
          environmentIDRules: [required],
        },
      };
    },
    computed: {
      env() {
        const env = this.m_select_projectEnvironmentItems.find((e) => {
          return e.value === this.obj.environmentid;
        });
        if (env) return env;
        return {};
      },
    },
    watch: {
      data() {
        this.portsCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.portsCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.obj = data;
        this.m_select_projectSelectData();
        this.m_select_projectEnvironmentSelectData(this.obj.projectid, true);
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.$emit('addData', Object.assign(this.env, { index: this.obj.index }));
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.obj = {
          index: -1,
          projectid: null,
          environmentid: null,
        };
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
      onProjectSelectFocus() {
        this.m_select_projectSelectData();
      },
      onProjectEnvironmentSelectFocus(projectid, vs = true) {
        this.m_select_projectEnvironmentSelectData(projectid, vs);
      },
    },
  };
</script>
