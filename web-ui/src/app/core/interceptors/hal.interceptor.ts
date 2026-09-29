import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { tap, finalize } from 'rxjs';
import { trace, context, propagation } from '@opentelemetry/api';

export const halInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {

  if (req.url.includes('/otel/v1/logs') || req.url.includes('/otel/v1/traces')) {
    return next(req);
  }

  const logger = logs.getLogger('web-ui-http-logger');
  const tracer = trace.getTracer('web-ui-http-tracer');

  // 1. Создаем спан для текущего HTTP-запроса
  const span = tracer.startSpan(`HTTP ${req.method}`, {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
    },
  });

  // 2. Внедряем traceparent (W3C Context) в заголовки запроса
  let headersCarrier: Record<string, string> = {};

  // Передаем активный контекст со спаном в глобальный менеджер проpropagation
  context.with(trace.setSpan(context.active(), span), () => {
    propagation.inject(context.active(), headersCarrier);
  });

  // Преобразуем объект headersCarrier в формат, который понимает Angular
  let targetReq = req.clone({
    setHeaders: headersCarrier
  });

  const isExcludedFromHal =
    req.url.includes('/login-options') ||
    req.url.includes('/api/me') ||
    req.url.includes('/logout');

  if (!isExcludedFromHal) {
    targetReq = targetReq.clone({
      setHeaders: {
        ...headersCarrier,
        Accept: 'application/hal+json',
        'Content-Type': 'application/json'
      },
    });
  }

  return next(targetReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          span.setAttribute('http.status_code', event.status);
          span.setStatus({ code: 1 });

          logger.emit({
            severityNumber: SeverityNumber.INFO,
            severityText: 'INFO',
            body: `HTTP Success: ${targetReq.method} ${targetReq.url}`,
            attributes: {
              'http.method': targetReq.method,
              'http.url': targetReq.url,
              'http.status_code': event.status,
            },
          });
        }
      },
      error: (error) => {
        span.setAttribute('http.status_code', error.status || 0);
        span.setStatus({ code: 2, message: error.message });
        span.recordException(error);

        logger.emit({
          severityNumber: SeverityNumber.ERROR,
          severityText: 'ERROR',
          body: `HTTP Failure: ${targetReq.method} ${targetReq.url}`,
          attributes: {
            'http.method': targetReq.method,
            'http.url': targetReq.url,
            'http.status_code': error.status || 0,
            'error.message': error.message || 'Unknown HTTP Error',
          },
        });
      },
    }),
    finalize(() => {
      span.end();
    })
  );
};
