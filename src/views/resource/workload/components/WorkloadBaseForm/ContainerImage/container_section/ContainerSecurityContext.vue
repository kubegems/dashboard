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
  <v-form v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>{{ $t('tip.access_control') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="securityContext"
                  class="my-0"
                  color="primary"
                  hide-selected
                  :items="modes"
                  :label="$t('tip.access_control')"
                  multiple
                  :no-data-text="$root.$t('data.no_data')"
                  :rules="objRules.securityContextRule"
                >
                  <template #selection="{ item }">
                    <v-chip class="ma-1" color="primary" small>
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="addData"> {{ $root.$t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet v-if="containerCopy && containerCopy.securityContext" class="grey lighten-4 rounded ma-2">
      <v-list-item dense>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item v-if="containerCopy.securityContext.privileged" class="pa-0">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ $t('tip.privileged') }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="containerCopy.securityContext.allowPrivilegeEscalation" class="pa-0">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ $t('tip.allow_escalation') }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="containerCopy.securityContext.readOnlyRootFilesystem" class="pa-0">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ $t('tip.root_readonly') }} </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-else class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              {{ $root.$t('operate.add_c', [$t('tab.security')]) }}
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import messages from '../../../../i18n';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ContainerSecurityContext',
    i18n: {
      messages: messages,
    },
    props: {
      container: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        securityContext: [],
        objRules: {
          securityContextRule: [required],
        },
        containerCopy: null,
      };
    },
    computed: {
      modes() {
        return [
          { text: this.$t('tip.privileged'), value: 'privileged' },
          {
            text: this.$t('tip.allow_escalation'),
            value: 'allowPrivilegeEscalation',
          },
          {
            text: this.$t('tip.root_readonly'),
            value: 'readOnlyRootFilesystem',
          },
        ];
      },
    },
    watch: {
      container() {
        if (this.container) this.containerCopy = deepCopy(this.container);
        else this.containerCopy = {};
      },
    },
    mounted() {
      if (this.container) this.containerCopy = deepCopy(this.container);
      else this.containerCopy = {};
    },
    methods: {
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const securityContext = {};
          this.securityContext.forEach((d) => {
            securityContext[d] = true;
          });
          this.$set(this.containerCopy, 'securityContext', securityContext);
          this.$emit('updateComponentData', this.containerCopy);
          this.closeCard();
        }
      },
      removeData() {
        this.$set(this.containerCopy, 'securityContext', null);
        this.$emit('updateComponentData', this.containerCopy);
      },
      updateData() {
        this.securityContext = Object.keys(this.containerCopy.securityContext);
        this.expandCard();
      },
    },
  };
</script>
