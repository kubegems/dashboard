export const CLUSTER_CPU_USAGE_PROMQL = `round(sum(gems_node_cpu_usage_cores), 0.001) * 1000 * 1000 * 1000`;
export const CLUSTER_MEMORY_USAGE_PROMQL = `sum(gems_node_memory_usage_bytes)`;
export const CLUSTER_DISK_USAGE_PROMQL = `sum(gems_node_disk_usage_bytes)`;
export const CLUSTER_POD_RUNNING_COUNT_PROMQL = `count(gems_pod_status{phase="Running"})`;
export const CLUSTER_CPU_TOTAL_PROMQL = `sum(gems_node_cpu_total_cores)`;
export const CLUSTER_MEMORY_TOTAL_PROMQL = `sum(gems_node_memory_total_bytes)`;
export const CLUSTER_DISK_TOTAL_PROMQL = `sum(gems_node_disk_total_bytes)`;
export const CLUSTER_POD_CAPACITY_PROMQL = `sum(kube_node_status_capacity{resource="pods"})`;
export const CLUSTER_API_SERVER_SUCCESS_RATE_PROMQL = `round((sum(gems_cluster_apiserver_qps{code!~"5.*"}) / sum(gems_cluster_apiserver_qps)) * 100, 0.01) or vector(0)`;
export const CLUSTER_API_SERVER_RT_PROMQL = `gems_cluster_apiserver_response_duration_seconds{verb!~"WATCH|CONNECT"} * 1000 * 1000`;
export const CLUSTER_API_SERVER_QPS_PROMQL = `sum(gems_cluster_apiserver_qps{code=~"$1"})`;
export const CLUSTER_ETCD_RT_PROMQL = `gems_cluster_etcd_response_duration_seconds * 1000 * 1000`;
export const CLUSTER_ETCD_QPS_PROMQL = `sum(gems_cluster_etcd_qps)`;

export const TENANT_CPU_USAGE_PROMQL = `round(sum(gems_namespace_cpu_usage_cores{tenant="$1"}) by (tenant), 0.001) * 1000 * 1000 * 1000`;
export const TENANT_MEMORY_USAGE_PROMQL = `sum(gems_namespace_memory_usage_bytes{tenant="$1"}) by (tenant)`;

export const NODE_LOAD_PROMQL = `node_load5`;
export const NODE_LOAD1_PROMQL = `node_load1{node="$1"}`;
export const NODE_LOAD5_PROMQL = `node_load5{node="$1"}`;
export const NODE_LOAD15_PROMQL = `node_load15{node="$1"}`;
export const NODE_POD_RUNNING_COUNT_PROMQL = `sum(gems_pod_status{phase="Running"})by(node)`;
export const NODE_ALL_CPU_USAGE_PROMQL = `gems_node_cpu_usage_percent`;
export const NODE_ALL_MEMORY_USAGE_PROMQL = `gems_node_memory_usage_percent`;
export const NODE_ONE_POD_RUNNING_COUNT_PROMQL = `sum(gems_pod_status{node="$1", phase="Running"})`;
export const NODE_CPU_USAGE_PROMQL = `gems_node_cpu_usage_percent{node="$1"}`;
export const NODE_MEMORY_USAGE_PROMQL = `gems_node_memory_usage_percent{node="$1"}`;
export const NODE_DISK_READ_IOPS_PROMQL = `gems_node_disk_read_iops{node="$1"}`;
export const NODE_DISK_WRITE_IOPS_PROMQL = `gems_node_disk_write_iops{node="$1"}`;
export const NODE_NETWORK_IN_PROMQL = `gems_node_network_receive_bps{node="$1"}`;
export const NODE_NETWORK_OUT_PROMQL = `gems_node_network_send_bps{node="$1"}`;
export const NODE_DISK_AVAILABLE_SIZE_PROMQL = `(gems_node_disk_total_bytes{node="$1", device !~"/dev/rbd.*"} - gems_node_disk_usage_bytes{node="$1", device !~"/dev/rbd.*"})`;

export const ENVIRONMENT_CPU_USAGE_PROMQL = `round(gems_namespace_cpu_usage_cores{environment=~"$1"}, 0.001) * 1000 * 1000 * 1000`;
export const ENVIRONMENT_MEMORY_USAGE_PROMQL = `round(gems_namespace_memory_usage_bytes{environment=~"$1"}, 0.001)`;
export const ENVIRONMENT_NETWORK_IN_PROMQL = `gems_namespace_network_receive_bps{environment=~"$1"}`;
export const ENVIRONMENT_NETWORK_OUT_PROMQL = `gems_namespace_network_send_bps{environment=~"$1"}`;

export const POD_CPU_USAGE_PROMQL = `round(sum(gems_container_cpu_usage_cores{pod=~"$1", namespace=~"$2"})without(container), 0.001) * 1000 * 1000 * 1000`;
export const POD_MEMORY_USAGE_PROMQL = `sum(gems_container_memory_usage_bytes{pod=~"$1", namespace=~"$2"})without(container)`;
export const POD_NETWORK_IN_PROMQL = `round(gems_container_network_receive_bps{pod=~"$1", namespace=~"$2"}, 0.001)`;
export const POD_NETWORK_OUT_PROMQL = `round(gems_container_network_send_bps{pod=~"$1", namespace=~"$2"}, 0.001)`;
export const POD_CPU_USAGE_BY_CONTAINER_PROMQL = `round(gems_container_cpu_usage_cores{pod=~"$1", namespace=~"$2", container!=""}, 0.001) * 1000 * 1000 * 1000`;
export const POD_MEMORY_BY_CONTAINER_USAGE_PROMQL = `gems_container_memory_usage_bytes{pod=~"$1", namespace=~"$2", container!=""}`;

export const WORKLOAD_CPU_USAGE_CORE_PROMQL = `round(sum(gems_container_cpu_usage_cores{workload=~"$1", namespace=~"$2"})without(container), 0.001) * 1000 * 1000 * 1000`;
export const WORKLOAD_MEMORY_USAGE_BYTE_PROMQL = `sum(gems_container_memory_usage_bytes{workload=~"$1", namespace=~"$2"})without(container)`;
export const WORKLOAD_NETWORK_IN_PROMQL = `round(gems_container_network_receive_bps{workload=~"$1", namespace=~"$2"}, 0.001)`;
export const WORKLOAD_NETWORK_OUT_PROMQL = `round(gems_container_network_send_bps{workload=~"$1", namespace=~"$2"}, 0.001)`;

export const CONTAINER_CPU_USAGE_PROMQL = `round(gems_container_cpu_usage_cores{container=~"$1", pod=~"$2", namespace=~"$3"}, 0.001) * 1000 * 1000 * 1000`;
export const CONTAINER_MEMORY_USAGE_PROMQL = `gems_container_memory_usage_bytes{container=~"$1", pod=~"$2", namespace=~"$3"}`;

export const PVC_USAGE_PROMQL = `gems_pvc_usage_bytes{namespace="$1",persistentvolumeclaim="$2"}`;
export const PVC_USAGE_INODE_PROMQL = `round(gems_pvc_inode_used{namespace="$1",persistentvolumeclaim="$2"} / gems_pvc_inode_total{namespace="$1",persistentvolumeclaim="$2"} * 100, 0.01)`;

export const TOP_15_POD_CPU_MAX_PROMQL = `topk(15, round(max_over_time(sum(gems_container_cpu_usage_cores{namespace="$1"})without(container)[1d:1m]), 0.001))`;
export const TOP_15_POD_CPU_AVG_PROMQL = `topk(15, round(avg_over_time(sum(gems_container_cpu_usage_cores{namespace="$1"})without(container)[1d:1m]), 0.001))`;
export const TOP_15_POD_MEMORY_MAX_PROMQL = `topk(15, round(max_over_time(sum(gems_container_memory_usage_bytes{namespace="$1"})without(container)[1d:1m]), 0.001))`;
export const TOP_15_POD_MEMORY_AVG_PROMQL = `topk(15, round(avg_over_time(sum(gems_container_memory_usage_bytes{namespace="$1"})without(container)[1d:1m]), 0.001))`;

export const WORKLOAD_CPU_USAGE_PROMQL = `sum(gems_container_cpu_usage_cores{namespace="$1", workload="$2"}) * 1000`;
export const WORKLOAD_MEMORY_USAGE_PROMQL = `sum(gems_container_memory_usage_bytes{namespace="$1", workload="$2"}) / 1024 / 1024`;

export const GATEWAY_QPS_PROMQL = `sum(irate(nginx_ingress_controller_requests{namespace="kubegems-gateway", container="$1"}[5m]))by(ingress, host, service)`;
export const GATEWAY_CONNECTIONS_PROMQL = `sum(nginx_ingress_controller_nginx_process_connections{namespace="kubegems-gateway", container="$1"})by(state)`;

export const ISTIO_WORKLOAD_ERR_QPS_PROMQL = `sum(gems_istio_workload_request_qps{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol = "http", response_code =~ "4.*|5.*"} or gems_istio_workload_request_qps{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol="grpc", grpc_response_status !~ "0|"})`;
export const ISTIO_WORKLOAD_ERR_REQUEST_LAST_24H_PROMQL = `round(sum(increase(istio_requests_total{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol = "http", response_code =~ "4.*|5.*"}[24h]) or increase(istio_requests_total{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol="grpc", grpc_response_status !~ "0|"}[24h])), 1)`;

// TODO: P99写进recording rule
export const ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P99_PROMQL = `sum(histogram_quantile(0.99, irate(istio_request_duration_milliseconds_bucket{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"}[5m])) >= 0) / 1000`;
export const ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL = `sum(histogram_quantile(0.95, irate(istio_request_duration_milliseconds_bucket{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"}[5m])) >= 0) / 1000`;
export const ISTIO_WORKLOAD_QPS_PROMQL = `sum(gems_istio_workload_request_qps{reporter="destination", destination_workload="$1", destination_workload_namespace="$2"} >= 0)`;
export const ISTIO_WORKLOAD_REQUEST_LAST_24H_PROMQL = `round(sum(increase(istio_requests_total{reporter="destination", destination_workload="$1", destination_workload_namespace="$2"}[24h])), 1)`;

export const ISTIO_INGRESS_GATEWAY_QPS_PROMQL = `sum(gems_istio_workload_request_qps{reporter="source", source_workload_namespace="$1", source_workload="$2"})by(destination_workload, destination_workload_namespace)`;
export const ISTIO_INGRESS_GATEWAY_REPONSE_DURATION_PROMQL = `sum(gems_istio_workload_response_duration_seconds{reporter="source", source_workload_namespace="$1", source_workload="$2"} > 0)by(destination_workload, destination_workload_namespace) * 1000 * 1000`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_QPS_PROMQL = `sum(gems_istio_gateway_port_80_downstream_qps{namespace="$1", pod=~"$2(.*)"})by(namespace, pod)`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_RESPONSE_DURATION_PROMQL = `gems_istio_gateway_port_80_downstream_response_duration_seconds{namespace="$1", pod=~"$2(.*)"} * 1000 * 1000`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_QPS_PROMQL = `sum(gems_istio_gateway_port_443_downstream_qps{namespace="$1", pod=~"$2(.*)"})by(namespace, pod)`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_RESPONSE_DURATION_PROMQL = `gems_istio_gateway_port_443_downstream_response_duration_seconds{namespace="$1", pod=~"$2(.*)"} * 1000 * 1000`;
export const ISTIO_INGRESS_NETWORK_PROMQL = `sum(gems_istio_workload_request_bps{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"} >= 0)`;
export const ISTIO_EGRESS_NETWORK_PROMQL = `sum(gems_istio_workload_response_bps{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"} >= 0)`;

export const GPU_USAGE = `round(gems_container_gpu_usage_percent{pod=~"$1", namespace=~"$2"}, 0.01)`;
export const GPU_MEMORY_USAGE = `round(gems_container_gpu_memory_usage_mb{pod=~"$1", namespace=~"$2"}, 0.001) / 1024`;
export const GPU_TEMP = `round(gems_container_gpu_temp{pod=~"$1", namespace=~"$2"}, 0.01)`;
export const GPU_POWER = `round(gems_container_gpu_power_usage_watt{pod=~"$1", namespace=~"$2"}, 0.01)`;

export const MODEL_WORKLOAD_CPU_USAGE_CORE_PROMQL = `round(sum(gems_container_cpu_usage_cores{pod=~"$1", namespace=~"$2"})without(container), 0.001) * 1000 * 1000 * 1000`;
export const MODEL_WORKLOAD_MEMORY_USAGE_BYTE_PROMQL = `sum(gems_container_memory_usage_bytes{pod=~"$1", namespace=~"$2"})without(container)`;
