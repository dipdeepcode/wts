import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Sampler, SamplingResult, SamplingDecision } from '@opentelemetry/sdk-trace-base';

class LocalStorageSampler implements Sampler {
  shouldSample(
    ..._args: Parameters<Sampler['shouldSample']>
  ): SamplingResult {
    const isEnabled = localStorage.getItem('ENABLE_TELEMETRY') === 'true';

    if (isEnabled) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    }

    return { decision: SamplingDecision.NOT_RECORD };
  }

  toString(): string {
    return 'LocalStorageSampler';
  }
}

export function initOtelLogger() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'web-ui',
  });

  const traceExporter = new OTLPTraceExporter({ url: '/otel/v1/traces' });

  const tracerProvider = new WebTracerProvider({
    resource,
    sampler: new LocalStorageSampler(),
    spanProcessors: [new SimpleSpanProcessor(traceExporter)]
  });

  tracerProvider.register();

  registerInstrumentations({
    tracerProvider: tracerProvider,
    instrumentations: [
      new XMLHttpRequestInstrumentation({
        clearTimingResources: true,
        ignoreUrls: [/\/otel\/v1\/traces/],
        applyCustomAttributesOnSpan: (span) => {
          span.setAttribute('custom.client.app', 'web-ui-angular');
        },
      }),
    ],
  });
}
