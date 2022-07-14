<template>
  <div>
    <div>
      <MessageBarChart :data="data" :date="date" />
    </div>
    <div class="my-8" />
    <div class="d-flex justify-space-around">
      <div class="kubegems__h-24 kubegems__w-11">
        <EventPieChart :data="data" title="事件源" type="source_component" />
      </div>
      <div class="kubegems__h-24 kubegems__w-11">
        <EventPieChart :data="data" title="事件类型" type="reason" />
      </div>
    </div>
  </div>
</template>

<script>
  import EventPieChart from './EventPieChart';
  import MessageBarChart from './MessageBarChart';

  export default {
    name: 'Chart',
    components: {
      EventPieChart,
      MessageBarChart,
    },
    props: {
      data: {
        type: Array,
        default: () => [],
      },
      date: {
        type: Array,
        default: () => [],
      },
    },
  };
</script>
