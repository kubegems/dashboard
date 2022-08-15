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
    <v-expand-transition>
      <v-card v-show="expand" class="mb-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-sheet class="pt-4 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>{{ $root.$t('resource.cpu_c', [$root.$t('resource.container')]) }}</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.default.cpu"
              class="mt-0 pt-0"
              :label="$t('tip.default')"
              :rules="objRules.container.cpuDefaultMinRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.defaultRequest.cpu"
              class="mt-0 pt-0"
              :label="$t('tip.default_reauest')"
              :rules="objRules.container.cpuDefaultRequestMinRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.max.cpu"
              class="mt-0 pt-0"
              :label="$t('tip.limit')"
              :rules="objRules.container.cpuMaxRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>{{ $root.$t('resource.memory_c', [$root.$t('resource.container')]) }}</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.default.memory"
              class="mt-0 pt-0"
              :label="$t('tip.default')"
              :rules="objRules.container.memoryDefaultRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.defaultRequest.memory"
              class="mt-0 pt-0"
              :label="$t('tip.default_reauest')"
              :rules="objRules.container.memoryDefaultRequestRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.max.memory"
              class="mt-0 pt-0"
              :label="$t('tip.limit')"
              :rules="objRules.container.memoryMaxRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>{{ $root.$t('resource.cpu_c', [$root.$t('resource.pod')]) }}</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Pod.max.cpu"
              class="mt-0 pt-0"
              :label="$t('tip.limit')"
              :rules="objRules.pod.cpuMaxRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left">
            <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
              <span>{{ $root.$t('resource.memory_c', [$root.$t('resource.pod')]) }}</span>
            </v-flex>
            <v-flex class="float-left ml-2">
              <v-text-field
                v-model="obj.LimitRange.Pod.max.memory"
                class="mt-0 pt-0"
                :label="$t('tip.limit')"
                :rules="objRules.pod.memoryMaxRule"
                :style="{ width: `120px` }"
              />
            </v-flex>
            <v-flex class="float-left ml-2">
              <v-flex :style="{ width: `120px` }" />
            </v-flex>
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>{{ $t('tip.storage_capacity') }}</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.PersistentVolumeClaim.max.storage"
              class="mt-0 pt-0"
              :label="$t('tip.limit')"
              :rules="objRules.persistentVolumeClaim.storageMaxRule"
              :style="{ width: `120px` }"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import messages from '../../i18n';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'LimitRange',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      obj: {
        LimitRange: {
          Container: {
            default: {
              cpu: '500m',
              memory: '1Gi',
            },
            defaultRequest: {
              cpu: '10m',
              memory: '10Mi',
            },
            min: {
              cpu: '0',
              memory: '0Mi',
            },
            max: {
              cpu: '24',
              memory: '48Gi',
            },
          },
          Pod: {
            min: {
              cpu: '0',
              memory: '0Mi',
            },
            max: {
              cpu: '48',
              memory: '64Gi',
            },
          },
          PersistentVolumeClaim: {
            min: {
              storage: '0Mi',
            },
            max: {
              storage: '1Ti',
            },
          },
        },
      },
    }),
    computed: {
      objRules() {
        return {
          container: {
            cpuDefaultMinRule: [(v) => !!new RegExp('^\\d+[m]?$').test(v) || this.$t('form.cpu_format_rule')],
            cpuDefaultRequestMinRule: [(v) => !!new RegExp('^\\d+[m]?$').test(v) || this.$t('form.cpu_format_rule')],
            cpuMaxRule: [
              (v) => !!new RegExp('^\\d+[m]?$').test(v) || this.$t('form.cpu_format_rule'),
              (v) =>
                sizeOfCpu(v) >= sizeOfCpu(this.obj.LimitRange.Container.defaultRequest.cpu) ||
                this.$t('form.limit_request_rule'),
            ],
            memoryDefaultRule: [
              (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || this.$t('form.memory_format_rule'),
            ],
            memoryDefaultRequestRule: [
              (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || this.$t('form.memory_format_rule'),
            ],
            memoryMaxRule: [
              (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || this.$t('form.memory_format_rule'),
              (v) =>
                sizeOfStorage(v) >= sizeOfStorage(this.obj.LimitRange.Container.defaultRequest.memory) ||
                this.$t('form.limit_request_rule'),
            ],
          },
          pod: {
            cpuMaxRule: [
              (v) => !!new RegExp('^\\d+[m]?$').test(v) || this.$t('form.cpu_format_rule'),
              (v) => sizeOfCpu(v) >= sizeOfCpu(this.obj.LimitRange.Pod.min.cpu) || this.$t('form.limit_request_rule'),
            ],
            memoryMaxRule: [
              (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || this.$t('form.memory_format_rule'),
              (v) =>
                sizeOfStorage(v) >= sizeOfStorage(this.obj.LimitRange.Pod.min.memory) ||
                this.$t('form.limit_request_rule'),
            ],
          },
          persistentVolumeClaim: {
            storageMaxRule: [
              (v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || this.$t('form.storage_format_rule'),
              (v) =>
                sizeOfStorage(v) >= sizeOfStorage(this.obj.LimitRange.PersistentVolumeClaim.min.storage) ||
                this.$t('form.limit_request_rule'),
            ],
          },
        };
      },
    },
    watch: {
      data() {
        this.obj = deepCopy(this.data.data);
      },
    },
    mounted() {
      if (this.data) {
        this.obj = deepCopy(this.data.data);
      }
    },
    methods: {
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.obj);
          this.$emit('addData', data);
        }
      },
      closeCard() {
        this.expand = false;
        if (this.data) {
          this.obj = deepCopy(this.data.data);
        }
        this.$emit('closeOverlay');
      },
    },
  };
</script>
