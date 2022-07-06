<template>
  <v-form ref="form" v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>键值对</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model.trim="obj.key" class="my-0" label="键" required :rules="objRules.keyRule" />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field v-model="obj.value" class="my-0" label="值" required :rules="objRules.valueRule" />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import { k8sAnnotation, required } from '@/utils/rules';

  export default {
    name: 'AnnotationForm',
    mixins: [BaseResource],
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        annotationsCopy: {},
        obj: {
          key: '',
          value: '',
        },
        oldKey: null,
      };
    },
    computed: {
      objRules() {
        return {
          keyRule: [required, k8sAnnotation],
          valueRule: [required],
        };
      },
    },
    watch: {
      data() {
        if (this.data) {
          this.annotationsCopy = deepCopy(this.data);
        }
      },
    },
    mounted() {
      if (this.data) {
        this.annotationsCopy = deepCopy(this.data);
      }
    },
    methods: {
      init(data) {
        this.obj = {
          key: data.key,
          value: data.value,
        };
        this.oldKey = data.key;
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.annotationsCopy) this.annotationsCopy = {};
          if (this.oldKey) this.$delete(this.annotationsCopy, this.oldKey);
          this.annotationsCopy[this.obj.key] = this.obj.value;
          this.$emit('addData', this.annotationsCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.oldKey = null;
        this.$emit('closeOverlay');
      },
    },
  };
</script>
