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
    <div v-scroll:#model__comment="_.debounce(scrolled, 50)">
      <v-card v-for="(item, index) in pagination.items" :key="index" class="mt-3" flat>
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
                  <v-flex v-if="store.state.User.Username === item.username">
                    <v-btn color="primary" small text @click="editCommnet(item)">
                      {{ i18n.t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="primary" small text @click="replyCommnet(item, item.id)">
                      {{ i18nLocal.t('operate.reply') }}
                    </v-btn>
                  </v-flex>
                  <v-flex v-if="store.state.User.Username === item.username">
                    <v-btn color="error" small text @click="removeComment(item)">
                      {{ i18n.t('operate.delete') }}
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
                  {{ moment(item.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }}
                  {{ i18nLocal.t('operate.publish_comment') }}
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
            {{ item.repliesCount || 0 }} {{ i18nLocal.t('operate.reply') }}
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
                      <v-flex v-if="store.state.User.Username === item.username">
                        <v-btn color="primary" small text @click="editCommnet(reply, true)">
                          {{ i18n.t('operate.edit') }}
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn color="primary" small text @click="replyCommnet(reply, item.id)">
                          {{ i18nLocal.t('operate.reply') }}
                        </v-btn>
                      </v-flex>
                      <v-flex v-if="store.state.User.Username === item.username">
                        <v-btn color="error" small text @click="removeComment(reply, true, item.id)">
                          {{ i18n.t('operate.delete') }}
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
                  {{ moment(reply.creationTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() }}
                  {{ i18nLocal.t('operate.publish_reply') }}
                </span>
              </div>
              <div
                v-if="reply.replyTo && reply.replyTo.id !== reply.replyTo.rootID"
                class="comment__reply__content grey lighten-4 rounded mx-4 px-3 kubegems__text"
              >
                <div>
                  {{ reply.replyTo.username }} {{ i18nLocal.t('tip.published_at') }}
                  {{ moment(reply.replyTo.creationTime).format('lll') }}
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
      <BaseDropProgress :progress="config.layout.PLATFORM" />
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

<script lang="ts" setup>
  import { useAiModelCommentPagination } from '@kubegems/api/hooks/ai_model';
  import { AIModelComment } from '@kubegems/api/typed/ai_model';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import _ from 'lodash';
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref } from 'vue';

  import config from '../../../../../config.json';
  import { useI18n } from '../../../i18n';
  import Reply from './Reply.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const query = useQuery();
  const params = useParams();

  const height: ComputedRef<number> = computed(() => {
    return parseInt(((window.innerHeight - 202) / store.state.Scale).toString());
  });

  let pagination: Pagination<AIModelComment> = reactive<Pagination<AIModelComment>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const expandIndex = ref<number>(undefined);
  const getModelCommentList = async (): Promise<void> => {
    const data = await useAiModelCommentPagination(
      new AIModelComment(),
      query.value.registry,
      params.value.name,
      pagination.page,
      pagination.size,
      { withRepliesCount: true },
    );
    data.items = data.items.map((d, index) => {
      return new AIModelComment({
        ...d,
        expand: expandIndex.value === index,
      });
    });
    if (pagination.page === 1) {
      pagination = Object.assign(pagination, data);
      goToTop();
    } else {
      pagination.items = pagination.items.concat(data.items);
    }
  };

  const replyItems = ref<AIModelComment[]>([]);
  const getModelReplyList = async (commentid): Promise<void> => {
    const data = await new AIModelComment().getCommentList(query.value.registry, params.value.name, {
      reply: commentid,
      size: 1000,
      noprocessing: true,
      page: 1,
    });
    replyItems.value = convertResponse2List<AIModelComment>(data);
  };

  const showReply = async (item: AIModelComment, index: number): Promise<void> => {
    const comment = pagination.items[index];
    if (comment.expand) {
      comment.expand = false;
      expandIndex.value = -1;
    } else {
      await getModelReplyList(item.id);
      comment.expand = true;
      expandIndex.value = index;
    }
    pagination.items = pagination.items.map((c, i) => {
      return new AIModelComment({
        ...c,
        expand: i === index && comment.expand,
      });
    });
  };

  const reply = ref(null);
  const addComment = (): void => {
    reply.value.open(i18n.t('operate.add_c', [i18nLocal.t('tip.comment')]));
  };

  const replyCommnet = (item: AIModelComment, rootId: string): void => {
    const data = {
      replyTo: {
        id: item.id,
        username: item.username,
        content: item.content,
        creationTime: item.creationTime,
        rootID: rootId,
      },
    };
    reply.value.init(data, true);
    reply.value.open(i18nLocal.t('operate.reply_c', [i18nLocal.t('tip.comment')]));
  };

  const emit = defineEmits(['refresh']);
  const refresh = (reply: boolean, commentid: number): void => {
    if (reply) {
      getModelReplyList(commentid);
    }
    pagination.page = 1;
    getModelCommentList();
    emit('refresh');
  };

  const editCommnet = (item: AIModelComment, rep = false): void => {
    reply.value.init(item, rep);
    reply.value.open(i18n.t('operate.edit_c', [i18nLocal.t('tip.comment')]));
  };

  const removeComment = (item: AIModelComment, reply = false, commentid: string = undefined): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('tip.comment')]),
      content: {
        text: i18n.t('operate.delete_c', [i18nLocal.t('tip.comment')]),
        type: 'confirm',
      },
      param: { item, reply, commentid },
      doFunc: async (param) => {
        await new AIModelComment(param.item).deleteComment(query.value.registry, params.value.name);
        refresh(param.reply, param.commentid);
      },
    });
  };

  const offsetTop = ref<number>(0);
  const loading = ref<boolean>(false);
  const scrolled = (e): void => {
    offsetTop.value = e.target.scrollTop;
    if (e.target.scrollTop + document.getElementById('model__comment').clientHeight >= e.target.scrollHeight - 1) {
      pagination.page += 1;
      if (pagination.pageCount < pagination.page) return;
      loading.value = true;
      getModelCommentList();
      loading.value = false;
    }
  };

  const goToTop = (): void => {
    const container = document.getElementById('model__comment');
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  onMounted(() => {
    getModelCommentList();
  });
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
