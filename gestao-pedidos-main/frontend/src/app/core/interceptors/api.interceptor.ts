import { HttpInterceptorFn } from '@angular/common/http';
import { API_URL } from '../config';

/** Prefixa as chamadas relativas (ex.: `/orders`) com a URL base da API. */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ url: `${API_URL}${req.url}` }));
};
