import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MySnackbarService {

  constructor() { }

  private snackBar=inject(MatSnackBar);

  showErrorMessage(message:string, duration:number=4000):MatSnackBarRef<TextOnlySnackBar>{
    return this.snackBar.open(message,undefined,{
      duration:duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'error-snack-bar'
    });
  }

  showSuccessMessage(message:string,duration:number=4000):MatSnackBarRef<TextOnlySnackBar>{
    return this.snackBar.open(message,undefined,{
      duration:duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'success-snack-bar'
    });
  }

  showMessage(message:string, duration:number=4000):MatSnackBarRef<TextOnlySnackBar>{
    return this.snackBar.open(message,undefined,{
      duration:duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
