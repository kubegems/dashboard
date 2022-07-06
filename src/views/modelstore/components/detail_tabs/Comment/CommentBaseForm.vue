<template>
  <v-flex>
    <BaseSubTitle title="模型评论定义" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
        <v-row>
          <v-col v-if="!reply" cols="12">
            <label class="v-label theme--light">评分</label>
            <v-rating
              v-model="obj.rating"
              background-color="orange lighten-3"
              color="orange"
              dense
              :rules="objRules.ratingRules"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="obj.content"
              auto-grow
              :label="reply ? '回复评论' : '评论'"
              :rules="objRules.contentRules"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'CommentBaseForm',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      reply: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        valid: false,
        obj: {
          rating: 0,
          content: '',
          postID: '',
          replyID: '',
        },
        objRules: {
          ratingRules: [required],
          contentRules: [required],
        },
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.setData(newValue);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      setData(data) {
        this.obj = deepCopy(data);
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      reset() {
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
    },
  };
</script>
