<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->
<template>
  <div id="model__comment" class="comment" :style="{ height: `${height}px`, overflowY: 'auto' }">
    <div v-scroll:#model__comment="$_.debounce(onScroll, 50)">
      <v-card v-for="(item, index) in commentItems" :key="index" class="mt-3" flat>
        <v-card-text class="pa-0">
          <v-flex class="kubegems__top-right mt-2">
            <v-menu left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2 text-center">
                  <v-flex v-if="User.Username === item.username">
                    <v-btn color="primary" small text @click="editCommnet(item)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="primary" small text @click="replyCommnet(item, item.id)">
                      {{ $t('operate.reply') }}
                    </v-btn>
                  </v-flex>
                  <v-flex v-if="User.Username === item.username">
                    <v-btn color="error" small text @click="removeComment(item)">
                      {{ $root.$t('operate.delete') }}
                    </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-flex>
          <div class="d-flex flex-row comment-row mt-0">
            <div class="comment-text w-100 pa-4 px-6 pb-0">
              <div class="mb-2">
                <v-avatar color="primary" size="50">
                  <span class="white--text text-h6">{{ item.username ? item.username[0].toUpperCase() : '' }}</span>
                </v-avatar>
                <span class="text-subtitle-1 mx-2 font-weight-medium">{{ item.username }}</span>
                <span class="text-muted text-caption kubegems__text">
                  {{ $moment(item.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }} {{ $t('operate.publish_comment') }}
                </span>
              </div>
              <v-rating
                v-if="!item.replyTo"
                background-color="orange lighten-3"
                class="float-right mt-1"
                color="orange"
                dense
                readonly
                small
                :value="item.rating"
              />
              <div class="d-block text-subtitle-2 font-weight-regular mt-3 kubegems__text">{{ item.content }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pt-1">
          <v-spacer />
          <v-btn color="primary" depressed small text @click="showReply(item, index)">
            <v-icon left small>{{ item.expand ? 'mdi-chevron-double-up' : 'mdi-comment-text-outline' }}</v-icon>
            {{ item.repliesCount || 0 }} {{ $t('operate.reply') }}
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
                      <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-text class="pa-2 text-center">
                      <v-flex v-if="User.Username === item.username">
                        <v-btn color="primary" small text @click="editCommnet(reply, true)">
                          {{ $root.$t('operate.edit') }}
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn color="primary" small text @click="replyCommnet(reply, item.id)">
                          {{ $t('operate.reply') }}
                        </v-btn>
                      </v-flex>
                      <v-flex v-if="User.Username === item.username">
                        <v-btn color="error" small text @click="removeComment(reply, true, item.id)">
                          {{ $root.$t('operate.delete') }}
                        </v-btn>
                      </v-flex>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </v-flex>
              <div class="ma-2">
                <v-avatar color="primary" size="24">
                  <span class="white--text text-body-1">{{
                    reply.username ? reply.username[0].toUpperCase() : ''
                  }}</span>
                </v-avatar>
                <span class="text-subtitle-2 mx-2 font-weight-medium kubegems__text">{{ reply.username }}</span>
                <span class="text-muted text-caption kubegems__text">
                  {{ $moment(reply.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }} {{ $t('operate.publish_reply') }}
                </span>
              </div>
              <div
                v-if="reply.replyTo && reply.replyTo.id !== reply.replyTo.rootID"
                class="comment__reply__content grey lighten-4 rounded mx-4 px-3 kubegems__text"
              >
                <div>
                  {{ reply.replyTo.username }} {{ $t('tip.published_at') }}
                  {{ $moment(reply.replyTo.creationTime).format('lll') }}
                </div>
                “{{ reply.replyTo.content }}”
              </div>
              <div class="d-block my-2 text-subtitle-2 font-weight-regular mt-3 mx-2 kubegems__text">
                {{ reply.content }}
              </div>
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <div v-if="loading" class="my-3 py-2 text-center card__scroll__loading">
      <BaseDropProgress />
    </div>

    <v-btn
      v-if="offsetTop"
      bottom
      class="comment__top"
      color="primary"
      direction="left"
      fab
      fixed
      right
      transition="slide-x-reverse-transition"
      @click="goToTop"
    >
      <v-icon>mdi-chevron-double-up</v-icon>
    </v-btn>

    <v-btn
      bottom
      class="comment__add"
      color="primary"
      direction="left"
      fab
      fixed
      right
      transition="slide-x-reverse-transition"
      @click="addComment"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <Reply ref="reply" @refresh="refresh" />
  </div>
</template>

<script>
  import { Base64 } from 'js-base64';
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import Reply from './Reply';
  import { deleteModelComment, getModelCommentList } from '@/api';

  export default {
    name: 'Comment',
    i18n: {
      messages: messages,
    },
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
      offsetTop: 0,
      loading: false,
    }),
    computed: {
      ...mapState(['Scale', 'User']),
      height() {
        return parseInt((window.innerHeight - 202) / this.Scale);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.modelCommentList();
      });
    },
    methods: {
      async modelCommentList() {
        const data = await getModelCommentList(
          this.$route.query.registry,
          Base64.encode(this.$route.params.name),
          this.params,
        );
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
        const data = await getModelCommentList(this.$route.query.registry, Base64.encode(this.$route.params.name), {
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
      addComment() {
        this.$refs.reply.open(this.$root.$t('operate.add_c', [this.$t('tip.comment')]));
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
        this.$refs.reply.open(this.$t('operate.reply_c', [this.$t('tip.comment')]));
      },
      refresh(reply, commentid) {
        if (reply) {
          this.modelReplyList(commentid);
        }
        this.modelCommentList();
        this.$emit('refresh');
      },
      editCommnet(item, reply = false) {
        this.$refs.reply.init(item, reply);
        this.$refs.reply.open(this.$root.$t('operate.edit_c', [this.$t('tip.comment')]));
      },
      removeComment(item, reply, commentid) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('tip.comment')]),
          content: {
            text: this.$root.$t('operate.delete_c', [this.$t('tip.comment')]),
            type: 'confirm',
          },
          param: { item, reply, commentid },
          doFunc: async (param) => {
            await deleteModelComment(this.$route.query.registry, Base64.encode(this.$route.params.name), param.item.id);
            this.refresh(param.reply, param.commentid);
          },
        });
      },
      onScroll(e) {
        this.offsetTop = e.target.scrollTop;
        if (e.target.scrollTop + document.getElementById('model__comment').clientHeight >= e.target.scrollHeight - 1) {
          this.params.page += 1;
          if (this.pageCount < this.params.page) return;
          this.loading = true;
          this.modelCommentList();
          this.loading = false;
        }
      },
      goToTop() {
        const container = document.getElementById('model__comment');
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
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

    &__top {
      bottom: 130px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }

    &__add {
      bottom: 75px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }
  }
</style>
