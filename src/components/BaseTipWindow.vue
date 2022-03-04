<template>
  <v-menu
    open-on-hover
    :top="top"
    right
    max-height="400px"
    :max-width="`${maxWidth}px`"
    :min-width="`${minWidth}px`"
    offset-y
    :origin="`${top ? 'bottom center' : 'top center'}`"
    transition="scale-transition"
    :close-on-content-click="false"
    :close-delay="200"
  >
    <template #activator="{ on }">
      <span v-on="on">
        <slot name="header"></slot>
      </span>
    </template>
    <v-card flat>
      <v-list dense class="pa-0">
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small>{{ icon }}</v-icon>
          <span>{{ title }}</span>
        </v-flex>
        <slot name="content"></slot>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: 'BaseTipWindow',
  props: {
    icon: {
      type: String,
      default: () => '',
    },
    title: {
      type: String,
      default: () => '',
    },
    top: {
      type: Boolean,
      default: () => true,
    },
    minWidth:{
      type:Number,
      default:() => 150,
    },
    maxWidth:{
      type:Number,
      default:() => 250,
    }
  },
}
</script>
