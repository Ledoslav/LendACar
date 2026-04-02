import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {VerificationRequestService} from '../../../services/verificationrequest.service';
import {VerificationRequestDto} from '../../../Models/VerificationRequestDto';
import {UserService} from '../../../services/user.service';
import {VerificationRequestSubmitDto} from '../../../Models/VerificationRequestSubmitDto';
import {DatePipe} from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-verification-request-page',
  templateUrl: './verification-request-page.component.html',
  styleUrl: './verification-request-page.component.css'
})
export class VerificationRequestPageComponent implements OnInit{
  private cdr = inject(ChangeDetectorRef);
  verificationService=inject(VerificationRequestService);
  accountService=inject(UserService);
  datePipe = inject(DatePipe);
  verificationRequest: VerificationRequestDto | null = null;
  verificationStatus: number = 3;
  comment:string = '';
  currentDate=new Date().toISOString();

  ngOnInit(): void {
    const currentUser = this.accountService.currentUser();

    if(currentUser !== null){
      this.verificationService.GetVerificationRequestByUserId(currentUser.id).subscribe({
        next: (res) => {
          this.verificationRequest = res;
          this.CheckVerificationStatus(); // Ensure to re-check after updating verificationRequest
        },
        error: (err) => {
          this.verificationRequest = null;
          this.CheckVerificationStatus(); // Reset status if there's an error
        }
      });
    }
  }


  CheckVerificationStatus() {
    if(this.verificationRequest !== null)
    {
      this.verificationStatus = this.verificationRequest.requestStatus;
    }
    else
    {
      this.verificationStatus = 3;
    }
  }


  SubmitVerificationRequest() {
    const currentUser = this.accountService.currentUser();

    if (currentUser) {
      const submit: VerificationRequestSubmitDto = {
        requestDate: new Date().toISOString(), // This sends UTC time
        userId: currentUser.id,
        requestComment: this.comment
      };

      this.verificationService.AddVerificationRequest(submit).subscribe({
        next: () => {
          window.location.reload();
        },
        error: (err) => {
        }
      });
    } else {
    }
  }


  DeleteRequest(){
    this.verificationService.DeleteVerificationRequest(this.verificationRequest?.id || 0).subscribe({
      next:_ => {window.location.reload();},
      error:err=>{}
    })
  }


}
