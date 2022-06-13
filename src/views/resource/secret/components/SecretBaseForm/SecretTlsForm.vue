<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-card-text class="pa-0">
          <v-sheet class="mt-2 px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
              <span class="ml-2">凭证</span>
            </v-flex>
            <v-flex class="ml-2">
              <ACEEditor
                v-model="tls['tls.crt']"
                :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
                lang="yaml"
                :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
                theme="chrome"
                height="200"
                @init="$aceinit"
                @keydown.stop
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
          <v-sheet class="mt-2 px-2">
            <v-flex class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width">
              <span class="ml-2">私钥</span>
            </v-flex>
            <v-flex class="ml-2">
              <ACEEditor
                v-model="tls['tls.key']"
                :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded mb-4`"
                lang="yaml"
                :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
                theme="chrome"
                height="200"
                @init="$aceinit"
                @keydown.stop
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn text small color="error" @click="closeCard"> 取消 </v-btn>
          <v-btn text small color="primary" @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';
  import { Base64 } from 'js-base64';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'SecretTlsForm',
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
        dataCopy: {},
        tls: {
          'tls.crt': '',
          'tls.key': '',
        },
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      data() {
        this.dataCopy = deepCopy(this.data);
      },
    },
    mounted() {
      if (this.labels) {
        this.dataCopy = deepCopy(this.data);
      }
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      init(data) {
        this.tls = {
          'tls.crt': data['tls.crt'],
          'tls.key': data['tls.key'],
        };
        this.expand = true;
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          for (const key in this.tls) {
            this.dataCopy[key] = Base64.encode(this.tls[key]);
          }
          this.$emit('addData', this.dataCopy);
          this.closeCard();
        }
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
        this.tls = {
          'tls.crt': '',
          'tls.key': '',
        };
        this.$emit('closeOverlay');
      },
    },
  };
</script>
