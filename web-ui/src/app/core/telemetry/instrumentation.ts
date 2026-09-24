import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';

export function initOtelLogger() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'web-ui',
  });

  const exporter = new OTLPLogExporter({
    url: '/otel/v1/logs',
  });

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new SimpleLogRecordProcessor({ exporter })
    ]
  });

  logs.setGlobalLoggerProvider(loggerProvider);
}
