import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ImageCroppedEvent, LoadedImage} from 'ngx-image-cropper';
import {EmployeeService} from '../../../services/employee.service';
import {MySnackbarService} from '../../../services/snackbars/my-snackbar.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogConfirmComponent} from '../../../shared/dialogs/dialog-confirm/dialog-confirm.component';

@Component({
  standalone: false,
  selector: 'app-photo-page',
  templateUrl: './photo-page.component.html',
  styleUrl: './photo-page.component.css'
})
export class PhotoPageComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  employeeService = inject(EmployeeService);
  http = inject(HttpClient);
  snackbarService=inject(MySnackbarService);

  imageChangedEvent: any = '';
  croppedImage: any = null;
  showCropper = false;
  croppedImageUrl: any = null;
  private dialog=inject(MatDialog);
  isLoading = false;

  constructor() {}


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
      console.log('Cropped Blob:', this.croppedImage);
      console.log('Preview URL:', this.croppedImageUrl);
    } else {
      console.error('Blob image is undefined.');
    }
  }


  uploadCroppedImage(): void {
    if (!this.croppedImage) {
      console.error('No cropped image available.');
      return;
    }

    this.isLoading=true;
    const formData = new FormData();
    const file = new File([this.croppedImage], 'cropped-image.png', { type: 'image/png' });
    formData.append('file', file);

    this.employeeService.UploadProfilePhoto(formData,this.employeeService.currentEmployee()?.id).subscribe({
        next:(response: any) => {
          console.log('Upload successful:', response);
          this.showCropper = false;
          this.employeeService.currentEmployee.set(response);
          this.snackbarService.showSuccessMessage('Profile picture updated successfully!')
          this.isLoading=false;
        },
        error:(error) => {
          console.error('Upload failed:', error);
          this.snackbarService.showErrorMessage('Failed to upload profile picture.');
          this.isLoading=false;
        }
      }
    );
  }

  removeProfilePhoto(): void {
    if (this.employeeService.currentEmployee()?.profilePhotoUrl==null) {
      console.error('No image available.');
      return;
    }


    this.openMyConfirmDialog()
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
        this.employeeService.RemoveProfilePhoto(this.employeeService.currentEmployee()?.id).subscribe({
            next:(response: any) => {
              console.log('Removal successful:', response);
              this.showCropper = false;
              this.employeeService.currentEmployee.set(response);
              this.snackbarService.showSuccessMessage('Profile picture removed successfully!')
            },
            error:(error) => {
              console.error('Removal failed:', error);
              this.snackbarService.showErrorMessage('Failed to remove profile picture.');
            }
          }
        );
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }
}
