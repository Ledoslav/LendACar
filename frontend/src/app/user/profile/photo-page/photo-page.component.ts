import { Component, ElementRef, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {UserService} from '../../../services/user.service';
import {ImageCroppedEvent, LoadedImage} from 'ngx-image-cropper';
import {HttpClient} from '@angular/common/http';
import {MySnackbarService} from '../../../services/snackbars/my-snackbar.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogConfirmComponent} from '../../../shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  standalone: false,
  selector: 'app-photo-page',
  templateUrl: './photo-page.component.html',
  styleUrl: './photo-page.component.css'
})
export class PhotoPageComponent implements OnInit{
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  accountService = inject(UserService);
  http = inject(HttpClient);
  snackbarService=inject(MySnackbarService);

  private dialog=inject(MatDialog);
  imageChangedEvent: any = '';
  croppedImage: any = null;
  showCropper = false;
  croppedImageUrl: any = null;
  isLoading = false;

  constructor() {}

  ngOnInit(): void {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.imageChangedEvent = { target: { files: event.dataTransfer.files } };
      this.showCropper = true;
    }
  }
  imageCropped(event: ImageCroppedEvent): void {
    const blob = event.blob;
    if (blob) {
      this.croppedImage = blob;
      this.croppedImageUrl = event.objectUrl;
    } else {
    }

  }


  uploadCroppedImage(): void {
    if (!this.croppedImage) {
      return;
    }


    this.isLoading = true;
    const formData = new FormData();
    const file = new File([this.croppedImage], 'cropped-image.png', { type: 'image/png' });
    formData.append('file', file);

   this.accountService.UploadProfilePhoto(formData,this.accountService.currentUser()?.id).subscribe({
   next:(response: any) => {
      this.showCropper = false;
      this.accountService.currentUser.set(response);
      this.snackbarService.showSuccessMessage('Profile picture updated successfully!')
      this.isLoading = false;
    },
    error:(error) => {
      this.snackbarService.showErrorMessage('Failed to upload profile picture')
      this.isLoading = false;
    }

   }
    );
  }

  removeProfilePhoto(): void {
    if (this.accountService.currentUser()?.profilePhotoUrl==null) {
      return;
    }


    this.openMyConfirmDialog();
  }


  cancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }


  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  openMyConfirmDialog() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm removal',
        message: 'Are you sure you want to remove your profile picture',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.RemoveProfilePhoto(this.accountService.currentUser()?.id).subscribe({
            next:(response: any) => {
              this.showCropper = false;
              this.accountService.currentUser.set(response);
              this.snackbarService.showSuccessMessage('Profile picture removed successfully!')
            },
            error:(error) => {
              this.snackbarService.showErrorMessage('Failed to remove profile picture.')
            }

          }
        );
      } else {
      }
    
    this.cdr.detectChanges();
  });
  }
}
