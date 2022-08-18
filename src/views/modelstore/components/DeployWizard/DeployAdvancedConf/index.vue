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
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    :style="{ height: `${height}px`, overflowY: 'auto' }"
    @submit.prevent
  >
    <div class="deploy__tip">
      <div class="float-right mr-2">
        <img alt="Seldon Core" class="mt-1" height="24px" src="/icon/seldon.svg" />
      </div>
      <div class="float-right mr-2 font-weight-medium">Provider By</div>
      <div class="float-left mr-2 font-weight-medium"> ModelDeployment </div>
      <div class="kubegems__clear-float" />
    </div>

    <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="部署信息" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            v-model="obj.server.kind"
            hide-no-data
            hide-selected
            :items="implementationItems"
            label="运行时"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
            :rules="objRules.implementationRules"
          >
            <template #selection="{ item }">
              <v-chip small>
                <BaseLogo class="white--text mt-1" :icon-name="item.icon" :ml="0" :width="20" />
                <span class="ml-2"> {{ item.text }}</span>
              </v-chip>
            </template>
            <template #item="{ item }">
              <BaseLogo class="white--text mt-2" :icon-name="item.icon" :ml="0" :width="24" />
              <span class="ml-2"> {{ item.text }}</span>
            </template>
          </v-autocomplete>

          <v-autocomplete
            v-if="obj.server.kind !== ''"
            v-model="obj.server.protocol"
            hide-no-data
            hide-selected
            :items="protocolItems"
            label="协议"
            :menu-props="{
              bottom: true,
              left: true,
              origin: `top center`,
            }"
            :rules="objRules.protocolRules"
          >
            <template #selection="{ item }">
              <v-chip class="my-1" color="primary" small text-color="white">
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>

          <v-text-field
            v-if="obj.server.kind === ''"
            v-model="obj.server.image"
            label="镜像"
            :rules="objRules.imageRules"
          />

          <v-text-field
            v-if="obj.server.kind === ''"
            v-model="obj.model.license"
            label="License"
            :rules="objRules.licenseRules"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <ResourceConf ref="resourceConf" :base="base" :spec="spec" />

    <v-switch v-model="advanced" class="ml-3" label="高级配置" />

    <template v-if="advanced">
      <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="访问信息" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="obj.ingress.host" label="访问域名" />

            <v-autocomplete
              v-model="gateway"
              hide-no-data
              hide-selected
              :items="gatewayItems"
              label="网关"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
              }"
              :rules="objRules.gatewayRules"
              @change="onGatewayChange"
            >
              <template #selection="{ item }">
                <v-chip class="my-1" color="primary" small text-color="white">
                  {{ item.text }}
                </v-chip>
              </template>
            </v-autocomplete>

            <Port v-model="obj.server.ports" />
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="obj.server.kind === ''">
        <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="模型挂载" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="obj.server.mountPath" label="挂载路径" />
            </v-col>
          </v-row>
        </v-card-text>

        <BaseSubTitle class="mt-3" color="grey lighten-3" :divider="false" title="启动参数" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <Env v-model="obj.server.env" />

              <Command v-model="obj.server.command" />

              <Args v-model="obj.server.args" />
            </v-col>
          </v-row>
        </v-card-text>
      </template>
    </template>
  </v-form>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import Args from './Args';
  import Command from './Command';
  import Env from './Env';
  import Port from './Port';
  import ResourceConf from './ResourceConf';
  import { getModelSourceDetail, getGatewayOriginList } from '@/api';
  import { required } from '@/utils/rules';

  export default {
    name: 'DeployAdvancedConf',
    components: {
      Args,
      Command,
      Env,
      Port,
      ResourceConf,
    },
    props: {
      base: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
      spec: {
        type: Object,
        default: () => null,
      },
    },
    data: function () {
      return {
        valid: false,
        advanced: false,
        imageItems: [],
        protocolItems: [
          { text: 'seldon', value: 'seldon' },
          { text: 'tensorflow', value: 'tensorflow' },
          { text: 'v2', value: 'v2' },
        ],
        gateway: '',
        gatewayItems: [],
        obj: {
          model: {
            name: '',
            url: '',
            version: '',
            source: '',
            license: '',
          },
          server: {
            args: [],
            command: [],
            env: [],
            image: '',
            ports: [],
            mountPath: '',
            protocol: 'v2',
          },
          resources: {
            limits: {
              cpu: 2,
              memory: '4Gi',
            },
          },
          replicas: 1,
          ingress: {
            className: '',
            gatewayName: '',
            host: '',
          },
        },
        objRules: {
          imageRules: [required],
          protocolRules: [required],
          implementationRules: [(v) => !!(v?.trim()?.length > 0 || v === '') || '必填项'],
          gatewayRules: [required],
          licenseRules: [required],
        },
      };
    },
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant']),
      height() {
        return parseInt((window.innerHeight - 190) / this.Scale);
      },
      gatewayObj() {
        const gateway = this.gatewayItems.find((g) => {
          return g.value === this.gateway;
        });
        if (gateway) return gateway.obj;
        return null;
      },
      implementationItems() {
        if (this.$route.query.registry === 'huggingface') {
          return [{ text: 'huggingface server', value: 'HUGGINGFACE_SERVER', icon: 'huggingface' }];
        }
        if (this.$route.query.registry === 'openmmlab') {
          return [{ text: 'openmmlab server', value: 'OPENMMLAB_SERVER', icon: 'openmmlab' }];
        }
        return [
          { text: 'huggingface server', value: 'HUGGINGFACE_SERVER', icon: 'huggingface' },
          { text: 'openmmlab server', value: 'OPENMMLAB_SERVER', icon: 'openmmlab' },
          { text: 'tensorflow server', value: 'TENSORFLOW_SERVER', icon: 'tensorflow' },
          { text: 'sklearn server', value: 'SKLEARN_SERVER', icon: 'sklearn' },
          { text: 'triton server', value: 'TRITON_SERVER', icon: 'triton' },
          { text: 'mlflow server', value: 'MLFLOW_SERVER', icon: 'mlflow' },
          { text: 'xgboost server', value: 'XGBOOST_SERVER', icon: 'xgboost' },
          { text: 'custom server', value: '', icon: 'kubegems' },
        ];
      },
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.modelSourceDetail();
          }
        },
        deep: true,
        immediate: true,
      },
      base: {
        handler(newValue) {
          if (newValue && newValue.cluster) {
            this.gatewayList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      if (this.$route.query.registry === 'huggingface') {
        this.obj.server.kind = 'HUGGINGFACE_SERVER';
      } else if (this.$route.query.registry === 'openmmlab') {
        this.obj.server.kind = 'OPENMMLAB_SERVER';
      }
    },
    methods: {
      async modelSourceDetail() {
        const data = await getModelSourceDetail(this.item.source);
        this.imageItems = data.images.map((i) => {
          return { text: i, value: i };
        });
      },
      async gatewayList() {
        const data = await getGatewayOriginList(this.base.cluster, { size: 1000 });
        this.gatewayItems = data.List.map((d) => {
          if (d.spec.tenant === this.Tenant().TenantName) {
            return { text: d.metadata.name, value: d.metadata.name, obj: d };
          }
        });
      },
      validate() {
        return this.$refs.form.validate(true) && this.$refs.resourceConf.validate();
      },
      getData() {
        const data = this.$refs.resourceConf.getData();
        this.obj.server.resources = data.server.resources;
        this.obj.replicas = data.replicas;
        return this.obj;
      },
      reset() {
        this.$refs.form.resetValidation() && this.$refs.resourceConf.reset();
      },
      onGatewayChange() {
        if (this.gatewayObj.spec?.ingressClass) {
          this.obj.ingress.className = this.gatewayObj.spec?.ingressClass;
        } else {
          this.obj.ingress.gatewayName = this.gatewayObj.metadata.name;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .deploy {
    &__tip {
      line-height: 32px;
    }
  }
</style>
