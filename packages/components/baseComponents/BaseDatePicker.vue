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
    v-model="state.menu"
    bottom
    :close-on-click="false"
    :close-on-content-click="false"
    left
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-btn
        :class="revert ? `primary--text pl-${pl}` : `white--text pl-${pl}`"
        :color="revert ? 'white' : 'primary'"
        depressed
        :small="small"
        :text="text"
        v-on="on"
      >
        <v-icon v-if="revert" left>mdi-calendar</v-icon>
        {{ currentDate }} <span v-if="timer" class="ml-2">{{ state.time }}</span>
        <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
        <v-icon v-else right>mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-card flat width="300px">
      <v-row>
        <v-col>
          <div v-if="timer" class="ma-3">
            <div class="time-label"> {{ i18n.t('datetimepicker.tip.start_end_short') }} </div>
            <v-divider class="mb-3" />
            <div class="d-flex align-center">
              <v-combobox
                v-model="state.time"
                attach
                dense
                flat
                hide-details
                :items="state.timeShortcutOptions"
                :label="i18n.t('datetimepicker.start')"
                solo
              />
            </div>
          </div>
          <v-date-picker v-model="currentDate" flat locale="zh-cn" no-title />
        </v-col>
      </v-row>
      <v-divider class="mx-1" />
      <v-card-actions class="px-3">
        <v-spacer />
        <v-btn color="primary" small @click="confirm">{{ i18n.t('operate.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import moment from 'moment';
  import { onMounted, reactive, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      text?: boolean;
      yesterday?: boolean;
      small?: boolean;
      revert?: boolean;
      pl?: number;
      timer?: boolean;
      value?: string;
    }>(),
    {
      text: false,
      yesterday: true,
      small: false,
      revert: false,
      pl: undefined,
      timer: false,
      value: '',
    },
  );

  const i18n = useGlobalI18n();

  const state = reactive({
    menu: false,
    timeShortcutOptions: [],
    time: '00:00:00',
  });

  const currentDate = ref<string>('');
  const emit = defineEmits(['date', 'input', 'change']);

  const confirm = (): void => {
    state.menu = false;
    emit('date', `${currentDate.value} ${state.time}`);
    emit('input', `${currentDate.value} ${state.time}`);
    emit('change', `${currentDate.value} ${state.time}`);
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        const [date, time] = newValue.split(' ');
        currentDate.value = date || moment().format('YYYY-MM-DD');
        state.time = time;
      }
    },
    { deep: true, immediate: true },
  );

  const generateTimeShortcutOptions = (): void => {
    const opts: string[] = [];
    for (let i = 0; i < 24; i++) {
      const h = i.toString().padStart(2, '0');
      opts.push(`${h}:00:00`, `${h}:30:00`);
    }
    state.timeShortcutOptions = opts;
  };

  onMounted(() => {
    generateTimeShortcutOptions();
    if (!props.timer) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      currentDate.value = props.yesterday ? moment(yesterday).format('YYYY-MM-DD') : moment(today).format('YYYY-MM-DD');
    }
  });
</script>

<style lang="scss" scoped>
  .v-picker--date {
    box-shadow: none !important;
  }
  .time-label {
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color: rgba(#000000, 0.6);
    margin-bottom: 4px;
  }
</style>
