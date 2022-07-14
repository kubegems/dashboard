<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-card-text class="px-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.strategy.canary.steps[0].setWeight"
            class="my-0"
            label="灰度流量比例"
            required
            :rules="canaryRules.setWeightRule"
            suffix="%"
            type="number"
            @keyup="onWeightInput"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger } from '@/utils/rules';

  export default {
    name: 'DefaultTraffic',
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        canaryRules: {
          setWeightRule: [positiveInteger],
        },
        obj: {
          strategy: {
            canary: {
              steps: [
                {
                  setWeight: 10,
                },
              ],
            },
          },
        },
      };
    },
    mounted() {
      if (this.data && this.data.strategy.type === 'Canary') {
        this.obj = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.obj = deepCopy(data);
      },
      onWeightInput() {
        this.$emit('updateComponentData', this.obj);
      },
      reset() {
        this.obj = deepCopy(this.$options.data().obj);
      },
      validate() {
        return this.$refs.form.validate(true);
      },
    },
  };
</script>
