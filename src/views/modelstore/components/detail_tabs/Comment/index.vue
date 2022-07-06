<template>
  <div class="comment" :style="{ height: `${height}px` }">
    <v-card v-for="(item, index) in commentItems" :key="index" class="mt-3" flat>
      <v-card-text class="pa-0">
        <v-flex class="kubegems__top-right mt-2">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" small text @click="editCommnet(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="replyCommnet(item)"> 回复 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeComment(item)"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
        <div class="d-flex flex-row comment-row mt-0">
          <div class="comment-text w-100 pa-4 px-6">
            <div class="mb-2">
              <v-icon color="primary" left small>{{ item.replyTo ? 'mdi-reply-all' : 'mdi-message-text' }}</v-icon>
              用户
              <span class="text-subtitle-2 mx-2">{{ item.username }}</span>
              <span class="text-muted"> {{ $moment(item.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }}</span>
              发布{{ item.replyTo ? '回复' : '评论' }}
            </div>
            <v-rating
              v-if="!item.replyTo"
              background-color="orange lighten-3"
              class="float-right mt-2"
              color="orange"
              dense
              small
              :value="item.rating"
            />
            <div v-if="item.replyTo" class="comment__reply grey lighten-4 rounded mx-4 px-3">
              <div>{{ item.replyTo.username }} 发布于 {{ $moment(item.replyTo.creationTime).format('lll') }}</div>
              “{{ item.replyTo.content }}”
            </div>
            <div class="d-block my-2 text-subtitle-2 font-weight-regular mt-4">{{ item.content }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card class="kubegems__full-height mt-3" flat max-height="114" min-height="114">
      <div class="kubegems__full-center">
        <v-btn block class="text-h6" color="primary" text @click="addComment">
          <v-icon left>mdi-plus-box</v-icon>
          添加评论
        </v-btn>
      </div>
    </v-card>

    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="modelCommentList"
    />

    <Reply ref="reply" @refresh="modelCommentList" />
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import Reply from './Reply';
  import { getModelCommentList, deleteModelComment } from '@/api';

  export default {
    name: 'Comment',
    components: {
      Reply,
    },
    data: () => ({
      commentItems: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 214) / this.Scale);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.modelCommentList();
      });
    },
    methods: {
      async modelCommentList() {
        const data = await getModelCommentList(this.$route.query.registry, this.$route.params.name, this.params);
        this.commentItems = data.list;
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      addComment() {
        this.$refs.reply.open('添加评论');
      },
      replyCommnet(item) {
        const data = {
          replyTo: {
            username: item.username,
            content: item.content,
            creationTime: item.creationTime,
          },
        };
        this.$refs.reply.init(data, true);
        this.$refs.reply.open('回复评论');
      },
      editCommnet(item) {
        this.$refs.reply.init(item, false);
        this.$refs.reply.open('编辑评论');
      },
      removeComment(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除评论`,
          content: {
            text: `删除该评论`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await deleteModelComment(this.$route.query.registry, this.$route.params.name, param.item.id);
            this.modelCommentList();
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .comment {
    position: relative;
    overflow-y: auto;

    &__reply {
      line-height: 40px;
      font-style: italic;
    }
  }
</style>
