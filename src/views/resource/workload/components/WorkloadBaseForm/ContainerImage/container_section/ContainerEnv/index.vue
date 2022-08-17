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
  <v-form v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $t('tip.params_type') }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="env"
                class="my-0"
                color="primary"
                hide-selected
                :items="envTypes"
                :label="$root.$t('resource.type')"
                :no-data-text="$root.$t('data.no_data')"
                @change="onEnvTypeChange"
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
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.name" class="my-0" label="名称" required :rules="objRules.nameRule" />
              </v-flex>
              <v-flex v-if="env === 'kv'">
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field v-model="obj.value" class="my-0" label="值" required :rules="objRules.valueRule" />
                </v-flex>
              </v-flex>
              <v-flex v-else-if="env === 'secret' || env === 'configmap'">
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="obj.fromName"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="items"
                    :label="env === 'secret' ? $root.$t('resource.secret') : $root.$t('resource.configmap')"
                    :no-data-text="$root.$t('data.no_data')"
                    :rules="objRules.fromNameRule"
                  >
                    <template #selection="{ item }">
                      <v-chip class="mx-1" color="primary" small>
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
                  <span />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="obj.value"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="keys"
                    :label="$root.$t('form.key')"
                    :no-data-text="$root.$t('data.no_data')"
                    :rules="objRules.valueRule"
                  >
                    <template #selection="{ item }">
                      <v-chip class="mx-1" color="primary" small>
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-flex>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex v-if="env === 'downward'">
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="obj.fromName"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="sources"
                    :label="$t('tip.source')"
                    :no-data-text="$root.$t('data.no_data')"
                    :rules="objRules.fromNameRule"
                  >
                    <template #selection="{ item }">
                      <v-chip class="mx-1" color="primary" small>
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <template v-if="obj.fromName === 'Container'">
                  <v-flex class="float-left ml-2 kubegems__form-width">
                    <v-text-field
                      v-model="obj.containerName"
                      class="my-0"
                      :label="$root.$t('container')"
                      required
                      :rules="objRules.containerNameRule"
                    />
                  </v-flex>
                  <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
                    <span />
                  </v-flex>
                  <v-flex class="float-left ml-2 kubegems__form-width">
                    <v-text-field
                      v-model="obj.value"
                      class="my-0"
                      label="resource"
                      required
                      :rules="objRules.valueRule"
                    />
                  </v-flex>
                </template>
                <template v-else-if="obj.fromName === 'Pod'">
                  <v-flex class="float-left ml-2 kubegems__form-width">
                    <v-text-field
                      v-model="obj.value"
                      class="my-0"
                      label="fieldPath"
                      required
                      :rules="objRules.valueRule"
                    />
                  </v-flex>
                </template>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet
      v-for="(item, index) in containerCopy && containerCopy.env ? containerCopy.env : []"
      :key="index"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <KeyValue v-if="!item.valueFrom" :item="item" />

        <Secret v-else-if="item.valueFrom && item.valueFrom.secretKeyRef" :item="item" />

        <Configmap v-else-if="item.valueFrom && item.valueFrom.configMapKeyRef" :item="item" />

        <DownwardPod v-else-if="item.valueFrom && item.valueFrom.fieldRef" :item="item" />

        <DownwardContainer v-else-if="item.valueFrom && item.valueFrom.resourceFieldRef" :item="item" />

        <v-btn color="primary" dark fab right text x-small @click="updateData(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('tip.env')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import messages from '../../../../../i18n';
  import Configmap from './Configmap';
  import DownwardContainer from './DownwardContainer';
  import DownwardPod from './DownwardPod';
  import KeyValue from './KeyValue';
  import Secret from './Secret';
  import { getAppResourceFileMetas, getConfigMapList, getSecretList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ContainerEnv',
    i18n: {
      messages: messages,
    },
    components: {
      Configmap,
      DownwardContainer,
      DownwardPod,
      KeyValue,
      Secret,
    },
    mixins: [BaseResource],
    props: {
      container: {
        type: Object,
        default: () => null,
      },
      manifest: {
        type: Boolean,
        default: () => false,
      },
      namespace: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        env: 'kv',
        items: [],
        obj: {
          name: '',
          fromName: '',
          value: '',
          containerName: '',
        },
        containerCopy: null,
      };
    },
    computed: {
      objRules() {
        return {
          nameRule: [required],
          fromNameRule: [required],
          valueRule: [required],
          containerNameRule: [required],
        };
      },
      keys() {
        if (this.env === 'secret') {
          const secret = this.items.find((s) => {
            return s.value === this.obj.fromName;
          });
          if (secret) return secret.keys;
          return [];
        } else if (this.env === 'configmap') {
          const configmap = this.items.find((c) => {
            return c.value === this.obj.fromName;
          });
          if (configmap) return configmap.keys;
          return [];
        }
        return [];
      },
      envTypes() {
        return [
          { text: this.$root.$t('form.key_value'), value: 'kv' },
          { text: this.$root.$t('resource.configmap'), value: 'configmap' },
          { text: this.$root.$t('resource.secret'), value: 'secret' },
          { text: 'Downward API', value: 'downward' },
        ];
      },
      sources() {
        return [
          { text: this.$root.$t('resource.container'), value: 'Container' },
          { text: 'Pod', value: 'Pod' },
        ];
      },
    },
    watch: {
      container() {
        if (this.container) this.containerCopy = deepCopy(this.container);
        else this.containerCopy = {};
      },
    },
    mounted() {
      if (this.container) this.containerCopy = deepCopy(this.container);
      else this.containerCopy = {};
    },
    methods: {
      async secretList() {
        let data = {};
        if (this.manifest) {
          data = await getAppResourceFileMetas(
            this.$route.query.tenantid,
            this.$route.query.projectid,
            this.ThisAppEnvironmentID,
            this.$route.params.name,
            {
              kind: 'Secret',
            },
          );
          this.items = data;
        } else {
          data = await getSecretList(this.ThisCluster, this.namespace, {
            size: 1000,
          });
          this.items = data.List;
        }
        this.items.forEach((v) => {
          v.text = v.secret.metadata.name;
          v.value = v.secret.metadata.name;
          v.keys = [];
          if (v.secret.data) {
            Object.keys(v.secret.data).forEach((d) => {
              v.keys.push({ text: d, value: d });
            });
          }
        });
      },
      async configMapList() {
        let data = {};
        if (this.manifest) {
          data = await getAppResourceFileMetas(
            this.$route.query.tenantid,
            this.$route.query.projectid,
            this.ThisAppEnvironmentID,
            this.$route.params.name,
            {
              kind: 'ConfigMap',
            },
          );
          this.items = data;
        } else {
          data = await getConfigMapList(this.ThisCluster, this.namespace, {
            size: 1000,
          });
          this.items = data.List;
        }
        this.items.forEach((v) => {
          v.text = v.metadata.name;
          v.value = v.metadata.name;
          v.keys = [];
          if (v.data) {
            Object.keys(v.data).forEach((d) => {
              v.keys.push({ text: d, value: d });
            });
          }
        });
      },
      onEnvTypeChange() {
        if (this.env === 'secret') this.secretList();
        else if (this.env === 'configmap') this.configMapList();
      },
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.$nextTick(() => {
          this.env = 'kv';
        });
      },
      generatorData() {
        if (this.env === 'kv') {
          return {
            name: this.obj.name,
            value: this.obj.value,
          };
        } else if (this.env === 'secret') {
          return {
            name: this.obj.name,
            valueFrom: {
              secretKeyRef: {
                name: this.obj.fromName,
                key: this.obj.value,
              },
            },
          };
        } else if (this.env === 'configmap') {
          return {
            name: this.obj.name,
            valueFrom: {
              configMapKeyRef: {
                name: this.obj.fromName,
                key: this.obj.value,
              },
            },
          };
        } else if (this.env === 'downward') {
          if (this.obj.fromName === 'Pod') {
            return {
              name: this.obj.name,
              valueFrom: {
                fieldRef: {
                  fieldPath: this.obj.value,
                },
              },
            };
          } else if (this.obj.fromName === 'Container') {
            return {
              name: this.obj.name,
              valueFrom: {
                resourceFieldRef: {
                  containerName: this.obj.containerName,
                  resource: this.obj.value,
                },
              },
            };
          }
        }
        return null;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.containerCopy.env) this.$set(this.containerCopy, 'env', []);
          const index = this.containerCopy.env.findIndex((e) => {
            return e.name === this.obj.name;
          });
          if (index > -1) {
            this.$set(this.containerCopy.env, index, this.generatorData());
          } else {
            const env = this.containerCopy.env;
            env.push(this.generatorData());
            this.$set(this.containerCopy, 'env', env);
          }
          this.$emit('updateComponentData', this.containerCopy);
          this.closeCard();
        }
      },
      removeData(index) {
        this.$delete(this.containerCopy.env, index);
        this.$emit('updateComponentData', this.containerCopy);
      },
      updateData(index) {
        const env = this.containerCopy.env[index];
        if (env.valueFrom) {
          if (env.valueFrom.secretKeyRef) {
            this.env = 'secret';
            this.obj = {
              name: env.name,
              value: env.valueFrom.secretKeyRef.key,
              fromName: env.valueFrom.secretKeyRef.name,
            };
            this.secretList();
          } else if (env.valueFrom.configMapKeyRef) {
            this.env = 'configmap';
            this.obj = {
              name: env.name,
              value: env.valueFrom.configMapKeyRef.key,
              fromName: env.valueFrom.configMapKeyRef.name,
            };
            this.configMapList();
          } else if (env.valueFrom.resourceFieldRef) {
            this.env = 'downward';
            this.obj = {
              name: env.name,
              value: env.valueFrom.resourceFieldRef.resource,
              containerName: env.valueFrom.resourceFieldRef.containerName,
              fromName: 'Container',
            };
          } else if (env.valueFrom.fieldRef) {
            this.env = 'downward';
            this.obj = {
              name: env.name,
              value: env.valueFrom.fieldRef.fieldPath,
              fromName: 'Pod',
            };
          }
        } else {
          this.env = 'kv';
          this.obj = {
            name: env.name,
            value: env.value,
          };
        }
        this.expandCard();
      },
    },
  };
</script>
