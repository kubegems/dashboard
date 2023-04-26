/*
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
 */
const getPlatfom = (): string => {
  const title = document.title;
  const platform =
    title.indexOf('-') > -1
      ? title
          ?.substr(title?.indexOf('-') + 1)
          ?.trim()
          ?.toLocaleLowerCase() || 'kubegems'
      : title?.trim()?.toLocaleLowerCase() || 'kubegems';
  return platform;
};

export const getIconName = (name: string, def = 'kubernetes'): string => {
  name = name.toLowerCase().trim();
  if (name.startsWith('mm')) return '';

  if (name.indexOf('aliyun') > -1) return 'img:/icon/aliyun.svg';
  if (name.indexOf('dingding') > -1) return 'img:/icon/dingding.svg';
  if (name.indexOf('volume-snapshoter') > -1) return 'logos:kubernetes';
  if (name.indexOf('node-problem-detector') > -1) return 'logos:kubernetes';
  if (name.indexOf('node-local-dns') > -1) return 'logos:kubernetes';
  if (name === 'container') return 'logos:kubernetes';
  if (name === 'log') return 'logos:kubernetes';
  if (name === 'volume') return 'logos:kubernetes';
  if (name.indexOf('prometheus') > -1) return 'logos:prometheus';
  if (name.indexOf('mysql') > -1) return 'logos:mysql-icon';
  if (name.indexOf('redis') > -1) return 'logos:redis';
  if (name.indexOf('nginx') > -1) return 'logos:nginx';
  if (name.indexOf('operator') > -1) return 'img:/icon/operator.svg';
  if (name.indexOf('elasticsearch') > -1) return 'logos:elasticsearch';
  if (name.indexOf('elastic') > -1) return 'logos:elasticsearch';
  if (name === 'es') return 'logos:elasticsearch';
  if (name.indexOf('mongodb') > -1) return 'logos:mongodb-icon';
  if (name === 'mongo') return 'logos:mongodb-icon';
  if (name === 'k3s') return 'img:/icon/k3s.svg';
  if (name === 'k3s-light') return 'img:/icon/k3s-light.svg';
  if (name.indexOf('seldon') > -1) return 'img:/icon/seldon-icon.svg';
  if (name.indexOf('cloudminds') > -1) return 'img:/icon/cloudminds.svg';
  if (name.indexOf('banzaicloud') > -1) return 'img:/icon/banzaicloud.svg';
  if (name.indexOf('hashicorp') > -1) return 'img:/icon/hashicorp.svg';
  if (name.indexOf('knative') > -1) return 'img:/icon/knative.svg';
  if (name.indexOf('postgresql') > -1) return 'logos:postgresql';
  if (name.indexOf('postgres') > -1) return 'logos:postgresql';
  if (name.indexOf('kibana') > -1) return 'logos:kibana';
  if (name.indexOf('cassandra') > -1) return 'logos:cassandra';
  if (name.indexOf('jenkins') > -1) return 'logos:jenkins';
  if (name.indexOf('logstash') > -1) return 'logos:logstash';
  if (name.indexOf('tomcat') > -1) return 'logos:tomcat';
  if (name.indexOf('consul') > -1) return 'logos:consul';
  if (name.indexOf('etcd') > -1) return 'logos:etcd';
  if (name === 'gpu') return 'img:/icon/gpu.svg';
  if (name.indexOf('memcached') > -1) return 'logos:memcached';
  if (name.indexOf('kafka') > -1) return 'logos:kafka-icon';
  if (name.indexOf('influxdb') > -1) return 'logos:influxdb';
  if (name.indexOf('rabbitmq') > -1) return 'logos:rabbitmq-icon';
  if (name.indexOf('neo4j') > -1) return 'logos:neo4j';
  if (name.indexOf('sonarqube') > -1) return 'logos:sonarqube';
  if (name.indexOf('vault') > -1) return 'logos:vault-icon';
  if (name.indexOf('vmware') > -1) return 'img:/icon/vmware.svg';
  if (name.indexOf('email') > -1) return 'logos:google-gmail';
  if (name.indexOf('feishu') > -1) return 'img:/icon/feishu.svg';
  if (name.indexOf('webhook') > -1) return 'logos:webhooks';
  if (name.indexOf('apm-server') > -1) {
    return 'img:/icon/apm-server.svg';
  }
  if (name.indexOf('apisix') > -1) return 'img:/icon/apisix.svg';
  if (name.indexOf('nacos') > -1) return 'img:/icon/nacos.svg';
  if (name.indexOf('minio') > -1) return 'img:/icon/minio.svg';
  if (name.indexOf('nats') > -1) return 'logos:nats-icon';
  if (name.indexOf('zookeeper') > -1) return 'img:/icon/zookeeper.svg';
  if (name.indexOf('skywalking') > -1) return 'img:/icon/skywalking.svg';
  if (name.indexOf('mariadb') > -1) return 'logos:mariadb-icon';
  if (name.indexOf('tensorflow') > -1) return 'logos:tensorflow';
  if (name.indexOf('solr') > -1) return 'logos:solr';
  if (name.indexOf('opencart') > -1) return 'logos:opencart';
  if (name.indexOf('bitnami') > -1) return 'logos:bitnami';
  if (name.indexOf('harbor') > -1) return 'img:/icon/harbor.svg';
  if (name.indexOf('prestashop') > -1) return 'logos:prestashop';
  if (name.indexOf('wordpress') > -1) return 'logos:wordpress';
  if (name.indexOf('apache') > -1) return 'logos:apache';
  if (name.indexOf('airflow') > -1) return 'logos:airflow';
  if (name.indexOf('joomla') > -1) return 'logos:joomla';
  if (name.indexOf('phabricator') > -1) return 'img:/icon/phabricator.svg';
  if (name.indexOf('wildfly') > -1) return 'logos:wildfly';
  if (name.indexOf('exporter') > -1) return 'logos:prometheus';
  if (name.indexOf('node_problem_detector') > -1) return 'logos:kubernetes';
  if (name.indexOf('nodejs') > -1) return 'logos:nodemon';
  if (name.indexOf('grafana') > -1) return 'logos:grafana';
  if (name.indexOf('phpbb') > -1) return 'logos:php';
  if (name.indexOf('pytorch') > -1) return 'logos:pytorch-icon';
  if (name.indexOf('concourse') > -1) return 'logos:concourse';
  if (name.indexOf('discourse') > -1) return 'logos:discourse';
  if (name.indexOf('spark') > -1) return 'logos:spark';
  if (name.indexOf('orangehrm') > -1) return 'img:/icon/orangehrm.svg';
  if (name.indexOf('spring') > -1) return 'logos:spring-icon';
  if (name.indexOf('mediawiki') > -1) return 'logos:xwiki';
  if (name.indexOf('spring') > -1) return 'logos:spring-icon';
  if (name.indexOf('aspnet') > -1) return 'logos:net';
  if (name.indexOf('drupal') > -1) return 'logos:drupal-icon';
  if (name.indexOf('fluentd') > -1) return 'img:/icon/fluentd.svg';
  if (name.indexOf('osclass') > -1) return 'img:/icon/osclass.svg';
  if (name.indexOf('kong') > -1) return 'logos:kong-icon';
  if (name.indexOf('ghost') > -1) return 'logos:ghost';
  if (name.indexOf('parse') > -1) return 'logos:parse';
  if (name.indexOf('php') > -1) return 'logos:php';
  if (name.indexOf('wiki') > -1) return 'logos:xwiki';
  if (name.indexOf('loki') > -1) return 'img:/icon/loki.svg';
  if (name.indexOf('logging') > -1) return 'img:/icon/loki.svg';
  if (name.indexOf('argo') > -1) return 'logos:argo-icon';
  if (name.indexOf('wavefront') > -1) return 'img:/icon/wavefront.svg';
  if (name.indexOf('istio') > -1) return 'img:/icon/istio.svg';
  if (name.indexOf('jaeger') > -1) return 'img:/icon/jaeger.svg';
  if (name.indexOf('coredns') > -1) return 'img:/icon/coredns.svg';
  if (name.indexOf('calico') > -1) return 'img:/icon/calico.svg';
  if (name.indexOf('flannel') > -1) return 'logos:flannel';
  if (name.indexOf('kube_ovn') > -1) return 'img:/icon/ovn.svg';
  if (name.indexOf('nvidia') > -1) return 'img:/icon/nvidia.svg';
  if (name.indexOf('log_agent') > -1) return 'img:/icon/fluentd.svg';
  if (name.indexOf('alertmanager') > -1) return 'logos:prometheus';
  if (name.indexOf('monitoring') > -1) return 'logos:prometheus';
  if (name.indexOf('cert_manager') > -1) return 'img:/icon/cert-manager.svg';
  if (name.indexOf('local_path') > -1) return 'logos:rancher-icon';
  if (name.indexOf('local-path') > -1) return 'logos:rancher-icon';
  if (name.indexOf('tke') > -1) return 'img:/icon/tke.svg';
  if (name.indexOf('filebeat') > -1) return 'img:/icon/filebeat.svg';
  if (name.indexOf('metricbeat') > -1) return 'img:/icon/metricbeat.svg';
  if (name.indexOf('fluent-bit') > -1) return 'img:/icon/fluentbit.svg';
  if (name.indexOf('cert-manager') > -1) return 'img:/icon/cert-manager.svg';
  if (name.indexOf('haproxy') > -1) return 'img:/icon/haproxy.svg';
  if (name.indexOf('kubeapps') > -1) return 'img:/icon/kubeapps.svg';
  if (name.indexOf('keycloak') > -1) return 'img:/icon/keycloak.svg';
  if (name.indexOf('metallb') > -1) return 'img:/icon/metallb.svg';
  if (name.indexOf('moodle') > -1) return 'img:/icon/moodle.svg';
  if (name.indexOf('ejbca') > -1) return 'img:/icon/ejbca.svg';
  if (name.indexOf('owncloud') > -1) return 'img:/icon/owncloud.svg';
  if (name.indexOf('odoo') > -1) return 'img:/icon/odoo.svg';
  if (name.indexOf('thanos') > -1) return 'img:/icon/thanos.svg';
  if (name.indexOf('sugarcrm') > -1) return 'img:/icon/sugarcrm.svg';
  if (name.indexOf('suitecrm') > -1) return 'img:/icon/suitecrm.svg';
  if (name.indexOf('redmine') > -1) return 'img:/icon/redmine.svg';
  if (name.indexOf('mxnet') > -1) return 'img:/icon/mxnet.svg';
  if (name.indexOf('magento') > -1) return 'img:/icon/magento.svg';
  if (name.indexOf('jupyterhub') > -1) return 'logos:jupyter';
  if (name.indexOf('jasperreports') > -1) return 'img:/icon/jasperreports.svg';
  if (name.indexOf('oauth2') > -1) return 'logos:oauth';
  if (name.indexOf('vscode') > -1) return 'logos:visual-studio-code';
  if (name.indexOf('gitlab') > -1) return 'logos:gitlab';
  if (name.indexOf('oauth') > -1) return 'logos:oauth';
  if (name.indexOf('ldap') > -1) return 'img:/icon/openldap.svg';
  if (name.toLocaleLowerCase() === 'opencsg') return `img:/opencsg.svg`;
  if (name.toLocaleLowerCase() === 'modelx') return `img:/${getPlatfom()}.svg`;
  if (name === 'kubegems') return `img:/${getPlatfom()}.svg`;
  if (name.startsWith('kubegems')) return `img:/${getPlatfom()}.svg`;
  if (name.indexOf('gke') > -1) return 'logos:google-cloud';
  if (name === 'ack') return 'img:/icon/aliyun.svg';
  if (name.indexOf('testlink') > -1) return 'img:/icon/testlink.svg';
  if (name.indexOf('geode') > -1) return 'img:/icon/geode.svg';
  if (name.indexOf('github') > -1) return 'logos:github-icon';
  if (name.indexOf('dataplatform') > -1) return 'img:/icon/dataplatform.svg';
  if (name.indexOf('cmak') > -1) return 'logos:kafka-icon';
  if (name.indexOf('c++') > -1) return 'logos:c-plusplus';
  if (name.indexOf('c#') > -1) return 'logos:c-sharp';
  if (name.indexOf('erlang') > -1) return 'logos:erlang';
  if (name.indexOf('golang') > -1) return 'logos:go';
  if (name.indexOf('javascript') > -1) return 'logos:javascript';
  if (name.indexOf('java') > -1) return 'logos:java';
  if (name.indexOf('jmx') > -1) return 'logos:java';
  if (name.indexOf('php') > -1) return 'logos:php';
  if (name.indexOf('helm') > -1) return 'logos:helm';
  if (name.indexOf('python') > -1) return 'logos:python';
  if (name.indexOf('ruby') > -1) return 'logos:ruby';
  if (name.indexOf('rust') > -1) return 'logos:rust';
  if (name.indexOf('swift') > -1) return 'logos:swift';
  if (name.indexOf('kubevela') > -1) return 'img:/icon/kubevela.svg';
  if (name.indexOf('region') > -1) return 'img:/icon/region.svg';
  if (name.indexOf('gateway') > -1) return 'logos:nginx';
  if (name.indexOf('tracing') > -1) return 'img:/icon/jaeger.svg';
  if (name.indexOf('log collect') > -1) return `img:/${getPlatfom()}.svg`;
  if (name === 'opentelemetry') return 'logos:opentelemetry';
  if (name.indexOf('opentelemetry') > -1) return 'logos:opentelemetry-icon';
  if (name.indexOf('otel') > -1) return 'logos:opentelemetry-icon';
  if (name.indexOf('openkruise') > -1) return 'img:/icon/openkruise.svg';
  if (name.indexOf('ai-model') > -1) return 'img:/icon/ai-model.svg';
  if (name.indexOf('transformers') > -1) return 'img:/icon/transform.svg';
  if (name.indexOf('huggingface') > -1) return 'img:/icon/transform.svg';
  if (name.indexOf('gitea') > -1) return 'img:/icon/gitea.svg';
  if (name.indexOf('chartmuseum') > -1) return 'img:/icon/chartmuseum.svg';
  if (name.indexOf('ceph') > -1) return 'img:/icon/ceph.svg';
  if (name.indexOf('storage') > -1) return 'img:/icon/storage.svg';

  if (name.indexOf('spacy') > -1) return 'img:/icon/spacy.svg';
  if (name.indexOf('generic') > -1) return 'img:/icon/generic.svg';
  if (name.indexOf('keras') > -1) return 'img:/icon/keras.svg';
  if (name.indexOf('asteroid') > -1) return 'img:/icon/asteroid.svg';
  if (name.indexOf('jax') > -1) return 'img:/icon/jax.svg';
  if (name.indexOf('onnx') > -1) return 'img:/icon/onnx.svg';
  if (name.indexOf('flair') > -1) return 'img:/icon/flair.svg';
  if (name.indexOf('nemo') > -1) return 'img:/icon/nvidia.svg';
  if (name.indexOf('fastai') > -1) return 'img:/icon/fastai.svg';
  if (name.indexOf('stanza') > -1) return 'img:/icon/stanza.svg';
  if (name.indexOf('espnet') > -1) return 'img:/icon/espnet.svg';
  if (name.indexOf('diffusers') > -1) return 'img:/icon/diffusers.svg';
  if (name.indexOf('core ml') > -1) return 'img:/icon/core ml.svg';

  if (name.indexOf('audio') > -1) return 'mdi:microphone';
  if (name.indexOf('text') > -1) return 'mdi:format-text-variant-outline';
  if (name.indexOf('image') > -1) return 'mdi:image-multiple-outline';
  if (name.indexOf('translation') > -1) return 'mdi:translate';
  if (name.indexOf('voice') > -1) return 'mdi:voicemail';
  if (name.indexOf('recognition') > -1) return 'mdi:text-recognition';
  if (name.indexOf('learning') > -1) return 'mdi:robot-outline';
  if (name.indexOf('classification') > -1) return 'mdi:layers-outline';
  if (name.indexOf('question') > -1) return 'mdi:comment-question-outline';
  if (name.indexOf('video') > -1) return 'mdi:video-wireless-outline';
  if (name.indexOf('shot') > -1) return 'mdi:image-filter-center-focus-strong-outline';
  if (name.indexOf('track') > -1) return 'mdi:track-light';
  if (name.indexOf('detection') > -1) return 'mdi:smoke-detector-outline';
  if (name.indexOf('keypoint') > -1) return 'mdi:hockey-sticks';
  if (name.indexOf('segmentation') > -1) return 'mdi:segment';
  if (name.indexOf('conversation') > -1) return 'mdi:account-convert';
  if (name.indexOf('extract') > -1) return 'mdi:eyedropper';
  if (name.indexOf('fill-mask') > -1) return 'mdi:basket-fill';
  if (name.indexOf('local') > -1) return 'mdi:earth';

  if (name.indexOf('tempo') > -1) return 'img:/icon/tempo.svg';
  if (name.indexOf('openmmlab') > -1) return 'img:/icon/openmmlab_logo.svg';
  if (name.indexOf('triton') > -1) return 'img:/icon/nvidia.svg';
  if (name.indexOf('sklearn') > -1) return 'img:/icon/sklearn.svg';
  if (name.indexOf('mlflow') > -1) return 'img:/icon/mlflow.svg';
  if (name.indexOf('xgboost') > -1) return 'img:/icon/xgboost.svg';

  if (name.startsWith('mdi')) return name;

  // if (name.indexOf('selfhosted') > -1) return 'img:kubegems.svg';

  switch (def) {
    case 'task':
      return 'mdi:alert-circle-check-outline';
    case 'framework':
      return '';
    case 'license':
      return 'mdi:bank-outline';
    case 'kubegems':
      return `img:/${getPlatfom()}.svg`;
    case 'model':
      return 'img:/icon/ai-model.svg';
    default:
      return 'logos:kubernetes';
  }
};
