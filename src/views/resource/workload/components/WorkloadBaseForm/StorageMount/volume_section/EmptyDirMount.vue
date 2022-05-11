<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <v-sheet class="px-2">
      <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width" />
      <v-flex class="float-left ml-2 kubegems__form-width">
        <v-text-field
          v-model="volumeObj.name"
          class="my-0"
          required
          label="卷名称"
          :rules="volumeRules.nameRule"
          :readonly="edit"
          @keyup="onVolumeNameInput"
        />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <VolumeMount
      ref="volumeMount"
      :containers="containers"
      :volume-mount-name="volumeMountName"
      :volume="volume"
    />
  </v-form>
</template>

<script>
import VolumeMount from './VolumeMount'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'

export default {
  name: 'EmptyDirMount',
  components: { VolumeMount },
  mixins: [BaseResource],
  props: {
    containers: {
      type: Array,
      default: () => [],
    },
    volumeMountName: {
      type: String,
      default: () => null,
    },
    volume: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      volumeObj: {
        name: '',
        emptyDir: {},
      },
      volumeRules: {
        nameRule: [required],
      },
    }
  },
  watch: {
    volume: {
      handler: function() {
        this.loadData()
      },
      deep: true,
    },
  },
  async mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      if (this.volume) this.volumeObj = this.volume
    },
    // eslint-disable-next-line vue/no-unused-properties
    generateData() {
      if (this.$refs.form.validate(true)) {
        const data = this.$refs.volumeMount.generateData()
        if (data) {
          return {
            volumeMount: data,
            volume: {
              name: this.volumeObj.name,
              emptyDir: {},
            },
          }
        }
        return null
      }
      return null
    },
    onVolumeNameInput() {
      this.$refs.volumeMount.initVolumeMount(this.volumeObj.name)
    },
  },
}
</script>
