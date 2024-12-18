import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {VerificationRequestService} from '../../services/verificationrequest.service';
import {VerificationRequestSubmitDto} from '../../Models/VerificationRequestSubmitDto';
import { VerificationRequestDto } from '../../Models/VerificationRequestDto';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  accountService=inject(UserService);
  verificationService=inject(VerificationRequestService);

  verificationRequest: VerificationRequestDto | null = null;
  verificationStatus: number = 1; // 0 - unverified, 1 - verified, 2 - denied verification, 3 - pending verification
  comment:string = '';

  ngOnInit(): void {
    const currentUser = this.accountService.currentUser();

    this.verificationService.GetVerificationRequestByUserId(currentUser?.id || 0).subscribe({
      next: (res) => {
        this.verificationRequest = res;
        this.CheckVerificationStatus(); // Ensure to re-check after updating verificationRequest
      },
      error: (err) => {
        console.error('Error fetching verification request:', err);
        this.verificationRequest = null;
        this.CheckVerificationStatus(); // Reset status if there's an error
      }
    });
  }

  CheckVerificationStatus() {
    const currentUser = this.accountService.currentUser();
    
    if(currentUser?.isVerified === true){
      this.verificationStatus = 1;
    }
    else if (this.verificationRequest?.isApproved === true){
      this.verificationStatus = 1;
    }
    else if (this.verificationRequest?.isApproved === false){
      this.verificationStatus = 2;
    }
    else if (this.verificationRequest?.isApproved === null){
      this.verificationStatus = 3;
    }
    else {
      this.verificationStatus = 0; // if verification request doesn't exist
    }

  }

  SubmitVerificationRequest() {
    const currentUser = this.accountService.currentUser();
    const currentDateTime = new Date();
  
    if (currentUser) {
      const submit: VerificationRequestSubmitDto = {
        requestDate: currentDateTime.toISOString(),
        userId: currentUser.id,
        requestComment: this.comment
      };
  
      this.verificationService.AddVerificationRequest(submit).subscribe({
        next: () => {
          window.location.reload();
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      console.log('No user is logged in.');
    }
  }

  DeleteRequest(){
    this.verificationService.DeleteVerificationRequest(this.verificationRequest?.id || 0).subscribe({
      next:_ => {window.location.reload();},
      error:err=>console.log(err)
    })
  }

}
