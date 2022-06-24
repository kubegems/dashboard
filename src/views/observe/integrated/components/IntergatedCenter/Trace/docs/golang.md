> 注意：在使用前请联系集群管理员开启 KubeGems Observability 相关的组件，包含Monitoring、Logging、 Opentelemetry、Jaeger

### KubeGems OpenTelemetry Collector

修改应用 SDK 中的 Exporter Endpoint 地址为 opentelemetry-collector.observability:<port>。 其中， opentelemetry-collector 是 Collector 的 Service 名称，observability 是 Collector 所在命名空间，不同上报协议对应端口如下:

| Receivers |  Protocols  | Port  |
| :-------: | :---------: | :---: |
|   otlp    |    gRPC     | 4317  |
|   otlp    |    http     | 4318  |
|  jaeger   |    gRPC     | 14250 |
|  jaeger   | thrift_http | 14268 |
|  zipkin   |             | 9411  |

###  golang 应用接入

##### step1 下载 otel 库

```golang
go get go.opentelemetry.io/otel \
  go.opentelemetry.io/otel/trace \
  go.opentelemetry.io/otel/sdk \
  go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin \
  go.opentelemetry.io/otel/exporters/otlp/otlptrace \
  go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc \
```

##### step2 配置 OpenTelemetry 的环境变量

```
var (
    serviceName  = os.Getenv("SERVICE_NAME")
    collectorURL = os.Getenv("opentelemetry-collector.observability:4317")
    insecure     = os.Getenv("INSECURE_MODE")
)
```

> 也可以设置环境变量
>
> OTEL_EXPORTER_OTLP_ENDPOINT=opentelemetry-collector.observability:4317
>
> SERVICE_NAME=your-goApp
>
> INSECURE_MODE=true

##### Step3 在 `main.go`中添加opentelemetry初始化函数

```go
import (
    .....
    "github.com/gin-gonic/gin"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"

    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer() func(context.Context) error {


    secureOption := otlptracegrpc.WithTLSCredentials(credentials.NewClientTLSFromCert(nil, ""))
    if len(insecure) > 0 {
        secureOption = otlptracegrpc.WithInsecure()
    }

    exporter, err := otlptrace.New(
        context.Background(),
        otlptracegrpc.NewClient(
            secureOption,
            otlptracegrpc.WithEndpoint(collectorURL),
        ),
    )

    if err != nil {
        log.Fatal(err)
    }
    resources, err := resource.New(
        context.Background(),
        resource.WithAttributes(
            attribute.String("service.name", serviceName),
            attribute.String("library.language", "go"),
        ),
    )
    if err != nil {
        log.Printf("Could not set resources: ", err)
    }

    otel.SetTracerProvider(
        sdktrace.NewTracerProvider(
            sdktrace.WithSampler(sdktrace.AlwaysSample()),
            sdktrace.WithBatcher(exporter),
            sdktrace.WithResource(resources),
        ),
    )
    return exporter.Shutdown
```

##### step4 在 main.go中初始化 tracer

```go
func main() {
    cleanup := initTracer()
    defer cleanup(context.Background())

    ......
}
```

### example with `net/http`[ ](https://opentelemetry.io/docs/instrumentation/go/libraries/#example-with-nethttp)

例如，下面这个样例是如何使用net/http未入站HTTP请求设置自动检测：

- 第一步 下载 `net/http`  库

```golang
go get go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
```
- 第二步  在代码中封装 HTTP 处理程序

```golang
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
)

// Package-level tracer.
// This should be configured in your code setup instead of here.
var tracer = otel.Tracer("github.com/full/path/to/mypkg")

// sleepy mocks work that your application does.
func sleepy(ctx context.Context) {
	_, span := tracer.Start(ctx, "sleep")
	defer span.End()

	sleepTime := 1 * time.Second
	time.Sleep(sleepTime)
	span.SetAttributes(attribute.Int("sleep.duration", int(sleepTime)))
}

// httpHandler is an HTTP handler function that is going to be instrumented.
func httpHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World! I am instrumented automatically!")
	ctx := r.Context()
	sleepy(ctx)
}

func main() {
	// Wrap your httpHandler function.
	handler := http.HandlerFunc(httpHandler)
	wrappedHandler := otelhttp.NewHandler(handler, "hello-instrumented")
	http.Handle("/hello-instrumented", wrappedHandler)

	// And start the HTTP serve.
	log.Fatal(http.ListenAndServe(":3030", nil))
}
```