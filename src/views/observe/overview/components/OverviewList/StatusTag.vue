<template>
  <div class="d-inline-block">
    <v-menu
      v-for="(item, i) in items"
      :key="item.key"
      top
      open-on-hover
      nudge-top="32px"
    >
      <template #activator="{ on }">
        <v-chip
          small
          label
          :color="setColor(item.key)"
          :class="{ 'ml-2': i > 0 }"
          :style="{ fontFamily: 'kubegems-sample' }"
          v-on="on"
        >
          {{ item.name }}
        </v-chip>
      </template>
      <v-card>
        <v-card-text class="pa-2">
          {{ isRunning ? item.text : item.notext }}
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'StatusTag',
  props: {
    m: {
      type: Boolean,
      default: false,
    },
    l: {
      type: Boolean,
      default: false,
    },
    s: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      items: [
        {
          key: 'm',
          name: 'Metrics',
          text: '已启用监控',
          notext: '未启用监控',
        },
        {
          key: 'l',
          name: 'Log',
          text: '已启用日志',
          notext: '未启用日志',
        },
        {
          key: 's',
          name: 'Mesh',
          text: '已启用服务网格',
          notext: '未启用服务网格',
        },
      ],
      isRunning: false,
    }
  },
  methods: {
    setColor (key) {
      this.isRunning = !!this[key]
      return this.isRunning ? 'success' : ''
    },
  },
}
</script>
