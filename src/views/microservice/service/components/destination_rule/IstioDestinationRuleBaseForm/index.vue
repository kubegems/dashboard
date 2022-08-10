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
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="istio虚拟服务定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              label="流量规则名称"
              :readonly="edit"
              required
              :rules="objRules.nameRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.host"
              class="my-0"
              label="服务名称(host)"
              required
              :rules="objRules.hostRule"
            />
          </v-col>
          <v-col v-if="obj.spec.exportTo" cols="12">
            <v-combobox
              v-model="exportTo"
              height="32"
              hide-no-data
              :items="[]"
              label="exportTo(回车)"
              multiple
              :search-input.sync="exportToText"
              small-chips
              @change="onExportToChange"
              @keydown.enter="createExportTo"
            >
              <template #selection="{ item }">
                <v-chip close close-icon="mdi-close-circle" color="primary" small @click:close="removeExportTo(item)">
                  <span>
                    {{ item.text }}
                  </span>
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
            @expandCard="expandTrafficPolicyCard"
            @removeTrafficPolicy="removeTrafficPolicy"
            @updateTrafficPolicy="updateTrafficPolicy"
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
            @expandCard="expandSubnetTrafficPolicyCard"
            @removeSubnetTrafficPolicy="removeSubnetTrafficPolicy"
            @updateSubnetTrafficPolicy="updateSubnetTrafficPolicy"
          />
        </v-card-text>
      </template>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapState } from 'vuex';

  import SubnetTrafficPolicyForm from './SubnetTrafficPolicyForm';
  import SubnetTrafficPolicyItem from './SubnetTrafficPolicyItem';
  import TrafficPolicyForm from './TrafficPolicyForm';
  import TrafficPolicyItem from './TrafficPolicyItem';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { k8sName, required } from '@/utils/rules';

  export default {
    name: 'IstioDestinationRuleBaseForm',
    components: {
      SubnetTrafficPolicyForm,
      SubnetTrafficPolicyItem,
      TrafficPolicyForm,
      TrafficPolicyItem,
    },
    mixins: [BaseResource],
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
      reset() {
        if (this.$refs.trafficPolicyForm) this.$refs.trafficPolicyForm.closeCard();
        this.exportTo = [];
        this.$refs.form.reset();
      },
      setData(data) {
        this.obj = data;
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
