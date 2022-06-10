<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    bottom
    left
    offset-y
    origin="top center"
    transition="scale-transition"
    nudge-bottom="5px"
  >
    <template #activator="{ on }">
      <v-btn depressed color="primary" :text="text" class="white--text" v-on="on">
        {{ currentDate }}
        <v-icon v-if="menu" right>fas fa-angle-up</v-icon>
        <v-icon v-else right>fas fa-angle-down</v-icon>
      </v-btn>
    </template>
    <v-card width="300px">
      <v-row>
        <v-col>
          <v-date-picker v-model="currentDate" no-title flat locale="zh-cn" @change="onDateChange"></v-date-picker>
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
</template>

<script>
  import moment from 'moment';

  export default {
    name: 'BaseDatePicker',
    data: () => ({
      currentDate: '',
      menu: false,
    }),
    props: {
      text: {
        type: Boolean,
        default: false,
      },
      yesterday: {
        type: Boolean,
        default: true,
      },
    },
    mounted() {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      this.currentDate = this.yesterday ? moment(yesterday).format('YYYY-MM-DD') : moment(today).format('YYYY-MM-DD');
    },
    methods: {
      onDateChange() {
        this.menu = false;
        this.$emit('date', this.currentDate);
      },
      setDate(date) {
        this.currentDate = moment(date).format('YYYY-MM-DD');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-picker--date {
    box-shadow: none !important;
  }
</style>
