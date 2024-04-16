<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1 mb-3">Tag</div>
        <v-autocomplete
          v-model="obj.tags"
          dense
          flat
          hide-details
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
        <div class="text-subtitle-1 mb-3">{{ $t('tip.input') }}</div>
        <BaseACEEditor
          v-model="obj.textContent"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          :height="`${height - 68}px`"
          lang="yaml"
          :options="{
            tabSize: 2,
            fontSize: 12,
            printMarginColumn: 100,
            showPrintMargin: false,
            wrap: true,
            readOnly: false,
          }"
          theme="chrome"
          @keydown.stop
        />
      </v-col>

      <v-btn
        class="kubegems__full-center"
        color="primary"
        icon
        :loading="Circular"
        :style="{ zIndex: 99 }"
        x-large
        @click="submitContent"
      >
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6" :style="{ position: 'relative' }">
        <div class="text-subtitle-1 mb-3">{{ $t('tip.output') }}</div>
        <pre :style="{ wordBreak: 'break-all', whiteSpace: 'break-spaces' }">{{ output }}</pre>
        <div v-if="!output" class="kubegems__full-center text-subtitle-1" :style="{ marginTop: '-30px' }">
          {{ $root.$t('data.no_data') }}
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../../i18n';
  import ParamsMixin from '../../mixins/params';

  export default {
    name: 'ZeroShotClassification',
    i18n: {
      messages: messages,
    },
    mixins: [ParamsMixin],
    props: {
      dialog: {
        type: Boolean,
        default: () => true,
      },
    },
    data() {
      return {
        obj: {
          textContent: '',
          tags: [],
        },
        output: '',
        tagItems: [],
        tagText: '',
      };
    },
    computed: {
      ...mapState(['Scale', 'Circular']),
      height() {
        return window.innerHeight - 122;
      },
    },
    watch: {
      dialog: {
        handler(newValue) {
          if (!newValue) {
            this.obj = this.$options.data().obj;
            this.output = '';
            this.tagItems = [];
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async submitContent() {
        if (this.obj.tags?.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_tag'),
            color: 'warning',
          });
          return;
        }

        if (!this.obj.textContent.trim()) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_text'),
            color: 'warning',
          });
          return;
        }

        const data = this.composeInputs(
          this.stringParam('sequences', this.obj.textContent),
          this.jsonParams('candidate_labels', this.obj.tags),
        );
        const ret = await this.infer(data);
        this.output = this.parseResult(ret);
      },
      createTag() {
        if (this.tagText.trim()) {
          this.obj.tags.push(this.tagText.trim());
          this.tagItems.push({ text: this.tagText.trim(), value: this.tagText.trim() });
        }
      },
      removeTag(item) {
        const index = this.obj.tags.findIndex((t) => {
          return t === item.value;
        });
        if (index > -1) {
          this.obj.tags.splice(index, 1);
        }
      },
    },
  };
</script>
