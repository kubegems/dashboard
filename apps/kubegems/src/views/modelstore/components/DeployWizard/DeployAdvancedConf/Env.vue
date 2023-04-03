<template>
  <v-menu
    v-model="state.menu"
    bottom
    :close-on-content-click="false"
    left
    nudge-top="20"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-combobox
        v-model="env"
        hide-no-data
        hide-selected
        :items="[]"
        :label="i18nLocal.t('tip.env')"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        multiple
        v-on="on"
      >
        <template #selection="{ item }">
          <v-chip
            class="my-1"
            close
            close-icon="mdi-close-circle"
            color="primary"
            small
            text-color="white"
            @click:close="removeEnv(item)"
          >
            <strong class="mx-1"> {{ item.name }} </strong>
            {{ item.value }}
          </v-chip>
        </template>
      </v-combobox>
      <!-- <div id="model_deploy_env" class="env__anchor" /> -->
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="state.valid" class="px-2" lazy-validation @click.stop @submit.prevent>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="obj.name" :label="i18n.t('form.key')" :rules="objRules.name" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="obj.value" :label="i18n.t('form.value')" :rules="objRules.value" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addEnv">
          {{ i18n.t('operate.confirm') }}</v-btn
        >
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { required } from '@kubegems/libs/utils/rules';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';

  const props = withDefaults(
    defineProps<{
      value: any[];
    }>(),
    {
      value: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const state = reactive({
    valid: false,
    menu: false,
  });

  const obj = ref({
    name: '',
    value: '',
  });
  const objRules = {
    name: [required],
    value: [required],
  };
  const env = ref<{ name: string; value: string }[]>([]);

  const emit = defineEmits(['input', 'change']);
  const form = ref(null);
  const addEnv = (): void => {
    if (form.value.validate(true)) {
      env.value.push(deepCopy(obj.value));
      state.menu = false;
      obj.value = {
        name: '',
        value: '',
      };
      form.value.resetValidation();

      emit('input', env.value);
      emit('change', env.value);
    }
  };

  const removeEnv = (item: { name: string; value: string }): void => {
    const index = env.value.findIndex((e) => {
      return e.name === item.name && e.value === item.value;
    });
    if (index > -1) {
      env.value.splice(index, 1);
    }

    emit('input', env.value);
    emit('change', env.value);
  };

  watch(
    () => props.value,
    async (newValue) => {
      if (!newValue) return;
      env.value = newValue;
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .env {
    &__anchor {
      position: relative;
    }
  }
</style>
