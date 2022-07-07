<template>
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <BaseSubTitle :divider="false">
          <template #action>
            <v-btn class="float-right mr-2" color="primary" small text @click="addPath">
              <v-icon left small> mdi-plus </v-icon>
              添加Path
            </v-btn>
          </template>
        </BaseSubTitle>
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>规则定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="ruler.host" class="my-0" label="域名" :rules="rulerRules.hostRule">
                <template #append>
                  <v-btn class="mt-n1" color="primary" small text @click="randomHost">
                    <v-icon left small> mdi-all-inclusive </v-icon>
                    随机域名
                  </v-btn>
                </template>
              </v-text-field>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="ruler.tls"
                class="my-0"
                color="primary"
                hide-selected
                :items="protocols"
                label="协议"
                no-data-text="暂无可选数据"
                :rules="rulerRules.tlsRule"
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

          <v-sheet class="px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
            <v-flex
              v-if="['https', 'wss', 'grpc'].indexOf(ruler.tls) > -1"
              class="float-left ml-2 kubegems__form-width"
            >
              <v-autocomplete
                v-model="ruler.secretName"
                class="my-0"
                color="primary"
                hide-selected
                :items="m_select_secretItems"
                label="密钥"
                no-data-text="暂无可选数据"
                :rules="rulerRules.secretName"
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
              路径{{ index + 1 }}
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="ruler.paths[index].path"
                class="my-0"
                label="路径"
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
                label="pathType"
                no-data-text="暂无可选数据"
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
                label="服务"
                no-data-text="暂无可选数据"
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
              <v-autocomplete
                v-model="ruler.paths[index].servicePort"
                class="my-0"
                color="primary"
                hide-selected
                :items="
                  m_select_serviceItems.find((s) => {
                    return s.text === ruler.paths[index].serviceName;
                  })
                    ? m_select_serviceItems.find((s) => {
                        return s.text === ruler.paths[index].serviceName;
                      }).portNames
                    : []
                "
                label="端口"
                no-data-text="暂无可选数据"
                :rules="rulerRules.pathsRule[index].servicePortRule"
              >
                <template #selection="{ item }">
                  <v-chip class="mx-1" color="primary" small>
                    {{ item['text'] }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-flex>
            <v-btn class="mt-4" color="error" dark fab right text x-small @click="removePtah(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
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
  </v-form>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy, randomString } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'IngressRuleForm',
    mixins: [BaseResource, BaseSelect],
    props: {
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
        protocols: [
          { text: 'http', value: 'http' },
          { text: 'https', value: 'https' },
          { text: 'ws', value: 'ws' },
          { text: 'wss', value: 'wss' },
          { text: 'grpc', value: 'grpc' },
        ],
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
          tls: '',
          secretName: '',
          host: '',
          paths: [{ path: '', pathType: '', serviceName: '', servicePort: '' }],
        },
      };
    },
    computed: {
      rulerRules() {
        const rule = {
          hostRule: [],
          secretName: [required],
          s: [required],
          pathsRule: [
            {
              pathRule: [required],
              serviceNameRule: [required],
              servicePortRule: [required],
              pathTypeRule: [required],
            },
          ],
        };
        if (['https', 'wss', 'grpc'].indexOf(this.ruler.tls) > -1) {
          rule.hostRule = [required];
        }
        return rule;
      },
    },
    watch: {
      obj: {
        handler: function (data) {
          if (data?.metadata?.namespace !== this.objCopy.metadata.namespace && data?.metadata?.namespace) {
            this.m_select_serviceSelectData(this.ThisCluster, data?.metadata?.namespace);
            this.m_select_secretSelectData(this.ThisCluster, data?.metadata?.namespace, 'kubernetes.io/tls');
          }
          this.objCopy = deepCopy(data);
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
            text: '暂无可生成的随机域名',
            color: 'warning',
          });
          return;
        }
        this.ruler.host = this.domain.replace(new RegExp('\\*', 'g'), randomString(4));
      },
      addPath() {
        this.ruler.paths.push({ path: '', pathType: '', serviceName: '', servicePort: '' });
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
            text: '至少保留一项路由规则',
            color: 'warning',
          });
          return;
        }
        this.ruler.paths.splice(index, 1);
        this.rulerRules.pathsRule.splice(index, 1);
      },
      generateAnnotation(oriRuler) {
        if (!this.objCopy.metadata.annotations) {
          this.objCopy.metadata.annotations = {};
        }
        if (this.objCopy.metadata.annotations && this.objCopy.metadata.annotations['nginx.org/websocket-services']) {
          const svcs = this.objCopy.metadata.annotations['nginx.org/websocket-services'].split(',');
          oriRuler.forEach((r) => {
            const index = svcs.indexOf(r.serviceName);
            if (index > -1) svcs.splice(index, 1);
          });
          this.objCopy.metadata.annotations['nginx.org/websocket-services'] = svcs.join(',');
          if (this.objCopy.metadata.annotations['nginx.org/websocket-services'] === '') {
            this.$delete(this.objCopy.metadata.annotations, 'nginx.org/websocket-services');
          }
        }
        if (this.objCopy.metadata.annotations && this.objCopy.metadata.annotations['nginx.org/grpc-services']) {
          const svcs = this.objCopy.metadata.annotations['nginx.org/grpc-services'].split(',');
          oriRuler.forEach((r) => {
            const index = svcs.indexOf(r.serviceName);
            if (index > -1) svcs.splice(index, 1);
          });
          this.objCopy.metadata.annotations['nginx.org/grpc-services'] = svcs.join(',');
          if (this.objCopy.metadata.annotations['nginx.org/grpc-services'] === '') {
            this.$delete(this.objCopy.metadata.annotations, 'nginx.org/grpc-services');
          }
        }
        if (this.ruler.tls === 'ws' || this.ruler.tls === 'wss') {
          if (!this.objCopy.metadata.annotations['nginx.org/websocket-services']) {
            this.objCopy.metadata.annotations['nginx.org/websocket-services'] = '';
          }
          const svcs = this.objCopy.metadata.annotations['nginx.org/websocket-services'].split(',').filter((svc) => {
            return svc !== '';
          });
          this.objCopy.metadata.annotations['nginx.org/websocket-services'] = svcs
            .concat(
              this.ruler.paths.map((p) => {
                return p.serviceName;
              }),
            )
            .join(',');
        } else if (this.ruler.tls === 'grpc') {
          if (!this.objCopy.metadata.annotations['nginx.org/grpc-services']) {
            this.objCopy.metadata.annotations['nginx.org/grpc-services'] = '';
          }
          const svcs = this.objCopy.metadata.annotations['nginx.org/grpc-services'].split(',').filter((svc) => {
            return svc !== '';
          });
          this.objCopy.metadata.annotations['nginx.org/grpc-services'] = svcs
            .concat(
              this.ruler.paths.map((p) => {
                return p.serviceName;
              }),
            )
            .join(',');
        }
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const oriRuler = this.ruler.paths;
          const paths = [];
          this.ruler.paths.forEach((p) => {
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
          });
          // 域名为空时后端才会自动生成
          if (this.ruler.host === '自动生成域名') {
            this.ruler.host = '';
          }
          if (['https', 'wss', 'grpc'].indexOf(this.ruler.tls) > -1) {
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
          if (['https', 'wss', 'grpc'].indexOf(this.ruler.tls) === -1) {
            if (this.objCopy.spec.tls && this.objCopy.spec.tls.length > 0) {
              const index = this.objCopy.spec.tls.findIndex((tls) => {
                return tls.hosts.find((h) => {
                  return h === this.ruler.host;
                });
              });
              this.$delete(this.objCopy.spec.tls, index);
            }
          }
          this.generateAnnotation(oriRuler);
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
    },
  };
</script>
