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

import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Store } from 'vuex';

const integratedOpenTelemetry = (options: {
  release: string;
  collector: string;
  store: Store<{ [key: string]: any }>;
}) => {
  const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'kubegems-dashboard',
      [SemanticResourceAttributes.SERVICE_VERSION]: options.release,
      'user.name': options.store.state?.User?.Username,
    }),
  );

  const provider = new WebTracerProvider({
    resource: resource,
  });
  const exporter = new OTLPTraceExporter({
    url: options.collector,
    headers: {},
    concurrencyLimit: 10,
  });

  const processor = new BatchSpanProcessor(exporter);
  provider.addSpanProcessor(processor);

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [new UserInteractionInstrumentation(), new XMLHttpRequestInstrumentation()],
  });
};

export default integratedOpenTelemetry;
