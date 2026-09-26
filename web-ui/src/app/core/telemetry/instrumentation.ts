import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';

function getCookie(name: string): string | undefined {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function initOtelLogger() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'web-ui',
  });

  const exporter = new OTLPLogExporter({
    url: '/otel/v1/logs',
    headers: async () => {
      const token = getCookie('XSRF-TOKEN');

      if (token) {
        return { 'X-XSRF-TOKEN': token };
      }

      return {} as Record<string, string>;
    }
  });

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new SimpleLogRecordProcessor({ exporter })
    ]
  });

  logs.setGlobalLoggerProvider(loggerProvider);
}
