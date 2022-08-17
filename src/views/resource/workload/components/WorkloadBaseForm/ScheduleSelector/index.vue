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
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <SelectorForm
      ref="selectorForm"
      :data="
        obj.spec
          ? kind !== 'CronJob'
            ? obj.spec.template.spec.nodeSelector
              ? obj.spec.template.spec.nodeSelector
              : {}
            : obj.spec.jobTemplate.spec.template.spec.nodeSelector
            ? obj.spec.jobTemplate.spec.template.spec.nodeSelector
            : {}
          : {}
      "
      @addData="addSelectorData"
      @closeOverlay="closeExpand"
    />
    <template v-if="kind !== 'DaemonSet'">
      <BaseSubTitle :title="$t('tip.node_schedule')" />
      <v-card-text class="pa-2">
        <SelectorItem
          :selector="
            obj.spec
              ? kind !== 'CronJob'
                ? obj.spec.template.spec.nodeSelector
                  ? obj.spec.template.spec.nodeSelector
                  : {}
                : obj.spec.jobTemplate.spec.template.spec.nodeSelector
                ? obj.spec.jobTemplate.spec.template.spec.nodeSelector
                : {}
              : {}
          "
          @expandCard="expandCard"
          @removeSelectors="removeSelectors"
          @updateSelectors="updateSelectors"
        />
        <div class="kubegems__clear-float" />
      </v-card-text>
    </template>

    <LabelForm ref="labelForm" :data="obj.metadata.labels" @addData="addLabelData" @closeOverlay="closeExpand" />
    <BaseSubTitle :title="$t('tip.label')" />
    <v-card-text class="pa-2">
      <LabelItem
        :labels="obj.metadata.labels"
        @expandCard="expandCard"
        @removeLabels="removeLabels"
        @updateLabels="updateLabels"
      />
      <div class="kubegems__clear-float" />
    </v-card-text>

    <AnnotationForm
      ref="annotationForm"
      :data="obj.metadata.annotations"
      @addData="addAnnotationData"
      @closeOverlay="closeExpand"
    />
    <BaseSubTitle :title="$t('tip.annotation')" />
    <v-card-text class="pa-2">
      <AnnotationItem
        :annotations="obj.metadata.annotations"
        @expandCard="expandCard"
        @removeAnnotations="removeAnnotations"
        @updateAnnotations="updateAnnotations"
      />
    </v-card-text>

    <DNSConfigForm
      ref="dnsConfigForm"
      :data="obj.spec && obj.spec.template.spec.dnsConfig ? obj.spec.template.spec.dnsConfig : null"
      @addData="addDnsConfigData"
      @closeOverlay="closeExpand"
    />
    <BaseSubTitle :title="$t('tip.dns_config')" />
    <v-card-text class="pa-2">
      <DNSConfigItem
        :dns-config="obj.spec && obj.spec.template.spec.dnsConfig ? obj.spec.template.spec.dnsConfig : null"
        @expandCard="expandCard"
        @removeDNSConfig="removeDNSConfig"
        @updateDNSConfig="updateDNSConfig"
      />
    </v-card-text>
  </v-form>
</template>

<script>
  import messages from '../../../i18n';
  import DNSConfigForm from './DNSConfigForm';
  import DNSConfigItem from './DNSConfigItem';
  import SelectorForm from './SelectorForm';
  import SelectorItem from './SelectorItem';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import AnnotationForm from '@/views/resource/components/annotation/AnnotationForm';
  import AnnotationItem from '@/views/resource/components/annotation/AnnotationItem';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import LabelItem from '@/views/resource/components/label/LabelItem';

  export default {
    name: 'ScheduleSelector',
    i18n: {
      messages: messages,
    },
    components: {
      AnnotationForm,
      AnnotationItem,
      DNSConfigForm,
      DNSConfigItem,
      LabelForm,
      LabelItem,
      SelectorForm,
      SelectorItem,
    },
    mixins: [BaseResource],
    props: {
      kind: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          metadata: {
            labels: {},
            annotations: {},
          },
        },
      };
    },
    methods: {
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(deepCopy(data), this.obj);
        });
      },
      back(data) {
        this.$nextTick(() => {
          this.obj = deepCopy(data);
        });
      },
      addLabelData(data) {
        this.obj.metadata.labels = data;
        if (
          this.kind === 'Deployment' ||
          this.kind === 'StatefulSet' ||
          this.kind === 'DaemonSet' ||
          this.kind === 'Job'
        ) {
          if (!this.obj.spec.template.metadata.labels) {
            this.obj.spec.template.metadata.labels = {};
          }
          this.obj.spec.template.metadata.labels = data;
          if (this.kind === 'Deployment' || this.kind === 'StatefulSet') {
            if (!this.obj.spec.selector) {
              this.obj.spec.selector = {
                matchLabels: {},
              };
            }
            if (!this.obj.spec.selector.matchLabels) {
              this.obj.spec.selector = {
                matchLabels: {},
              };
            }
            this.obj.spec.selector.matchLabels = data;
          }
        } else if (this.kind === 'CronJob') {
          if (!this.obj.spec.jobTemplate.metadata.labels) {
            this.obj.spec.jobTemplate.metadata.labels = {};
          }
          this.obj.spec.jobTemplate.metadata.labels = data;
        }
      },
      addSelectorData(data) {
        if (this.kind === 'Job' || this.kind === 'Deployment' || this.kind === 'StatefulSet') {
          this.obj.spec.template.spec.nodeSelector = data;
        } else if (this.kind === 'CronJob') {
          this.obj.spec.jobTemplate.spec.template.spec.nodeSelector = data;
        }
      },
      addAnnotationData(data) {
        this.obj.metadata.annotations = data;
      },
      removeSelectors(key) {
        if (this.kind === 'Cronjob') {
          this.$delete(this.obj.spec.jobTemplate.spec.template.spec.nodeSelector, key);
        } else if (this.kind === 'Deployment' || this.kind === 'StatefulSet' || this.kind === 'Job') {
          this.$delete(this.obj.spec.template.spec.nodeSelector, key);
        }
      },
      removeLabels(key) {
        this.$delete(this.obj.metadata.labels, key);
      },
      removeAnnotations(key) {
        this.$delete(this.obj.metadata.annotations, key);
      },
      updateSelectors(key) {
        let data = {};
        if (this.kind === 'Job' || this.kind === 'Deployment' || this.kind === 'StatefulSet') {
          data = {
            key: key,
            value: this.obj.spec.template.spec.nodeSelector[key],
          };
        } else if (this.kind === 'CronJob') {
          data = {
            key: key,
            value: this.obj.spec.jobTemplate.spec.template.spec.nodeSelector[key],
          };
        }
        this.$nextTick(() => {
          this.$refs.selectorForm.init(data);
        });
      },
      updateLabels(key) {
        const data = { key: key, value: this.obj.metadata.labels[key] };
        this.$nextTick(() => {
          this.$refs.labelForm.init(data);
        });
      },
      updateAnnotations(key) {
        const data = { key: key, value: this.obj.metadata.annotations[key] };
        this.$nextTick(() => {
          this.$refs.annotationForm.init(data);
        });
      },
      addDnsConfigData(data) {
        this.obj.spec.template.spec.dnsConfig = data;
      },
      updateDNSConfig() {
        const data = deepCopy(this.obj.spec.template.spec.dnsConfig);
        this.$nextTick(() => {
          this.$refs.dnsConfigForm.init(data);
        });
      },
      removeDNSConfig() {
        this.$delete(this.obj.spec.template.spec, 'dnsConfig');
      },
      expandCard(formComponent) {
        this.$nextTick(() => {
          this.$refs[formComponent].expand = true;
          this.expand = true;
        });
      },
      closeExpand() {
        this.expand = false;
      },
      reset() {
        this.$refs.labelForm.closeCard();
        this.$refs.annotationForm.closeCard();
        this.$refs.selectorForm.closeCard();
        this.$refs.dnsConfigForm.closeCard();
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      getData() {
        return this.obj;
      },
      checkSaved() {
        if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
          return !this.expand;
        }
        return true;
      },
    },
  };
</script>
