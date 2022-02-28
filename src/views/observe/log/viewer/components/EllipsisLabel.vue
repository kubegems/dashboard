<template>
  <v-menu
    top
    open-on-hover
    :close-delay="200"
    nudge-top="25px"
    nudge-left="8px"
    :value="showTootip"
  >
    <template #activator="{ on, attrs }">
      <div
        ref="span"
        class="ellipsis-label"
        @mouseenter="handleShowTootip"
        @mouseleave="handleCloseTootip"
      >
        {{ text }}
      </div>
      <span
        v-bind="attrs"
        v-on="on"
      />
    </template>
    <v-card>
      <v-card-text class="pa-2"> {{ text }} </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: 'EllipsisLabel',
  props: {
    text: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showTootip: false,
      hiddenSpan: null,
    }
  },
  methods: {
    handleShowTootip() {
      this.hiddenSpan = document.createElement('span')
      this.hiddenSpan.innerHTML = this.text
      this.hiddenSpan.style.position = 'absolute'
      this.hiddenSpan.style.opacity = '0'
      this.hiddenSpan.style.left = '0'
      this.hiddenSpan.style.top = '0'
      this.$refs.span.appendChild(this.hiddenSpan)
      this.$nextTick(() => {
        this.showTootip =
          this.hiddenSpan.offsetWidth > this.$refs.span.offsetWidth
      })
    },
    handleCloseTootip() {
      this.showTootip = false
      if (this.hiddenSpan) {
        this.$refs.span.removeChild(this.hiddenSpan)
        this.hiddenSpan = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.ellipsis-label {
  position: relative;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
