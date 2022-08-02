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
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-0 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-2">
          <v-row class="my-1 mx-0">
            <v-col cols="6">
              <v-text-field v-model="obj.name" class="my-0" label="名称" required :rules="objRules.nameRule" />
            </v-col>
          </v-row>

          <LabelForm ref="labelForm" :data="obj.labels" @addData="addLabelData" />
          <BaseSubTitle title="标签" />
          <v-card-text class="pa-2">
            <LabelItem
              :labels="obj.labels"
              @expandCard="expandLabelCard"
              @removeLabels="removeLabels"
              @updateLabels="updateLabels"
            />
            <div class="kubegems__clear-float" />
          </v-card-text>

          <BaseSubTitle title="流量策略" />
          <v-tabs v-model="tab" class="px-2 rounded-t mt-2 mb-3" height="30">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
          </v-tabs>

          <component
            :is="tabItems[tab].value"
            :ref="tabItems[tab].value"
            :traffic-policy="obj.trafficPolicy"
            @updateComponentData="updateComponentData"
          />
        </v-card-text>
        <v-card-actions class="pa-2">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import ConnectionPool from '@/views/microservice/service/components/destination_rule/policy/ConnectionPool';
  import LoadBalancer from '@/views/microservice/service/components/destination_rule/policy/LoadBalancer';
  import OutlierDetection from '@/views/microservice/service/components/destination_rule/policy/OutlierDetection';
  import PortLevelSettings from '@/views/microservice/service/components/destination_rule/policy/PortLevelSettings';
  import TLS from '@/views/microservice/service/components/destination_rule/policy/TLS';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import LabelItem from '@/views/resource/components/label/LabelItem';

  export default {
    name: 'SubnetTrafficPolicyForm',
    components: {
      ConnectionPool,
      LoadBalancer,
      LabelForm,
      LabelItem,
      OutlierDetection,
      PortLevelSettings,
      TLS,
    },
    data() {
      return {
        valid: false,
        obj: {
          index: -1,
          name: '',
          labels: {},
          trafficPolicy: {},
        },
        expand: false,
        tab: 0,
        tabItems: [
          { text: '负载均衡', value: 'LoadBalancer' },
          { text: '连接池', value: 'ConnectionPool' },
          { text: '异常检测', value: 'OutlierDetection' },
          { text: 'TLS', value: 'TLS' },
          { text: '端口级别设置', value: 'PortLevelSettings' },
        ],
        objRules: {
          nameRule: [required],
        },
      };
    },
    methods: {
      init(data) {
        this.obj = deepCopy(data);
        this.expandCard();
      },
      reset() {
        this.$refs.form.reset();
      },
      expandCard() {
        const tabsSliderWrappers = document.querySelectorAll('.v-tabs-slider-wrapper');
        if (tabsSliderWrappers) {
          for (const index in tabsSliderWrappers) {
            if (tabsSliderWrappers[index].style) {
              tabsSliderWrappers[index].style.width = `189px`;
            }
          }
        }
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$emit('closeOverlay');
        this.reset();
      },
      addData() {
        this.$emit('addData', deepCopy(this.obj));
        this.closeCard();
      },
      updateComponentData(data) {
        this.obj.trafficPolicy = data;
      },
      expandLabelCard() {
        this.$nextTick(() => {
          this.$refs.labelForm.expandCard();
          this.expand = true;
        });
      },
      addLabelData(data) {
        this.obj.labels = data;
      },
      removeLabels(key) {
        this.$delete(this.obj.labels, key);
      },
      updateLabels(key) {
        const data = { key: key, value: this.obj.labels[key] };
        this.$nextTick(() => {
          this.$refs.labelForm.init(data);
          this.expand = true;
        });
      },
    },
  };
</script>
