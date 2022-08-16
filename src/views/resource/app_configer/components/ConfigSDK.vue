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
  <BasePanel v-model="panel" icon="mdi-wrench" :title="$t('tip.sdk_demo')">
    <template #content>
      <v-card class="conf rounded-0 pa-0" flat>
        <v-card-text class="text-h5 card__title">
          <v-form class="pa-0" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-radio-group v-model="sdk" hide-details row>
                  <v-radio v-for="(t, index) in sdkItems" :key="index" :label="t.text" :value="t.value" />
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <ACEEditor
          v-model="sdkContent"
          :class="`rounded-0 clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          :lang="lang"
          :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
          :style="{ height: `${height}px !important` }"
          @init="$aceinit"
          @keydown.stop
        />
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';

  export default {
    name: 'ConfigSDK',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        panel: false,
        sdk: 'python',
        sdkItems: [
          { text: 'python', value: 'python', lang: 'python' },
          { text: 'golang', value: 'golang', lang: 'golang' },
          { text: 'java', value: 'java', lang: 'java' },
          { text: 'springboot', value: 'springboot', lang: 'java' },
          { text: 'spring cloud', value: 'springcloud', lang: 'java' },
          { text: 'c++', value: 'c_cpp', lang: 'c_cpp' },
        ],
        sdkContent: '',
      };
    },
    computed: {
      ...mapState(['Scale']),
      lang() {
        return this.sdkItems.find((s) => {
          return s.value === this.sdk;
        }).lang;
      },
      height() {
        return window.innerHeight - 120 * this.Scale - 1;
      },
    },
    watch: {
      sdk: {
        handler(newValue) {
          switch (newValue) {
            case 'python':
              this.sdkContent = `# https://github.com/nacos-group/nacos-sdk-python
    import nacos

    SERVER_ADDRESSES = "nacos-client.nacos:8848"
    NAMESPACE = "your-namespace"

    client = nacos.NacosClient(SERVER_ADDRESSES, namespace=NAMESPACE)
    data_id = "your-dataid"
    group = "you-group"

    print(client.get_config(data_id, group))`;
              break;
            case 'golang':
              this.sdkContent = `// https://github.com/nacos-group/nacos-sdk-go
    package main

    import (
        "fmt"
        "github.com/nacos-group/nacos-sdk-go/clients"
        "github.com/nacos-group/nacos-sdk-go/common/constant"
        "github.com/nacos-group/nacos-sdk-go/vo"
        "time"
    )

    func main() {

        var endpoint = "nacos-client.nacos"
        var namespaceId = "your-namespace"

        clientConfig := constant.ClientConfig{
            //
            Endpoint:       endpoint + ":8848",
            NamespaceId:    namespaceId,
            TimeoutMs:      5 * 1000,
            ListenInterval: 30 * 1000,
        }

        configClient, err := clients.CreateConfigClient(map[string]interface{}{
            "clientConfig": clientConfig,
        })

        if err != nil {
            fmt.Println(err)
            return
        }

        var dataId = "your-dataid"
        var group = "your-group"

        // 发布配置
        success, err := configClient.PublishConfig(vo.ConfigParam{
            DataId:  dataId,
            Group:   group,
            Content: "connectTimeoutInMills=3000"})

        if success {
            fmt.Println("Publish config successfully.")
        }

        time.Sleep(3 * time.Second)

        // 获取配置
        content, err := configClient.GetConfig(vo.ConfigParam{
            DataId: dataId,
            Group:  group})

        fmt.Println("Get config：" + content)

        // 监听配置
        configClient.ListenConfig(vo.ConfigParam{
            DataId: dataId,
            Group:  group,
            OnChange: func(namespace, group, dataId, data string) {
                fmt.Println("ListenConfig group:" + group + ", dataId:" + dataId + ", data:" + data)
            },
        })

        // 删除配置
        success, err = configClient.DeleteConfig(vo.ConfigParam{
            DataId: dataId,
            Group:  group})

        if success {
            fmt.Println("Delete config successfully.")
        }

    }           `;
              break;
            case 'java':
              this.sdkContent =
                `/*
    * Demo for Nacos
    * pom.xml
        <dependency>
            <groupId>com.alibaba.nacos</groupId>
            <artifactId>nacos-client</artifactId>
            <version>` +
                '${version}' +
                `</version>
        </dependency>
    */
    package com.alibaba.nacos.example;

    import java.util.Properties;
    import java.util.concurrent.Executor;
    import com.alibaba.nacos.api.NacosFactory;
    import com.alibaba.nacos.api.config.ConfigService;
    import com.alibaba.nacos.api.config.listener.Listener;
    import com.alibaba.nacos.api.exception.NacosException;

    /**
     * Config service example
     *
     * @author Nacos
     *
     */
    public class ConfigExample {

            public static void main(String[] args) throws NacosException, InterruptedException {
                    String serverAddr = "nacos-client.nacos:8848";
                    String dataId = "your-dataid";
                    String group = "your-group";
                    Properties properties = new Properties();
                    properties.put(PropertyKeyConst.SERVER_ADDR, serverAddr);
                    ConfigService configService = NacosFactory.createConfigService(properties);
                    String content = configService.getConfig(dataId, group, 5000);
                    System.out.println(content);
                    configService.addListener(dataId, group, new Listener() {
                            @Override
                            public void receiveConfigInfo(String configInfo) {
                                    System.out.println("recieve:" + configInfo);
                            }

                            @Override
                            public Executor getExecutor() {
                                    return null;
                            }
                    });

                    boolean isPublishOk = configService.publishConfig(dataId, group, "content");
                    System.out.println(isPublishOk);

                    Thread.sleep(3000);
                    content = configService.getConfig(dataId, group, 5000);
                    System.out.println(content);

                    boolean isRemoveOk = configService.removeConfig(dataId, group);
                    System.out.println(isRemoveOk);
                    Thread.sleep(3000);

                    content = configService.getConfig(dataId, group, 5000);
                    System.out.println(content);
                    Thread.sleep(300000);

            }
    }`;
              break;
            case 'springboot':
              this.sdkContent =
                `// Refer to document: https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-boot-example/nacos-spring-boot-config-example
    package com.alibaba.nacos.example.spring.boot.controller;

    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.ResponseBody;

    import static org.springframework.web.bind.annotation.RequestMethod.GET;

    @Controller
    @RequestMapping("config")
    public class ConfigController {

        @Value(` +
                '"${useLocalCache:false}"' +
                `)
        private boolean useLocalCache;

        public void setUseLocalCache(boolean useLocalCache) {
            this.useLocalCache = useLocalCache;
        }

        @RequestMapping(value = "/get", method = GET)
        @ResponseBody
        public boolean get() {
            return useLocalCache;
        }
    }`;
              break;
            case 'springcloud':
              this.sdkContent =
                `// Refer to document:  https://github.com/nacos-group/nacos-examples/tree/master/nacos-spring-cloud-example/nacos-spring-cloud-config-example
  package com.alibaba.nacos.example.spring.cloud.controller;

  import org.springframework.beans.factory.annotation.Value;
  import org.springframework.cloud.context.config.annotation.RefreshScope;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RestController;

  @RestController
  @RequestMapping("/config")
  @RefreshScope
  public class ConfigController {

      @Value(` +
                '"${useLocalCache:false}"' +
                `)
      private boolean useLocalCache;

      @RequestMapping("/get")
      public boolean get() {
          return useLocalCache;
      }
  }`;
              break;
            case 'c_cpp':
              this.sdkContent = `// https://github.com/nacos-group/nacos-sdk-cpp

#include <iostream>
#include "Nacos.h"using namespace std;using namespace nacos;int main() {
    Properties props;
    props[PropertyKeyConst::SERVER_ADDR] = "nacos-client.nacos:8848";//Server address
    NacosServiceFactory *factory = new NacosServiceFactory(props);
    ResourceGuard <NacosServiceFactory> _guardFactory(factory);
    ConfigService *n = factory->CreateConfigService();
    ResourceGuard <ConfigService> _serviceFactory(n);
    NacosString ss = "";
    try {
        ss = n->getConfig("k", NULLSTR, 1000);
    }
    catch (NacosException &e) {
        cout <<
             "Request failed with curl code:" << e.errorcode() << endl <<
             "Reason:" << e.what() << endl;
        return -1;
    }
    cout << ss << endl;

    return 0;
}`;
              break;
            default:
              this.sdkContent = ``;
              break;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .conf {
    background-color: #f6f6f6;
  }
</style>
