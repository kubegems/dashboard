<template>
  <v-form
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit.prevent
          >
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>检查类型</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.checkType"
                  :items="checkTypes"
                  :rules="objRules.checkTypeRule"
                  color="primary"
                  label="健康检查类型"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                >
                  <template #selection="{ item }">
                    <v-chip
                      color="primary"
                      small
                      class="mx-1"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>检查方式</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.checkMethod"
                  :items="checkMethods"
                  :rules="objRules.checkMethodRule"
                  color="primary"
                  label="健康检查方式"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                >
                  <template #selection="{ item }">
                    <v-chip
                      color="primary"
                      small
                      class="mx-1"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet
              v-if="obj.checkMethod === 'httpGet'"
              class="px-2"
            >
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>HTTP请求</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="obj.httpGet.scheme"
                  :items="[
                    { text: 'HTTP', value: 'HTTP' },
                    { text: 'HTTPS', value: 'HTTPS' },
                  ]"
                  :rules="objRules.schemeRule"
                  color="primary"
                  label="协议"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                >
                  <template #selection="{ item }">
                    <v-chip
                      color="primary"
                      small
                      class="mx-1"
                    >
                      {{ item['text'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.httpGet.path"
                  class="my-0"
                  required
                  label="路径"
                  :rules="objRules.pathRule"
                />
              </v-flex>
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              />
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.httpGet.port"
                  class="my-0"
                  required
                  type="number"
                  label="端口"
                  :rules="objRules.portRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet
              v-else-if="obj.checkMethod === 'exec'"
              class="px-2"
            >
              <v-flex
                class="float-left text-subtitle-2 pt-4 primary--text kubegems__min-width"
              >
                <span>执行命令</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-textarea
                  v-model="obj.exec.command"
                  class="my-0"
                  auto-grow
                  required
                  label="命令"
                  :rules="objRules.commandRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet
              v-else-if="obj.checkMethod === 'tcpSocket'"
              class="px-2"
            >
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>TCP端口</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.tcpSocket.port"
                  class="my-0"
                  required
                  label="端口"
                  type="number"
                  :rules="objRules.portRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>参数</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.initialDelaySeconds"
                  class="my-0"
                  required
                  label="初始延迟"
                  type="number"
                  :rules="objRules.initialDelaySecondsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.timeoutSeconds"
                  class="my-0"
                  required
                  label="超时时间"
                  type="number"
                  :rules="objRules.timeoutSecondsRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.periodSeconds"
                  class="my-0"
                  required
                  label="探测频率"
                  type="number"
                  :rules="objRules.periodSecondsRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.successThreshold"
                  class="my-0"
                  required
                  label="健康阀值"
                  type="number"
                  :rules="objRules.successThresholdRule"
                  :readonly="
                    obj.checkType === 'livenessProbe' ||
                      obj.checkType === 'startupProbe'
                  "
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.failureThreshold"
                  class="my-0"
                  required
                  label="不健康阀值"
                  type="number"
                  :rules="objRules.failureThresholdRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <v-sheet
      v-if="containerCopy && containerCopy.livenessProbe"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  存活检查
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <template v-if="containerCopy.livenessProbe.httpGet">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.livenessProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.livenessProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    HTTP请求检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.livenessProbe.httpGet.scheme }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.livenessProbe.httpGet.path }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    路径
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.livenessProbe.httpGet.port }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    端口
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template v-else-if="containerCopy.livenessProbe.exec">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.livenessProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.livenessProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    执行命令检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1 kubegems__break-all">
                    <template
                      v-for="command in containerCopy.livenessProbe.exec
                        .command"
                    >
                      {{ command }}
                    </template>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    命令
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template v-else-if="containerCopy.livenessProbe.tcpSocket">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.livenessProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.livenessProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    TCP端口检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.livenessProbe.tcpSocket.port }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    端口
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData('livenessProbe')"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData('livenessProbe')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>

    <v-sheet
      v-if="containerCopy && containerCopy.readinessProbe"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  就绪检查
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <template v-if="containerCopy.readinessProbe.httpGet">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.readinessProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.readinessProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    HTTP请求检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.readinessProbe.httpGet.scheme }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.readinessProbe.httpGet.path }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    路径
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.readinessProbe.httpGet.port }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    端口
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template v-else-if="containerCopy.readinessProbe.exec">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.readinessProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.readinessProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    执行命令检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1 kubegems__break-all">
                    <template
                      v-for="command in containerCopy.readinessProbe.exec
                        .command"
                    >
                      {{ command }}
                    </template>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    命令
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template v-else-if="containerCopy.readinessProbe.tcpSocket">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.readinessProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.readinessProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    TCP端口检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.readinessProbe.tcpSocket.port }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    端口
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData('readinessProbe')"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData('readinessProbe')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>

    <v-sheet
      v-if="containerCopy && containerCopy.startupProbe"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  启动检查
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <template v-if="containerCopy.startupProbe.httpGet">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.startupProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.startupProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    HTTP请求检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.startupProbe.httpGet.scheme }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.startupProbe.httpGet.path }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    路径
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.startupProbe.httpGet.port }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    端口
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template v-else-if="containerCopy.startupProbe.exec">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.startupProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.startupProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    执行命令检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1 kubegems__break-all">
                    <template
                      v-for="command in containerCopy.startupProbe.exec.command"
                    >
                      {{ command }}
                    </template>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    命令
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template v-else-if="containerCopy.startupProbe.tcpSocket">
              <v-list-item
                two-line
                class="float-left pa-0 kubegems__three-width"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    初始延迟{{
                      containerCopy.startupProbe.initialDelaySeconds
                    }}s&nbsp;超时{{
                      containerCopy.startupProbe.timeoutSeconds
                    }}s
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    TCP端口检查
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ containerCopy.startupProbe.tcpSocket.port }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    端口
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData('startupProbe')"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData('startupProbe')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>

    <v-flex
      v-if="
        !containerCopy ||
          !containerCopy.livenessProbe ||
          !containerCopy.readinessProbe ||
          !containerCopy.startupProbe
      "
      class="grey lighten-4 rounded-0 ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn
              text
              color="primary"
              @click="expandCard"
            >
              <v-icon
                left
                small
              >
                mdi-plus
              </v-icon>
              添加健康检查
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'
import { required, positiveInteger, port } from '@/utils/rules'

export default {
  name: 'ContainerHealthCheck',
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
      checkTypes: [
        { text: '容器存活检查', value: 'livenessProbe' },
        { text: '容器就绪检查', value: 'readinessProbe' },
        { text: '容器启动检查', value: 'startupProbe' },
      ],
      checkMethods: [
        { text: 'HTTP请求检查', value: 'httpGet' },
        { text: '执行命令检查', value: 'exec' },
        { text: 'TCP端口检查', value: 'tcpSocket' },
      ],
      obj: {
        checkType: 'livenessProbe',
        checkMethod: 'httpGet',
        initialDelaySeconds: 1,
        timeoutSeconds: 1,
        periodSeconds: 10,
        successThreshold: 1,
        failureThreshold: 1,
        httpGet: {
          scheme: 'HTTP',
          path: '',
          port: '',
        },
        exec: {
          command: '',
        },
        tcpSocket: {
          port: '',
        },
      },
      containerCopy: null,
    }
  },
  computed: {
    objRules() {
      const ruler = {
        checkTypeRule: [required],
        checkMethodRule: [required],
        initialDelaySecondsRule: [
          positiveInteger,
        ],
        timeoutSecondsRule: [
          positiveInteger,
          (v) => parseInt(v) >= 1 || '最小为1',
        ],
        periodSecondsRule: [
          positiveInteger,
          (v) => parseInt(v) >= 1 || '最小为1',
        ],
        successThresholdRule: [
          positiveInteger,
        ],
        failureThresholdRule: [
          positiveInteger,
        ],
      }
      if (this.obj.checkMethod === 'httpGet') {
        ruler['schemeRule'] = [required]
        ruler['pathRule'] = [required]
        ruler['portRule'] = [
          port,
        ]
      } else if (this.obj.checkMethod === 'exec') {
        ruler['commandRule'] = [required]
      } else if (this.obj.checkMethod === 'tcpSocket') {
        ruler['portRule'] = [
          port,
        ]
      }
      return ruler
    },
  },
  watch: {
    container() {
      if (this.container) this.containerCopy = deepCopy(this.container)
      else this.containerCopy = {}
    },
  },
  mounted() {
    if (this.container) this.containerCopy = deepCopy(this.container)
    else this.containerCopy = {}
  },
  methods: {
    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$nextTick(() => {
        this.obj = {
          checkType: 'livenessProbe',
          checkMethod: 'httpGet',
          initialDelaySeconds: 1,
          timeoutSeconds: 1,
          periodSeconds: 10,
          successThreshold: 1,
          failureThreshold: 1,
          httpGet: {
            scheme: 'HTTP',
            path: '',
            port: '',
          },
          exec: {
            command: '',
          },
          tcpSocket: {
            port: '',
          },
        }
      })
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        const prob = {
          initialDelaySeconds: this.obj.initialDelaySeconds,
          timeoutSeconds: this.obj.timeoutSeconds,
          periodSeconds: this.obj.periodSeconds,
          successThreshold: this.obj.successThreshold,
          failureThreshold: this.obj.failureThreshold,
        }
        if (this.obj.checkMethod === 'httpGet') {
          prob['httpGet'] = this.obj.httpGet
        } else if (this.obj.checkMethod === 'exec') {
          prob['exec'] = { command: [this.obj.exec.command] }
        } else if (this.obj.checkMethod === 'tcpSocket') {
          prob['tcpSocket'] = this.obj.tcpSocket
        }
        this.$set(this.containerCopy, this.obj.checkType, deepCopy(prob))
        this.$emit('updateComponentData', this.containerCopy)
        this.closeCard()
      }
    },
    removeData(checkType) {
      this.$set(this.containerCopy, checkType, null)
      this.$emit('updateComponentData', this.containerCopy)
    },
    updateData(checkType) {
      const probe = this.containerCopy[checkType]
      this.obj = {
        checkType: checkType,
        checkMethod: probe.httpGet
          ? 'httpGet'
          : probe.exec
          ? 'exec'
          : 'tcpSocket',
        initialDelaySeconds: probe.initialDelaySeconds,
        timeoutSeconds: probe.timeoutSeconds,
        periodSeconds: probe.periodSeconds,
        successThreshold: probe.successThreshold,
        failureThreshold: probe.failureThreshold,
        httpGet: {
          scheme: probe.httpGet ? probe.httpGet.scheme : 'HTTP',
          path: probe.httpGet ? probe.httpGet.path : '',
          port: probe.httpGet ? probe.httpGet.port : 'HTTP',
        },
        exec: {
          command: probe.exec ? probe.exec.command[0] : '',
        },
        tcpSocket: {
          port: probe.tcpSocket ? probe.tcpSocket.port : '',
        },
      }
      this.expandCard()
    },
  },
}
</script>
