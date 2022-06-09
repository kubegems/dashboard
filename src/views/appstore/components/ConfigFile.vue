<template>
  <div>
    <v-autocomplete
      v-model="mySelectFile"
      :items="fileName"
      color="primary"
      solo
      flat
      dense
      label="文件"
      hide-selected
      hide-details
      class="mb-3"
      no-data-text="暂无可选数据"
      style="width: 500px;"
      @change="onFileChange"
    />
    <ACEEditor
      v-model="code"
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
      lang="yaml"
      :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
      theme="chrome"
      :style="`height: ${height}px !important`"
      @init="$aceinit"
      @keydown.stop
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ConfigFile',
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
  data: () => ({
    mySelectFile: 'values.yaml',
    code: null,
    fileName: [],
  }),
  computed: {
    ...mapState(['Scale']),
    height() {
      return window.innerHeight - 300 * this.Scale
    },
  },
  watch: {
    item: {
      handler: function () {
        this.code = this.item.files[this.mySelectFile]
        for (const k in this.item.files) {
          this.fileName.push(k)
        }
      },
      immediate: true,
    },
  },
  methods: {
    onFileChange() {
      this.code = this.item.files[this.mySelectFile]
    },
  },
}
</script>
