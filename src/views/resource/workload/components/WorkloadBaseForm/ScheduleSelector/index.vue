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
      <BaseSubTitle title="节点调度" />
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
          @updateSelectors="updateSelectors"
          @removeSelectors="removeSelectors"
          @expandCard="expandCard"
        />
        <div class="kubegems__clear-float" />
      </v-card-text>
    </template>

    <LabelForm ref="labelForm" :data="obj.metadata.labels" @addData="addLabelData" @closeOverlay="closeExpand" />
    <BaseSubTitle title="标签" />
    <v-card-text class="pa-2">
      <LabelItem
        :labels="obj.metadata.labels"
        @updateLabels="updateLabels"
        @removeLabels="removeLabels"
        @expandCard="expandCard"
      />
      <div class="kubegems__clear-float" />
    </v-card-text>

    <AnnotationForm
      ref="annotationForm"
      :data="obj.metadata.annotations"
      @addData="addAnnotationData"
      @closeOverlay="closeExpand"
    />
    <BaseSubTitle title="注解" />
    <v-card-text class="pa-2">
      <AnnotationItem
        :annotations="obj.metadata.annotations"
        @updateAnnotations="updateAnnotations"
        @removeAnnotations="removeAnnotations"
        @expandCard="expandCard"
      />
    </v-card-text>

    <DNSConfigForm
      ref="dnsConfigForm"
      :data="obj.spec && obj.spec.template.spec.dnsConfig ? obj.spec.template.spec.dnsConfig : null"
      @addData="addDnsConfigData"
      @closeOverlay="closeExpand"
    />
    <BaseSubTitle title="DNS配置" />
    <v-card-text class="pa-2">
      <DNSConfigItem
        :dns-config="obj.spec && obj.spec.template.spec.dnsConfig ? obj.spec.template.spec.dnsConfig : null"
        @updateDNSConfig="updateDNSConfig"
        @removeDNSConfig="removeDNSConfig"
        @expandCard="expandCard"
      />
    </v-card-text>
  </v-form>
</template>

<script>
  import LabelItem from '@/views/resource/components/label/LabelItem';
  import AnnotationItem from '@/views/resource/components/annotation/AnnotationItem';
  import LabelForm from '@/views/resource/components/label/LabelForm';
  import AnnotationForm from '@/views/resource/components/annotation/AnnotationForm';
  import SelectorItem from './SelectorItem';
  import SelectorForm from './SelectorForm';
  import DNSConfigItem from './DNSConfigItem';
  import DNSConfigForm from './DNSConfigForm';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ScheduleSelector',
    components: {
      LabelItem,
      AnnotationItem,
      LabelForm,
      AnnotationForm,
      SelectorItem,
      SelectorForm,
      DNSConfigItem,
      DNSConfigForm,
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
      // eslint-disable-next-line vue/no-unused-properties
      init(data) {
        this.$nextTick(() => {
          this.obj = this.$_.merge(deepCopy(data), this.obj);
        });
      },
      // eslint-disable-next-line vue/no-unused-properties
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
      // eslint-disable-next-line vue/no-unused-properties
      reset() {
        this.$refs.labelForm.closeCard();
        this.$refs.annotationForm.closeCard();
        this.$refs.selectorForm.closeCard();
        this.$refs.dnsConfigForm.closeCard();
        this.$refs.form.resetValidation();
        this.obj = this.$options.data().obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
      validate() {
        return this.$refs.form.validate(true);
      },
      // eslint-disable-next-line vue/no-unused-properties
      getData() {
        return this.obj;
      },
      // eslint-disable-next-line vue/no-unused-properties
      checkSaved() {
        if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
          return !this.expand;
        }
        return true;
      },
    },
  };
</script>
