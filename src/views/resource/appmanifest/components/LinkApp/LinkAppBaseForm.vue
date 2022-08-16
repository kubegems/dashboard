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
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <BaseSubTitle :title="$t('operate.link_c', [$root.$t('resource.app')])" />
      <v-card-text class="px-2 pb-0">
        <v-sheet>
          <v-autocomplete
            v-model="obj"
            class="my-0"
            color="primary"
            hide-selected
            :items="items"
            :label="$root.$t('resource.app')"
            multiple
            :no-data-text="$root.$t('data.no_data')"
            :rules="objRules.ApplicationRule"
            @focus="onAppSelectFocus"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-sheet>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import { getAppRunningList, getManifestList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'LinkAppBaseForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    data: () => ({
      valid: false,
      items: [],
      obj: [],
      objRules: {
        ApplicationRule: [required],
      },
      linkedAppItems: [],
    }),
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Project', 'Tenant', 'Environment']),
    },
    methods: {
      async appManifestList() {
        const data = await getManifestList(this.Tenant().ID, this.Project().ID, {
          size: 1000,
        });
        const apps = [];
        data.List.forEach((app) => {
          if (
            this.linkedAppItems.some((l) => {
              return l.name === app.name;
            })
          ) {
            apps.push({ text: `${app.name}(${this.$t('tip.linked')})`, value: app, disabled: true });
          } else {
            apps.push({ text: app.name, value: app, disabled: false });
          }
        });
        this.items = apps;
      },
      async appRunningList() {
        const data = await getAppRunningList(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          Object.assign({
            kind: 'app',
            noprocessing: true,
            size: 1000,
          }),
        );
        this.linkedAppItems = data.List;
      },
      reset() {
        this.$refs.form.reset();
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      async onAppSelectFocus() {
        await this.appRunningList();
        this.appManifestList();
      },
    },
  };
</script>
