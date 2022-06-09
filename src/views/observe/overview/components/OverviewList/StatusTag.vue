<template>
  <div class="d-inline-block">
    <v-menu
      v-for="(item, i) in items"
      :key="item.key"
      top
      open-on-hover
      nudge-top="22px"
    >
      <template #activator="{ on }">
        <v-btn
          depressed
          x-small
          label
          :color="setColor(item.status)"
          :class="{ 'ml-2': i > 0, 'kubegems__text': !item.status }"
          :style="{ fontFamily: 'kubegems-sample' }"
          v-on="on"
        >
          {{ item.name }}
        </v-btn>
      </template>
      <v-card>
        <v-card-text class="pa-2">
          {{ item.status ? item.text : item.notext }}
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
  computed: {
    items() {
      return [
        {
          key: 'm',
          name: 'Metrics',
          text: '已启用监控',
          notext: '未启用监控',
          status: this.m,
        },
        {
          key: 'l',
          name: 'Log',
          text: '已启用日志',
          notext: '未启用日志',
          status: this.l,
        },
        {
          key: 's',
          name: 'Mesh',
          text: '已启用服务网格',
          notext: '未启用服务网格',
          status: this.s,
        },
      ]
    },
  },
  methods: {
    setColor (status) {
      return status ? 'success' : ''
    },
  },
}
</script>
