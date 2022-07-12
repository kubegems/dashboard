<template>
  <div class="d-inline-block">
    <!-- 无数据显示 -->
    <span v-if="visibleItems.length === 0">{{ emptyText }}</span>

    <v-menu
      v-if="items.length"
      open-on-hover
      :close-delay="200"
      :close-on-content-click="false"
      :max-width="maxWidth"
      :disabled="items.length === 0"
    >
      <template #activator="{ on }">
        <v-flex v-on="on">
          <v-icon :color="color" v-if="icon" left> {{ icon }} </v-icon>
        </v-flex>
      </template>

      <v-card flat class="pa-2">
        <template v-if="singleLine">
          <div v-for="item in items" :key="item[itemValue]">
            <v-flex
              small
              :class="{ 'ma-1': true, 'text-caption': true, kubegems__text: true, kubegems__pointer: linked }"
            >
              <v-icon v-if="icon" :color="color" small left> {{ icon }} </v-icon>
              <strong v-if="dataType === 'object'" class="mr-1">
                {{ item[itemValue] }}
              </strong>
              <slot :item="item">{{ item[itemText] }}</slot>
            </v-flex>
          </div>
        </template>
        <template v-else>
          <v-chip v-for="item in items" :key="item[itemValue]" small :color="color" class="ma-1">
            <slot :item="item">{{ item[itemText] }}</slot>
          </v-chip>
        </template>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'BaseTipChips',
    props: {
      chips: {
        type: [Array, Object, String],
        default: () => [],
      },
      color: {
        type: String,
        default: 'success',
      },
      count: {
        type: Number,
        default: 1,
      },
      delimiter: {
        type: String,
        default: ',',
      },
      emptyText: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: undefined,
      },
      itemText: {
        type: String,
        default: 'text',
      },
      itemValue: {
        type: String,
        default: 'value',
      },
      linked: {
        type: Boolean,
        default: () => false,
      },
      maxWidth: {
        type: String,
        default: undefined,
      },
      singleLine: Boolean,
    },
    data() {
      return {
        items: [],
        visibleItems: [],
        dataType: null,
      };
    },
    watch: {
      chips: {
        handler() {
          this.handleSetItems();
        },
        immediate: true,
      },
    },
    methods: {
      handleSetItems() {
        if (Array.isArray(this.chips)) {
          this.items = this.chips.map((item) => {
            if (typeof item === 'object') {
              return { ...item };
            } else {
              return {
                [this.itemText]: item,
                [this.itemValue]: item,
              };
            }
          });
          this.dataType = 'array';
        } else if (typeof this.chips === 'string') {
          const arr = Array.from(new Set(this.chips.split(this.delimiter)));
          this.items = arr.map((v) => {
            return {
              [this.itemText]: v,
              [this.itemValue]: v,
            };
          });
          this.dataType = 'string';
        } else {
          this.items = Object.keys(this.chips || {}).map((key) => {
            return {
              [this.itemText]: this.chips[key],
              [this.itemValue]: key,
            };
          });
          this.dataType = 'object';
        }
        this.visibleItems = this.items;
      },
      // linkToPage() {
      //   this.$emit('linkToPage');
      // },
    },
  };
</script>
