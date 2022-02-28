<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn
            text
            small
            class="primary--text"
            @click="deployModel"
          >
            <v-icon
              left
              small
            >
              mdi-rocket
            </v-icon>
            发布
          </v-btn>
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateModel"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeModel"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col
        cols="3"
        class="pt-0"
      >
        <ModelInfo
          :model="model"
          :versions="versions"
        />
      </v-col>
      <v-col
        cols="9"
        class="pt-0"
      >
        <v-card>
          <v-card-text>
            <v-tabs height="40">
              <v-tab
                v-for="item in [{ text: '模型详情', value: 'detail' }]"
                :key="item.value"
              >
                {{ item.text }}
              </v-tab>
            </v-tabs>
            <div class="markdown-body py-2">
              <h2>Detail For {{ model.name }}</h2>
              <p>{{ model.description }}</p>
              <h2>Keywords, Format And Signature</h2>
              <h3>all keywords</h3>
              <p>{{ model.keywords.join(' ，') }}</p>
              <h3>model format</h3>
              <p>TorchScript</p>
              <h3>Signature</h3>
              <pre>{{ signature }}</pre>
              <h2>Ormb</h2>
              <pre><code class="hljs language-sh">$ormb save add apisix https://charts.apiseven.com</code></pre>
              <pre><code class="hljs language-sh">$ormb push add apisix https://charts.apiseven.com</code></pre>
              <pre><code class="hljs language-sh">$ormb pull add apisix https://charts.apiseven.com</code></pre>
              <h2>Size</h2>
              <p>3.5 Gi</p>
              <h2>Files</h2>
              <p>all files contained in the current model</p>
              <table>
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>Filename</th>
                    <th>Dir</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(file, index) in files"
                    :key="index"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>
                      <code>{{ file.substr(file.lastIndexOf('/') + 1) }}</code>
                    </td>
                    <td>
                      <code>{{ file }}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <Deploy
      ref="deploy"
      :model="model"
      :versions="versions"
    />
    <UpdateAiModel ref="updateAiModel" />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import ModelInfo from './components/ModelInfo'
import Deploy from './components/Deploy'
import UpdateAiModel from './components/UpdateAiModel'

export default {
  name: 'ModelStoreDetail',
  components: {
    ModelInfo,
    Deploy,
    UpdateAiModel,
  },
  data: () => ({
    breadcrumb: {
      title: '模型商店',
      tip: '模型商店(ormb)通过镜像仓库来分发模型，可以帮助用户更好的管理他们的机器学习 / 深度学习模型。通过 Ormb，模型能更易于创建、版本化、共享以及发布。',
    },
    model: {
      id: 1,
      name: 'asr-speech-bokan-v2',
      description: 'asr bokan model',
      repository: '',
      keywords: ['asr', 'speech'],
      maintainers: [],
      createdAt: '2021-08-05T13:40:00.267+08:00',
    },
    versions: ['1.2', '1.1', '1.0'],
    files: [
      'model/am.mdl',
      'model/cmvn.status',
      'model/final.mdl',
      'model/grammar/base.fst',
      'model/grammar/base_words.txt',
      'model/grammar/client_map.txt',
      'model/grammar/hot.fst',
      'model/grammar/hot_words.txt',
      'model/trans_cminds.mdl',
      'model/trans_kaldi.mdl',
    ],
    signature: {
      inputs: [{ dType: 'float32', name: 'input__0', size: [1, 3, 224, 224] }],
      outputs: [{ dType: 'float32', name: 'input__9', size: [1, 1000] }],
    },
  }),
  computed: {
    ...mapState(['Scale']),
  },
  methods: {
    deployModel() {
      this.$refs.deploy.open()
    },
    updateModel() {
      this.$refs.updateAiModel.init()
      this.$refs.updateAiModel.open()
    },
    removeModel() {
      this.$store.commit('SET_CONFIRM', {
        title: `删除AI模型`,
        content: {
          text: `删除AI模型 ${this.$route.params.name}`,
          type: 'delete',
          name: this.$route.params.name,
        },
        param: {},
        doFunc: async () => {},
      })
    },
  },
}
</script>
