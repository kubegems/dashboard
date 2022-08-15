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
        <v-sheet class="pt-2 px-2">
          <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
            <span>{{ $root.$t('resource.namespace') }}</span>
          </v-flex>
          <v-flex class="float-left ml-2 kubegems__form-width">
            <v-autocomplete
              v-model="namespace"
              class="my-0"
              color="primary"
              hide-selected
              :items="namespaceItems"
              :label="$root.$t('resource.namespace')"
              :no-data-text="$root.$t('data.no_data')"
              :rules="namespaceRule"
              @focus="onNamespaceSelectFocus"
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
  import { mapGetters } from 'vuex';

  import { namespaceSelectDataFilter } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'AddNamespace',
    mixins: [BaseSelect],
    props: {
      data: {
        type: Number,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      namespace: '',
      namespaceItems: [],
      namespaceRule: [required],
    }),
    computed: {
      ...mapGetters(['Tenant']),
      clusterName() {
        const cluster = this.m_select_clusterItems.find((c) => {
          return c.value === this.data;
        });
        if (cluster) return cluster.text;
        return '';
      },
    },
    async mounted() {
      await this.m_select_clusterSelectData(null, false);
    },
    methods: {
      async addData() {
        if (this.$refs.form.validate(true)) {
          this.$emit('addData', this.namespace);
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$emit('closeOverlay');
      },
      onNamespaceSelectFocus() {
        this.namespaceSelectData();
      },
      async namespaceSelectData() {
        if (!this.clusterName) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_cluster'),
            color: 'warning',
          });
          return;
        }
        const data = await namespaceSelectDataFilter(this.clusterName);
        const namespaceSelect = [];
        data.List.forEach((ns) => {
          namespaceSelect.push({
            text: ns.metadata.name,
            value: ns.metadata.name,
          });
        });
        this.namespaceItems = namespaceSelect;
      },
    },
  };
</script>
