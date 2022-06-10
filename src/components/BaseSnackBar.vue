<template>
  <v-snackbar
    v-model="SnackBar.value"
    top
    right
    :color="SnackBar.color"
    transition="slide-x-reverse-transition"
    text
    class="mr-1"
  >
    <v-flex>
      <v-flex class="float-left">
        <v-icon left small :color="SnackBar.color">
          {{ SnackBar.icon }}
        </v-icon>
      </v-flex>
      <v-flex :class="`float-left snackbar-break ${SnackBar.collapse ? 'snackbar--collapse' : 'snackbar--show'}`">
        {{ SnackBar.text }}
      </v-flex>
      <div class="kubegems__clear-float"></div>
      <v-btn
        v-if="SnackBar.text && SnackBar.text.length > 300"
        icon
        small
        :color="SnackBar.color"
        @click="SnackBar.collapse = !SnackBar.collapse"
      >
        <v-icon small>
          {{ SnackBar.collapse ? 'fas fa-angle-down' : 'fas fa-angle-up' }}
        </v-icon>
      </v-btn>
    </v-flex>
    <template #action>
      <v-icon :color="SnackBar.color" left small @click="SnackBar.value = false"> mdi-close </v-icon>
    </template>
  </v-snackbar>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseSnackBar',
    data() {
      return {
        icon: {
          primary: 'fa-check-circle',
          warning: 'fa-exclamation-circle',
          error: 'fa-minus-circle',
          success: 'fa-info-circle',
          info: 'fa-info-circle',
        },
      };
    },
    computed: {
      ...mapState(['SnackBar']),
    },
  };
</script>

<style lang="scss" scoped>
  .snackbar-break {
    word-break: break-word;
  }
  .snackbar--collapse {
    max-height: 60px;
    overflow: hidden;
    width: 90%;
  }
  .snackbar--show {
    /* eslint-disable unit-whitelist */
    max-height: 96vh;
    overflow-y: auto;
    width: 95%;
  }
</style>
