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
        <v-card-text class="pa-0">
          <BaseSubTitle title="匹配策略" />
          <L4MatchAttributesForm :match="tcp.match" @updateComponentData="updateMatchComponentData" />

          <BaseSubTitle title="路由策略" />
          <RouteDestinationForm :route="tcp.route" @updateComponentData="updateRouteComponentData" />
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
  import { deepCopy } from '@/utils/helpers';
  import L4MatchAttributesForm from '@/views/microservice/service/components/virtual_service/match/L4MatchAttributesForm';
  import RouteDestinationForm from '@/views/microservice/service/components/virtual_service/route/RouteDestinationForm';

  export default {
    name: 'TcpForm',
    components: {
      L4MatchAttributesForm,
      RouteDestinationForm,
    },
    props: {
      data: {
        type: Array,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        tcpCopy: [],
        tcp: {},
      };
    },
    watch: {
      data() {
        this.tcpCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.data) {
        this.tcpCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        if (data) {
          this.tcp = deepCopy(data);
        } else {
          this.tcp = {
            index: -1,
            match: [],
            route: [],
          };
        }
        this.expand = true;
      },
      updateMatchComponentData(data) {
        this.tcp.match = data;
      },
      updateRouteComponentData(data) {
        this.tcp.route = data;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.tcp);
          delete data['index'];
          if (this.tcp.index === -1) {
            this.tcpCopy.push(data);
          } else {
            this.$set(this.tcpCopy, this.tcp.index, data);
          }
          this.$emit('addData', this.tcpCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.tcp.index = -1;
        this.$emit('closeOverlay');
      },
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
