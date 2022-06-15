<template>
  <BasePanel v-model="panel" icon="fas fa-bell" title="Kubernetes事件" @dispose="dispose">
    <template #action>
      <BaseDatetimePicker v-model="date" color="primary" :default-value="60" @change="onDatetimeChange(undefined)" />
    </template>
    <template #content>
      <div class="d-flex flex-column mt-2" :style="{ height: `${height}px` }">
        <div class="kubegems__h-8">
          <MessageBarChart :data="data" :date="date" />
        </div>
        <div class="my-8" />
        <div class="d-flex justify-space-around kubegems__h-8">
          <div class="kubegems__h-24 kubegems__w-11">
            <EventPieChart :data="data" title="事件源" type="source_component" />
          </div>
          <div class="kubegems__h-24 kubegems__w-11">
            <EventPieChart :data="data" title="事件类型" type="reason" />
          </div>
        </div>
      </div>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import EventPieChart from './EventPieChart';
  import MessageBarChart from './MessageBarChart';
  import { getEventListFromLoki } from '@/api';

  export default {
    name: 'K8sEvents',
    components: {
      EventPieChart,
      MessageBarChart,
    },
    props: {
      env: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        panel: false,
        data: null,
        date: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 1;
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.eventList();
          }
        },
        deep: true,
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      async eventList() {
        let query = '{container="gems-eventer"} | json | __error__=``';
        query += ` | line_format "{{.metadata_namespace}}" |= "${this.env.namespace}"`;
        const data = await getEventListFromLoki(this.env.clusterName, {
          query: query,
          limit: 3000,
          start: `${this.date[0]}000000`,
          end: `${this.date[1]}000000`,
        });
        this.data = data || [];
      },
      onDatetimeChange() {
        this.eventList();
      },
      dispose() {},
    },
  };
</script>
