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
  <v-flex>
    <v-sheet class="text-body-2 text--darken-1 d-flex align-right mx-1" :style="{ float: 'right' }">
      <v-menu
        v-model="durationMenu"
        bottom
        class="mx-1 px-1"
        left
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <v-btn class="primary--text font-weight-medium" color="white" small text v-on="on">
            {{ durationText }}
            <v-icon v-if="durationMenu" right> mdi-chevron-up </v-icon>
            <v-icon v-else right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator
          class="file-iterator"
          hide-default-footer
          :items="[{ text: $t('tip.time'), values: durations }]"
        >
          <template #no-data>
            <v-card>
              <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" flat>
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>{{ $t('tip.time') }}</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(dur, index) in item.values"
                  :key="index"
                  class="text-caption text-center font-weight-medium mx-2"
                  link
                  :style="{ color: dur.value === duration ? `#1e88e5 !important` : `` }"
                  @click="setDuration(dur)"
                >
                  <v-list-item-content>
                    <span>{{ dur.text }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </v-sheet>
  </v-flex>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'Duration',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        durationMenu: false,
        duration: '1h',
      };
    },
    computed: {
      durationText() {
        return this.durations.find((d) => {
          return d.value === this.duration;
        })?.text;
      },
      durations() {
        return [
          { text: this.$t('tip.last_30_second'), value: '30s' },
          { text: this.$t('tip.last_5_minute'), value: '5m' },
          { text: this.$t('tip.last_1_hour'), value: '1h' },
          { text: this.$t('tip.last_1_day'), value: '1d' },
          { text: this.$t('tip.last_1_week'), value: '1w' },
        ];
      },
    },
    watch: {
      value: {
        handler(newValue) {
          this.duration = newValue;
        },
        deep: true,
      },
    },
    methods: {
      setDuration(duration) {
        if (duration.value !== this.duration) {
          this.duration = duration.value;
          this.$emit('input', this.duration);
          this.$emit('change', this.duration);
        }
      },
    },
  };
</script>
