<template>
  <ACEEditor
    ref="log"
    v-model="content"
    class="rounded-0"
    :lang="lang"
    :options="aceOptions"
    :style="{ height: `${height} !important` }"
    theme="chrome"
    @input="contentInput"
    @keydown.stop
  />
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import ACEEditor from 'vue2-ace-editor';

  import 'brace/theme/chrome';
  import 'brace/ext/language_tools';
  import 'brace/ext/searchbox';
  import 'brace/ext/beautify';
  import 'brace/mode/yaml';
  import 'brace/mode/json';
  import 'brace/mode/xml';
  import 'brace/mode/ini';
  import 'brace/mode/html';
  import 'brace/mode/java';
  import 'brace/mode/sh';
  import 'brace/mode/python';
  import 'brace/mode/golang';
  import 'brace/mode/c_cpp';
  import 'brace/mode/csharp';
  import 'brace/mode/css';
  import 'brace/mode/javascript';
  import 'brace/mode/properties';
  import 'brace/mode/plain_text';
  import 'brace/mode/sass';
  import 'brace/mode/scss';
  import 'brace/snippets/json';

  const props = withDefaults(
    defineProps<{
      lang?: string;
      height?: string;
      options?: any;
      value: string;
    }>(),
    {
      lang: 'yaml',
      height: void 0,
      options: void 0,
      value: '',
    },
  );

  const _aceOptions = ref({
    tabSize: 2,
    fontSize: 12,
    printMarginColumn: 100,
    showPrintMargin: false,
    wrap: true,
    readOnly: false,
  });

  const aceOptions = computed(() => {
    if (props.options) {
      return props.options;
    }
    return _aceOptions;
  });

  const emit = defineEmits(['input', 'change', 'instance']);
  const content = ref('');
  const contentInput = () => {
    emit('input', content.value);
    emit('change', content.value);
  };

  const log = ref(null);
  watch(
    () => props.value,
    (newVal) => {
      if (newVal) {
        content.value = newVal;
        emit('instance', log.value);
      }
    },
    { deep: true, immediate: true },
  );
</script>
