<template>
  <v-form ref="form" v-model="valid" class="ma-2" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
              <span>授信域名</span>
            </v-flex>
            <v-flex class="float-left ml-0 kubegems__long-width">
              <v-text-field v-model="dnsName" class="my-0" label="授信域名" required :rules="rules.dnsNameRules" />
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
  import { required } from '@/utils/rules';

  export default {
    name: 'DnsNameForm',
    data: () => ({
      valid: false,
      expand: false,
      dnsName: null,
      edit: false,
      index: null,
      rules: {
        dnsNameRules: [required],
      },
    }),
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      init(dnsNames, index) {
        this.dnsName = dnsNames[index];
        this.edit = true;
        this.index = index;
      },
      closeCard() {
        this.$refs.form.reset();
        this.expand = false;
        this.edit = false;
        this.index = null;
        this.$emit('closeOverlay');
      },
      addData() {
        this.edit
          ? this.$emit('updateData', 'DnsName', this.dnsName, this.index)
          : this.$emit('addData', 'DnsName', this.dnsName);
        this.closeCard();
      },
      // eslint-disable-next-line vue/no-unused-properties
      expandCard() {
        this.expand = true;
      },
    },
  };
</script>
