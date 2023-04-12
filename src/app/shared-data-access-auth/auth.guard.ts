import { inject } from '@angular/core';
import { fromSignal } from '@angular/core/rxjs-interop';
import { CanMatchFn, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from './auth.service';

export function authGuard(type: 'protected' | 'unprotected'): CanMatchFn {
    return () => {
        const router = inject(Router);
        const authService = inject(AuthService);

        return fromSignal(authService.vm.isAuthenticated).pipe(
            filter(() => !authService.vm.isAuthenticating()),
            map((isAuthenticated) => {
                if ((type === 'unprotected' && !isAuthenticated) || (type === 'protected' && isAuthenticated))
                    return true;
                return router.parseUrl('/');
            })
        );
    };
}
