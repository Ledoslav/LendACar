import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MySnackbarService {

  constructor() { }

  private snackBar=inject(MatSnackBar);

  showMessage(message:string,duration:number=4000):MatSnackBarRef<TextOnlySnackBar>{
    return this.snackBar.open(message,undefined,{
      duration:duration,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showSuccessMessage(message:string,duration:number=4000):MatSnackBarRef<TextOnlySnackBar>{
    return this.snackBar.open(message,undefined,{
      duration:duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }


}
