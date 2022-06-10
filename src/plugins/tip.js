const TIP = {
  // 微服务
  virtualspace: '虚拟空间(Virtualspace)是一组环境的聚合。',
  dag: '服务调用图 (DAG) 是一个或多个命名空间下的所有负载服务调用链路关系图。',
  dns: 'DNS(DNSDomain)。',
  'v-dashboard': '租户容器服务提供了安全隔离的、具有访问权限控制的工作平台。这里您可以看到当前租户内资源运行的概况。',
  'v-workload': '工作负载 (Workload) 通常是访问服务的载体, 是对一组容器组 (Pod) 的抽象。',
  'v-service': '服务 (Service) 是定义了一类容器组的逻辑集合和一个用于访问它们的策略。',
  'v-configmap':
    '配置集 (ConfigMap) 常用于存储工作负载所需的配置信息，许多应用程序会从配置文件、命令行参数或环境变量中读取配置信息。',
  'v-gateway-instance': 'Istio网关实例(IngressGateway)。',
  'v-authorization-policy': '认证策略 (AuthorizationPolicy) 支持对网格中工作负载的访问控制。',
  'v-gateway': '网关 (Gateway) 描述了在网格边缘运行的负载均衡器，用于接收传入或传出的 HTTP/TCP 连接。',
  'v-peer-authentication': '端点认证 (PeerAuthentication) 定义了流量将如何通过隧道（或不通过）传输到 sidecar。',
  'v-service-entry':
    '服务入口 (ServiceEntry) 允许在 Istio 的内部服务注册表中添加额外的条目，以便网格中自动发现的服务可以访问/路由到这些手动指定的服务。',
  'v-sidecar': '边车 (Sidecar) 描述代理的配置，该代理将入站和出站通信调解到它所附加的工作负载实例。',

  // 应用商店
  appstore:
    '应用商店(HelmChart)是一个描述Kubernetes相关资源的文件集合，单个应用可以用来部署某些复杂的HTTP服务器以及web全栈应用、数据库、缓存等。',
  'appstore-registry': 'chart仓库是chart包存放的位置, 被应用商店和部署所使用。',

  // 模型商店
  modelstore:
    '模型商店(Ormb)通过镜像仓库来分发模型，可以帮助用户更好的管理他们的机器学习 / 深度学习模型。通过 Ormb，模型能更易于创建、版本化、共享以及发布。',

  // 设置
  'base-setting': '平台基本配置, 包括平台审计, 平台组件等。',
  'auth-setting': '基于 oauth2.0/ldap 的第三方认证集成, 用户可进行多种方式登录。',
  'prometheus-setting': '配置 Prometheus Recording rules 来提升监控查询效率。',

  // 租户
  role: '系统所有角色(Role)与操作权限的描述。',
  tenant:
    '租户(tenant)是一个组织您的项目和 DevOps 工程、管理资源访问权限以及在团队内部共享资源等的逻辑单元，可以作为团队工作的独立工作空间。',
  user: '平台所有用户(user)，包括系统管理员与普通成员。',

  // 工具箱
  audit: '审计(Audit)针对项目空间，环境空间，资源等多维度操作审计查询。',
  event: '事件通知(Event)为容器云事件驱动器提供，代表资源在集群内的状态历史。',
  'user-center': '用户中心(User Center)提供用户消息，审计，个人设置等。',

  // 资源
  dashboard: '租户容器服务提供了安全隔离的、具有访问权限控制的工作平台。这里您可以看到当前租户内资源运行的概况。',
  project: '项目(Project)是一组环境，应用以及镜像仓库的抽象组合。',
  appmanifest: '应用编排(AppManifest)是一组工作负载，配置，密钥等资源的描述文件集合。',
  registry:
    '镜像仓库(Registry)是一种存储库（或存储库集合），用于存储Kubernetes、DevOps 和基于容器的应用开发的容器镜像。',
  cluster: '对多集群以及每个集群的基础资源，服务组件和应用资源等统一管理。',
  plugin: '服务组件提供Kubernetes集群内各项服务组件的健康状态，启用状态等管理。',
  environment: '环境(Environment)是具体应用，负载，存储等资源的边界，通常来说是一个命名空间(namespace)。',
  node: '节点(Node)提供了当前集群下节点的运行状态。',
  app: '应用(Application)是来自应用编排与应用商店部署下的应用运行时。',
  deploy: '应用部署提供多种应用部署方式，包括重建，滚动更新，蓝绿，金丝雀等。',
  workload: '工作负载 (Workload) 通常是访问服务的载体,是对一组容器组 (Pod) 的抽象。',
  pod: '容器组 (Pod) 是 Kubernetes 应用程序的基本执行单元，是您创建或部署的 Kubernetes 对象模型中最小和最简单的单元。',
  service: '服务 (Service) 是定义了一类容器组的逻辑集合和一个用于访问它们的策略。',
  ingress: '路由(ingress)提供一种聚合服务的方式，您可以将集群的内部服务通过一个外部可访问的 IP 地址暴露给集群外部。',
  gateway: '网关(Gateway)是用来转发其他服务器通信数据。',
  job: '任务 (Job) 负责批量处理短暂的一次性任务，即仅执行一次的任务，它保证批处理任务的一个或多个容器组成功结束。',
  cronjob: '定时任务 (CronJob) 管理基于时间的任务，例如在给定时间点只运行一次，或周期性地在给定时间点运行。',
  configmap:
    '配置集 (ConfigMap) 常用于存储工作负载所需的配置信息，许多应用程序会从配置文件、命令行参数或环境变量中读取配置信息。',
  secret:
    '密钥 (Secret) 是一种包含少量敏感信息的资源对象，例如密码、token、秘钥等，以键/值对形式保存并且可以在容器组中使用。',
  certmanager:
    '证书 (Certificate)，在创建证书时，证书管理器将创建相应的CertificateRequest资源，其中包含编码的X.509证书请求、颁发者引用和基于证书资源规范的其他选项。',
  crd: '自定义资源 (CRD) 是一种 Kubernetes 实现自定义资源类型的扩展方式，用户可以如同操作内置资源对象一样操作 CRD 对象。',
  persistentvolumeclaim:
    '存储卷(PersistentVolumeClaim)供用户创建的工作负载使用，是将工作负载数据持久化的一种资源对象。',
  volumesnapshot:
    '存储卷快照(VolumeSnapshot)表示存储卷的时间点副本。快照可用于配置新卷（预先填充快照数据）或将现有存储卷还原到先前状态（由快照表示）。',
  storageclass: '存储类型 (StorageClass) 是由集群管理员配置存储服务端参数，并按类型提供存储给集群用户使用。',

  // 可观测性
  observe: '可观测性(Observability)提供日志采集，查看，告警/监控指标采集，告警/告警中心，历史/链路追踪等所有功能。',
  integrated: '接入中心(Intergate Center)允许您配置应用/中间件的链路追踪，指标监控，日志以获得可观测性功能。',
  'dash-overview': '监控大盘(Monitor Dashboard)允许您查询、可视化了解您的指标。',
  'dash-metrics': '指标查询(Metrics)允许您查询系统监控指标，并生成相关告警。',
  'dash-log': '日志(Log)基于Loki的日志查看面板，可进行日志实时查询，快照，过滤等。',
  'dash-log-snapshot': '日志快照(Log Snapshot)允许您保存的指定节点的日志文件，用来复盘某个时刻的日志历史。',
  'dash-trace': '链路查询器(Jaeger)是端到端分布式跟踪监控系统。',
  'alert-overview': '告警大盘(Alert Dashboard)允许您查看最近告警趋势，告警指标汇总及对比值。',
  'alert-living': '',
  'alert-history': '告警历史(Alert History)允许您按照条件查看告警的历史信息。',
  'alert-blacklist': '告警黑名单(Alert Blacklist)允许您将部分不需要接收的告警进行静默。',
  'config-monitor': '监控采集配置中心(Monitor Config Center)允许您进行采集器，告警，接收器等监控指标相关的配置。',
  'log-monitor':
    '日志采集配置中心(Log Config Center)允许您进行日志采集器，告警，接收器等日志指标相关的配置以及日志流转过滤等配置。',
  'service-monitor': '采集器 (ServiceMonitor) 为一组服务定义监控, 自动被Prometheus发现, 成为其指标拉取目标Target。',
  'prometheus-rule': '告警规则 (PrometheusRule) 通常是针对监控指标设置的Prometheus告警规则。',
  flow: '日志采集器 (Flow/ClusterFlow) 定义了一个带有过滤器和输出的日志流。',
  output: '日志路由器 (Output/ClusterOutput) 定义您的流可以发送日志消息的输出。',
};

export default {
  install(Vue) {
    Vue.prototype.$TIP = TIP;
  },
};
