<template>
  <v-menu
    v-model="state.menu"
    attach="#agg_chart_operator"
    bottom
    close-on-click
    :close-on-content-click="false"
    max-height="350px"
    max-width="450px"
    min-width="200px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div id="agg_chart_operator" class="float-left">
        <v-btn
          :class="`mr-2 mt-0 font-weight-medium ${reverse ? 'white--text' : 'primary--text'}`"
          :color="reverse ? 'primary' : 'white'"
          dark
          depressed
          small
          :style="{ marginTop: `${0}px` }"
          v-on="on"
        >
          {{ i18n.t('tip.operator') }}: {{ operatorText }}
          <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <v-card class="pa-2 py-3" flat height="350px">
      <div class="select__div" :style="{ width: '100%' }">
        <div class="text-caption pa-1 mt-2">{{ i18n.t('tip.operator') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="250" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="idx" color="primary">
            <v-list-item v-for="(item, index) in operatorItems" :key="index" dense>
              <v-list-item-content @click="selectOperator(item)">
                <v-list-item-title class="select__list__title">
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="kubegems__clear-float" />
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { computed, reactive, ref } from 'vue';

  withDefaults(
    defineProps<{
      reverse?: boolean;
    }>(),
    {
      reverse: false,
    },
  );

  const i18n = useGlobalI18n();

  const state = reactive({
    menu: false,
  });

  const operator = ref('default');
  const operatorText = computed(() => {
    return (
      operatorItems.find((o) => {
        return o.value === operator.value;
      })?.text || 'default'
    );
  });
  const operatorItems = [
    { text: i18n.t('agg.default'), value: 'default' },
    { text: i18n.t('agg.max'), value: 'max' },
    { text: i18n.t('agg.min'), value: 'min' },
    { text: i18n.t('agg.avg'), value: 'avg' },
  ];

  const idx = ref(0);

  const emit = defineEmits(['input', 'change']);
  const selectOperator = (item) => {
    operator.value = item.value;
    state.menu = false;

    emit('input', item.value);
    emit('change', item.value);
  };
</script>
