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
          <v-tabs v-model="tab" class="px-2 rounded-t mt-2 mb-3" height="30">
            <v-tab v-for="item in tabItems" :key="item.value">
              {{ item.text }}
            </v-tab>
          </v-tabs>

          <component
            :is="tabItems[tab].value"
            :ref="tabItems[tab].value"
            :traffic-policy="obj"
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
  import ConnectionPool from '@/views/microservice/service/components/destination_rule/policy/ConnectionPool';
  import LoadBalancer from '@/views/microservice/service/components/destination_rule/policy/LoadBalancer';
  import OutlierDetection from '@/views/microservice/service/components/destination_rule/policy/OutlierDetection';
  import PortLevelSettings from '@/views/microservice/service/components/destination_rule/policy/PortLevelSettings';
  import TLS from '@/views/microservice/service/components/destination_rule/policy/TLS';

  export default {
    name: 'TrafficPolicyForm',
    components: {
      ConnectionPool,
      LoadBalancer,
      OutlierDetection,
      PortLevelSettings,
      TLS,
    },
    data() {
      return {
        valid: false,
        obj: {},
        expand: false,
        tab: 0,
        tabItems: [
          { text: '负载均衡', value: 'LoadBalancer' },
          { text: '连接池', value: 'ConnectionPool' },
          { text: '异常检测', value: 'OutlierDetection' },
          { text: 'TLS', value: 'TLS' },
          { text: '端口级别设置', value: 'PortLevelSettings' },
        ],
      };
    },
    methods: {
      init(data) {
        if (data) {
          this.obj = deepCopy(data);
        } else {
          this.obj = {};
        }
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
        this.obj = data;
      },
    },
  };
</script>
