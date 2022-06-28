<template>
  <BaseDialog v-model="dialog" icon="mdi-wrench" title="监听列表" :width="1000">
    <template #content>
      <v-data-table :headers="headers" :items="listeners" :items-per-page="10" />
    </template>
  </BaseDialog>
</template>

<script>
  import { configListener } from '../api/index.js';
  export default {
    name: 'ConfigListener',
    data() {
      return {
        dialog: false,
        listeners: [],
        headers: [
          { text: 'ip', value: 'ip' },
          { text: 'md5', value: 'md5' },
        ],
      };
    },
    methods: {
      async open(item) {
        const ret = await configListener(item.tenant, item.project, item.application, item.environment, item.key);
        let listeners = [];
        console.log(ret);
        for (let key in ret) {
          listeners.push({ ip: key, md5: ret[key] });
        }
        this.listeners = listeners;
        this.dialog = true;
      },
    },
  };
</script>
