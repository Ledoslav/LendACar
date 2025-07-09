import {inject} from '@angular/core';
import {UserService} from '../services/user.service';
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {catchError, debounceTime, distinctUntilChanged, map, Observable, of} from 'rxjs';

export function usernameAsyncValidator(): AsyncValidatorFn {
  const userService=inject(UserService);
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }
     return userService.CheckUsernameAvailability(control.value).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map((isTaken: boolean) => {
        return !isTaken ? null : { 'usernameTaken': { value: control.value } };
      }),
      catchError(() => of(null))
    );
  };
}
