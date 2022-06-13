<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="网关定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col v-if="AdminViewport && obj.spec.tenant !== 'notenant'" cols="6">
            <v-autocomplete
              v-model="obj.spec.tenant"
              class="my-0"
              color="primary"
              hide-selected
              item-value="text"
              :items="m_select_tenantItems"
              label="租户"
              no-data-text="暂无可选数据"
              :readonly="edit"
              :rules="objRules.tenantRule"
              @focus="onTenantSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip class="ma-1" color="primary" :disabled="item.disabled" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              label="网关名称"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.type"
              class="my-0"
              color="primary"
              hide-selected
              :items="gatewayTypes"
              label="网关类型"
              no-data-text="暂无可选数据"
              :rules="objRules.gatewayTypeRule"
            >
              <template #selection="{ item }">
                <v-chip class="ma-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="protocol"
              class="my-0"
              color="primary"
              hide-selected
              :items="protocolTypes"
              label="协议"
              no-data-text="暂无可选数据"
              :rules="objRules.protocolTypeRule"
              @change="onProtocolChange"
            >
              <template #selection="{ item }">
                <v-chip class="ma-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.replicas"
              class="my-0"
              label="副本数"
              required
              :rules="objRules.replicasRule"
              type="number"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.baseDomain"
              class="my-0"
              label="默认域名"
              required
              :rules="objRules.baseDomainRule"
            >
              <template #append>
                <v-btn class="my-0" color="primary" small text @click="setDomain(obj)"> 使用默认域名 </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="6">
            <v-text-field v-model="image" class="my-0" label="镜像" required :rules="objRules.imageRule" />
          </v-col>
        </v-row>
      </v-card-text>

      <DataForm ref="dataForm" :data="obj.spec.configMapData" @addData="addData" @closeOverlay="closeExpand" />
      <BaseSubTitle title="配置项">
        <template #tips>
          <v-icon class="mt-n1 kubegems__pointer" color="warning" right small @click="help">
            mdi-information-variant
          </v-icon>
        </template>
      </BaseSubTitle>
      <v-card-text class="pa-2">
        <GatewayDataItem
          :data="obj.spec.configMapData"
          @expandCard="expandCard"
          @removeData="removeData"
          @updateData="updateData"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import GatewayDataItem from './GatewayDataItem';

  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required, positiveInteger } from '@/utils/rules';
  import DataForm from '@/views/resource/components/common/DataForm';

  export default {
    name: 'GatewayBaseForm',
    components: {
      DataForm,
      GatewayDataItem,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      gatewayTypes: [
        { text: '常规集群网关(NodePort)', value: 'NodePort' },
        { text: '外部负载均衡网关(LoadBalancer)', value: 'LoadBalancer' },
      ],
      protocolTypes: [
        { text: 'http/1.1', value: 'http/1.1' },
        { text: 'http/2(仅对启用ssl的服务生效)', value: 'http/2' },
      ],
      protocol: 'http/1.1',
      image: '',
      obj: {
        apiVersion: '',
        kind: 'TenantGateway',
        metadata: {
          name: '',
        },
        spec: {
          tenant: '',
          type: 'NodePort',
          replicas: 1,
          baseDomain: '',
          configMapData: {},
        },
      },
    }),
    computed: {
      ...mapState(['AdminViewport', 'ApiResources']),
      ...mapGetters(['Tenant']),
      objRules() {
        return {
          nameRule: [
            required,
            (v) => !v || !!new RegExp('^[a-z]([-a-z0-9]*[a-z0-9])?$').test(v) || '格式错误（以字母开头）',
          ],
          tenantRule: [required],
          gatewayTypeRule: [required],
          protocolTypeRule: [required],
          replicasRule: [positiveInteger],
          baseDomainRule: [(v) => !!v || "域名格式错误（支持通配符'*'）"],
          imageRule: [
            (v) => !v || !!new RegExp('^([\\w|/|\\.|-]+)[:|@]([\\w|\\.|-]+)$').test(v) || '格式错误（不符合镜像格式）',
          ],
        };
      },
    },
    watch: {
      item: {
        handler() {
          this.obj.apiVersion = this.ApiResources['tenantgateway'] || 'gems.kubegems.io/v1beta1';
          this.loadData();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async loadData() {
        this.$nextTick(() => {
          if (!this.item) {
            this.$refs.form.resetValidation();
          } else {
            this.obj = deepCopy(this.item);
          }

          if (!this.AdminViewport) {
            this.obj.spec.tenant = this.Tenant().TenantName;
          }
          if (!this.obj.spec.configMapData) {
            this.$set(this.obj.spec, 'configMapData', {});
          }
          this.m_select_tenantSelectData();
        });
      },
      addData(data) {
        this.obj.spec.configMapData = data;
        this.$refs.dataForm.closeCard();
        if (data['http2']) {
          if (data['http2'] === 'False') {
            this.protocol = 'http/1.1';
          } else if (data['http2'] === 'True') {
            this.protocol = 'http/2';
          }
        }
      },
      updateData(key) {
        const data = { key: key, value: this.obj.spec.configMapData[key] };
        this.$refs.dataForm.init(data);
        this.expand = true;
        if (key === 'http2') {
          if (this.obj.spec.configMapData[key] === 'False') {
            this.protocol = 'http/1.1';
          } else if (this.obj.spec.configMapData[key] === 'True') {
            this.protocol = 'http/2';
          }
        }
      },
      removeData(key) {
        if (key === 'http2') {
          this.protocol = 'http/1.1';
        }
        this.$delete(this.obj.spec.configMapData, key);
      },
      expandCard() {
        this.$nextTick(() => {
          this.$refs.dataForm.expandCard();
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs.dataForm.closeCard();
        this.$refs.form.reset();
        this.obj = this.$options.data().obj;
      },
      setDomain(obj) {
        obj.spec.baseDomain = `*.kubegems.io`;
      },
      help() {
        window.open(
          'https://docs.nginx.com/nginx-ingress-controller/configuration/global-configuration/configmap-resource/',
        );
      },
      onProtocolChange() {
        if (this.protocol === 'http/2') {
          this.$set(this.obj.spec.configMapData, 'http2', 'True');
        } else {
          this.$set(this.obj.spec.configMapData, 'http2', 'False');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      setData(data) {
        this.obj = data;
        if (this.obj.spec.image) {
          this.image = `${this.obj.spec.image.repository}:${this.obj.spec.image.tag}`;
        }
      },
      onTenantSelectFocus() {
        this.m_select_tenantSelectData();
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        if (this.image) {
          const repository = this.splitImage(this.image, 'image');
          const tag = this.splitImage(this.image, 'tag');
          this.obj.spec.image = {
            repository: repository,
            tag: tag,
            pullPolicy: 'IfNotPresent',
          };
        } else {
          delete this.obj.spec.image;
        }
        return this.obj;
      },
      splitImage(image, type) {
        const match = new RegExp('([\\w|/|\\.|-]+)?[:|@]?([\\w|\\.|-]+)?', 'g').exec(image);

        if (match) {
          if (type === 'image') {
            return match[1];
          } else if (type === 'tag') {
            return match[2];
          }
          return '';
        }
        return '';
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
