<template>
  <v-flex class="text-center pa-4">
    <v-flex class="pagination-height">
      <v-flex
        id="smallpagination"
        class="pagination"
      >
        <v-pagination
          v-model="p"
          class="float-right"
          :length="pageCount"
          :total-visible="2"
          @input="onPageInput"
        />
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'Pagination',
  model: {
    prop: 'page',
  },
  props: {
    pageCount: {
      type: Number,
      default: () => 0,
    },
    page: {
      type: Number,
      default: () => 1,
    },
    frontPage: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      p: 1,
    }
  },
  watch: {
    page() {
      this.p = this.page
    },
  },
  mounted() {
    this.p = this.page
  },
  methods: {
    onPageInput() {
      this.$emit('changepage', this.p)
      if (this.p === this.page) return
      if (!this.frontPage) {
        this.$emit('loaddata')
      } else {
        if (this.p === 1) {
          this.$emit('loaddata')
        }
      }
    },
  },
}
</script>

<style lang="scss">
.pagination {
  position: absolute;
  right: 10px;
  transform: translate(0%, 0%);
}
.pagination-height {
  height: 40px;
}
.pagination-size {
  top: auto !important;
}
#smallpagination .v-pagination__navigation {
  width: 24px;
  height: 24px;
}
#smallpagination .v-pagination__item {
  width: 24px;
  height: 24px;
  min-width: 0;
}
</style>
