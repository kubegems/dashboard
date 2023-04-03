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
  <BaseDialog
    v-model="dialog"
    icon="mdi-arrow-up-bold"
    :title="`${$t('operate.upgrade_model')} ${obj.spec.model.name}`"
    :width="800"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.spec.model.version"
                class="my-0"
                color="primary"
                hide-selected
                :items="versionItems"
                :label="$t('tip.version')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="objRules.versionRules"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-btn class="mt-4" color="primary" small text @click="refreshModel">
                {{ $root.$t('operate.refresh') }}
              </v-btn>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="obj.spec.server.image"
                class="my-0"
                :label="$t('table.image')"
                required
                :rules="objRules.imageRules"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="upgrade">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { required } from '@kubegems/libs/utils/rules';
  import { Base64 } from 'js-base64';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getModelStoreDetail, postModelSync, putModelRuntime } from '@/api';

  export default {
    name: 'UpgradeModel',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        dialog: false,
        valid: false,
        obj: {
          spec: {
            model: {
              name: '',
              version: '',
            },
            server: {
              image: '',
            },
          },
        },
        versionItems: [],
      };
    },
    computed: {
      ...mapState(['Circular']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      objRules() {
        return {
          versionRules: [required],
          imageRules: [],
        };
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item) {
        this.obj = deepCopy(item);
        this.modelStoreDetail();
      },
      async modelStoreDetail() {
        const data = await getModelStoreDetail(this.obj.spec.model.source, Base64.encode(this.obj.spec.model.name), {
          noprocessing: true,
        });
        this.versionItems = data.versions.map((v) => {
          return { text: v.name, value: v.name };
        });
      },
      async upgrade() {
        if (this.$refs.form.validate(true)) {
          const data = this.obj;
          await putModelRuntime(
            this.Tenant().TenantName,
            this.Project().ProjectName,
            this.Environment().EnvironmentName,
            this.obj.metadata.name,
            data,
          );
          this.reset();
          this.$emit('refresh');
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      refreshModel() {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.refresh'),
          content: {
            text: `${this.$root.$t('operate.refresh')} ${this.obj.spec.model.name}`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await postModelSync(this.obj.spec.model.source, Base64.encode(this.obj.spec.model.name));
            this.modelStoreDetail();
          },
        });
      },
    },
  };
</script>
