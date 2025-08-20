// dashboard.component.ts
import {Component, ElementRef, inject, input, OnInit, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy} from '@angular/core';
import { UserService } from '../../services/user.service';
import {CompanyService} from '../../services/company.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';
import {MatDialog} from '@angular/material/dialog';
import {ImageCroppedEvent, LoadedImage} from 'ngx-image-cropper';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MatTableDataSource} from '@angular/material/table';
import jsPDF from "jspdf";
import {MatPaginator} from '@angular/material/paginator';
import {delay} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  // Injectabels
  accountService = inject(UserService); // Inject UserService
  authService = inject(MyAuthServiceService);

  // Form controls
  isFormVisible = false;
  isLoggedIn: boolean = false;
  hasCompany: boolean = false;  // Flag to check if the user has a company
  updateFormVisible = false; // Visibility toggle for the update form
  employeeSectionClicked: boolean = true;
  isEmployeeFormVisible = false;
  hasEmployees:boolean = false;
  isUpdating: boolean = false;
  isAppUser: boolean = false;
  dropdownClicked: boolean = false;
  isFileSelected: boolean = false;
  isUpdateEmployeeFormVisible: boolean = false;
  isEmployee: boolean = false;
  isNavLinkHomeActive: boolean = true;
  isNavLinkCompanyVehiclesActive: boolean = false;

  // Company data
  companyName = '';
  companyPhone = '';
  companyEmail = '';
  companyAddress = '';
  companyAvatar: File | null = null;
  companyAvatarBackup: File | null = null;
  avatarPreviewUrl:any;
  companyDescription: string = '';
  fileName: any = "Upload a pdf file certificate";
  fileNameBackup: any = "Upload a pdf file certificate";
  file: File | null = null;
  fileBackup: File | null = null;

  //Employee table data
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  displayedColumns: string[] = ['userId', 'firstName', 'lastName', 'phoneNumber', 'title', 'email', 'workingHours','actions'];
  employees: any = [];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;


  //Employee data
  firstName: string ='';
  lastName: string = '';
  companyAdminEmail: any;
  phoneNumber: string = '';
  title: string = '';
  email: string = '';
  employeeIdToUpdate: number | null = null;

  //Other
  activeLink: string = 'home';
  username: any;
  userId: any;
  switchClicked: boolean = false;
  mode: string = 'light-mode';

  private _formBuilder = inject(FormBuilder);
  private _updateFormBuilder = inject(FormBuilder);

  avatarFormGroup = this._formBuilder.group({
    companyAvatar: ['', [Validators.required]]
  });
  basicInfoFormGroup = this._formBuilder.group({
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[\w\s\-]+$/)]],
    companyPhone: ['', [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    companyEmail: ['', [Validators.required, Validators.email]],
    companyAddress: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), Validators.pattern(/^[\w\s\-]+$/)]],
    companyDescription: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), Validators.pattern(/^[\w\s\-]+$/)]]
  });
  verificationFormGroup = this._formBuilder.group({
    file: ['', [Validators.required]]
  });

  avatarUpdateFormGroup = this._updateFormBuilder.group({
    companyAvatar: [this.companyAvatar, [Validators.required]]
  });
  basicInfoUpdateFormGroup = this._updateFormBuilder.group({
    companyName: [this.companyName, [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[\w\s\-]+$/)]],
    companyPhone: [this.companyPhone, [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    companyEmail: [this.companyEmail, [Validators.required, Validators.email]],
    companyAddress: [this.companyAddress, [Validators.required, Validators.minLength(5), Validators.maxLength(100), Validators.pattern(/^[\w\s\-]+$/)]],
    companyDescription: [this.companyDescription, [Validators.required, Validators.minLength(5), Validators.maxLength(100), Validators.pattern(/^[\w\s\-]+$/)]]
  });
  verificationUpdateFormGroup = this._updateFormBuilder.group({
    file: [this.file, [Validators.required]]
  });

  companyEmployeeFormGroup = this._formBuilder.group({
    firstName: ['',[Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    lastName: ['',[Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    phoneNumber: ['',[Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    title: ['',[Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    email:['',[Validators.required, Validators.email]],
  });
  workingHoursFormGroup = this._formBuilder.group({
    startTime: ['',[Validators.required]],
    endTime: ['',[Validators.required]],
    monday: [false],
    tuesday: [false],
    wednesday: [false],
    thursday: [false],
    friday: [false],
    saturday: [false],
    sunday: [false],
  });
  companyEmployeeBirthDateFormGroup = this._formBuilder.group({
    birthDate: ['',[Validators.required]]
  });

  companyUpdateEmployeeFormGroup = this._formBuilder.group({
    firstName: ['',[Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    lastName: ['',[Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    phoneNumber: ['',[Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    title: ['',[Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    email:['',[Validators.required, Validators.email]],
  });
  workingHoursUpdateFormGroup = this._formBuilder.group({
    startTime: ['',[Validators.required]],
    endTime: ['',[Validators.required]],
    monday: [false],
    tuesday: [false],
    wednesday: [false],
    thursday: [false],
    friday: [false],
    saturday: [false],
    sunday: [false],
  });
  companyEmployeeUpdateBirthDateFormGroup = this._formBuilder.group({
    birthDate: ['',[Validators.required]]
  });

// Add employee form visibility control
  showEmployeeForm() {
    this.isEmployeeFormVisible = true; // Show the form
  }

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private companyEmployeeService: CompanyEmployeeService) {
  }

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAppUser = this.authService.isAppUser();

    if (this.isAppUser) {
      this.username = this.accountService.currentUser()?.username;
      this.userId = this.accountService.currentUser()?.id;

      // 1️⃣ Check if user is owner (has companyAdminEmail)
      this.companyEmployeeService.getCompanyAdminEmail(this.userId).subscribe({
        next: (adminEmail) => {
          if (adminEmail) {
            // ✅ User is OWNER
            this.isEmployee = false;
            this.hasCompany = true;
            this.companyAdminEmail = adminEmail;

            // Load company info for the owner
            this.companyService.getCompanyByUserId(this.userId).subscribe((company) => {
              this.setCompanyData(company);

              // Load employees if owner
              this.companyEmployeeService.getAllEmployeesForAdmin().subscribe({
                next: (employees) => {
                  this.employees = employees;
                  this.hasEmployees = employees.length > 0;
                  this.dataSource.data = employees;

                  if (this.paginator) {
                    this.dataSource.paginator = this.paginator;
                    console.log('Paginator assigned:', this.dataSource.paginator);
                  }
                },
                error: (error) => {
                  console.error('Error fetching employees:', error);
                  this.handleNoEmployees();
                }
              });
            });

          } else {
            // 2️⃣ If no admin email, check if employee
            this.companyEmployeeService.getEmployeeForAdmin(this.userId).subscribe({
              next: (response) => {
                if (response?.company?.companyName) {
                  // ✅ User is EMPLOYEE
                  this.isEmployee = true;
                  this.hasCompany = true;
                  this.setCompanyData(response.company);
                } else {
                  // ❌ Neither owner nor employee
                  this.isEmployee = false;
                  this.hasCompany = false;
                }
              },
              error: () => {
                this.isEmployee = false;
                this.hasCompany = false;
              }
            });
          }
        },
        error: (err) => {
          console.error('Error checking companyAdminEmail:', err);
          this.isEmployee = false;
          this.hasCompany = false;
        }
      });
    }
  }

  /** Reusable method to fill company data */
  private setCompanyData(company: any) {
    this.companyName = company.companyName;
    this.companyPhone = company.companyPhone;
    this.companyEmail = company.companyEmail;
    this.companyDescription = company.companyDescription;
    this.companyAddress = company.companyAddress;

    // Handle company avatar
    if (company.companyAvatar && typeof company.companyAvatar === 'string') {
      const byteChars = atob(company.companyAvatar);
      const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      this.companyAvatar = new File([blob], 'avatar.png', { type: 'image/png' });
    } else {
      this.companyAvatar = company.companyAvatar as File;
    }
    this.companyAvatarBackup = this.companyAvatar;

    // Handle company file
    if (company.file && typeof company.file === 'string') {
      const byteChars = atob(company.file);
      const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      this.file = new File([blob], 'document.pdf', { type: 'application/pdf' });
    } else {
      this.file = company.file as File;
    }
    this.fileBackup = this.file;

    if (company.fileName != null) {
      this.fileName = company.fileName;
    }
    this.fileNameBackup = this.fileName;

    this.convertImageToDataUrl(this.companyAvatar);
  }


  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator; // assign paginator after view init
      console.log('Paginator assigned:', this.dataSource.paginator);
    } else {
      console.warn('Paginator still not available!');
    }
  }

  ngAfterViewChecked() {
    if (this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
      console.log('Paginator now assigned in AfterViewChecked');
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.avatarPreviewUrl) {
      URL.revokeObjectURL(this.avatarPreviewUrl);
    }
  }


// Helper method to handle no employees found
  private handleNoEmployees(): void {
    this.hasEmployees = false;         // Indicate no employees available
  }


  cancelUpdateEmployeeForm(): void {
    this.isUpdating = false; // Hide the form without submitting
  }

// Method to handle add employee logic (display the form)
  addEmployee() {

    const formValue = this.companyEmployeeFormGroup.value;
    const formTimeValue = this.workingHoursFormGroup.value;
    const formBirthDateValue = this.companyEmployeeBirthDateFormGroup.value;

    const newEmployee = {
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      phoneNumber: formValue.phoneNumber!,
      title: formValue.title!,
      email: formValue.email!,
      employeePassword : this.generateRandomPassword(),
      companyAdminEmail: this.companyAdminEmail,
      startTime: formTimeValue.startTime!,
      birthDate: formBirthDateValue.birthDate!,
      endTime: formTimeValue.endTime!,
      monday: formTimeValue.monday!,
      tuesday: formTimeValue.tuesday!,
      wednesday: formTimeValue.wednesday!,
      thursday: formTimeValue.thursday!,
      friday: formTimeValue.friday!,
      saturday: formTimeValue.saturday!,
      sunday: formTimeValue.sunday!,
    };

    console.log(newEmployee);

    const username = newEmployee.firstName + newEmployee.lastName;

      this.companyEmployeeService.addEmployee(newEmployee).subscribe({
        next: (response) => {
          console.log('Employee added successfully:', response);
          this.isEmployeeFormVisible = false; // Hide the form
          this.companyEmployeeService.getAllEmployeesForAdmin().subscribe({
            next: (employees) => {
              this.employees = employees;
              this.dataSource = new MatTableDataSource(this.employees);
              this.downloadEmployeeCredentials(username, newEmployee.employeePassword, newEmployee.firstName, newEmployee.lastName);
              window.location.reload();
            },
            error: (error) => {
              console.error('Error fetching employees:', error);
            }
          })
        },
        error: (error) => {
          console.error('Error adding employee:', error);
        }
      });
  }

  updateEmployee() {

    const formValue = this.companyUpdateEmployeeFormGroup.value;
    const formTimeValue = this.workingHoursUpdateFormGroup.value;
    const formBirthDateValue = this.companyEmployeeUpdateBirthDateFormGroup.value;

    const updateEmployee = {
      userId: this.employeeIdToUpdate,
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      phoneNumber: formValue.phoneNumber!,
      title: formValue.title!,
      email: formValue.email!,
      companyAdminEmail: this.companyAdminEmail,
      startTime: formTimeValue.startTime!,
      birthDate: formBirthDateValue.birthDate!,
      endTime: formTimeValue.endTime!,
      monday: formTimeValue.monday!,
      tuesday: formTimeValue.tuesday!,
      wednesday: formTimeValue.wednesday!,
      thursday: formTimeValue.thursday!,
      friday: formTimeValue.friday!,
      saturday: formTimeValue.saturday!,
      sunday: formTimeValue.sunday!,
    };

    console.log(updateEmployee);

    this.companyEmployeeService.updateEmployee(updateEmployee).subscribe({
      next: (response) => {
        console.log('Employee updated successfully:', response);
        this.isUpdateEmployeeFormVisible = false; // Hide the form
        this.companyEmployeeService.getAllEmployeesForAdmin().subscribe({
          next: (employees) => {
            this.employees = employees;
            this.dataSource = new MatTableDataSource(this.employees);
          },
          error: (error) => {
            console.error('Error fetching employees:', error);
          }
        })
      }

    });
  }

  deleteEmployee(employeeId:any): void {

    const userIdToDelete = employeeId;

    const deleteEmployeeRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm removal',
        message: 'Are you sure you want to delete this employee',
        confirmButtonText:'Confirm'
      }
    });

    deleteEmployeeRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyEmployeeService.deleteEmployee(userIdToDelete).subscribe({});
        window.location.reload();
        this.snackbarService.showSuccessMessage('Employee deleted successfully!')
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }

  generateRandomPassword(length: number = 12): string {
    // Only letters and digits for safe UTF-8 handling
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    // Optional: include some safe symbols if you like
    const safeSymbols = "!@#$%^&*";

    let password = "";

    for (let i = 0; i < length; i++) {
      // Mix letters/digits and optional safe symbols
      const useSymbol = Math.random() < 0.2; // 20% chance to pick a symbol
      if (useSymbol) {
        password += safeSymbols[Math.floor(Math.random() * safeSymbols.length)];
      } else {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return password;
  }

  downloadEmployeeCredentials(username: string, password: string, firstName: string, lastName: string): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Employee Login Credentials", 20, 20);

    doc.setFontSize(12);
    doc.text(`Username: ${username}`, 20, 40);
    doc.text(`Password: ${password}`, 20, 50);

    doc.text("Keep this document safe. Do not share it with anyone else.", 20, 70);

    doc.save("EmployeeCredentials-" + firstName + '-' + lastName + ".pdf");
  }

  // Show the form
  showForm() {
    this.isFormVisible = true;
  }

  // Cancel the form without saving
  cancelForm() {
    this.isFormVisible = false;
  }

  convertImageToDataUrl(Avatar: any){
      if (Avatar) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.avatarPreviewUrl = e.target.result; // this is the correct data URL
        };
        reader.readAsDataURL(Avatar); // converts File to base64
      }
  }

  showUpdateForm() {
    this.updateFormVisible = !this.updateFormVisible;
    this.dropdownClicked = false;

    this.basicInfoUpdateFormGroup.patchValue({
      companyName: this.companyName,
      companyPhone: this.companyPhone,
      companyEmail: this.companyEmail,
      companyAddress: this.companyAddress,
      companyDescription: this.companyDescription
    });

    this.avatarUpdateFormGroup.patchValue({
      companyAvatar: this.companyAvatar
    });

    this.verificationUpdateFormGroup.patchValue({
      file: this.file
    });

    this.isFileSelected = true;
  }

  toggleDropdown() {
    if(this.updateFormVisible==false){
        this.dropdownClicked = !this.dropdownClicked;
    }
  }

  onFileSelected($event: Event) {
    this.file = ($event.target as HTMLInputElement).files![0];
    this.fileName = this.file.name;
    this.isFileSelected = true;
  }

  createCompany() {

    const companyData = {
      ...this.basicInfoFormGroup.value,
      companyAvatar: this.companyAvatar, // If this is an uploaded File, make sure it's a File object, not a base64 string
      file: this.file, // Your PDF file
      fileName: this.fileName,
      userId: this.userId
    };

    this.companyService.createCompany(companyData).subscribe(
      () => {
        this.snackbarService.showSuccessMessage('Company created successfully');
        window.location.reload();
      },
      (error) => {
        this.snackbarService.showErrorMessage('Failed to create company');
        console.error('Error creating company:', error);
      }
    );

    this.isFormVisible = false;
    this.fileName = "Upload a pdf file certificate";
  }

  updateCompany(){
    const companyUpdateData = {
      ...this.basicInfoUpdateFormGroup.value,
      companyAvatar: this.companyAvatar, // If this is an uploaded File, make sure it's a File object, not a base64 string
      file: this.file, // Your PDF file
      fileName: this.fileName,
      userId: this.userId
    };

    console.log(companyUpdateData);

    this.companyService.updateCompanyByUserId(this.userId,companyUpdateData).subscribe(
      () => {
        this.snackbarService.showSuccessMessage('Company updated successfully');
        window.location.reload();
      },
      (error) => {
        this.snackbarService.showErrorMessage('Failed to update company');
        console.error('Error updating company:', error);
      }
    );
  }

  @ViewChild('companyFileInput', { static: false }) companyFileInput!: ElementRef;
  http = inject(HttpClient);
  snackbarService = inject(MySnackbarService);
  private dialog = inject(MatDialog);
  imageChangedEvent: any = '';
  croppedImage: any = null;
  showCropper = false;
  croppedImageUrl: any = null;
  isLoading = false;

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

  onFileChange(event: any): void {
    this.companyAvatar = event.target.files[0];
    if (this.companyAvatar) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  openCompanyPdf() {
    if (!this.file) {
      console.error('No file to preview.');
      return;
    }
    console.log(this.file); // See what you actually have

    // Create a Blob URL directly from the File
    const fileURL = URL.createObjectURL(this.file);
    console.log('File URL:', fileURL);
    const pdfWindow = window.open();

    if (pdfWindow) {
      pdfWindow.document.write(
        `<iframe width="100%" height="100%" src="${fileURL}"></iframe>`
      );
    }
  }


  imageCropped(event: ImageCroppedEvent): void {
    const blob = event.blob;
    if (blob) {
      this.croppedImage = blob;
      this.croppedImageUrl = event.objectUrl;
    } else {
      console.error('Blob image is undefined.');
    }
  }

  uploadCroppedImage(): void {
    if (!this.croppedImage) {
      console.error('No cropped image available.');
      return;
    }

    // Convert blob to File
    this.companyAvatar = new File(
      [this.croppedImage],
      'company-avatar.png',
      { type: 'image/png' }
    );

    // Hide cropper if needed
    this.showCropper = false;

    console.log('Company avatar stored for later:', this.companyAvatar);
    this.convertImageToDataUrl(this.companyAvatar);
  }

  removeProfilePhoto(): void {

    if (this.companyAvatar==null) {
      console.error('No image available.');
      return;
    }

    this.openMyConfirmDialog();
  }

  cancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }

  openMyConfirmDialog() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm removal',
        message: 'Are you sure you want to remove your company picture',
        confirmButtonText:'Confirm'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
              this.showCropper = false;
              this.companyAvatar = null;
              this.snackbarService.showSuccessMessage('Company profile picture removed successfully!')
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }

  closeUpdateForm() {
    this.companyAvatar = this.companyAvatarBackup;
    this.convertImageToDataUrl(this.companyAvatar);

    this.file = this.fileBackup;
    this.fileName = this.fileNameBackup;

    this.updateFormVisible = false;
  }

  closeForm() {
    this.isFormVisible = false;
    this.isFileSelected = false;
    this.companyAvatar = null;
    this.convertImageToDataUrl(this.companyAvatar);
    this.file = null;
    this.fileName = "Upload a pdf file certificate";
  }

  resetForm(){
    this.isFileSelected = false;
    this.companyAvatar = null;
    this.convertImageToDataUrl(this.companyAvatar);
    this.file = null;
    this.fileName = "Upload a pdf file certificate";
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.dataSource.filterPredicate = (data:any, filter: string) => {
      const searchTerm = filter.toLowerCase();

      return data.user.firstName.toLowerCase().includes(searchTerm)
        || data.user.lastName.toLowerCase().includes(searchTerm)
        || data.user.phoneNumber.toLowerCase().includes(searchTerm)
        || data.user.emailAdress.toLowerCase().includes(searchTerm)
        || data.companyPosition.name.toLowerCase().includes(searchTerm)
        || data.workingHour.startTime.toLowerCase().includes(searchTerm)
        || data.workingHour.endTime.toLowerCase().includes(searchTerm)
    };

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCompany() {
    this.companyService.deleteCompanyByUserId(this.userId).subscribe(
      ()=>{
        this.snackbarService.showSuccessMessage('Company deleted successfully');
        window.location.reload();
      },
      (error)=>{
        this.snackbarService.showErrorMessage('Failed to delete company');
        console.error('Error deleting company:', error);
      }
    )
  }

  closeAddEmployeeForm() {
    this.isEmployeeFormVisible = false;
  }

  closeUpdateEmployeeForm() {
    this.isUpdateEmployeeFormVisible = false;

  }


  showUpdateEmployeeForm(employee:any) {
    this.isUpdateEmployeeFormVisible= true;
    this.employeeIdToUpdate = employee.userId;

    console.log(employee);

    this.companyUpdateEmployeeFormGroup.patchValue({
      firstName: employee.user.firstName,
      lastName: employee.user.lastName,
      phoneNumber: employee.user.phoneNumber,
      title: employee.companyPosition.name,
      email: employee.user.emailAdress,
    });

    this.workingHoursUpdateFormGroup.patchValue({
      startTime: employee.workingHour.startTime.slice(0, 5),
      endTime: employee.workingHour.endTime.slice(0, 5),
      monday: employee.workingHour.monday,
      tuesday: employee.workingHour.tuesday,
      wednesday: employee.workingHour.wednesday,
      thursday: employee.workingHour.thursday,
      friday: employee.workingHour.friday,
      saturday: employee.workingHour.saturday,
      sunday: employee.workingHour.sunday
    });

    this.companyEmployeeUpdateBirthDateFormGroup.patchValue({
      birthDate: employee.birthDate
    });
  }

  toggleDarkMode() {
    this.switchClicked = !this.switchClicked;

    if(this.switchClicked) {
      this.mode = 'dark-mode';
    }else{
      this.mode = 'light-mode';
    }
    }

  setActiveNavLink(activeNav: string) {
    if(activeNav == 'home'){
      this.isNavLinkHomeActive = true;
      this.isNavLinkCompanyVehiclesActive = false;
    }else{
      this.isNavLinkHomeActive = false;
      this.isNavLinkCompanyVehiclesActive = true;
    }
  }

  addVehicle() {
    return;
  }
}

