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
          v-on="on"
        >
          {{ item.name }}
        </v-chip>
      </template>
      <v-card>
        <v-card-text class="pa-2">
          {{ item.text }}
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
          name: 'M',
          text: '状态1',
        },
        {
          key: 'l',
          name: 'L',
          text: '状态2',
        },
        {
          key: 's',
          name: 'S',
          text: '状态3',
        },
      ],
    }
  },
  methods: {
    setColor (key) {
      const isRunning = !!this[key]
      return isRunning ? 'success' : ''
    },
  },
}
</script>
