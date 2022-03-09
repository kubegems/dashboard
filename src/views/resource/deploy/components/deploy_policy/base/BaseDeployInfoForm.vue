<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <BaseSubTitle title="当前运行时" />
      <v-card-text class="pa-2">
        <v-sheet
          v-for="(image, index) in runningImages"
          :key="index"
          class="grey lighten-4 rounded mb-2"
        >
          <v-list-item two-line>
            <v-list-item-content class="py-2">
              <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text" />
              <v-list-item-subtitle class="text-body-2 py-0">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title class="text-subtitle-2 py-1">
                      {{ image }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 py-1">
                      镜像
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  v-if="index === 0"
                  two-line
                  class="float-right pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title class="text-subtitle-2 py-1">
                      {{
                        runtime.istioVersion ? runtime.istioVersion : ''
                      }}&nbsp;
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 py-1">
                      版本号
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-subtitle>
              <div class="kubegems__clear-float" />
            </v-list-item-content>
          </v-list-item>
        </v-sheet>
        <v-sheet
          v-if="runningImages.length === 0"
          class="grey lighten-4 rounded mb-2 text-center py-5 text-subtitle-1"
        >
          暂无运行镜像
        </v-sheet>
      </v-card-text>
      <BaseSubTitle title="即将发布" />
      <v-card-text class="pa-2">
        <v-row>
          <template v-for="(image, index) in publishImages">
            <v-col
              :key="`${index}0`"
              cols="12"
              class="py-4"
            >
              <v-sheet
                :min-width="650"
                :width="650"
                class="float-left"
              >
                <v-text-field
                  class="my-0"
                  required
                  label="镜像"
                  readonly
                  :value="image"
                  :rules="baseRules.publishRuler[image]"
                  full-width
                  dense
                />
              </v-sheet>
              <v-sheet
                :min-width="300"
                :width="300"
                class="float-right"
              >
                <v-autocomplete
                  v-model="base.images[image].tag"
                  :items="tags[image]"
                  color="primary"
                  hide-selected
                  class="my-0 py-0"
                  no-data-text="暂无可选数据"
                  hide-details
                  solo
                  dense
                  flat
                  full-width
                  :search-input.sync="base.images[image].tagtext"
                  @change="onTagChange(image)"
                  @keyup.enter="createImageTag(image)"
                >
                  <template #selection="{ item, disabled }">
                    <v-chip
                      color="primary"
                      small
                      class="ma-1"
                      :disabled="disabled"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-sheet>
              <div class="kubegems__clear-float" />
            </v-col>
          </template>
          <v-col cols="6">
            <v-text-field
              v-model="base.istioVersion"
              :rules="baseRules.versionRules"
              class="my-0"
              required
              label="版本号"
            >
              <template #append>
                <v-btn
                  small
                  text
                  color="primary"
                  @click="generateVersion"
                >
                  自动生成版本号
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getAppImageTags } from '@/api'
import { required } from '@/utils/rules'

export default {
  name: 'BaseDeployInfoForm',
  props: {
    runtime: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      runningImages: [],
      publishImages: [],
      tags: {},
      base: {
        images: {},
        istioVersion: '',
      },
    }
  },
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant', 'Project']),
    baseRules() {
      const ruler = {
        versionRules: [required],
      }
      const publishRuler = {}
      this.publishImages.forEach((img) => {
        publishRuler[img] = [
          (v) =>
            !!(this.splitImage(this.base.images[v].publish, 'tag') !== '') ||
            '必填项',
        ]
      })
      ruler['publishRuler'] = publishRuler
      return ruler
    },
  },
  watch: {
    runtime: {
      handler: function () {
        this.generateBaseData()
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    async appImageTags(image) {
      const data = await getAppImageTags(this.Tenant().ID, this.Project().ID, {
        image: image,
        noprocessing: true,
      })
      const tags = data.map((d) => {
        return {
          text: d.unpublishable ? `${d.name}(不可发布)` : d.name,
          value: d.name,
          disabled: d.unpublishable,
          ...d,
        }
      })
      this.$set(this.tags, image, tags)
    },
    generateBaseData() {
      this.publishImages = []
      this.runningImages = []
      if (this.runtime.images) {
        Object.keys(this.runtime.images).forEach((img) => {
          const image = this.runtime.images[img]
          const tag = this.splitImage(image.publish, 'tag')
          if (image.running && image.running.length > 0) {
            this.runningImages.push(image.running)
          }
          this.publishImages.push(img)
          this.appImageTags(img)

          this.base.images[img] = {
            tag: tag,
            tagtext: '',
            publish: image.publish,
            running: image.running,
          }
        })
      }
    },
    createImageTag(image) {
      const tags = this.tags[image]
      if (
        !this.tags[image].find((tag) => {
          return tag.value === this.base.images[image].tagtext
        })
      ) {
        tags.push({
          text: this.base.images[image].tagtext,
          value: this.base.images[image].tagtext,
          disabled: false,
          image: `${image}:${this.base.images[image].tagtext}`,
          name: this.base.images[image].tagtext,
        })
      }
      this.$set(this.tags, image, tags)
      this.$set(this.base.images[image], 'tag', this.base.images[image].tagtext)
      this.$set(this.base.images[image], 'tagtext', '')
      this.base.images[
        image
      ].publish = `${image}:${this.base.images[image].tag}`
    },
    onTagChange(image) {
      this.base.images[
        image
      ].publish = `${image}:${this.base.images[image].tag}`
    },
    splitImage(image, type) {
      const match = new RegExp(
        '([\\w|/|\\.|-]+)?[:|@]?([\\w|\\.|-]+)?',
        'g',
      ).exec(image)

      if (match) {
        if (type === 'image') {
          return match[1]
        } else if (type === 'tag') {
          return match[2]
        }
        return ''
      }
      return ''
    },
    generateVersion() {
      if (this.runtime.istioVersion) {
        const lastversion =
          this.runtime.istioVersion[this.runtime.istioVersion.length - 1]
        if (!isNaN(lastversion)) {
          this.base.istioVersion = `${this.runtime.istioVersion.substr(
            0,
            this.runtime.istioVersion.length - 1,
          )}${parseInt(lastversion) + 1}`
        } else {
          this.base.istioVersion = `${this.runtime.istioVersion}-v1`
        }
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.runningImages = []
      this.publishImages = []
      this.tags = {}
      this.base = this.$options.data().base
      this.$refs.form.resetValidation()
    },
  },
}
</script>
