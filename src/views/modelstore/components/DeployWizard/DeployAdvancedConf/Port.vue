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
        label="端口配置"
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
            {{ item.hostPort }}
          </v-chip>
        </template>
      </v-combobox>
      <!-- <div id="model_deploy_port" class="port__anchor" /> -->
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="valid" class="px-2" lazy-validation @click.stop @submit.prevent>
          <v-row>
            <v-col>
              <v-text-field v-model="obj.name" label="端口名称" :rules="objRules.nameRules" />
            </v-col>
            <v-col>
              <v-autocomplete
                v-model="obj.protocol"
                hide-no-data
                hide-selected
                :items="protocolItems"
                label="协议"
                :menu-props="{
                  bottom: true,
                  left: true,
                  origin: `top center`,
                }"
              />
            </v-col>
            <v-col>
              <v-text-field v-model.number="obj.containerPort" label="容器端口" :rules="objRules.containerPortRules" />
            </v-col>
            <v-col>
              <v-text-field v-model="obj.hostIP" label="IP" :rules="objRules.hostIPRules" />
            </v-col>
            <v-col>
              <v-text-field v-model.number="obj.hostPort" label="端口" :rules="objRules.hostPortRules" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addPort"> 确定 </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'Port',
    data() {
      return {
        valid: false,
        menu: false,
        ports: [],
        obj: {
          name: '',
          containerPort: 0,
          hostIP: '',
          hostPort: 0,
          protocol: '',
        },
        objRules: {
          nameRules: [required],
          containerPortRules: [required],
          hostPortRules: [required],
          protocolRules: [required],
        },
        protocolItems: [{ text: 'tcp', value: 'tcp' }],
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

<style lang="scss" scoped>
  .port {
    &__anchor {
      position: relative;
    }
  }
</style>
