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
    <component
      :is="steps[step]"
      :ref="steps[step]"
      :app="app"
      :edit="edit"
      :item="item"
      :kind="kind"
      :kinds="kindItems"
      :manifest="true"
      @change="onKindChange"
    />
  </v-form>
</template>

<script>
  import AppBaseInfo from './AppBaseInfo';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';
  import ConfigMapBaseForm from '@/views/resource/configmap/components/ConfigMapBaseForm';
  import CronJobContaninerImage from '@/views/resource/cronjob/components/CronjobBaseForm/ContainerImage';
  import CronJobBaseInfo from '@/views/resource/cronjob/components/CronjobBaseForm/CronJobBaseInfo';
  import CronJobStorageMount from '@/views/resource/cronjob/components/CronjobBaseForm/StorageMount';
  import IngressBaseForm from '@/views/resource/ingress/components/IngressBaseForm';
  import JobBaseInfo from '@/views/resource/job/components/JobBaseForm/JobBaseInfo';
  import PersistentVolumeClaimBaseForm from '@/views/resource/persistentvolumeclaim/components/PersistentVolumeClaimBaseForm';
  import SecretBaseForm from '@/views/resource/secret/components/SecretBaseForm';
  import ServiceBaseForm from '@/views/resource/service/components/ServiceBaseForm';
  import ContaninerImage from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage';
  import DeployPolicy from '@/views/resource/workload/components/WorkloadBaseForm/DeployPolicy';
  import ScheduleSelector from '@/views/resource/workload/components/WorkloadBaseForm/ScheduleSelector';
  import StorageMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount';
  import WorkloadBaseInfo from '@/views/resource/workload/components/WorkloadBaseForm/WorkloadBaseInfo';

  export default {
    name: 'AppResourceBaseForm',
    components: {
      AppBaseInfo,
      ConfigMapBaseForm,
      ContaninerImage,
      CronJobBaseInfo,
      CronJobContaninerImage,
      CronJobStorageMount,
      DeployPolicy,
      IngressBaseForm,
      JobBaseInfo,
      PersistentVolumeClaimBaseForm,
      ScheduleSelector,
      SecretBaseForm,
      ServiceBaseForm,
      StorageMount,
      WorkloadBaseInfo,
    },
    mixins: [BaseResource, BaseSelect],
    props: {
      app: {
        type: Object,
        default: () => null,
      },
      edit: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => '',
      },
      step: {
        type: Number,
        default: () => 0,
      },
    },
    data: () => ({
      valid: false,
      steps: ['AppBaseInfo'],
    }),
    computed: {
      obj() {
        return this.$refs[this.steps[this.step]].getData();
      },
      kindItems() {
        return this.app
          ? this.app.kind && this.app.kind.length > 0
            ? this.m_select_resourceItems.concat({
                text: this.$root.$t(`resource.${this.app.kind.toLowerCase()}`),
                value: this.app.kind,
              })
            : this.m_select_resourceItems.concat(this.defaultKindItems)
          : [];
      },
      defaultKindItems() {
        return [
          {
            text: this.$root.$t('resource.deployment'),
            value: 'Deployment',
          },
          {
            text: this.$root.$t('resource.daemonset'),
            value: 'DaemonSet',
          },
          {
            text: this.$root.$t('resource.statefulset'),
            value: 'StatefulSet',
          },
        ];
      },
    },
    methods: {
      init(data, cyclic = false) {
        if (cyclic) {
          if (data && data.kind) {
            this.onKindChange(data.kind, true, data);
          }
        } else {
          this.$refs[this.steps[this.step]].init(data);
        }
      },
      back(data) {
        this.$refs[this.steps[this.step]].back(data);
      },
      checkSaved() {
        return this.$refs[this.steps[this.step]].checkSaved();
      },
      validate() {
        return this.$refs[this.steps[this.step]].validate();
      },
      reset() {
        this.$refs[this.steps[this.step]].reset();
        this.$set(this, 'steps', ['AppBaseInfo']);
      },
      onKindChange(kind, init = false, data = null) {
        let step = 1;
        if (['Deployment', 'DaemonSet', 'StatefulSet'].indexOf(kind) > -1) {
          this.$set(this, 'steps', [
            'WorkloadBaseInfo',
            'ContaninerImage',
            'StorageMount',
            'ScheduleSelector',
            'DeployPolicy',
          ]);
          step = 5;
        } else if (kind === 'Job') {
          this.$set(this, 'steps', ['JobBaseInfo', 'ContaninerImage', 'StorageMount', 'ScheduleSelector']);
          step = 4;
        } else if (kind === 'CronJob') {
          this.$set(this, 'steps', [
            'CronJobBaseInfo',
            'CronJobContaninerImage',
            'CronJobStorageMount',
            'ScheduleSelector',
          ]);
          step = 4;
        } else if (kind === 'Service') {
          this.$set(this, 'steps', ['ServiceBaseForm']);
        } else if (kind === 'Secret') {
          this.$set(this, 'steps', ['SecretBaseForm']);
        } else if (kind === 'ConfigMap') {
          this.$set(this, 'steps', ['ConfigMapBaseForm']);
        } else if (kind === 'PersistentVolumeClaim') {
          this.$set(this, 'steps', ['PersistentVolumeClaimBaseForm']);
        } else if (kind === 'Ingress') {
          this.$set(this, 'steps', ['IngressBaseForm']);
        }
        this.$emit('change', kind, step, init, data);
      },
      getData() {
        return this.obj;
      },
    },
  };
</script>
