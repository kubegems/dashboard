<template>
  <BaseDialog v-model="dialog" icon="mdi-comment" title="模型推荐指数" :width="500" @reset="reset">
    <template #content>
      <v-flex>
        <BaseSubTitle title="推荐指数定义" />
        <v-card-text class="pa-2">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="obj.recomment"
                  label="推荐指数"
                  :rules="objRules.recommentRules"
                  type="number"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateRecomment"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import { putUpdateModel } from '@/api';
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger, required } from '@/utils/rules';

  export default {
    name: 'Recommend',
    data() {
      return {
        dialog: false,
        valid: false,
        obj: {
          recomment: 0,
        },
        objRules: {
          recommentRules: [required, positiveInteger, (v) => v <= 100 || '格式错误(0-100)'],
        },
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateRecomment() {
        if (this.$refs.form.validate(true)) {
          const data = this.obj;
          await putUpdateModel(this.$route.params.name, Base64.encode(data.name), data);
          this.reset();
          this.$emit('refresh');
        }
      },
      init(item) {
        this.obj = deepCopy(item);
      },
      reset() {
        this.dialog = false;
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
