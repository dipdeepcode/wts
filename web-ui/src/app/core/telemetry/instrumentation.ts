import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export function initOtelLogger() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'web-ui',
  });

  // --- 1. Настройка Логов ---
  const logExporter = new OTLPLogExporter({ url: '/otel/v1/logs' });
  const loggerProvider = new LoggerProvider({
    resource,
    processors: [new SimpleLogRecordProcessor({ exporter: logExporter })]
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  // --- 2. Настройка Трассировки ---
  const traceExporter = new OTLPTraceExporter({ url: '/otel/v1/traces' });

  // Передаем процессор в конструктор
  const tracerProvider = new WebTracerProvider({
    resource,
    spanProcessors: [new SimpleSpanProcessor(traceExporter)]
  });

  // Регистрируем глобальный провайдер
  tracerProvider.register();
}
