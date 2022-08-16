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
        <BaseSubTitle :divider="false">
          <template #action>
            <v-btn class="float-right mr-2" color="primary" small text @click="addPath">
              <v-icon left small> mdi-plus </v-icon>
              {{ $t('operate.add_path') }}
            </v-btn>
          </template>
        </BaseSubTitle>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>{{ $root.$t('form.definition', [$t('tip.ingress_rule')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="ruler.host" class="my-0" label="域名" :rules="rulerRules.hostRule">
                <template #append>
                  <v-btn class="mt-n1" color="primary" small text @click="randomHost">
                    <v-icon left small> mdi-all-inclusive </v-icon>
                    {{ $t('tip.random_domain') }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-flex>
            <v-flex v-if="hasTLS" class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="ruler.secretName"
                class="my-0"
                color="primary"
                hide-selected
                :items="m_select_secretItems"
                :label="$root.$t('resource.secret')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="rulerRules.secretNameRule"
                @focus="onSecretSelectFocus(ThisCluster, obj.metadata.namespace, 'kubernetes.io/tls')"
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

          <v-sheet v-for="(item, index) in ruler.paths" :key="index" class="px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 py-1 primary--text kubegems__min-width">
              {{ $t('tip.path') }}{{ index + 1 }}
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="ruler.paths[index].path"
                class="my-0"
                :label="$t('tip.path')"
                required
                :rules="rulerRules.pathsRule[index].pathRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="ruler.paths[index].pathType"
                class="my-0"
                color="primary"
                hide-selected
                :items="pathTypeItems"
                label="PathType"
                :no-data-text="$root.$t('data.no_data')"
                :rules="rulerRules.pathsRule[index].serviceNameRule"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="ruler.paths[index].serviceName"
                class="my-0"
                color="primary"
                hide-selected
                :items="m_select_serviceItems"
                :label="$root.$t('resource.service')"
                :no-data-text="$root.$t('data.no_data')"
                :rules="rulerRules.pathsRule[index].serviceNameRule"
                @focus="onServiceSelectFocus(ThisCluster, obj.metadata.namespace)"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-row>
                <v-col class="pr-0" cols="3">
                  <v-menu
                    v-model="ruler.paths[index].portTypeMenu"
                    bottom
                    :close-on-content-click="false"
                    content-class="tag-menu"
                    nudge-bottom="5px"
                    offset-y
                    origin="top center"
                    right
                    transition="scale-transition"
                  >
                    <template #activator="{ on }">
                      <v-chip class="primary--text float-left mt-3 font-weight-medium" color="white" label v-on="on">
                        {{ ruler.paths[index].portType === 'name' ? $t('tip.port_name') : $t('tip.port_number') }}
                        <v-icon v-if="ruler.paths[index].portTypeMenu" right small> mdi-chevron-up </v-icon>
                        <v-icon v-else right small> mdi-chevron-down </v-icon>
                      </v-chip>
                    </template>
                    <v-data-iterator
                      hide-default-footer
                      :items="[
                        {
                          text: 'portType',
                          values: [
                            { text: $t('tip.port_name'), value: 'name' },
                            { text: $t('tip.port_number'), value: 'number' },
                          ],
                        },
                      ]"
                    >
                      <template #default="props">
                        <v-card v-for="iterdata in props.items" :key="iterdata.text" flat>
                          <v-list dense>
                            <v-list-item
                              v-for="(pType, i) in iterdata.values"
                              :key="i"
                              class="text-body-2 text-center"
                              link
                              :style="{
                                color: pType.value === ruler.paths[index].portType ? `#1e88e5 !important` : ``,
                              }"
                              @click="setPortType(pType, index)"
                            >
                              <v-list-item-content>
                                <span>
                                  {{ pType.text }}
                                </span>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </template>
                    </v-data-iterator>
                  </v-menu>
                </v-col>
                <v-col class="pl-0" cols="9">
                  <v-autocomplete
                    v-model="ruler.paths[index].servicePort"
                    class="my-0"
                    color="primary"
                    hide-selected
                    :items="
                      m_select_serviceItems.find((s) => {
                        return s.text === ruler.paths[index].serviceName;
                      })
                        ? ruler.paths[index].portType === 'name'
                          ? m_select_serviceItems.find((s) => {
                              return s.text === ruler.paths[index].serviceName;
                            }).portNames
                          : m_select_serviceItems.find((s) => {
                              return s.text === ruler.paths[index].serviceName;
                            }).ports
                        : []
                    "
                    :label="$t('tip.port')"
                    :no-data-text="$root.$t('data.no_data')"
                    :rules="rulerRules.pathsRule[index].servicePortRule"
                  >
                    <template #selection="{ item }">
                      <v-chip class="mx-1" color="primary" small>
                        {{ item['text'] }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
            </v-flex>
            <v-btn class="mt-4" color="error" dark fab right text x-small @click="removePtah(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
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
  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy, randomString } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'IngressRuleForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      annotations: {
        type: Object,
        default: () => null,
      },
      domain: {
        type: String,
        default: () => '',
      },
      obj: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        pathTypeItems: [
          { text: 'Prefix', value: 'Prefix' },
          { text: 'Exact', value: 'Exact' },
          { text: 'ImplementationSpecific', value: 'ImplementationSpecific' },
        ],
        objCopy: {
          metadata: {
            namespace: '',
          },
        },
        ruler: {
          index: -1,
          secretName: '',
          host: '',
          paths: [{ path: '', pathType: '', serviceName: '', servicePort: '', portType: 'name', portTypeMenu: false }],
        },
      };
    },
    computed: {
      rulerRules() {
        const rule = {
          hostRule: [required],
          secretNameRule: [required],
          pathsRule: [
            {
              pathRule: [required],
              serviceNameRule: [required],
              servicePortRule: [required],
              pathTypeRule: [required],
            },
          ],
        };
        if (this.hasTLS) {
          rule.secretNameRule = [required];
        }
        return rule;
      },
      hasTLS() {
        return (
          this.annotations &&
          ['HTTPS', 'GRPCS'].indexOf(this.annotations['nginx.ingress.kubernetes.io/backend-protocol']) > -1
        );
      },
    },
    watch: {
      obj: {
        handler: function (newValue) {
          if (newValue?.metadata?.namespace !== this.objCopy.metadata.namespace && newValue?.metadata?.namespace) {
            this.m_select_serviceSelectData(this.ThisCluster, newValue?.metadata?.namespace);
            this.m_select_secretSelectData(this.ThisCluster, newValue?.metadata?.namespace, 'kubernetes.io/tls');
          }
          this.objCopy = deepCopy(newValue);
        },
        deep: true,
      },
    },
    methods: {
      init(data) {
        this.ruler = data;
        this.ruler.paths.forEach(() => {
          this.rulerRules.pathsRule.push({
            pathRule: [required],
            serviceNameRule: [required],
            servicePortRule: [required],
            pathTypeRule: [required],
          });
        });
        this.expand = true;
      },
      randomHost() {
        if (!this.domain) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.no_random_domain'),
            color: 'warning',
          });
          return;
        }
        this.ruler.host = this.domain.replace(new RegExp('\\*', 'g'), randomString(4));
      },
      addPath() {
        this.ruler.paths.push({
          path: '',
          pathType: '',
          serviceName: '',
          servicePort: '',
          portType: 'name',
          portTypeMenu: false,
        });
        this.rulerRules.pathsRule.push({
          pathRule: [required],
          serviceNameRule: [required],
          servicePortRule: [required],
          pathTypeRule: [required],
        });
      },
      removePtah(index) {
        if (this.ruler.paths.length === 1) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.leave_1_rule'),
            color: 'warning',
          });
          return;
        }
        this.ruler.paths.splice(index, 1);
        this.rulerRules.pathsRule.splice(index, 1);
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const paths = [];
          this.ruler.paths.forEach((p) => {
            if (p.portType === 'name') {
              paths.push({
                path: p.path,
                pathType: p.pathType,
                backend: {
                  service: {
                    name: p.serviceName,
                    port: {
                      name: p.servicePort,
                    },
                  },
                },
              });
            } else {
              paths.push({
                path: p.path,
                pathType: p.pathType,
                backend: {
                  service: {
                    name: p.serviceName,
                    port: {
                      number: p.servicePort,
                    },
                  },
                },
              });
            }
          });
          // 域名为空时后端才会自动生成
          if (this.ruler.host === this.$t('tip.auto_domain')) {
            this.ruler.host = '';
          }
          if (this.hasTLS) {
            if (!this.objCopy.spec.tls) {
              this.objCopy.spec.tls = [];
            }
            this.objCopy.spec.tls.push({
              hosts: [this.ruler.host],
              secretName: this.ruler.secretName,
            });
          }
          if (this.ruler.index === -1) {
            this.objCopy.spec.rules.push({
              host: this.ruler.host,
              http: {
                paths: paths,
              },
            });
          } else {
            this.$set(this.objCopy.spec.rules, this.ruler.index, {
              host: this.ruler.host,
              http: {
                paths: paths,
              },
            });
          }
          if (!this.hasTLS) {
            if (this.objCopy.spec.tls && this.objCopy.spec.tls.length > 0) {
              const index = this.objCopy.spec.tls.findIndex((tls) => {
                return tls.hosts.find((h) => {
                  return h === this.ruler.host;
                });
              });
              this.$delete(this.objCopy.spec.tls, index);
            }
          }
          this.$emit('addData', this.objCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.rulerRules.pathsRule = [
          {
            pathRule: [required],
            serviceNameRule: [required],
            servicePortRule: [required],
            pathTypeRule: [required],
          },
        ];
        this.ruler = deepCopy(this.$options.data().ruler);
        this.$refs.form.resetValidation();
        this.$emit('closeOverlay');
      },
      onServiceSelectFocus(clusterName, namespace) {
        this.m_select_serviceSelectData(clusterName, namespace);
      },
      onSecretSelectFocus(clusterName, namespace, type) {
        this.m_select_secretSelectData(clusterName, namespace, type);
      },
      setPortType(portType, index) {
        this.ruler.paths[index].portType = portType.value;
        this.ruler.paths[index].portTypeMenu = false;
      },
    },
  };
</script>
