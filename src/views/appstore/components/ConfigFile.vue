<template>
  <div class="pa-3 white rounded mt-3">
    <v-autocomplete
      v-model="mySelectFile"
      class="mb-3"
      color="primary"
      dense
      flat
      hide-details
      hide-selected
      :items="fileName"
      label="文件"
      no-data-text="暂无可选数据"
      solo
      :style="{ width: `500px` }"
      @change="onFileChange"
    />
    <ACEEditor
      v-model="code"
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
      lang="yaml"
      :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
      :style="{ height: `${height}px !important` }"
      theme="chrome"
      @init="$aceinit"
      @keydown.stop
    />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

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
        return window.innerHeight - 312 * this.Scale;
      },
    },
    watch: {
      item: {
        handler: function () {
          this.code = this.item.files[this.mySelectFile];
          for (const k in this.item.files) {
            this.fileName.push(k);
          }
        },
        immediate: true,
      },
    },
    methods: {
      onFileChange() {
        this.code = this.item.files[this.mySelectFile];
      },
    },
  };
</script>
