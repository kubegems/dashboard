<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="istio虚拟服务定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              required
              label="流量规则名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.host"
              class="my-0"
              required
              label="服务名称(host)"
              :rules="objRules.hostRule"
            />
          </v-col>
          <v-col v-if="obj.spec.exportTo" cols="12">
            <v-combobox
              v-model="exportTo"
              hide-no-data
              :items="[]"
              :search-input.sync="exportToText"
              multiple
              small-chips
              height="32"
              label="exportTo(回车)"
              @change="onExportToChange"
              @keydown.enter="createExportTo"
            >
              <template #selection="{ item }">
                <v-chip small color="primary" class="pa-1">
                  <span>
                    {{ item.text }}
                  </span>
                  <v-icon small @click="removeExportTo(item)"> mdi-close </v-icon>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'trafficPolicy')">
        <TrafficPolicyForm
          ref="trafficPolicyForm"
          :data="obj.spec.trafficPolicy"
          @addData="addTrafficPolicyData"
          @closeOverlay="closeExpand"
        />
        <BaseSubTitle title="流量策略" />
        <v-card-text class="pa-2">
          <TrafficPolicyItem
            :traffic-policy="obj.spec.trafficPolicy"
            @updateTrafficPolicy="updateTrafficPolicy"
            @removeTrafficPolicy="removeTrafficPolicy"
            @expandCard="expandTrafficPolicyCard"
          />
        </v-card-text>
      </template>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'subsets')">
        <SubnetTrafficPolicyForm
          ref="subnetTrafficPolicyForm"
          @addData="addSubnetTrafficPolicyData"
          @closeOverlay="closeExpand"
        />
        <BaseSubTitle title="流量策略子集" />
        <v-card-text class="pa-2">
          <SubnetTrafficPolicyItem
            :subsets="obj.spec.subsets"
            @updateSubnetTrafficPolicy="updateSubnetTrafficPolicy"
            @removeSubnetTrafficPolicy="removeSubnetTrafficPolicy"
            @expandCard="expandSubnetTrafficPolicyCard"
          />
        </v-card-text>
      </template>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';
  import TrafficPolicyItem from './TrafficPolicyItem';
  import TrafficPolicyForm from './TrafficPolicyForm';
  import SubnetTrafficPolicyItem from './SubnetTrafficPolicyItem';
  import SubnetTrafficPolicyForm from './SubnetTrafficPolicyForm';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'IstioDestinationRuleBaseForm',
    components: {
      TrafficPolicyItem,
      TrafficPolicyForm,
      SubnetTrafficPolicyItem,
      SubnetTrafficPolicyForm,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      obj: {
        apiVersion: 'networking.istio.io/v1beta1',
        kind: 'DestinationRule',
        metadata: {
          name: '',
          namespace: null,
        },
        spec: {
          host: '',
          trafficPolicy: {},
          subsets: [],
          exportTo: [],
        },
      },
      exportTo: [],
      exportToText: '',
    }),
    computed: {
      ...mapState(['EnvironmentFilter', 'ApiResources']),
      objRules() {
        return {
          nameRule: [required, k8sName],
          hostRule: [required],
        };
      },
    },
    watch: {
      item() {
        this.$nextTick(() => {
          this.obj.apiVersion = this.ApiResources['destinationrule'] || 'networking.istio.io/v1beta1';
          this.obj = deepCopy(this.item);
          this.obj.metadata.namespace = this.EnvironmentFilter.namespace;
          this.loaddata();
        });
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.obj.metadata.namespace = this.EnvironmentFilter.namespace;
        this.loaddata();
      });
    },
    methods: {
      loaddata() {
        if (this.obj.spec.exportTo) {
          this.obj.spec.exportTo.forEach((e, index) => {
            this.exportTo.push({
              text: e,
              value: index,
            });
          });
        }
      },
      onExportToChange() {
        const exportTo = this.exportTo.filter((to) => {
          return to !== '' && typeof to === 'object';
        });
        this.exportTo = exportTo;
        this.obj.spec.exportTo = exportTo.map((to) => {
          return to.text;
        });
      },
      createExportTo() {
        if (!this.exportToText) return;
        const index = this.exportTo.length;
        this.exportTo.push({
          text: this.exportToText,
          value: index,
        });
        this.exportToText = '';
      },
      removeExportTo(item) {
        const exportTo = this.exportTo.filter((to) => {
          return to.value !== item.value;
        });
        this.exportTo = exportTo;
      },
      closeExpand() {
        this.expand = false;
      },
      addTrafficPolicyData(data) {
        this.obj.spec.trafficPolicy = data;
      },
      expandTrafficPolicyCard() {
        this.$nextTick(() => {
          this.$refs.trafficPolicyForm.init();
          this.expand = true;
        });
      },
      expandSubnetTrafficPolicyCard() {
        this.$nextTick(() => {
          this.$refs.subnetTrafficPolicyForm.expandCard();
          this.expand = true;
        });
      },
      updateTrafficPolicy() {
        const data = this.obj.spec.trafficPolicy;
        this.$nextTick(() => {
          this.$refs.trafficPolicyForm.init(data);
          this.expand = true;
        });
      },
      removeTrafficPolicy() {
        this.$set(this.obj.spec, 'trafficPolicy', {});
      },
      addSubnetTrafficPolicyData(data) {
        const obj = deepCopy(data);
        delete obj['index'];
        if (data.index === -1) {
          this.obj.spec.subsets.push(obj);
        } else {
          this.$set(this.obj.spec.subsets, data.index, obj);
        }
      },
      updateSubnetTrafficPolicy(index) {
        const subnet = this.obj.spec.subsets[index];
        const data = { index: index, ...subnet };
        this.$nextTick(() => {
          this.$refs.subnetTrafficPolicyForm.init(data);
          this.expand = true;
        });
      },
      removeSubnetTrafficPolicy(index) {
        this.$delete(this.obj.spec.subsets, index);
      },
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        if (this.$refs.trafficPolicyForm) this.$refs.trafficPolicyForm.closeCard();
        this.exportTo = [];
        this.$refs.form.reset();
      },
      // eslint-disable-next-line vue/no-unused-properties
      setData(data) {
        this.obj = data;
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
