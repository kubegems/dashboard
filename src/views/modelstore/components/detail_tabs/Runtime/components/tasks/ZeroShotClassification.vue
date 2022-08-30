<template>
  <v-form class="pa-3" @submit.prevent>
    <v-row>
      <v-col class="pr-8" cols="12" md="6">
        <div class="text-subtitle-1">Tag</div>
        <v-autocomplete
          v-model="tags"
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
        <div class="text-subtitle-1">文本输入</div>
        <ACEEditor
          v-model="textContent"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          lang="yaml"
          :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
          :style="{ height: `${height - 68}px !important` }"
          theme="chrome"
          @init="$aceinit"
          @keydown.stop
        />
      </v-col>

      <v-btn class="kubegems__full-center" color="primary" icon x-large @click="submitContent">
        <v-icon>mdi-arrow-right-bold </v-icon>
      </v-btn>

      <v-col class="pl-8" cols="12" md="6">
        <div class="text-subtitle-1">文本输出</div>
        <ACEEditor
          v-model="output"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} kubegems__rounded_small`"
          lang="yaml"
          :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
          :style="{ height: `${height}px !important` }"
          theme="chrome"
          @init="$aceinit"
          @keydown.stop
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import ParamsMixin from '../../mixins/params';
  import { postModelApi } from '@/api';

  export default {
    name: 'ZeroShotClassification',
    mixins: [ParamsMixin],
    props: {
      instance: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        textContent: '',
        output: '',
        tagItems: [],
        tags: [],
        tagText: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 110;
      },
    },
    methods: {
      async submitContent() {
        const data = this.composeInputs(
          this.stringParam('sequences', this.textContent),
          this.jsonParams('candidate_labels', this.tags),
        );
        const ret = await postModelApi(this.instance.environment, this.instance.name, data);
        for (const out of ret.data.outputs) {
          this.output = out.data;
        }
      },
      createTag() {
        if (this.tagText.trim()) {
          this.tags.push(this.tagText.trim());
          this.tagItems.push({ text: this.tagText.trim(), value: this.tagText.trim() });
        }
      },
      removeTag(item) {
        const index = this.tags.findIndex((t) => {
          return t === item.value;
        });
        if (index > -1) {
          this.tags.splice(index, 1);
        }
      },
    },
  };
</script>
