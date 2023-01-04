<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3"> labels </div>
        <v-autocomplete
          v-model="obj.tags"
          dense
          flat
          hide-details
          hide-selected
          :items="tagItems"
          label="tag"
          multiple
          :no-data-text="$root.$t('data.no_data')"
          :search-input.sync="tagText"
          solo
          @keyup.enter="createTag"
        >
          <template #selection="{ item }">
            <v-chip
              class="my-1"
              close
              close-icon="mdi-close-circle"
              color="primary"
              small
              text-color="white"
              @click:close="removeTag(item)"
            >
              <strong class="mx-1"> {{ item.text }} </strong>
            </v-chip>
          </template>
        </v-autocomplete>
        <div class="text-subtitle-1 mb-3">图片</div>

        <v-img v-if="obj.previewUrl" max-width="800" :src="obj.previewUrl" />
        <div v-else class="file__div">
          <div class="kubegems__full-center">
            <v-file-input
              accept="image/*"
              class="ml-5"
              counter
              filled
              flat
              hide-input
              prepend-icon="mdi-file-image"
              show-size
              solo
              @change="onFileChange"
            />
            <div class="text-subtitle-1">上传图片</div>
          </div>
        </div>
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon :loading="Circular" x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">问答结果</div>
        <pre>{{ rawOut }}</pre>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import ParamsMixin from '../../mixins/params';

  export default {
    name: 'ZeroShotImageClassification',
    mixins: [ParamsMixin],
    props: {
      dialog: {
        type: Boolean,
        default: () => true,
      },
    },
    data: () => {
      return {
        obj: {
          previewUrl: '',
          file: null,
          tags: [],
        },
        rawOut: null,
        tagItems: [],
        tagText: '',
      };
    },
    computed: {
      ...mapState(['Scale', 'Circular']),
    },
    watch: {
      dialog: {
        handler(newValue) {
          if (!newValue) {
            this.obj = this.$options.data().obj;
            this.rawOut = null;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onFileChange(e) {
        if (e) {
          this.obj.previewUrl = URL.createObjectURL(e);
          this.obj.file = e;
        } else {
          this.obj.previewUrl = '';
          this.obj.file = null;
        }
        this.rawOut = null;
      },
      createTag() {
        if (this.tagText.trim()) {
          this.obj.tags.push(this.tagText.trim());
          this.tagItems.push({ text: this.tagText.trim(), value: this.tagText.trim() });
        }
      },
      async submitContent() {
        if (!this.obj.file) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请上传图片',
            color: 'warning',
          });
          return;
        }
        if (this.obj.tags?.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请添加Tag',
            color: 'warning',
          });
          return;
        }

        const _v = this;
        const reader = new FileReader();
        reader.onloadend = async function () {
          const b64data = reader.result.split(',')[1];
          const data = _v.composeInputs(
            _v.imageParam('images', b64data),
            _v.stringParam('candidate_labels', ..._v.obj.tags),
          );
          const ret = await this.infer(data);
          _v.rawOut = _v.parseResult(ret);
        };
        reader.readAsDataURL(this.obj.file);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .file {
    &__div {
      width: 100%;
      height: 600px;
      border: 1.5px solid #efefef;
      border-radius: 3px;
      position: relative;
    }
  }
</style>
