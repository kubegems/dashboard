<template>
  <div class="kubegems__text text-subtitle-2 font-weight-medium">
    <span> 限制条数 </span>
    <v-menu
      v-model="limitMenu"
      bottom
      left
      offset-y
      origin="top center"
      transition="scale-transition"
      nudge-bottom="5px"
    >
      <template #activator="{ on }">
        <v-btn depressed color="white" class="primary--text" dark small v-on="on">
          {{ limitObj.text }}
          <v-icon v-if="limitMenu" right> fas fa-angle-up </v-icon>
          <v-icon v-else right> fas fa-angle-down </v-icon>
        </v-btn>
      </template>
      <v-data-iterator :items="[{ text: '条数', values: limitItems }]" hide-default-footer>
        <template #no-data>
          <v-card>
            <v-card-text> 暂无条数 </v-card-text>
          </v-card>
        </template>
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text">
            <v-list dense>
              <v-flex class="text-subtitle-2 text-center ma-2">
                <span>条数</span>
              </v-flex>
              <v-divider class="mx-2" />
              <v-list-item
                v-for="(time, index) in item.values"
                :key="index"
                class="text-body-2 text-center"
                link
                :style="time.value === limit ? `color: #1e88e5 !important;` : ``"
                @click="setLimit(time)"
              >
                <v-list-item-content>
                  <span class="font-weight-medium">
                    {{ time.text }}
                  </span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'CountLimit',
    data() {
      return {
        limit: 100,
        limitItems: [
          { text: '10', value: 10 },
          { text: '50', value: 50 },
          { text: '100', value: 100 },
          { text: '200', value: 200 },
          { text: '500', value: 500 },
          { text: '1000', value: 1000 },
        ],
        limitMenu: false,
      };
    },
    computed: {
      limitObj() {
        const t = this.limitItems.find((d) => {
          return d.value === this.limit;
        });
        if (t) return t;
        return '';
      },
    },
    methods: {
      setLimit(t) {
        this.limit = t.value;
        this.$emit('refreshLimit', this.limit);
      },
    },
  };
</script>
