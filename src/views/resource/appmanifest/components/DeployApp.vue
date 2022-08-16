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
  <BaseDialog
    v-model="dialog"
    icon="mdi-send"
    :title="$root.$t('operate.deploy_c', [$root.$t('resource.app')])"
    :width="1200"
    @reset="reset"
  >
    <template #content>
      <v-card-text class="pa-0">
        <v-flex class="text-subtitle-2 primary--text px-0">
          {{ $root.$t('resource.environment') }} : {{ Environment().EnvironmentName }}
        </v-flex>
        <v-text-field v-model="search" class="mt-2 pt-0" hide-details prepend-inner-icon="mdi-magnify" />
        <v-data-table
          class="mt-2 deploy__table"
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="500"
          :no-data-text="$root.$t('data.no_data')"
          :no-results-text="$root.$t('data.no_data')"
          :search.sync="search"
          show-select
          @toggle-select-all="selectAllApp"
        >
          <template #[`item.data-table-select`]="{ item }">
            <v-checkbox v-model="item.published" hide-details @click.stop />
          </template>
          <template #[`item.images`]="{ item }">
            <v-flex v-for="(value, key) in item.images" :key="key" class="py-3">
              {{ key }}
            </v-flex>
          </template>
          <template #[`item.runningTag`]="{ item }">
            <v-flex v-for="(value, key) in item.images" :key="key" class="py-3">
              {{ splitImage(value.running, 'tag') }}
            </v-flex>
          </template>
          <template #[`item.publishTag`]="{ item }">
            <v-flex v-for="(value, key) in item.images" :key="key" class="py-1">
              <v-menu
                v-model="tagMenus[`${item.index}-${key}`].menu"
                bottom
                :close-on-content-click="false"
                content-class="tag__menu"
                nudge-bottom="5px"
                offset-y
                origin="top center"
                right
                transition="scale-transition"
              >
                <template #activator="{ on }">
                  <v-chip
                    class="primary--text font-weight-medium"
                    color="white"
                    label
                    v-on="on"
                    @click="appImageTags(key)"
                  >
                    {{ splitImage(value.publish, 'tag') }}
                    <v-icon v-if="tagMenus[`${item.index}-${key}`].menu" right small> mdi-chevron-up </v-icon>
                    <v-icon v-else right small> mdi-chevron-down </v-icon>
                  </v-chip>
                </template>
                <v-flex>
                  <v-flex class="px-3 pt-3 white search-filter">
                    <v-text-field
                      v-model="tagMenus[`${item.index}-${key}`].search"
                      dense
                      flat
                      hide-details
                      :label="$t('tip.enter_2_create')"
                      solo
                      @keyup.enter="createTag(`${item.index}-${key}`, key, item.name)"
                    />
                  </v-flex>
                  <v-data-iterator
                    class="iterator rounded-b"
                    hide-default-footer
                    :items="[{ text: 'Tag', values: tags }]"
                  >
                    <template #no-data>
                      <v-card>
                        <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
                      </v-card>
                    </template>
                    <template #default="props">
                      <v-card v-for="iterdata in props.items" :key="iterdata.text" class="tag-card rounded-b" flat>
                        <v-list dense>
                          <v-list-item
                            v-for="(tag, index) in iterdata.values"
                            :key="index"
                            class="text-body-2 text-center"
                            link
                            :style="{ color: tag.image === value.publish ? `#1e88e5 !important` : `` }"
                            @click="setTag(tag.image, key, item.name, tag.unpublishable, item.index)"
                          >
                            <v-list-item-content>
                              <span>
                                {{ tag.name }}
                                <span v-if="tag.unpublishable" class="error--text"> ({{ $t('tip.no_deploy') }}) </span>
                              </span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </template>
                  </v-data-iterator>
                </v-flex>
              </v-menu>
            </v-flex>
          </template>
        </v-data-table>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="deployEnvironmentApps">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getAppImageTags, getEnvironmentAppImageList, postDeployEnvironmentAppImages } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'DeployApp',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource, BaseSelect],
    data: () => ({
      dialog: false,
      items: [],
      tagMenus: [],
      tags: [],
      environmentID: 0,
      search: '',
    }),
    computed: {
      ...mapState(['Circular', 'AdminViewport']),
      ...mapGetters(['Environment', 'Project', 'Tenant']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.kind'), value: 'kind', align: 'start' },
          { text: this.$t('table.image'), value: 'images', align: 'start' },
          { text: this.$t('table.now_tag'), value: 'runningTag', align: 'start' },
          { text: this.$t('table.deploy_tag'), value: 'publishTag', align: 'start' },
        ];
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async init() {
        this.environmentAppList();
      },
      splitImage(image, type) {
        const match = new RegExp('([\\w|/|\\.|-]+)?[:|@]?([\\w|\\.|-]+)?', 'g').exec(image);

        if (match) {
          if (type === 'image') {
            return match[1];
          } else if (type === 'tag') {
            return match[2];
          }
          return '';
        }
        return '';
      },
      async environmentAppList() {
        const data = await getEnvironmentAppImageList(
          this.Tenant().ID,
          this.Project().ID,
          this.AdminViewport
            ? this.environmentID
            : this.ThisAppEnvironmentID
            ? this.ThisAppEnvironmentID
            : this.environmentID,
        );
        const items = data.map((d, index) => {
          return { index: index, ...d };
        });
        items.forEach((item, index) => {
          for (const key in item.images) {
            this.tagMenus[`${index}-${key}`] = {
              search: '',
              menu: false,
            };
          }
        });
        this.items = items;
      },
      async appImageTags(image) {
        this.tags = [];
        const data = await getAppImageTags(this.Tenant().ID, this.Project().ID, {
          image: image,
        });
        this.tags = data;
      },
      createTag(key, image, applicationName) {
        this.tagMenus[key].menu = false;
        const tag = this.tagMenus[key].search;
        const index = this.items.findIndex((app) => {
          return app.name === applicationName;
        });
        if (index > -1) {
          const app = this.items[index];
          app.images[image].publish = `${this.splitImage(image, 'image')}:${tag}`;
          this.$set(this.items, index, app);
        }
      },
      setTag(tag, image, applicationName, unpublishable, imageIndex) {
        this.tagMenus[`${imageIndex}-${image}`].menu = false;
        if (unpublishable) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.tag_not_deploy'),
            color: 'warning',
          });
          return;
        }
        const index = this.items.findIndex((app) => {
          return app.name === applicationName;
        });
        if (index > -1) {
          const app = this.items[index];
          app.images[image].publish = tag;
          this.$set(this.items, index, app);
        }
      },
      selectAllApp(checkObj) {
        this.items.forEach((app, index) => {
          app.published = checkObj.value;
          this.$set(this.items, index, app);
        });
      },
      checkAllApp() {
        let ok = false;
        this.items.forEach((app) => {
          if (app.published) {
            ok = true;
            return;
          }
        });
        return ok;
      },
      checkAllPublished() {
        let ok = true;
        this.items.forEach((app) => {
          for (const key in app.images) {
            if (app.images[key].publish === '' && app.published) {
              ok = false;
              return;
            }
          }
        });
        return ok;
      },
      async deployEnvironmentApps() {
        if (!this.checkAllApp()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_app'),
            color: 'warning',
          });
          return;
        }
        if (!this.checkAllPublished()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_tag'),
            color: 'warning',
          });
          return;
        }
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.deploy_c', [this.$root.$t('resource.app')]),
          content: {
            text: `${this.$root.$t('operate.deploy_c', [this.$root.$t('resource.app')])} ${this.items
              .filter((app) => {
                return app.published;
              })
              .map((app) => {
                return app.name;
              })
              .join(',')}`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await postDeployEnvironmentAppImages(
              this.Tenant().ID,
              this.Project().ID,
              this.ThisAppEnvironmentID ? this.ThisAppEnvironmentID : this.environmentID,
              this.items,
            );
            this.dialog = false;
            this.$emit('refresh');
          },
        });
      },
      reset() {
        this.dialog = false;
      },
    },
  };
</script>

<style lang="scss">
  .iterator {
    min-width: 150px;
    max-width: 200px;
    max-height: 200px;
    overflow-y: auto;
  }
  .tag-card {
    max-height: 200px;
    overflow-y: auto;
  }
  .search-filter {
    z-index: 999;
    min-width: 150px;
    max-width: 200px;
  }
  .tag__menu {
    min-height: 60px !important;
  }

  .deploy__table .v-data-table__wrapper {
    max-height: 500px;
  }
</style>
