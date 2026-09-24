import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { tap } from 'rxjs';

export const halInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const logger = logs.getLogger('web-ui-http-logger');

  if (req.url.includes('/otel/v1/logs')) {
    return next(req);
  }

  let targetReq = req;
  const isExcludedFromHal =
    req.url.includes('/login-options') ||
    req.url.includes('/api/me') ||
    req.url.includes('/logout');

  if (!isExcludedFromHal) {
    targetReq = req.clone({
      setHeaders: { Accept: 'application/hal+json', 'Content-Type': 'application/json' },
    });
  }

  return next(targetReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
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
    })
  );
};
