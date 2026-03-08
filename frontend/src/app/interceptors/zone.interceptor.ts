import { ApplicationRef, Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Forces Angular's full change detection (ApplicationRef.tick) after every HTTP response.
 * Also tracks loading state via LoadingService.
 */
@Injectable()
export class ZoneInterceptor implements HttpInterceptor {
  private appRef = inject(ApplicationRef);
  private loadingService = inject(LoadingService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();
    
    return next.handle(req).pipe(
      tap({
        next: () => setTimeout(() => this.appRef.tick(), 0),
        error: () => setTimeout(() => this.appRef.tick(), 0),
      }),
      finalize(() => {
        this.loadingService.hide();
        // Final safety tick to ensure UI clears loading state
        setTimeout(() => this.appRef.tick(), 100);
      })
    );
  }
}
