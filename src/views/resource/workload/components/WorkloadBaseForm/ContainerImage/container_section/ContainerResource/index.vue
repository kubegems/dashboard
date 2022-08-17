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
  <v-form v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
                <span>{{ $root.$t('resource.cpu') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.requests.cpu" label="Reuqests" required :rules="objRules.requestsCpuRule" />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.limits.cpu" label="Limits" required :rules="objRules.limitsCpuRule" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
                <span>{{ $root.$t('resource.memory') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.requests.memory"
                  label="Requests"
                  required
                  :rules="objRules.requestsMemoryRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.limits.memory" label="Limits" required :rules="objRules.limitsMemoryRule" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <ResourceLimit :container-copy="containerCopy" @removeData="removeData" @updateData="updateData" />
  </v-form>
</template>

<script>
  import messages from '../../../../../i18n';
  import ResourceLimit from './ResourceLimit';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ContainerResource',
    i18n: {
      messages: messages,
    },
    components: {
      ResourceLimit,
    },
    props: {
      container: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
          limits: {
            cpu: 2,
            memory: '4Gi',
          },
        },
        containerCopy: null,
      };
    },
    computed: {
      objRules() {
        return {
          requestsCpuRule: [
            (v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || this.$t('form.cpu_rule'),
          ],
          requestsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || this.$t('form.memory_rule'),
          ],
          limitsCpuRule: [
            (v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || this.$t('form.cpu_rule'),
            (v) => sizeOfCpu(v) >= sizeOfCpu(this.obj.requests.cpu) || this.$t('form.limit_lte_request_rule'),
          ],
          limitsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || this.$t('form.memory_rule'),
            (v) =>
              sizeOfStorage(v) >= sizeOfStorage(this.obj.requests.memory) || this.$t('form.limit_lte_request_rule'),
          ],
        };
      },
    },
    watch: {
      container() {
        if (this.container) this.containerCopy = deepCopy(this.container);
        else this.containerCopy = {};
      },
    },
    mounted() {
      if (this.container) this.containerCopy = deepCopy(this.container);
      else this.containerCopy = {};
    },
    methods: {
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.obj = {
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
          limits: {
            cpu: 2,
            memory: '4Gi',
          },
        };
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.$set(this.containerCopy, 'resources', this.obj);
          this.$emit('updateComponentData', this.containerCopy);
          this.closeCard();
        }
      },
      removeData() {
        this.$set(this.containerCopy, 'resources', null);
        this.$emit('updateComponentData', this.containerCopy);
      },
      updateData() {
        if (this.containerCopy && this.containerCopy.resources && this.containerCopy.resources.requests) {
          this.obj.requests = deepCopy(this.containerCopy.resources.requests);
        }
        if (this.containerCopy && this.containerCopy.resources && this.containerCopy.resources.limits) {
          this.obj.limits = deepCopy(this.containerCopy.resources.limits);
        }
        this.expandCard();
      },
    },
  };
</script>
