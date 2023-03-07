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
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-text-field
      :id="id"
      class="my-2"
      :label="pathLevel === 1 ? '' : label"
      :placeholder="param.placeholder || ''"
      :rules="rules"
      :type="inputType ? inputType : 'text'"
      :value="param.value"
      @change="changed($event)"
    >
      <template v-if="allowDelete" #append-outer>
        <v-btn color="error" icon small @click="removeItem">
          <v-icon small>mdi-close-box</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-flex>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, onMounted } from 'vue';

  import { useGlobalI18n } from '@/i18n';
  import { required, timeInterval } from '@/utils/rules';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      inputType?: string;
      allowDelete?: boolean;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      inputType: '',
      allowDelete: false,
    },
  );

  const i18n = useGlobalI18n();

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules: ComputedRef<any> = computed(() => {
    if (props.param.type?.indexOf('null') > -1 && !props.param.value) {
      return [];
    }
    if (props.param.minLength === 0) {
      return [];
    } else if (props.param.minLength > 0) {
      let rule = [(v) => v?.length >= props.param.minLength || i18n.t('ruler.lt_min', [props.param.minLength])];
      if (props.param.maxLength) {
        rule = rule.concat([
          (v) => v?.length <= props.param.maxLength || i18n.t('ruler.gt_max', [props.param.maxLength]),
        ]);
      }
      return rule;
    }
    if (props.param.minimum && props.param.maximum) {
      return [
        (v) => parseFloat(v || 0) >= props.param.minimum || i18n.t('ruler.lt_num_min', [props.param.minimum]),
        (v) => parseFloat(v || 0) <= props.param.maximum || i18n.t('ruler.gt_num_max', [props.param.maximum]),
      ];
    }
    if (props.param.pattern) {
      return (v) => !v || !!new RegExp(props.param.pattern).test(v) || i18n.t('ruler.regexp', [props.param.pattern]);
    }
    if (props.param.format === 'duration') {
      return [required, timeInterval];
    } else if (props.param.format === 'date-time') {
      return [
        required,
        (v) => !v || !!new RegExp('(^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$)').test(v) || i18n.t('ruler.datetime'),
      ];
    } else if (props.param.format === 'time') {
      return [required, (v) => !v || !!new RegExp('(^\\d{2}:\\d{2}:\\d{2}$)').test(v) || i18n.t('ruler.time')];
    } else if (props.param.format === 'date') {
      return [required, (v) => !v || !!new RegExp('(^\\d{4}-\\d{2}-\\d{2}$)').test(v) || i18n.t('ruler.date')];
    }
    return [required];
  });

  const emit = defineEmits(['changeBasicFormParam', 'removeItem']);
  const changed = (value: number | string): void => {
    if (props.inputType === 'number' && value) {
      value = parseFloat(value.toString());
    }
    if (value) {
      emit('changeBasicFormParam', props.param, value);
    } else {
      emit('changeBasicFormParam', props.param, null);
    }
  };

  const removeItem = () => {
    emit('removeItem', props.param.path);
  };

  onMounted(() => {
    changed(props.param.value);
  });
</script>
