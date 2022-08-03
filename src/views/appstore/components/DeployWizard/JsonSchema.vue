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
  <v-form ref="form" v-model="valid" class="pa-0 ma-0" lazy-validation @submit.prevent>
    <v-flex v-if="isRender" class="pa-0 ma-0">
      <Param
        v-for="(param, index) in params"
        :id="`p${index}`"
        :key="`p${index}`"
        :all-params="params"
        :app-values="appValues"
        class="mt-0"
        :cluster-name="clusterName"
        :param="param"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </v-flex>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import Param from './Param';
  import { getAppStoreDetail } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import { deepCopy } from '@/utils/helpers';
  import { YamlMixin } from '@/views/appstore/mixins/yaml';

  export default {
    name: 'JsonSchema',
    components: {
      Param,
    },
    mixins: [BaseResource, BaseSelect, YamlMixin],
    props: {
      appValues: {
        type: Object,
        default: () => {},
      },
      clusterName: {
        type: String,
        default: () => '',
      },
      params: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        selectVersion: null,
        versions: [],
        allApps: [],
        valid: false,
        obj: {
          AppName: '',
          TenantProjectId: '',
          EnvironmentId: '',
          app: null,
        },
        isRender: true,
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
    },
    methods: {
      changeAppVersion() {
        for (const k in this.allApps) {
          if (this.allApps[k].version === this.selectVersion) {
            this.currentApp = this.allApps[k];
          }
        }
      },
      async appStoreDetail() {
        if (this.dialog === false) {
          return;
        }
        const res = await getAppStoreDetail(this.obj.app.name);
        this.allApps = res;
        for (const k in res) {
          this.versions.push(res[k].version);
        }
        if (!this.selectVersion) {
          this.selectVersion = this.versions[0];
        }
        this.currentApp = this.allApps[0];
      },
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(this.obj, deepCopy(data));
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      reset() {
        this.$refs.form.reset();
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
