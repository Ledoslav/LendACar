import {Component, inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PasswordResetService} from '../../../services/password-reset.service';
import {SecurityQuestion, SecurityQuestionService} from '../../../services/security-question.service';
import {UserSecurityQuestionAnswerService} from '../../../services/user-security-question-answer.service';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '../../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import { MySnackbarService } from '../../../services/snackbars/my-snackbar.service';
import {MapQuestionTextToKey} from '../../../helper/map-question-text-to-key.helper';

@Component({
  selector: 'app-account-security-page',
  templateUrl: './account-security-page.component.html',
  styleUrl: './account-security-page.component.css'
})
export class AccountSecurityPageComponent implements OnInit{

  model:any={};
  questions:any[]=[]

  fb=inject(FormBuilder)
  accountService=inject(UserService);
  router=inject(Router);
  private passwordResetService=inject(PasswordResetService);
  private securityQuestionService=inject(SecurityQuestionService);
  private userSecurityQuestionAnswerService=inject(UserSecurityQuestionAnswerService);
  private dialog = inject(MatDialog);
  private snackbarService = inject(MySnackbarService);

  ngOnInit(): void {

    this.loadSecurityQuestion();

    this.changePasswordForm.controls['newPassword'].valueChanges.subscribe({
      next: value => {this.changePasswordForm.controls['repeatPassword'].updateValueAndValidity()}
    })
  }



  changePasswordForm=this.fb.group({
    currentPassword:['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    repeatPassword: ['', [Validators.required, this.matchValues('newPassword'), Validators.minLength(6), Validators.maxLength(100)]],
    passwordShow:[false],
    emailAddress: '',
  })


  securityQuestionForm=this.fb.group({
    securityQuestionId:[0,Validators.required],
    questionAnswer: ['', Validators.required],
    currentPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  })


  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }


  loadSecurityQuestion() {
    this.securityQuestionService.GetAllQuestions().subscribe(res => {
      this.questions = res.map(q => ({
        ...q,
        questionTextKey: MapQuestionTextToKey(q.id)
      }));
    })
  }

  ChangePassword() {
    this.changePasswordForm.patchValue({
      emailAddress: this.accountService.currentUser()?.emailAddress,
    })
    const passwordChangeModel={...this.changePasswordForm.value};
    delete passwordChangeModel.passwordShow

    this.passwordResetService.ChangePassword(passwordChangeModel)
  }


  ChangeQuestion(){
    const userId=this.accountService.currentUser()?.id ?? 0 ;
    const changeQuestionModel={... this.securityQuestionForm.value};
    this.userSecurityQuestionAnswerService.ChangeSecurityQuestion(userId,changeQuestionModel).subscribe({
      next:res=>{
        this.snackbarService.showSuccessMessage('Question changed successfully');
        this.accountService.currentUser.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth-token');
        void this.router.navigateByUrl('/public/home');
      },
      error: err => console.log(err)
    });
  }

  AddQuestion(){
    const userId=this.accountService.currentUser()?.id ?? 0 ;
    const changeQuestionModel={... this.securityQuestionForm.value};

    this.userSecurityQuestionAnswerService.CreateAnswer(userId,changeQuestionModel).subscribe({
      next:res=>{
        this.snackbarService.showSuccessMessage('Security question added successfully');
        this.accountService.currentUser.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth-token');
        void this.router.navigateByUrl('/public/home');
      },
      error: err => console.log(err)
    });
  }

  RemoveQuestion(){
    const userId=this.accountService.currentUser()?.id ?? 0 ;
    const changeQuestionModel={... this.securityQuestionForm.value};
    this.userSecurityQuestionAnswerService.RemoveSecurityQuestion(userId,changeQuestionModel).subscribe({
      next:res=>{
        this.snackbarService.showSuccessMessage('Question removed successfully');
        this.accountService.currentUser.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('auth-token');
        void this.router.navigateByUrl('/public/home');
      },
      error: err => console.log(err)
    });
  }


  RemoveQuestionConfirmDialog() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm removal',
        message: 'Are you sure you want to remove security questions?',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.RemoveQuestion()
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }

  ChangeQuestionConfirmDialog() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm change',
        message: 'Are you sure you want to change security questions?',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ChangeQuestion()
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }

  AddQuestionConfirmDialog() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm',
        message: 'Are you sure you want to add security question?',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.AddQuestion()
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }

}
