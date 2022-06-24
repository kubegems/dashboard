> 注意：在使用前请联系集群管理员开启 KubeGems Observability 相关的组件，包含Monitoring、Logging、 Opentelemetry、Jaeger

### KubeGems OpenTelemetry Collector

修改应用 SDK 中的 Exporter Endpoint 地址为 opentelemetry-collector.observability:\<port>。 其中， opentelemetry-collector 是 Collector 的 Service 名称，observability 是 Collector 所在命名空间，不同上报协议对应端口如下:

| Receivers |  Protocols  | Port  |
| :-------: | :---------: | :---: |
|   otlp    |    gRPC     | 4317  |
|   otlp    |    http     | 4318  |
|  jaeger   |    gRPC     | 14250 |
|  jaeger   | thrift_http | 14268 |
|  zipkin   |             | 9411  |

###  Java应用接入

##### step 1 下载Agent

[opentelemetry-javaagent.jar](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)

##### step2 设置 java 启动参数

```
java -javaagent:<path/to/opentelemetry-javaagent.jar> \
     -Dotel.exporter.otlp.endpoint=http://opentelemetry-collector.observability:4318 \
     -Dotel.service.name=java-opentelemetry-otlp-instrumentation
     -jar myapp.jar
```

| System property                                   | Environment variable                              | Description                                                                                                                                                                                                                                                                                                                                                                                                          |
|---------------------------------------------------|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| otel.traces.exporter=otlp (default)               | OTEL_TRACES_EXPORTER=otlp                         | Select the OpenTelemetry exporter for tracing (default)                                                                                                                                                                                                                                                                                                                                                              |
| otel.metrics.exporter=otlp                        | OTEL_METRICS_EXPORTER=otlp                        | Select the OpenTelemetry exporter for metrics (default)                                                                                                                                                                                                                                                                                                                                                              |
| otel.logs.exporter=otlp                           | OTEL_LOGS_EXPORTER=otlp                           | Select the OpenTelemetry exporter for logs                                                                                                                                                                                                                                                                                                                                                                           |
| otel.exporter.otlp.endpoint                       | OTEL_EXPORTER_OTLP_ENDPOINT                       | The OTLP traces, metrics, and logs endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal will be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`). Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
| otel.exporter.otlp.traces.endpoint                | OTEL_EXPORTER_OTLP_TRACES_ENDPOINT                | The OTLP traces endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/traces` when protocol is `http/protobuf`.                                                                                                                                                         |
| otel.service.name	 | OTEL_SERVICE_NAME	| Specify logical service name. Takes precedence over service.name defined with otel.resource.attributes |
| otel.exporter.otlp.headers | 	OTEL_EXPORTER_OTLP_HEADERS|	Key-value pairs separated by commas to pass as request headers on OTLP trace, metric, and log requests.|
| otel.traces.sampler     | OTEL_TRACES_SAMPLER     | The sampler to use for tracing. Defaults to `parentbased_always_on` |
| otel.traces.sampler.arg | OTEL_TRACES_SAMPLER_ARG | An argument to the configured tracer if supported, for example a ratio. |



> 更多 java sdk 的配置参考[open-telemetry/opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#otlp-exporter-both-span-and-metric-exporters)

##### Step3 登录 kubegems 指标观测性并查看调用链接


### java 手动接入

请参考 opentelemetry 官方指导文档

https://opentelemetry.io/docs/instrumentation/java/manual/