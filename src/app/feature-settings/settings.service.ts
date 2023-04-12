import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { UpdateUser, UserAndAuthenticationApiClient } from '../shared-data-access-api';
import { AuthService } from '../shared-data-access-auth/auth.service';
import { ApiStatus } from '../shared-data-access-models/api-status';

@Injectable()
export class SettingsService {
    private readonly userAndAuthenticationApiClient = inject(UserAndAuthenticationApiClient);
    private readonly authService = inject(AuthService);

    private readonly status = signal<ApiStatus>('idle');

    readonly vm = {
        isLoading: () => this.status() === 'loading',
        user: () => this.authService.vm.user(),
    };

    updateUser(user: UpdateUser) {
        this.status.set('loading');
        lastValueFrom(this.userAndAuthenticationApiClient.updateCurrentUser({ body: { user } }))
            .then((response) => {
                this.status.set('success');
                this.authService.authenticate(['/profile', response.user.username]);
            })
            .catch(({ error }: HttpErrorResponse) => {
                console.error(`Error updating user`, error);
                this.status.set('error');
            });
    }

    logout() {
        localStorage.removeItem('ng-conduit-signals-token');
        localStorage.removeItem('ng-conduit-signals-user');
        this.authService.authenticate();
    }
}
