<template>
  <v-form v-model="valid" lazy-validation class="my-2" @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width">
                <span>异常检测</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-switch
                  v-model="obj.splitExternalLocalOriginErrors"
                  class="mt-5"
                  label="splitExternalLocalOriginErrors"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.consecutiveGatewayErrors"
                  class="my-0"
                  required
                  label="consecutiveGatewayErrors"
                  type="number"
                  :rules="objRules.consecutiveGatewayErrorsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.consecutive5xxErrors"
                  class="my-0"
                  required
                  label="consecutive5xxErrors"
                  type="number"
                  :rules="objRules.consecutive5xxErrorsRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.interval"
                  class="my-0"
                  required
                  label="interval"
                  :rules="objRules.intervalRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.baseEjectionTime"
                  class="my-0"
                  required
                  label="baseEjectionTime"
                  :rules="objRules.baseEjectionTimeRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.maxEjectionPercent"
                  class="my-0"
                  required
                  label="maxEjectionPercent"
                  type="number"
                  :rules="objRules.maxEjectionPercentRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.minHealthPercent"
                  class="my-0"
                  required
                  label="minHealthPercent"
                  type="number"
                  :rules="objRules.minHealthPercentRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width">
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.consecutiveLocalOriginFailures"
                  class="my-0"
                  required
                  label="consecutiveLocalOriginFailures"
                  type="number"
                  :rules="objRules.consecutiveLocalOriginFailuresRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn text small color="error" @click="closeCard"> 取消 </v-btn>
          <v-btn text small color="primary" @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet
      v-if="trafficPolicyCopy.outlierDetection && JSON.stringify(trafficPolicyCopy.outlierDetection) !== '{}'"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.splitExternalLocalOriginErrors }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> splitExternalLocalOriginErrors </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.consecutiveLocalOriginFailures }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> consecutiveLocalOriginFailures </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.consecutiveGatewayErrors }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> consecutiveGatewayErrors </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.consecutive5xxErrors }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> consecutive5xxErrors </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.interval }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> interval </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.baseEjectionTime }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> baseEjectionTime </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.maxEjectionPercent }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> maxEjectionPercent </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left pa-0 kubegems__three-width">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ trafficPolicyCopy.outlierDetection.minHealthPercent }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> minHealthPercent </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn dark text fab right x-small color="primary" @click="updateData">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn dark text fab right x-small color="error" @click="removeData">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-else class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn text color="primary" @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加异常检测
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { positiveInteger } from '@/utils/rules';

  export default {
    name: 'OutlierDetection',
    props: {
      trafficPolicy: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          splitExternalLocalOriginErrors: false,
          consecutiveLocalOriginFailures: 5,
          consecutiveGatewayErrors: 0,
          consecutive5xxErrors: 0,
          interval: '10s',
          baseEjectionTime: '30s',
          maxEjectionPercent: 10,
          minHealthPercent: 0,
        },
        objRules: {
          consecutiveLocalOriginFailuresRule: [positiveInteger],
          consecutiveGatewayErrorsRule: [positiveInteger],
          consecutive5xxErrorsRule: [positiveInteger],
          intervalRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          baseEjectionTimeRule: [(v) => !!new RegExp('(^\\d+[s|m|h]$)').test(v) || '格式错误(示例:30s,1m,1h)'],
          maxEjectionPercentRule: [positiveInteger],
          minHealthPercentRule: [positiveInteger],
        },
        trafficPolicyCopy: {},
      };
    },
    watch: {
      trafficPolicy() {
        if (this.trafficPolicy) {
          this.trafficPolicyCopy = deepCopy(this.trafficPolicy);
        }
      },
    },
    mounted() {
      if (this.trafficPolicy) {
        this.trafficPolicyCopy = deepCopy(this.trafficPolicy);
      }
    },
    methods: {
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.obj = deepCopy(this.$options.data().obj);
        this.$refs.form.resetValidation();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          if (!this.trafficPolicyCopy.outlierDetection) {
            this.trafficPolicyCopy.outlierDetection = {};
          }
          this.trafficPolicyCopy.outlierDetection = this.obj;
          this.$emit('updateComponentData', this.trafficPolicyCopy);
          this.closeCard();
        }
      },
      removeData() {
        this.$delete(this.trafficPolicyCopy, 'outlierDetection');
        this.$emit('updateComponentData', this.trafficPolicyCopy);
      },
      updateData() {
        this.obj = deepCopy(this.trafficPolicyCopy.outlierDetection);
        this.expandCard();
      },
    },
  };
</script>
