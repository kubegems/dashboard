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
    v-model="state.showPicker"
    bottom
    :close-on-content-click="false"
    :disabled="disabled"
    left
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
    @input="menuInput"
  >
    <template #activator="{ on }">
      <v-btn
        v-if="!inForm"
        :class="color === 'white' ? `primary--text` : `white--text`"
        :color="color"
        dark
        depressed
        :small="small"
        :style="{ marginTop: `${offsetY}px` }"
        v-on="on"
      >
        {{ label }}
        <v-icon right>mdi-chevron-{{ state.showPicker ? 'up' : 'down' }}</v-icon>
      </v-btn>

      <v-text-field v-else class="my-0" :label="i18n.t('tip.start_end')" :value="label" v-on="on" />
    </template>

    <v-card class="pa-3" flat width="550px">
      <v-row>
        <!-- 快捷选项 -->
        <v-col v-if="!inForm" cols="3">
          <v-list-item
            v-for="item in dateShortcutOptions"
            :key="item.value"
            class="v-list-item__title text-caption font-weight-medium"
            :class="{
              'v-item--active v-list-item--active': state.shortcut === item.value,
            }"
            color="primary"
            :style="{ minHeight: `40px` }"
            @click="shortcutDate(item)"
          >
            {{ item.text }}
          </v-list-item>
        </v-col>
        <!-- 快捷选项 -->

        <v-divider v-if="!inForm" class="my-4" vertical />

        <!-- 选择面板 -->
        <v-col :cols="inForm ? 12 : 9">
          <div class="time-label"> {{ i18n.t('datetimepicker.tip.start_end') }} </div>
          <v-divider class="mb-3" />
          <div class="d-flex align-center">
            <v-combobox
              v-model="state.time[0]"
              attach
              dense
              flat
              hide-details
              :items="state.timeShortcutOptions"
              :label="i18n.t('datetimepicker.start')"
              solo
              @blur="comboboxBlurd($event, 0)"
              @change="touchChanged"
            />
            <span class="mx-2">~</span>
            <v-combobox
              v-model="state.time[1]"
              attach
              dense
              flat
              hide-details
              :items="state.timeShortcutOptions"
              :label="i18n.t('datetimepicker.end')"
              solo
              @blur="comboboxBlurd($event, 1)"
              @change="touchChanged"
            />
          </div>
          <v-date-picker
            v-model="state.date"
            class="mt-4"
            flat
            :locale="store.state.Locale === 'zh-Hans' ? 'zh-cn' : store.state.Locale"
            no-title
            range
            @change="touchChanged"
          />
        </v-col>
        <!-- 选择面板 -->
      </v-row>

      <!-- 确认 -->
      <v-divider class="my-1" />
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn v-if="clearable" color="error" small @click="clear">{{ i18n.t('operate.clear') }}</v-btn>
        <v-btn color="primary" small @click="confirm">{{ i18n.t('operate.confirm') }}</v-btn>
      </v-card-actions>
      <!-- 确认 -->
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useName, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { formatDatetime } from '@kubegems/libs/utils/helpers';
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      clearable?: boolean;
      color?: string;
      defaultValue?: number;
      defaultValueForQuery?: boolean;
      disabled?: boolean;
      inForm?: boolean;
      offsetY?: number;
      closeRestoreState?: boolean;
      queryEndTimeKey?: string;
      queryStartTimeKey?: string;
      small?: boolean;
      value: Date[];
      valueChangeToQuery?: boolean;
      valueFormat?: string;
    }>(),
    {
      clearable: false,
      color: 'white',
      defaultValue: undefined,
      defaultValueForQuery: false,
      disabled: false,
      inForm: false,
      offsetY: 0,
      closeRestoreState: true,
      queryEndTimeKey: 'timeEnd',
      queryStartTimeKey: 'timeStart',
      small: true,
      value: undefined,
      valueChangeToQuery: false,
      valueFormat: 'timestamp',
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();
  const query = useQuery();
  const router = useRouter();
  const routeName = useName();

  const dateShortcutOptions = [
    { text: i18n.t('datetimepicker.last.5'), value: 5, type: 'relative' },
    { text: i18n.t('datetimepicker.last.15'), value: 15, type: 'relative' },
    { text: i18n.t('datetimepicker.last.30'), value: 30, type: 'relative' },
    { text: i18n.t('datetimepicker.last.60'), value: 60, type: 'relative' },
    { text: i18n.t('datetimepicker.last.180'), value: 180, type: 'relative' },
    { text: i18n.t('datetimepicker.last.360'), value: 360, type: 'relative' },
    { text: i18n.t('datetimepicker.last.720'), value: 720, type: 'relative' },
    { text: i18n.t('datetimepicker.last.1440'), value: 1440, type: 'relative' },
    { text: i18n.t('datetimepicker.last.2880'), value: 2880, type: 'relative' },
    { text: i18n.t('datetimepicker.last.10080'), value: 10080, type: 'relative' },
  ];

  const status = ref<any>({});
  const state = reactive<any>({
    showPicker: false,
    datetime: [],
    date: [],
    time: ['00:00:00', '23:59:59'],
    type: props.defaultValue ? 'relative' : 'absolute',
    shortcut: props.defaultValue,
    timeShortcutOptions: [],
    touch: false,
  });

  const label: ComputedRef = computed(() => {
    if (!state.datetime.length) {
      return i18n.t('datetimepicker.tip.range');
    }
    if (state.type === 'relative' && state.shortcut && !props.inForm) {
      return (
        dateShortcutOptions.find((item) => item.value === state.shortcut)?.text ||
        i18n.t('datetimepicker.last.last_c', [state.shortcut])
      );
    } else {
      return `${formatDatetime(state.datetime[0], 'yyyy-MM-dd hh:mm:ss')} - ${formatDatetime(
        state.datetime[1],
        'yyyy-MM-dd hh:mm:ss',
      )}`;
    }
  });

  const generateTimeShortcutOptions = (): void => {
    const opts: string[] = [];
    for (let i = 0; i < 24; i++) {
      const h = i.toString().padStart(2, '0');
      opts.push(`${h}:00:00`, `${h}:30:00`);
    }
    state.timeShortcutOptions = opts;
  };

  // 设置date、time及datetime的值
  const setDatetime = (start: Date, end: Date): void => {
    if (start && end) {
      state.datetime = [formatDatetime(start, props.valueFormat), formatDatetime(end, props.valueFormat)];
      state.date = [formatDatetime(start, 'yyyy-MM-dd'), formatDatetime(end, 'yyyy-MM-dd')];
      state.time = [formatDatetime(start, 'hh:mm:ss').toString(), formatDatetime(end, 'hh:mm:ss').toString()];
    }
  };

  // 根据query中设置值
  const setDatetimeByQuery = (): void => {
    if (!props.defaultValueForQuery) return;
    let start =
      Number(query.value[props.queryStartTimeKey]) ||
      Date.parse(new Date(query.value[props.queryStartTimeKey]).toString());
    let end =
      Number(query.value[props.queryEndTimeKey]) || Date.parse(new Date(query.value[props.queryEndTimeKey]).toString());
    if (start && end) {
      start = new Date(start).getTime();
      end = new Date(end).getTime();
      const s = start < end ? start : end;
      const e = start > end ? start : end;
      setDatetime(new Date(s), new Date(e));
      state.type = 'absolute';
      state.shortcut = undefined;
    }
  };

  // 根据快捷选项设置值
  const setDatetimeByShortcut = (): void => {
    if (state.shortcut) {
      const end = Date.now();
      const start = end - state.shortcut * 60 * 1000;
      setDatetime(new Date(start), new Date(end));
      state.type = 'relative';
    }
  };

  // 保存状态
  const saveState = (): void => {
    status.value = {
      datetime: [...state.datetime],
      date: [...state.date],
      time: [...state.time],
      type: state.type,
      shortcut: state.shortcut,
      touch: state.touch,
    };
  };

  // 恢复状态
  const restoreState = (): void => {
    state.datetime = status.value.datetime;
    state.date = status.value.date;
    state.time = status.value.time;
    state.type = status.value.type;
    state.shortcut = status.value.shortcut;
    state.touch = status.value.touch;
    status.value = {};
  };

  // 菜单v-model内部发生变更
  const menuInput = (value: string): void => {
    if (value) {
      saveState();
    } else {
      if (props.closeRestoreState) {
        restoreState();
      }
    }
  };

  // 触碰标记
  const touchChanged = (): void => {
    state.touch = true;
  };

  // 失焦验证
  const comboboxBlurd = (e: any, type: number): void => {
    const value = e.target.value;
    let time = '';
    switch (true) {
      // 验证1~2位数字格式(1、12)
      case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])$').test(value): {
        time = `${value.padStart(2, '0')}:00:00`;
        break;
      }
      // 验证4位数字格式(1230)
      case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?[0-5][0-9]$').test(value): {
        const str = value.padStart(4, '0');
        time = `${str.slice(0, 2)}:${str.slice(2, 4)}:00`;
        break;
      }
      // 验证6位数字(123034)
      case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?([0-5][0-9]){2}$').test(value): {
        const str = value.padStart(6, '0');
        time = `${str.slice(0, 2)}:${str.slice(2, 4)}:${str.slice(4, 6)}`;
        break;
      }
      // 验证时分格式(12:30)
      case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?:[0-5][0-9]$').test(value): {
        const str = value.padStart(5, '0');
        time = `${str}:00`;
        break;
      }
      // 验证时分秒格式(12:30:30)
      case new RegExp('^([0-9]|[0-1][0-9]|2[0-3])?(:[0-5][0-9]){2}$').test(value): {
        time = value.padStart(8, '0');
        break;
      }
      // 格式错误
      default: {
        time = type === 0 ? '00:00:00' : '23:59:59';
      }
    }
    if (state.time[type] !== time) {
      state.touch = true;
      state.time[type] = time;
    }
  };

  // 验证时间顺序
  const checkDatetime = (): void => {
    if (state.datetime.length === 0) return;
    let start = new Date(state.datetime[0]).getTime();
    let end = new Date(state.datetime[1]).getTime();
    if (start > end) {
      const v = [...state.datetime];
      if (state.date[0] === state.date[1]) {
        state.time = [formatDatetime(v[1], 'hh:mm:ss').toString(), formatDatetime(v[0], 'hh:mm:ss').toString()];
      } else {
        state.date = [formatDatetime(v[1], 'yyyy-MM-dd'), formatDatetime(v[0], 'yyyy-MM-dd')];
      }
      state.datetime = [new Date(`${state.date[0]} ${state.time[0]}`), new Date(`${state.date[1]} ${state.time[1]}`)];
    }
  };

  // 检查是否手动触碰值
  const checkTouch = (): void => {
    if (state.touch) {
      state.type = 'absolute';
      state.shortcut = undefined;
    }
    state.touch = false;
  };

  // 快捷日期
  const shortcutDate = (item: any): void => {
    state.type = item.type;
    state.shortcut = item.value;
    setDatetimeByShortcut();
    emit();
    state.touch = false;
    state.showPicker = false;
  };

  const em = defineEmits(['input', 'change']);
  // input、change事件分发
  const emit = (emitChange = true): void => {
    if (props.valueChangeToQuery) {
      router.replace({
        name: routeName.value,
        query: {
          ...query.value,
          [props.queryStartTimeKey]: state.datetime[0],
          [props.queryEndTimeKey]: state.datetime[1],
        },
      });
    }
    em('input', [...state.datetime]);
    if (emitChange) {
      em('change', [...state.datetime]);
    }
  };

  // 取消
  const cancel = (): void => {
    restoreState();
    state.showPicker = false;
  };

  // 确认
  const confirm = (): void => {
    if (state.date.length === 0) {
      state.touch = true;
      state.datetime = [];
    } else {
      if (state.date.length === 1) {
        state.touch = true;
        state.date = [state.date[0], state.date[0]];
      }
      state.datetime = [
        new Date(`${state.date[0]} ${state.time[0]}`).getTime(),
        new Date(`${state.date[1]} ${state.time[1]}`).getTime(),
      ];
    }
    checkDatetime();
    emit();
    checkTouch();
    state.showPicker = false;
  };

  /**
   * 支持组件实例调用方法
   */
  // 清空值
  const clear = (emitChange = true): void => {
    state.datetime = [];
    state.date = [];
    state.time = ['00:00:00', '23:59:59'];
    state.shortcut = undefined;
    state.type = 'absolute';
    state.showPicker = false;
    state.touch = false;
    emit(emitChange);
  };

  // 相对时间更新值
  const refresh = (emitChange: boolean): void => {
    if (state.type === 'relative') {
      setDatetimeByShortcut();
    }
    emit(emitChange);
  };

  // 设置快捷值
  const setShortcut = (value: number): void => {
    state.shortcut = value || 5;
    shortcutDate(dateShortcutOptions[state.shortcut]);
  };

  defineExpose({
    setShortcut,
    refresh,
    cancel,
  });

  onMounted(() => {
    generateTimeShortcutOptions();
    setDatetime(props.value[0], props.value[1]);
    setDatetimeByShortcut();
    setDatetimeByQuery();
    emit(false);
  });

  watch(
    () => props.value,
    async (newValue) => {
      if (!newValue) return;
      if (newValue[0] !== state.datetime[0] || newValue[1] !== state.datetime[1]) {
        state.type = 'absolute';
        state.shortcut = undefined;
        setDatetime(newValue[0], newValue[1]);
      }
    },
    { immediate: true },
  );
</script>

<style lang="scss" scoped>
  .time-label {
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color: rgba(#000000, 0.6);
    margin-bottom: 4px;
  }

  .v-picker--date {
    box-shadow: none !important;
  }
</style>
