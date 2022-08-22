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
        v-model="ports"
        hide-no-data
        hide-selected
        :items="[]"
        :label="$t('tip.port_config')"
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
            @click:close="removePort(item)"
          >
            <strong class="mx-1"> {{ item.name }} </strong>
            {{ $t('tip.port') }} : {{ item.hostPort }}
          </v-chip>
        </template>
      </v-combobox>
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" class="px-2" lazy-validation @click.stop @submit.prevent>
          <v-row>
            <v-col>
              <v-text-field
                v-model="obj.name"
                :hint="$t('tip.port_name_hint')"
                :label="$t('tip.port_name')"
                :rules="objRules.nameRules"
              />
            </v-col>
            <v-col>
              <v-autocomplete
                v-model="obj.protocol"
                hide-no-data
                hide-selected
                :items="protocolItems"
                :label="$t('tip.protocol')"
                :menu-props="{
                  bottom: true,
                  left: true,
                  origin: `top center`,
                }"
                :rules="objRules.protocolRules"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model.number="obj.containerPort"
                :label="$t('tip.container_port')"
                :rules="objRules.containerPortRules"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model.number="obj.hostPort"
                :label="$t('tip.host_port')"
                :rules="objRules.hostPortRules"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addPort">
          {{ $root.$t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script>
  import messages from '../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'Port',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        valid: false,
        menu: false,
        ports: [],
        obj: {
          name: 'http',
          containerPort: 0,
          hostPort: 0,
          protocol: 'TCP',
          hostIP: '',
        },
        objRules: {
          nameRules: [required],
          containerPortRules: [required],
          hostPortRules: [required],
          protocolRules: [required],
        },
        protocolItems: [{ text: 'TCP', value: 'TCP' }],
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.ports = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      addPort() {
        if (this.$refs.form.validate(true)) {
          this.ports.push(deepCopy(this.obj));
          this.menu = false;
          this.obj = this.$options.data().obj;
          this.$refs.form.resetValidation();

          this.$emit('input', this.ports);
          this.$emit('change', this.ports);
        }
      },
      removePort(item) {
        const index = this.ports.findIndex((e) => {
          return e.name === item.name && e.value === item.value;
        });
        if (index > -1) {
          this.ports.splice(index, 1);
        }

        this.$emit('input', this.ports);
        this.$emit('change', this.ports);
      },
    },
  };
</script>
