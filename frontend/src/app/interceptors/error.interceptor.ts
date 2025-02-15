import {HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MySnackbarService} from '../services/snackbars/my-snackbar.service';
import {Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {

  private snackBar=inject(MySnackbarService);
  private router=inject(Router);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     return next.handle(req).pipe(
       catchError(err => {
         if(err){
           switch (err.status){
             case 400:
               if(err.error.errors){
                 const modalStateErrors=[];
                 for(const key in err.error.errors){
                   if(err.error.errors[key]){
                     modalStateErrors.push(err.error.errors[key])
                   }
                 }
                 throw modalStateErrors.flat()
               }
               else if(typeof (err.error)==='object'){
                 this.snackBar.showMessage(err.statusText)
               }
               else{
                 this.snackBar.showMessage(err.error)
               }
               break;
             case 401:
               this.snackBar.showMessage(err.error)
               break;
             case 403:
               this.snackBar.showMessage(err.error.message) // redirect na forbidden page
               void this.router.navigateByUrl('/not-authorized');
               break;
             case 404: //redirect the user to a not found page
               this.snackBar.showMessage(err.error)
               void this.router.navigateByUrl('/not-found');
               break;
             case 500:
               this.snackBar.showMessage(err.statusText)
               break;
             default:
               this.snackBar.showMessage("Something went wrong");
               console.log(err);
               break;
           }
         }
         return throwError(() => err);
       })
     );
    }
}
