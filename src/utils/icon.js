export function getIconName(name) {
  if (name.indexOf('node-problem-detector') > -1) return 'logos:kubernetes'
  if (name.indexOf('node-local-dns') > -1) return 'logos:kubernetes'
  if (name.indexOf('prometheus') > -1) return 'logos:prometheus'
  if (name.indexOf('mysql') > -1) return 'logos:mysql'
  if (name.indexOf('redis') > -1) return 'logos:redis'
  if (name.indexOf('nginx') > -1) return 'logos:nginx'
  if (name.indexOf('operator') > -1) return 'img:operator.png'
  if (name.indexOf('elasticsearch') > -1) return 'logos:elasticsearch'
  if (name.indexOf('mongodb') > -1) return 'simple-icons:mongodb'
  if (name.indexOf('postgresql') > -1) return 'logos:postgresql'
  if (name.indexOf('kibana') > -1) return 'logos:kibana'
  if (name.indexOf('cassandra') > -1) return 'logos:cassandra'
  if (name.indexOf('jenkins') > -1) return 'logos:jenkins'
  if (name.indexOf('logstash') > -1) return 'logos:logstash'
  if (name.indexOf('tomcat') > -1) return 'logos:tomcat'
  if (name.indexOf('consul') > -1) return 'logos:consul'
  if (name.indexOf('etcd') > -1) return 'logos:etcd'
  if (name.indexOf('memcached') > -1) return 'logos:memcached'
  if (name.indexOf('kafka') > -1) return 'logos:kafka-icon'
  if (name.indexOf('influxdb') > -1) return 'logos:influxdb'
  if (name.indexOf('rabbitmq') > -1) return 'logos:rabbitmq-icon'
  if (name.indexOf('neo4j') > -1) return 'logos:neo4j'
  if (name.indexOf('sonarqube') > -1) return 'simple-icons:sonarqube'
  if (name.indexOf('vault') > -1) return 'logos:vault-icon'
  if (name.indexOf('vmware') > -1) return 'carbon:logo-vmware'
  if (name.indexOf('tempo') > -1) return 'logos:grafana'
  if (name.indexOf('apm-server') > -1) { return 'vscode-icons:file-type-elastic' }
  if (name.indexOf('apisix') > -1) return 'img:apisix.png'
  if (name.indexOf('nacos') > -1) return 'img:nacos.jpeg'
  if (name.indexOf('minio') > -1) return 'img:minio.png'
  if (name.indexOf('nats') > -1) return 'img:nats.png'
  if (name.indexOf('zookeeper') > -1) return 'img:zookeeper.png'
  if (name.indexOf('skywalking') > -1) return 'img:skywalking.png'
  if (name.indexOf('mariadb') > -1) return 'logos:mariadb-icon'
  if (name.indexOf('tensorflow') > -1) return 'logos:tensorflow'
  if (name.indexOf('solr') > -1) return 'logos:solr'
  if (name.indexOf('opencart') > -1) return 'logos:opencart'
  if (name.indexOf('bitnami') > -1) return 'logos:bitnami'
  if (name.indexOf('harbor') > -1) return 'simple-icons:harbor'
  if (name.indexOf('prestashop') > -1) return 'logos:prestashop'
  if (name.indexOf('wordpress') > -1) return 'logos:wordpress'
  if (name.indexOf('apache') > -1) return 'logos:apache'
  if (name.indexOf('airflow') > -1) return 'logos:airflow'
  if (name.indexOf('joomla') > -1) return 'logos:joomla'
  if (name.indexOf('phabricator') > -1) return 'fa-brands:phabricator'
  if (name.indexOf('wildfly') > -1) return 'logos:wildfly'
  if (name.indexOf('exporter') > -1) return 'logos:prometheus'
  if (name.indexOf('node_local_dns') > -1) return 'img:coredns.png'
  if (name.indexOf('node_problem_detector') > -1) return 'logos:kubernetes'
  if (name.indexOf('node') > -1) return 'logos:nodemon'
  if (name.indexOf('grafana') > -1) return 'logos:grafana'
  if (name.indexOf('phpbb') > -1) return 'whh:phpbb'
  if (name.indexOf('pytorch') > -1) return 'logos:pytorch'
  if (name.indexOf('concourse') > -1) return 'logos:concourse'
  if (name.indexOf('discourse') > -1) return 'cib:discourse'
  if (name.indexOf('pytorch') > -1) return 'logos:pytorch'
  if (name.indexOf('spark') > -1) return 'cib:apache-spark'
  if (name.indexOf('orangehrm') > -1) return 'whh:orangehrm'
  if (name.indexOf('spring') > -1) return 'logos:spring-icon'
  if (name.indexOf('mediawiki') > -1) return 'file-icons:mediawiki'
  if (name.indexOf('spring') > -1) return 'logos:spring-icon'
  if (name.indexOf('aspnet') > -1) return 'logos:net'
  if (name.indexOf('drupal') > -1) return 'logos:drupal-icon'
  if (name.indexOf('fluentd') > -1) return 'img:fluentd.jpeg'
  if (name.indexOf('osclass') > -1) return 'whh:osclass'
  if (name.indexOf('kong') > -1) return 'logos:kong-icon'
  if (name.indexOf('ghost') > -1) return 'logos:ghost'
  if (name.indexOf('parse') > -1) return 'logos:parse'
  if (name.indexOf('php') > -1) return 'logos:php'
  if (name.indexOf('wiki') > -1) return 'flat-color-icons:wikipedia'
  if (name.indexOf('loki') > -1) return 'img:loki.png'
  if (name.indexOf('logging') > -1) return 'img:loki.png'
  if (name.indexOf('argo') > -1) return 'img:argo.png'
  if (name.indexOf('wavefront') > -1) return 'img:wavefront.png'
  if (name.indexOf('istio') > -1) return 'img:istio.png'
  if (name.indexOf('jaeger') > -1) return 'img:jaeger.png'
  if (name.indexOf('coredns') > -1) return 'img:coredns.png'
  if (name.indexOf('calico') > -1) return 'img:calico.png'
  if (name.indexOf('flannel') > -1) return 'img:flannel.png'
  if (name.indexOf('kube_ovn') > -1) return 'img:ovn.jpeg'
  if (name.indexOf('nvidia') > -1) return 'img:nvidia.png'
  if (name.indexOf('log_agent') > -1) return 'img:fluentd.jpeg'
  if (name.indexOf('alertmanager') > -1) return 'logos:prometheus'
  if (name.indexOf('monitoring') > -1) return 'logos:prometheus'
  if (name.indexOf('cert_manager') > -1) return 'img:cert.png'
  if (name.indexOf('local_path') > -1) return 'logos:rancher-icon'
  if (name.indexOf('local-path') > -1) return 'logos:rancher-icon'
  if (name.indexOf('tke') > -1) return 'img:tke.png'
  if (name.indexOf('filebeat') > -1) return 'img:filebeat.png'
  if (name.indexOf('metricbeat') > -1) return 'img:metricbeat.png'
  if (name.indexOf('fluent-bit') > -1) return 'img:fluentbit.jpeg'
  if (name.indexOf('cert-manager') > -1) return 'img:cert.png'
  if (name.indexOf('haproxy') > -1) return 'img:haproxy.png'
  if (name.indexOf('kubeapps') > -1) return 'img:kubeapps.png'
  if (name.indexOf('keycloak') > -1) return 'img:keycloak.png'
  if (name.indexOf('metallb') > -1) return 'img:metallb.png'
  if (name.indexOf('moodle') > -1) return 'img:moodle.png'
  if (name.indexOf('ejbca') > -1) return 'img:ejbca.jpeg'
  if (name.indexOf('owncloud') > -1) return 'img:owncloud.png'
  if (name.indexOf('odoo') > -1) return 'img:odoo.png'
  if (name.indexOf('thanos') > -1) return 'img:thanos.png'
  if (name.indexOf('sugarcrm') > -1) return 'img:sugarcrm.png'
  if (name.indexOf('suitecrm') > -1) return 'img:suitecrm.png'
  if (name.indexOf('redmine') > -1) return 'img:redmine.jpeg'
  if (name.indexOf('mxnet') > -1) return 'img:mxnet.jpeg'
  if (name.indexOf('magento') > -1) return 'img:magento.png'
  if (name.indexOf('jupyterhub') > -1) return 'img:jupyterhub.png'
  if (name.indexOf('jasperreports') > -1) return 'img:jasperreports.jpeg'
  if (name.indexOf('oauth2') > -1) return 'img:oauth2.png'
  if (name.indexOf('vscode') > -1) return 'vscode-icons:file-type-vscode2'
  if (name.indexOf('gitlab') > -1) return 'logos:gitlab'
  if (name.indexOf('oauth') > -1) return 'logos:oauth'
  if (name.indexOf('ldap') > -1) return 'img:openldap.jpeg'
  if (name.indexOf('kubegems') > -1) return 'img:kubegems.jpg'
  if (name.indexOf('gke') > -1) return 'logos:google-cloud'
  if (name.indexOf('ack') > -1) return 'img:aliyun.png'
  if (name.indexOf('testlink') > -1) return 'img:testlink.png'
  if (name.indexOf('geode') > -1) return 'img:geode.png'
  if (name.indexOf('github') > -1) return 'logos:github-icon'
  if (name.indexOf('dataplatform') > -1) return 'img:dataplatform.png'
  if (name.indexOf('cmak') > -1) return 'logos:kafka-icon'
  if (name.indexOf('c++') > -1) return 'logos:c-plusplus'
  if (name.indexOf('c#') > -1) return 'logos:c-sharp'
  if (name.indexOf('erlang') > -1) return 'logos:erlang'
  if (name.indexOf('golang') > -1) return 'logos:go'
  if (name.indexOf('javascript') > -1) return 'logos:javascript'
  if (name.indexOf('java') > -1) return 'logos:java'
  if (name.indexOf('php') > -1) return 'logos:php'
  if (name.indexOf('python') > -1) return 'logos:python'
  if (name.indexOf('ruby') > -1) return 'logos:ruby'
  if (name.indexOf('rust') > -1) return 'logos:rust'
  if (name.indexOf('swift') > -1) return 'logos:swift'
  if (name.indexOf('kubevela') > -1) return 'img:kubevela.png'
  if (name.indexOf('gateway') > -1) return 'logos:nginx'
  if (name.indexOf('observability') > -1) return 'img:kubegems.jpg'
  // if (name.indexOf('selfhosted') > -1) return 'bx:bxl-kubernetes'
  return 'logos:kubernetes'
}
