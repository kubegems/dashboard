<template>
  <v-form v-model="valid" class="my-2" lazy-validation @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-0 px-2">
              <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
                <span>运行命令</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="obj.commands"
                  hide-no-data
                  hide-selected
                  :items="[]"
                  multiple
                  :rules="objRules.commandRule"
                  :search-input.sync="commandText"
                  @change="onCommandChange"
                  @keydown.enter="createCommand"
                >
                  <template #selection="{ item }">
                    <v-chip class="pa-1" color="primary" small>
                      <span>
                        {{ item.text }}
                      </span>
                      <v-icon small @click="removeCommand(item)"> mdi-close </v-icon>
                    </v-chip>
                  </template>
                </v-combobox>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
                <span>参数</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-combobox
                  v-model="obj.args"
                  hide-no-data
                  hide-selected
                  :items="[]"
                  multiple
                  :search-input.sync="argsText"
                  @change="onArgsChange"
                  @keydown.enter="createArgs"
                >
                  <template #selection="{ item }">
                    <v-chip class="pa-1" color="primary" small>
                      <span>
                        {{ item.text }}
                      </span>
                      <v-icon small @click="removeArgs(item)"> mdi-close </v-icon>
                    </v-chip>
                  </template>
                </v-combobox>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="closeCard"> 取消 </v-btn>
          <v-btn color="primary" small text @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet v-if="containerCopy && (containerCopy.command || containerCopy.args)" class="grey lighten-4 rounded ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle
            v-for="(command, index) in containerCopy.command ? containerCopy.command : []"
            :key="`${index}command`"
            class="text-body-2 py-0"
          >
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ command }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 启动命令 </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <v-list-item-subtitle
            v-for="(args, index) in containerCopy.args ? containerCopy.args : []"
            :key="`${index}args`"
            class="text-body-2 py-0"
          >
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ args }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> 启动参数 </v-list-item-subtitle>
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
              添加启动命令
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  export default {
    name: 'ContainerRunCommand',
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
        commandText: '',
        argsText: '',
        obj: {
          commands: [],
          args: [],
        },
        objRules: {
          commandRule: [required],
        },
        containerCopy: null,
      };
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
      onCommandChange() {
        const commands = this.obj.commands.filter((cmd) => {
          return cmd !== '' && typeof cmd === 'object';
        });
        this.obj.commands = commands;
      },
      createCommand() {
        if (!this.commandText) return;
        const index = this.obj.commands.length;
        this.obj.commands.push({
          text: this.commandText,
          value: index,
        });
        this.commandText = '';
      },
      removeCommand(item) {
        const commands = this.obj.commands.filter((cmd) => {
          return cmd.value !== item.value;
        });
        this.obj.commands = commands;
      },
      onArgsChange() {
        const args = this.obj.args.filter((args) => {
          return args !== '' && typeof cmd === 'object';
        });
        this.obj.args = args;
      },
      createArgs() {
        if (!this.argsText) return;
        const index = this.obj.args.length;
        this.obj.args.push({
          text: this.argsText,
          value: index,
        });
        this.argsText = '';
      },
      removeArgs(item) {
        const args = this.obj.args.filter((args) => {
          return args.value !== item.value;
        });
        this.obj.args = args;
      },
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.$refs.form.reset();
      },
      removeData() {
        this.$set(this.containerCopy, 'command', null);
        this.$set(this.containerCopy, 'args', null);
        this.$emit('updateComponentData', this.containerCopy);
      },
      updateData() {
        this.obj.commands = this.containerCopy.command
          ? this.containerCopy.command.map((cmd, index) => {
              return { text: cmd, value: index };
            })
          : [];
        this.obj.args = this.containerCopy.args
          ? this.containerCopy.args.map((cmd, index) => {
              return { text: cmd, value: index };
            })
          : [];
        this.expandCard();
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          const commands = [];
          this.obj.commands.forEach((cmd) => {
            commands.push(cmd.text);
          });
          this.$set(this.containerCopy, 'command', commands);
          const args = [];
          this.obj.args.forEach((arg) => {
            args.push(arg.text);
          });
          this.$set(this.containerCopy, 'args', args);
          this.$emit('updateComponentData', this.containerCopy);
          this.closeCard();
        }
      },
    },
  };
</script>
