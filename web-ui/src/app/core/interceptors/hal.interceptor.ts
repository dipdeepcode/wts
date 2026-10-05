import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const halInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Игнорируем запросы к самому OTel Collector
  if (req.url.includes('/otel/v1/')) {
    return next(req);
  }

  const isExcludedFromHal =
    req.url.includes('/login-options') ||
    req.url.includes('/api/me') ||
    req.url.includes('/logout');

  if (!isExcludedFromHal) {
    const targetReq = req.clone({
      setHeaders: {
        Accept: 'application/hal+json',
        'Content-Type': 'application/json'
      },
    });
    return next(targetReq);
  }

  return next(req);
};
