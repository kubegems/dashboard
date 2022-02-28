<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <BaseSubTitle title="集群定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.ClusterName"
            required
            label="集群名称"
            :rules="objRules.ClusterNameRules"
            :readonly="edit"
          />
        </v-col>
        <v-col
          v-if="!control && !edit"
          cols="6"
        >
          <v-switch
            v-model="obj.Primary"
            class="mt-4"
            label="控制集群"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle title="Kubeconfig" />
    <v-card-text class="pa-2">
      <ACEEditor
        v-model="obj.KubeConfig"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
        lang="yaml"
        :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
        theme="chrome"
        height="500"
        @init="$aceinit"
        @keydown.stop
      />
    </v-card-text>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import { required } from '@/utils/rules'

export default {
  name: 'ClusterBaseForm',
  props: {
    edit: {
      type: Boolean,
      default: () => false,
    },
    control: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    obj: {
      ClusterID: 0,
      ClusterName: '',
      KubeConfig: '',
      Primary: false,
    },
    objRules: {
      ClusterNameRules: [required],
    },
  }),
  computed: {
    ...mapState(['Scale']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
