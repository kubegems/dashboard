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
        class="log-ellipsis-text"
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
  name: 'EllipsisText',
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
        this.showTootip = this.hiddenSpan.offsetWidth > this.$refs.span.offsetWidth
        this.$refs.span.removeChild(this.hiddenSpan)
        this.hiddenSpan = null
      })
    },
    handleCloseTootip() {
      this.showTootip = false
    },
  },
}
</script>

<style lang="scss" scoped>
.log-ellipsis-text {
  position: relative;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
