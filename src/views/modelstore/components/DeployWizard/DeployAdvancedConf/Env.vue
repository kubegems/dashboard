<template>
  <v-menu
    v-model="menu"
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
        :label="$t('tip.env')"
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
        <v-form ref="form" v-model="valid" class="px-2" lazy-validation @click.stop @submit.prevent>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="obj.name" :label="$root.$t('form.key')" :rules="objRules.nameRules" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="obj.value" :label="$root.$t('form.value')" :rules="objRules.valueRules" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addEnv">
          {{ $root.$t('operate.confirm') }}</v-btn
        >
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'Env',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        valid: false,
        menu: false,
        env: [],
        obj: {
          name: '',
          value: '',
        },
        objRules: {
          nameRules: [required],
          valueRules: [required],
        },
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.env = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      addEnv() {
        if (this.$refs.form.validate(true)) {
          this.env.push(deepCopy(this.obj));
          this.menu = false;
          this.obj = this.$options.data().obj;
          this.$refs.form.resetValidation();

          this.$emit('input', this.env);
          this.$emit('change', this.env);
        }
      },
      removeEnv(item) {
        const index = this.env.findIndex((e) => {
          return e.name === item.name && e.value === item.value;
        });
        if (index > -1) {
          this.env.splice(index, 1);
        }

        this.$emit('input', this.env);
        this.$emit('change', this.env);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .env {
    &__anchor {
      position: relative;
    }
  }
</style>
