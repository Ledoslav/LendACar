import {HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {MyAuthServiceService} from '../services/auth-service/my-auth-service.service';

export class TokenInterceptor implements HttpInterceptor {

    private authService=inject(MyAuthServiceService)
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const tokenObject=this.authService.getToken();
        const token=tokenObject?.token ?? "";
        const authReq=req.clone({
          headers: req.headers.set('my-auth-token', token)
        })
      return next.handle(authReq);
    }
}



