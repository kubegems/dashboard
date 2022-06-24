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

###  ruby 应用接入

##### step 1 下载 opentelemetry 库

```ruby
gem install opentelemetry-api
gem install opentelemetry-sdk
gem install opentelemetry-exporter-otlp
opentelemetry-instrumentation-all
```

##### step2 设置环境变量

```
export service.name=your-rubyApp
export service.version=your-rubyApp-version
```

##### step3 设置埋点

```ruby
require 'opentelemetry/sdk'
require 'opentelemetry-exporter-otlp'

# Configure the sdk with default export and context propagation formats
# see SDK#configure for customizing the setup
OpenTelemetry::SDK.configure do |c|
  c.add_span_processor(
    OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
      OpenTelemetry::Exporter::OTLP::Exporter.new(
        endpoint: 'http://opentelemetry-collector.observability:2318/opentelemetry/v1/traces'
      )
    )
  )
end

# To start a trace you need to get a Tracer from the TracerProvider
tracer = OpenTelemetry.tracer_provider.tracer('my_app_or_gem', '0.1.0')

tracer.in_span('foo') do |span|
  # set an attribute
  span.set_attribute('tform', 'osx')
  # add an event
  span.add_event('event in bar')
  # create bar as child of foo
  tracer.in_span('bar') do |child_span|
    # inspect the span
    pp child_span
  end
end
```