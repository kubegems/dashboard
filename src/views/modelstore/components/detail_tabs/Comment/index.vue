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
                  <v-btn color="primary" small text @click="replyCommnet(item, item.id)"> 回复 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeComment(item)"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
        <div class="d-flex flex-row comment-row mt-0">
          <div class="comment-text w-100 pa-4 px-6 pb-0">
            <div class="mb-2">
              <v-avatar color="primary" size="36">
                <span class="white--text text-h6">{{ item.username[0].toUpperCase() }}</span>
              </v-avatar>
              <span class="text-subtitle-1 mx-2 font-weight-medium">{{ item.username }}</span>
              <span class="text-muted text-caption kubegems__text">
                {{ $moment(item.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }} 发表评论
              </span>
            </div>
            <v-rating
              v-if="!item.replyTo"
              background-color="orange lighten-3"
              class="float-right mt-3"
              color="orange"
              dense
              readonly
              small
              :value="item.rating"
            />
            <div class="d-block my-2 text-subtitle-1 font-weight-regular mt-4 kubegems__text">{{ item.content }}</div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-4">
        <v-spacer />
        <v-btn color="primary" depressed small text @click="showReply(item, index)">
          <v-icon left small>{{ item.expand ? 'mdi-chevron-double-up' : 'mdi-comment-text-outline' }}</v-icon>
          {{ item.repliesCount }} 回复
        </v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-show="item.expand" class="ma-0 pa-0 px-8 pb-3">
          <div v-for="(reply, i) in replyItems" :key="i" class="my-1 comment__reply">
            <v-divider />
            <v-flex class="kubegems__top-right mt-1">
              <v-menu left>
                <template #activator="{ on }">
                  <v-btn icon>
                    <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-text class="pa-2 text-center">
                    <v-flex>
                      <v-btn color="primary" small text @click="replyCommnet(reply, item.id)"> 回复 </v-btn>
                    </v-flex>
                  </v-card-text>
                </v-card>
              </v-menu>
            </v-flex>
            <div class="ma-2">
              <v-avatar color="primary" size="24">
                <span class="white--text text-body-1">{{ reply.username[0].toUpperCase() }}</span>
              </v-avatar>
              <span class="text-subtitle-2 mx-2 font-weight-medium kubegems__text">{{ reply.username }}</span>
              <span class="text-muted text-caption kubegems__text">
                {{ $moment(reply.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }} 发表回复
              </span>
            </div>
            <div
              v-if="reply.replyTo && reply.replyTo.id !== reply.replyTo.rootID"
              class="comment__reply__content grey lighten-4 rounded mx-4 px-3 kubegems__text"
            >
              <div>{{ reply.replyTo.username }} 发布于 {{ $moment(reply.replyTo.creationTime).format('lll') }}</div>
              “{{ reply.replyTo.content }}”
            </div>
            <div class="d-block my-2 text-subtitle-2 font-weight-regular mt-4 mx-2 kubegems__text">
              {{ reply.content }}
            </div>
          </div>
        </div>
      </v-expand-transition>
    </v-card>
    <v-card class="kubegems__full-height mt-3" flat max-height="142" min-height="142">
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

    <Reply ref="reply" @refresh="refresh" />
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
      replyItems: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
        withRepliesCount: true,
      },
      expandIndex: [],
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
        this.commentItems = this.commentItems.map((c, index) => {
          return {
            ...c,
            expand: this.expandIndex === index,
          };
        });
        this.pageCount = Math.ceil(data.total / this.params.size);
        this.params.page = data.page;
      },
      async modelReplyList(commentid) {
        const data = await getModelCommentList(this.$route.query.registry, this.$route.params.name, {
          reply: commentid,
          size: 1000,
          noprocessing: true,
        });
        this.replyItems = data.list;
      },
      async showReply(item, index) {
        const comment = this.commentItems[index];
        if (comment.expand) {
          comment.expand = false;
          this.expandIndex = -1;
        } else {
          await this.modelReplyList(item.id);
          comment.expand = true;
          this.expandIndex = index;
        }
        const items = this.commentItems.map((c, i) => {
          return {
            ...c,
            expand: i === index && comment.expand,
          };
        });
        this.$set(this, 'commentItems', items);
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
        this.expandItems = [];
      },
      addComment() {
        this.$refs.reply.open('添加评论');
      },
      replyCommnet(item, rootId) {
        const data = {
          replyTo: {
            id: item.id,
            username: item.username,
            content: item.content,
            creationTime: item.creationTime,
            rootID: rootId,
          },
        };
        this.$refs.reply.init(data, true);
        this.$refs.reply.open('回复评论');
      },
      refresh(reply, commentid) {
        if (reply) {
          this.modelReplyList(commentid);
        }
        this.modelCommentList();
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
      position: relative;

      &__content {
        line-height: 30px;
        font-style: italic;
        font-size: 14px;
      }
    }
  }
</style>
