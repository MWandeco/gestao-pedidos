import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/** Mostra em um único lugar a mensagem de qualquer erro HTTP retornado pela API. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.status === 0
          ? 'Não foi possível conectar ao servidor.'
          : (error.error?.message ?? 'Erro inesperado no servidor.');

      notifications.error(message);
      return throwError(() => error);
    }),
  );
};
