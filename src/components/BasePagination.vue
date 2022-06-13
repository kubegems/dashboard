<template>
  <v-flex class="text-center pa-4">
    <v-flex class="pagination__height">
      <v-flex class="pagination" id="pagesize">
        <v-pagination
          class="float-left"
          v-model="p"
          :length="pageCount"
          :total-visible="6"
          @input="onPageInput"
        ></v-pagination>
        <v-sheet v-if="pageCount * size > 10 && showSize" class="text-body-1 float-left ml-2 mt-2">
          每页条目数
          <v-menu
            v-model="pageMenu"
            attach="#pagesize"
            top
            left
            offset-y
            origin="bottom center"
            transition="scale-transition"
            nudge-bottom="-5px"
          >
            <template #activator="{ on }">
              <v-btn depressed color="white" class="primary--text" small dark v-on="on">
                {{ size }}
                <v-icon v-if="pageMenu" right>fas fa-angle-up</v-icon>
                <v-icon v-else right>fas fa-angle-down</v-icon>
              </v-btn>
            </template>
            <v-data-iterator :items="[{ text: '页数', values: [10, 20, 50, 100] }]" hide-default-footer>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text">
                  <v-list dense>
                    <v-flex class="text-body-2 text-center ma-2">
                      <span>条目数</span>
                    </v-flex>
                    <v-divider class="mx-2"></v-divider>
                    <v-list-item
                      v-for="(s, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center"
                      link
                      :style="s === size ? `color: #1e88e5 !important;` : ``"
                      @click="setSize(s)"
                    >
                      <v-list-item-content>
                        <span>{{ s }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </v-sheet>
        <div class="kubegems__clear-float"></div>
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'BasePagination',
    data() {
      return {
        p: 1,
        pageMenu: false,
      };
    },
    model: {
      prop: 'page',
    },
    props: {
      frontPage: {
        type: Boolean,
        default: () => false,
      },
      page: {
        type: Number,
        default: () => 1,
      },
      pageCount: {
        type: Number,
        default: () => 0,
      },
      showSize: {
        type: Boolean,
        default: () => true,
      },
      size: {
        type: Number,
        default: () => 10,
      },
    },
    computed: {
      height() {
        window.innerHeight;
      },
    },
    watch: {
      page() {
        this.p = this.page;
      },
    },
    mounted() {
      this.p = this.page;
    },
    methods: {
      onPageInput() {
        this.$emit('changepage', this.p);
        if (this.p === this.page) return;
        if (!this.frontPage) {
          this.$emit('loaddata');
        } else {
          if (this.p === 1) {
            this.$emit('loaddata');
          }
        }
      },
      setSize(size) {
        this.p = 1;
        this.$emit('changesize', size);
        this.$emit('loaddata');
      },
    },
  };
</script>

<style lang="scss">
  .pagination {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0%);

    &__height {
      height: 40px;
    }
  }
</style>
