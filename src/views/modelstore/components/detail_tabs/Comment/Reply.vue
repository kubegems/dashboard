<template>
  <BaseDialog v-model="dialog" icon="mdi-comment" :title="title" :width="500" @reset="reset">
    <template #content>
      <component :is="formComponent" :ref="formComponent" :item="item" :reply="reply" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="addComment"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import CommentBaseForm from './CommentBaseForm';
  import { postModelComment, putModelComment } from '@/api';

  export default {
    name: 'Reply',
    components: {
      CommentBaseForm,
    },
    data() {
      return {
        dialog: false,
        title: '',
        formComponent: 'CommentBaseForm',
        reply: false,
        item: null,
      };
    },
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      open(title) {
        this.dialog = true;
        this.title = title;
      },
      async addComment() {
        if (this.$refs[this.formComponent].validate()) {
          const data = this.$refs[this.formComponent].getData();
          if (data.id) {
            await putModelComment(this.$route.query.registry, this.$route.params.name, data.id, data);
          } else {
            await postModelComment(this.$route.query.registry, this.$route.params.name, data);
          }
          this.reset();
          this.$emit('refresh', this.reply, data?.replyTo?.rootID);
        }
      },
      init(item, reply) {
        this.reply = reply;
        this.item = item;
      },
      reset() {
        this.dialog = false;
        this.$refs[this.formComponent].reset();
      },
    },
  };
</script>
