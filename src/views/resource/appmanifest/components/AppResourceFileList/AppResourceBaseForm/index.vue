<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <component
      :is="steps[step]"
      :ref="steps[step]"
      :item="item"
      :edit="edit"
      :kind="kind"
      :manifest="true"
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
      :app="app"
      @change="onKindChange"
    />
  </v-form>
</template>

<script>
import AppBaseInfo from './AppBaseInfo'
import WorkloadBaseInfo from '@/views/resource/workload/components/WorkloadBaseForm/WorkloadBaseInfo'
import ContaninerImage from '@/views/resource/workload/components/WorkloadBaseForm/ContainerImage'
import StorageMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount'
import ScheduleSelector from '@/views/resource/workload/components/WorkloadBaseForm/ScheduleSelector'
import DeployPolicy from '@/views/resource/workload/components/WorkloadBaseForm/DeployPolicy'

import ConfigMapBaseForm from '@/views/resource/configmap/components/ConfigMapBaseForm'
import SecretBaseForm from '@/views/resource/secret/components/SecretBaseForm'
import PersistentVolumeClaimBaseForm from '@/views/resource/persistentvolumeclaim/components/PersistentVolumeClaimBaseForm'
import ServiceBaseForm from '@/views/resource/service/components/ServiceBaseForm'
import JobBaseInfo from '@/views/resource/job/components/JobBaseForm/JobBaseInfo'
import CronJobBaseInfo from '@/views/resource/cronjob/components/CronjobBaseForm/CronJobBaseInfo'
import CronJobContaninerImage from '@/views/resource/cronjob/components/CronjobBaseForm/ContainerImage'
import CronJobStorageMount from '@/views/resource/cronjob/components/CronjobBaseForm/StorageMount'
import IngressBaseForm from '@/views/resource/ingress/components/IngressBaseForm'
import BaseResource from '@/mixins/resource'
import BaseSelect from '@/mixins/select'

export default {
  name: 'AppResourceBaseForm',
  components: {
    AppBaseInfo,
    WorkloadBaseInfo,
    ConfigMapBaseForm,
    SecretBaseForm,
    PersistentVolumeClaimBaseForm,
    ServiceBaseForm,
    JobBaseInfo,
    CronJobBaseInfo,
    ContaninerImage,
    StorageMount,
    ScheduleSelector,
    DeployPolicy,
    CronJobContaninerImage,
    CronJobStorageMount,
    IngressBaseForm,
  },
  mixins: [BaseResource, BaseSelect],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
    step: {
      type: Number,
      default: () => 0,
    },
    kind: {
      type: String,
      default: () => '',
    },
    app: {
      type: Object,
      default: () => null,
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
    // eslint-disable-next-line vue/no-unused-properties
    obj() {
      return this.$refs[this.steps[this.step]].obj
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data, cyclic = false) {
      if (cyclic) {
        if (data && data.kind) {
          this.onKindChange(data.kind, true, data)
        }
      } else {
        this.$refs[this.steps[this.step]].init(data)
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$refs[this.steps[this.step]].back(data)
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (this.$refs[this.steps[this.step]].expand) {
        return !this.$refs[this.steps[this.step]].expand
      }
      return true
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs[this.steps[this.step]].$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs[this.steps[this.step]].$refs.form.reset()
      this.$set(this, 'steps', ['AppBaseInfo'])
    },
    onKindChange(kind, init = false, data = null) {
      let step = 1
      if (['Deployment', 'DaemonSet', 'StatefulSet'].indexOf(kind) > -1) {
        this.$set(this, 'steps', [
          'WorkloadBaseInfo',
          'ContaninerImage',
          'StorageMount',
          'ScheduleSelector',
          'DeployPolicy',
        ])
        step = 5
      } else if (kind === 'Job') {
        this.$set(this, 'steps', [
          'JobBaseInfo',
          'ContaninerImage',
          'StorageMount',
          'ScheduleSelector',
        ])
        step = 4
      } else if (kind === 'CronJob') {
        this.$set(this, 'steps', [
          'CronJobBaseInfo',
          'CronJobContaninerImage',
          'CronJobStorageMount',
          'ScheduleSelector',
        ])
        step = 4
      } else if (kind === 'Service') {
        this.$set(this, 'steps', ['ServiceBaseForm'])
      } else if (kind === 'Secret') {
        this.$set(this, 'steps', ['SecretBaseForm'])
      } else if (kind === 'ConfigMap') {
        this.$set(this, 'steps', ['ConfigMapBaseForm'])
      } else if (kind === 'PersistentVolumeClaim') {
        this.$set(this, 'steps', ['PersistentVolumeClaimBaseForm'])
      } else if (kind === 'Ingress') {
        this.$set(this, 'steps', ['IngressBaseForm'])
      }
      this.$emit('change', kind, step, init, data)
    },
  },
}
</script>
