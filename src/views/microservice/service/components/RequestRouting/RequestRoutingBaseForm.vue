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

      <BaseSubTitle :title="$t('tip.match_header')" />
      <StringMatchForm :data="obj.match[0].headers" @addData="addHeaderData" />

      <BaseSubTitle :title="$t('tip.match_uri')" />
      <UriMatchForm :data="obj.match[0].uri" @addData="addUriData" />

      <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.route')])" />
      <v-card-text class="pa-2">
        <v-row v-for="(workload, index) in serviceCopy ? serviceCopy.workloads : []" :key="index">
          <v-col cols="6">
            <v-text-field
              class="my-0"
              :label="$t('form.destination_workload')"
              readonly
              required
              :value="workload.name"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.route[index].weight"
              class="my-0"
              :label="$t('form.traffic_weight')"
              required
              :rules="objRules[index].weightRule"
              suffix="%"
              type="number"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';
  import StringMatchForm from '@/views/resource/deploy/components/deploy_policy/traffic/HeaderTraffic/StringMatchForm';
  import UriMatchForm from '@/views/resource/deploy/components/deploy_policy/traffic/UriTraffic/UriMatchForm';

  export default {
    name: 'RequestRoutingBaseForm',
    i18n: {
      messages: messages,
    },
    components: {
      StringMatchForm,
      UriMatchForm,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      service: {
        type: Object,
        default: () => null,
      },
      vs: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      serviceCopy: null,
      routeDefault: {
        destination: {
          host: '',
          subset: '',
        },
        weight: 100,
      },
      obj: {
        match: [
          {
            headers: {},
            uri: {},
          },
        ],
        route: [],
      },
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      objRules() {
        const rules = [];
        if (this.serviceCopy) {
          this.serviceCopy.workloads.forEach(() => {
            rules.push({
              weightRule: [
                required,
                (v) => !!(parseInt(v) <= 100 && parseInt(v) >= 0) || this.$t('form.limit_100_rule'),
              ],
            });
          });
        }
        return rules;
      },
    },
    watch: {
      vs: {
        handler: function () {
          if (this.vs) this.loadData(true);
        },
        deep: true,
        immediate: true,
      },
      service: {
        handler: function () {
          this.initObj();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      initObj() {
        this.serviceCopy = deepCopy(this.service);
        this.obj.route = [];
        if (this.serviceCopy) {
          const length = this.serviceCopy.workloads.length;
          const weight = parseInt(100 / length);
          const remainder = 100 % length;
          this.serviceCopy.workloads.forEach((w, index) => {
            const route = deepCopy(this.routeDefault);
            route.destination.host = `${this.serviceCopy.service.name}.${this.serviceCopy.service.namespace.name}.svc.cluster.local`;
            route.destination.subset = `${w.labels.version ? w.labels.version : ''}`;
            if (length === index + 1) {
              route.weight = weight + remainder;
            } else {
              route.weight = weight;
            }
            this.obj.route.push(route);
          });
        }
      },
      loadData(cover = false) {
        this.$nextTick(() => {
          if (cover) {
            this.obj = deepCopy(this.vs);
          }
        });
      },
      reset() {
        this.serviceCopy = null;
        this.$refs.form.resetValidation();
        this.obj = deepCopy(this.$options.data().obj);
      },
      addHeaderData(data) {
        this.obj.match[0].headers = data;
      },
      addUriData(data) {
        this.obj.match[0].uri = data;
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
