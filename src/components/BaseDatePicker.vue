<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    left
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-btn class="white--text" color="primary" depressed :text="text" v-on="on">
        {{ currentDate }}
        <v-icon v-if="menu" right>mdi-chevron-up</v-icon>
        <v-icon v-else right>mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-card flat width="300px">
      <v-row>
        <v-col>
          <v-date-picker v-model="currentDate" flat locale="zh-cn" no-title @change="onDateChange" />
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
</template>

<script>
  import moment from 'moment';

  export default {
    name: 'BaseDatePicker',
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
    data: () => ({
      currentDate: '',
      menu: false,
    }),
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
