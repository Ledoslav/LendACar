import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {ImageCroppedEvent, LoadedImage} from 'ngx-image-cropper';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-photo-page',
  templateUrl: './photo-page.component.html',
  styleUrl: './photo-page.component.css'
})
export class PhotoPageComponent implements OnInit{

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  accountService = inject(UserService);
  http = inject(HttpClient);

  imageChangedEvent: any = '';
  croppedImage: any = null;
  showCropper = false;
  croppedImageUrl: any = null;

  private uploadUrl = `http://localhost:7000/api/User/add-profile-pic/${this.accountService.currentUser()?.id}`;

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

    const formData = new FormData();
    const file = new File([this.croppedImage], 'cropped-image.png', { type: 'image/png' });
    formData.append('file', file);

   this.accountService.UploadProfilePhoto(formData,this.accountService.currentUser()?.id).subscribe({
   next:(response: any) => {
      console.log('Upload successful:', response);
      this.showCropper = false;
      this.accountService.currentUser.set(response);
      alert('Profile picture updated successfully!');
    },
    error:(error) => {
      console.error('Upload failed:', error);
      alert('Failed to upload profile picture.');
    }
   }
    );
  }

  removeProfilePhoto(): void {
    if (this.accountService.currentUser()?.profilePhotoUrl==null) {
      console.error('No image available.');
      return;
    }

    if(confirm('Are you sure you want to remove profile photo?')){
      this.accountService.RemoveProfilePhoto(this.accountService.currentUser()?.id).subscribe({
          next:(response: any) => {
            console.log('Removal successful:', response);
            this.showCropper = false;
            this.accountService.currentUser.set(response);
            alert('Profile picture removed successfully!');
          },
          error:(error) => {
            console.error('Removal failed:', error);
            alert('Failed to remove profile picture.');
          }
        }
      );
    }
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
}
