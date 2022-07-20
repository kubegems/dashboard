<template>
  <v-flex class="text-center pa-4">
    <v-flex class="pagination__height">
      <v-flex :id="pid" class="pagination">
        <v-pagination
          v-model="p"
          class="float-left"
          :length="pageCount"
          :total-visible="visibleNum"
          @input="onPageInput"
        />
        <div v-if="pageCount * size > 10 && showSize" class="text-body-2 float-left ml-2 mt-2">
          每页条目数
          <v-menu
            v-model="pageMenu"
            :attach="`#${pid}`"
            left
            nudge-bottom="-5px"
            offset-y
            origin="bottom center"
            top
            transition="scale-transition"
          >
            <template #activator="{ on }">
              <v-btn class="primary--text" color="white" dark depressed small v-on="on">
                {{ size }}
                <v-icon v-if="pageMenu" right>fas fa-angle-up</v-icon>
                <v-icon v-else right>fas fa-angle-down</v-icon>
              </v-btn>
            </template>
            <v-data-iterator hide-default-footer :items="[{ text: '页数', values: [10, 20, 50, 100] }]">
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat>
                  <v-list dense>
                    <v-flex class="text-body-2 text-center ma-2">
                      <span>条目数</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <v-list-item
                      v-for="(s, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center"
                      link
                      :style="s === size ? `color: #1e88e5 !important;` : ``"
                      @click="setSize(s)"
                    >
                      <v-list-item-content>
                        <span class="font-weight-medium">{{ s }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </div>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'BasePagination',
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
      pid: {
        type: String,
        default: () => 'pagesize',
      },
      showSize: {
        type: Boolean,
        default: () => true,
      },
      size: {
        type: Number,
        default: () => 10,
      },
      visibleNum: {
        type: Number,
        default: () => 6,
      },
    },
    data() {
      return {
        p: 1,
        pageMenu: false,
      };
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
