<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <component
      :is="steps[step]"
      :ref="steps[step]"
      :app="app"
      :edit="edit"
      :item="item"
      :kind="kind"
      :kinds="
        app
          ? app.kind && app.kind.length > 0
            ? m_select_resourceItems.concat({
                text: $RESOURCE_SHORT_CN[app.kind],
                value: app.kind,
              })
            : m_select_resourceItems.concat(defaultKindItems)
          : []
      "
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
      defaultKindItems: [
        {
          text: '无状态服务',
          value: 'Deployment',
        },
        {
          text: '守护进程服务',
          value: 'DaemonSet',
        },
        {
          text: '有状态服务',
          value: 'StatefulSet',
        },
      ],
    }),
    computed: {
      obj() {
        return this.$refs[this.steps[this.step]].getData();
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
