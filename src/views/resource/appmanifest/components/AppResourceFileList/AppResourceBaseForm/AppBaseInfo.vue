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
    <BaseSubTitle :title="$t('table.kind')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="resourceKind"
            class="my-0"
            color="primary"
            hide-selected
            :items="kinds"
            :label="$root.$t('resource.kind')"
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.kindRule"
            @change="onKindChange"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'AppBaseInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      kinds: {
        type: Array,
        default: () => [],
      },
    },
    data: () => ({
      valid: false,
      resourceKind: '',
      obj: {},
      objRules: {
        kindRule: [required],
      },
    }),
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Project']),
    },
    methods: {
      reset() {
        this.$refs.form.reset();
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      onKindChange() {
        this.$emit('change', this.resourceKind);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      checkSaved() {
        if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
          return !this.expand;
        }
        return true;
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
