import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const halInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  if (req.url.includes('/login-options') || req.url.includes('/api/me')) {
    return next(req);
  }

  const modifiedReq = req.clone({
    setHeaders: { Accept: 'application/hal+json', 'Content-Type': 'application/json' },
  });

  return next(modifiedReq);
};
