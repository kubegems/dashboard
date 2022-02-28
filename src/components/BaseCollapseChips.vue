<template>
  <div class="d-inline-block">

    <span v-if="visibleItems.length === 0">{{ emptyText }}</span>

    <v-chip
      v-else-if="hiddenItems.length === 1"
      v-for="item in visibleItems"
      :key="item[itemValue]"
      :color="color"
      small
      class="mr-2"
    >
      <v-icon v-if="icon" small left> {{ icon }} </v-icon>
      <strong v-if="dataType === 'object'" class="mr-1">
        {{ item[itemValue] }}
      </strong>
      <slot :item="item">{{ item[itemText] }}</slot>
    </v-chip>
    
    <v-menu
      v-else
      open-on-hover
      :close-delay="200"
      :max-width="maxWidth"
      :close-on-click="false"
    >
      <template #activator="{ on }">
        <v-chip
          v-for="item in visibleItems"
          :key="item[itemValue]"
          :color="color"
          small
          class="mr-2"
          v-on="on"
        >
          <v-icon v-if="icon" small left> {{ icon }} </v-icon>
          <strong v-if="dataType === 'object'" class="mr-1">
            {{ item[itemValue] }}
          </strong>
          <slot :item="item">{{ item[itemText] }}</slot>
          <strong v-if="hiddenItems.length > 1" class="ml-2">+{{ hiddenItems.length }}</strong>
        </v-chip>
      </template>

      <v-card class="pa-2">
        <template v-if="singleLine">
          <div v-for="item in hiddenItems" :key="item[itemValue]">
            <v-flex small class="ma-1 text-caption kubegems__detail">
              <v-icon v-if="icon" :color="color" small left> {{ icon }} </v-icon>
              <strong v-if="dataType === 'object'" class="mr-1">
                {{ item[itemValue] }}
              </strong>
              <slot :item="item">{{ item[itemText] }}</slot>
            </v-flex>
          </div>
        </template>
        <template v-else>
          <v-chip
            v-for="item in hiddenItems"
            :key="item[itemValue]"
            small
            :color="color"
            class="ma-1"
          >
            <slot :item="item">{{ item[itemText] }}</slot>
          </v-chip>
        </template>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'BaseCollapseChips',
  props: {
    chips: {
      type: [Array, Object, String],
      default: () => [],
    },
    count: {
      type: Number,
      default: 1,
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    itemText: {
      type: String,
      default: 'text',
    },
    delimiter: {
      type: String,
      default: ',',
    },
    color: {
      type: String,
      default: 'success',
    },
    maxWidth: {
      type: String,
      default: undefined,
    },
    singleLine: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: undefined,
    },
    emptyText: {
      type: String,
      default: '-'
    }
  },
  data() {
    return {
      items: [],
      visibleItems: [],
      hiddenItems: [],
      dataType: null,
    }
  },
  watch: {
    chips: {
      handler() {
        this.setItems()
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    setItems() {
      if (Array.isArray(this.chips)) {
        this.items = this.chips.map((item) => {
          if (typeof item === 'object') {
            return { ...item }
          } else {
            return {
              [this.itemText]: item,
              [this.itemValue]: item,
            }
          }
        })
        this.dataType = 'array'
      } else if (typeof this.chips === 'string') {
        const arr = Array.from(new Set(this.chips.split(this.delimiter)))
        this.items = arr.map((v) => {
          return {
            [this.itemText]: v,
            [this.itemValue]: v,
          }
        })
        this.dataType = 'string'
      } else {
        this.items = Object.keys(this.chips || {}).map((key) => {
          return {
            [this.itemText]: this.chips[key],
            [this.itemValue]: key,
          }
        })
        this.dataType = 'object'
      }
      this.visibleItems = this.items.slice(0, this.count)
      this.hiddenItems = this.items
    },
  },
}
</script>
