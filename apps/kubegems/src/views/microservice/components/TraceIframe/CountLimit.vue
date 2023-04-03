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
  <div class="kubegems__text text-subtitle-2 font-weight-medium">
    <span> {{ $t('tip.limit_count') }} </span>
    <v-menu
      v-model="limitMenu"
      bottom
      left
      nudge-bottom="5px"
      offset-y
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-btn class="primary--text" color="white" dark depressed small v-on="on">
          {{ limitObj.text }}
          <v-icon v-if="limitMenu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
      </template>
      <v-data-iterator hide-default-footer :items="[{ text: $t('tip.limit_count'), values: limitItems }]">
        <template #no-data>
          <v-card>
            <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
          </v-card>
        </template>
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text" flat>
            <v-list dense>
              <v-flex class="text-subtitle-2 text-center ma-2">
                <span>{{ $t('tip.limit_count') }}</span>
              </v-flex>
              <v-divider class="mx-2" />
              <v-list-item
                v-for="(time, index) in item.values"
                :key="index"
                class="text-body-2 text-center"
                link
                :style="{ color: time.value === limit ? `#1e88e5 !important` : `` }"
                @click="setLimit(time)"
              >
                <v-list-item-content>
                  <span class="font-weight-medium">
                    {{ time.text }}
                  </span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>
  </div>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'CountLimit',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        limit: 100,
        limitItems: [
          { text: '10', value: 10 },
          { text: '50', value: 50 },
          { text: '100', value: 100 },
          { text: '200', value: 200 },
          { text: '500', value: 500 },
          { text: '1000', value: 1000 },
        ],
        limitMenu: false,
      };
    },
    computed: {
      limitObj() {
        const t = this.limitItems.find((d) => {
          return d.value === this.limit;
        });
        if (t) return t;
        return '';
      },
    },
    methods: {
      setLimit(t) {
        this.limit = t.value;
        this.$emit('refreshLimit', this.limit);
      },
    },
  };
</script>
