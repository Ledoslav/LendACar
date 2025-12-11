// dashboard.component.ts
import {Component, ElementRef, inject, OnInit, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy} from '@angular/core';
import { UserService } from '../../services/user.service';
import {CompanyService} from '../../services/company.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import {VehicleListingService, VehicleUploadDto} from '../../services/vehiclelisting.service';
import {VehicleCategoriesService} from '../../services/vehiclecategory.service';
import {VehicleService} from '../../services/vehicle.service';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {MySnackbarService} from '../../services/snackbars/my-snackbar.service';
import {MatDialog} from '@angular/material/dialog';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {DialogConfirmComponent} from '../../shared/dialogs/dialog-confirm/dialog-confirm.component';
import {MatTableDataSource} from '@angular/material/table';
import jsPDF from "jspdf";
import {MatPaginator} from '@angular/material/paginator';
import {CityService} from '../../services/city.service';
import {CountryService} from '../../services/country.service';
import {VehicleDto} from '../../Models/VehicleDto';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivityService, ActivityCreateRequest} from '../../services/activity-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  // Injectabels
  accountService = inject(UserService); // Inject UserService
  authService = inject(MyAuthServiceService);
  router = inject(Router);

  // Form controls
  isFormVisible = false;
  isLoggedIn: boolean = false;
  hasCompany: boolean = false;  // Flag to check if the user has a company
  updateFormVisible = false; // Visibility toggle for the update form
  employeeSectionClicked: boolean = true;
  isEmployeeFormVisible = false;
  hasEmployees: boolean = false;
  isAppUser: boolean = false;
  dropdownClicked: boolean = false;
  isFileSelected: boolean = false;
  isUpdateEmployeeFormVisible: boolean = false;
  isEmployee: boolean = false;
  isNavLinkHomeActive: boolean = true;
  isNavLinkCompanyVehiclesActive: boolean = false;
  hasVehicles: boolean = false;
  isVehicleFormVisible: boolean = false;
  isVehicleUpdateFormVisible: boolean = false;
  zoomClicked: boolean = false;

  // Company data
  companyName = '';
  companyPhone = '';
  companyEmail = '';
  companyAddress = '';
  companyAvatar: File | null = null;
  companyAvatarBackup: File | null = null;
  avatarPreviewUrl: any;
  companyDescription: string = '';
  fileName: any = "Upload a pdf file certificate";
  fileNameBackup: any = "Upload a pdf file certificate";
  file: File | null = null;
  fileBackup: File | null = null;

  //Employee table data
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  displayedColumns: string[] = ['userId', 'firstName', 'lastName', 'phoneNumber', 'title', 'email', 'workingHours', 'actions'];
  employees: any = [];
  @ViewChild(MatPaginator, {static: false}) paginator!: MatPaginator;


  //Employee data
  firstName: string = '';
  lastName: string = '';
  companyAdminEmail: any;
  phoneNumber: string = '';
  title: string = '';
  email: string = '';
  employeeIdToUpdate: number | null = null;

  //Vehicle data
  vehicles: any = [];
  vehicleModels: any = [];
  vehicleCategories: any = [];
  vehicleBrands: any = [];
  uploadedFiles: File[] = [];
  deletedImageIds: any[] = [];
  uploadedImages: string[] = [];
  cities: any = [];
  countries: any = [];
  currentPage = 1;
  pageSize = 3;
  fuelTypes = [
    { value: 0, label: 'Petrol' },
    { value: 1, label: 'Diesel' },
    { value: 2, label: 'Electric' },
    { value: 3, label: 'Hybrid' },
    { value: 4, label: 'LPG' },
    { value: 5, label: 'CNG' }
  ];
  transmissionTypes = [
    { value: 0, label: 'Manual' },
    { value: 1, label: 'Automatic' },
    { value: 2, label: 'AutomatedManual' },
    { value: 3, label: 'DCT' },
    { value: 4, label: 'CVT' }
  ];
  airConditioningOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Single-Zone' },
    { value: 2, label: 'Double-Zone' },
    { value: 3, label: 'Triple-Zone' },
    { value: 4, label: 'Quad-Zone' }
  ];
  years = Array.from({ length: 81 }, (_, i) => 2025 - i);
  companyAdminUserId: any;
  vehicleIdToUpdate: any;
  city:any;
  user:any;
  vehicleModel:any;
  vehicleCategory:any;
  imageIndex: number = 0;

  //Other
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
    firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s\-]+$/)]],
    lastName: ['', [Validators.required,  Validators.pattern(/^[A-Za-z\s\-]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    title: ['', [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
  });
  workingHoursFormGroup = this._formBuilder.group({
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    monday: [false],
    tuesday: [false],
    wednesday: [false],
    thursday: [false],
    friday: [false],
    saturday: [false],
    sunday: [false],
  });
  companyEmployeeBirthDateFormGroup = this._formBuilder.group({
    birthDate: ['', [Validators.required]]
  });

  companyUpdateEmployeeFormGroup = this._formBuilder.group({
    firstName: ['', [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern("^\\+?[0-9\\s\\-\\(\\)]+$")]],
    title: ['', [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
  });
  workingHoursUpdateFormGroup = this._formBuilder.group({
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    monday: [false],
    tuesday: [false],
    wednesday: [false],
    thursday: [false],
    friday: [false],
    saturday: [false],
    sunday: [false],
  });
  companyEmployeeUpdateBirthDateFormGroup = this._formBuilder.group({
    birthDate: ['', [Validators.required]]
  });

  companyVehicleBasicInfoForm = this._formBuilder.group({
    title: ['', [Validators.required]],
    brandId: [null as number | null, [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    vehicleModelID: [null as number | null, [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    pricePerDay: ['', [Validators.required]],
  });
  companyTechincalDataFormGroup = this._formBuilder.group({
    fuelType: ['', [Validators.required]],
    transmissionType: [0, [Validators.required]],
    engineDisplacement: ['', [Validators.required]],
    enginePower: ['', [Validators.required]],
    airConditioning: ['', [Validators.required]],
    numberOfSeats: ['', [Validators.required]],
    towingHitch: [false, [Validators.required]],
    productionYear: ['', [Validators.required]],
  });
  companyDescriptionFormGroup = this._formBuilder.group({
    description: ['', [Validators.required]],
    vehicleCategoryID: [null as number | null, [Validators.required]],
    cityID: ['', [Validators.required]],
    avaliable: [true, [Validators.required]],
  });

  companyUpdateVehicleBasicInfoForm = this._formBuilder.group({
    title: ['', [Validators.required]],
    brandId: [null as number | null, [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    vehicleModelID: [null as number | null, [Validators.required, Validators.pattern(/^[\w\s\-]+$/)]],
    pricePerDay: ['', [Validators.required]],
  });
  companyUpdateTechincalDataFormGroup = this._formBuilder.group({
    fuelType: ['', [Validators.required]],
    transmissionType: [0, [Validators.required]],
    engineDisplacement: ['', [Validators.required]],
    enginePower: ['', [Validators.required]],
    airConditioning: ['', [Validators.required]],
    numberOfSeats: ['', [Validators.required]],
    towingHitch: [false, [Validators.required]],
    productionYear: ['', [Validators.required]],
  });
  companyUpdateDescriptionFormGroup = this._formBuilder.group({
    description: ['', [Validators.required]],
    vehicleCategoryID: [null as number | null, [Validators.required]],
    cityID: ['', [Validators.required]],
    avaliable: [true, [Validators.required]],
  });

// Add employee form visibility control
  showEmployeeForm() {
    this.isEmployeeFormVisible = true; // Show the form
  }

  constructor(
    private companyService: CompanyService,
    private companyEmployeeService: CompanyEmployeeService,
    private vehicleListingService: VehicleListingService,
    private vehicleService: VehicleService,
    private vehicleCategoriesService: VehicleCategoriesService,
    private vehicleModelsBrandsService: VehicleService,
    private cityService: CityService,
    private countryService: CountryService,
    private snackBar: MatSnackBar,
    private activityService: ActivityService) {
  }

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAppUser = this.authService.isAppUser();

    if(localStorage.getItem('mode') == 'dark-mode'){
      this.mode = 'dark-mode';
      this.switchClicked = true;
    }else{
      this.mode = 'light-mode';
      this.switchClicked = false;
    }

    if (this.isAppUser) {
      this.username = this.accountService.currentUser()?.username;
      this.userId = this.accountService.currentUser()?.id;

      this.companyEmployeeService.getCompanyAdminEmail(this.userId).subscribe({
        next: (adminEmail) => {
          if (adminEmail) {
            this.isEmployee = false;
            this.hasCompany = true;
            this.companyAdminEmail = adminEmail;
            this.getVehicles();
            this.getCountries();
            this.getCities();
            this.getVehicleCategories();
            this.getCompanyAdminId();
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
            this.companyEmployeeService.getEmployeeForAdmin(this.userId).subscribe({
              next: (response) => {
                if (response?.company?.companyName) {
                  this.isEmployee = true;
                  this.hasCompany = true;
                  this.getVehicles();
                  this.getCountries();
                  this.getCities();
                  this.getVehicleCategories();
                  this.getCompanyAdminId();
                  this.setCompanyData(response.company);
                } else {
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
      const blob = new Blob([byteArray], {type: 'image/png'});
      this.companyAvatar = new File([blob], 'avatar.png', {type: 'image/png'});
    } else {
      this.companyAvatar = company.companyAvatar as File;
    }
    this.companyAvatarBackup = this.companyAvatar;

    // Handle company file
    if (company.file && typeof company.file === 'string') {
      const byteChars = atob(company.file);
      const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'application/pdf'});
      this.file = new File([blob], 'document.pdf', {type: 'application/pdf'});
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

  addActivity(_variant:number, _companyEmployeeId:number, _vehicleId:number, _newVehicleId:number){

    var activity:ActivityCreateRequest = {
      userId:this.userId,
      variant: _variant,
      companyEmployeeId: _companyEmployeeId,
      vehicleId:_vehicleId,
      newVehicleId:_newVehicleId
    }

    this.activityService.create(activity).subscribe({
      next:(response:any) =>{
        console.log(response);
      },
      error:(err:any)=>{
        console.log(err);
      }
    })

  }

// Helper method to handle no employees found
  private handleNoEmployees(): void {
    this.hasEmployees = false;         // Indicate no employees available
  }

// Method to handle add employee logic (display the form)
  addEmployee() {

    const formValue = this.companyEmployeeFormGroup.value;
    const formTimeValue = this.workingHoursFormGroup.value;
    const formBirthDateValue = this.companyEmployeeBirthDateFormGroup.value;

    this.isLoading = true;

    const newEmployee = {
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      phoneNumber: formValue.phoneNumber!,
      title: formValue.title!,
      email: formValue.email!,
      employeePassword: this.generateRandomPassword(),
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
            this.addActivity(1,response.id,0,0);
            this.isLoading = false;

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

    this.isLoading = true;

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
            this.addActivity(2, response.id,0,0);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching employees:', error);
          }
        })
      }

    });
  }

  deleteEmployee(employeeId: any): void {

    const userIdToDelete = employeeId;

    const deleteEmployeeRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm removal',
        message: 'Are you sure you want to delete this employee',
        confirmButtonText: 'Confirm'
      }
    });

    deleteEmployeeRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyEmployeeService.deleteEmployee(userIdToDelete).subscribe({});
        window.location.reload();
        this.snackbarService.showSuccessMessage('Employee deleted successfully!')
        this.addActivity(3,userIdToDelete,0,0);
      } else {
        console.log('Korisnik je otkazao brisanje');
      }
    });
  }

  generateRandomPassword(length: number = 12): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const safeSymbols = "!@#$%^&*";

    let password = "";

    for (let i = 0; i < length; i++) {
      const useSymbol = Math.random() < 0.2;
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

  convertImageToDataUrl(Avatar: any) {
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
    if (this.updateFormVisible == false) {
      this.dropdownClicked = !this.dropdownClicked;
    }
  }

  onFileSelected($event: Event) {
    this.file = ($event.target as HTMLInputElement).files![0];
    this.fileName = this.file.name;
    this.isFileSelected = true;
  }

  createCompany() {

    this.isLoading = true;

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
        this.addActivity(10,0,0,0);
        window.location.reload();
      },
      (error) => {
        this.snackbarService.showErrorMessage('Failed to create company');
        console.error('Error creating company:', error);
      }
    );

    this.isFormVisible = false;
    this.fileName = "Upload a pdf file certificate";
    this.isLoading = false;
  }

  updateCompany() {

    this.isLoading = true;

    const companyUpdateData = {
      ...this.basicInfoUpdateFormGroup.value,
      companyAvatar: this.companyAvatar, // If this is an uploaded File, make sure it's a File object, not a base64 string
      file: this.file, // Your PDF file
      fileName: this.fileName,
      userId: this.userId
    };

    console.log(companyUpdateData);

    this.companyService.updateCompanyByUserId(this.userId, companyUpdateData).subscribe(
      () => {
        this.snackbarService.showSuccessMessage('Company updated successfully');
        this.addActivity(11,0,0,0);
        this.isLoading = false;
        window.location.reload();
      },
      (error) => {
        this.snackbarService.showErrorMessage('Failed to update company');
        console.error('Error updating company:', error);
      }
    );
  }

  @ViewChild('companyFileInput', {static: false}) companyFileInput!: ElementRef;
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
      this.imageChangedEvent = {target: {files: event.dataTransfer.files}};
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
      {type: 'image/png'}
    );

    // Hide cropper if needed
    this.showCropper = false;

    console.log('Company avatar stored for later:', this.companyAvatar);
    this.convertImageToDataUrl(this.companyAvatar);
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
        confirmButtonText: 'Confirm'
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

  resetForm() {
    this.isFileSelected = false;
    this.companyAvatar = null;
    this.convertImageToDataUrl(this.companyAvatar);
    this.file = null;
    this.fileName = "Upload a pdf file certificate";
  }

  applyFilter(filterValue: string) {
    const searchTerm = filterValue.trim().toLowerCase();
    this.dataSource.filter = searchTerm;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (
        data.userId.toString().includes(searchTerm) ||
        data.user.firstName.toLowerCase().includes(searchTerm) ||
        data.user.lastName.toLowerCase().includes(searchTerm) ||
        data.user.phoneNumber.toLowerCase().includes(searchTerm) ||
        data.user.emailAdress.toLowerCase().includes(searchTerm) ||
        data.companyPosition.name.toLowerCase().includes(searchTerm) ||
        data.workingHour.startTime.toLowerCase().includes(searchTerm) ||
        data.workingHour.endTime.toLowerCase().includes(searchTerm)
      );
    };

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  deleteCompany(): void {

    const deleteCompanyRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm deletion',
        message: 'Are you sure you want to delete your company? This action cannot be undone.',
        confirmButtonText: 'Delete'
      }
    });

    deleteCompanyRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.deleteCompanyByUserId(this.userId).subscribe(
          () => {
            this.snackbarService.showSuccessMessage('Company deleted successfully!');
            this.addActivity(12, 0, 0, 0);
            window.location.reload();
          },
          (error) => {
            this.snackbarService.showErrorMessage('Failed to delete company');
            console.error('Error deleting company:', error);
          }
        );
      } else {
        console.log('User canceled company deletion');
      }
    });
  }


  closeAddEmployeeForm() {
    this.isEmployeeFormVisible = false;
  }

  closeUpdateEmployeeForm() {
    this.isUpdateEmployeeFormVisible = false;

  }


  showUpdateEmployeeForm(employee: any) {
    this.isUpdateEmployeeFormVisible = true;
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

  setActiveNavLink(activeNav: string) {
    if (activeNav == 'home') {
      this.isNavLinkHomeActive = true;
      this.isNavLinkCompanyVehiclesActive = false;
    } else {
      this.isNavLinkHomeActive = false;
      this.isNavLinkCompanyVehiclesActive = true;
    }
  }

  getVehicles() {
    this.vehicleListingService.getVehiclesByCompanyAdminEmail(this.userId, this.companyAdminEmail).subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles.map((v: any) => ({
          ...v,
          imageIndex: 0
        }));
        console.log(this.vehicles);

        this.hasVehicles = true;
      },
      error: (error) => {
        console.log(error);
      }
    })

    this.vehicleService.GetVehicleBrands().subscribe({
      next: (brands) => {
        this.vehicleBrands = brands;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  getVehicleCategories(){
    this.vehicleCategoriesService.getCategories().subscribe({
      next: (categories) => {
        this.vehicleCategories = categories;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  get pagedVehicles() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.vehicles.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.vehicles.length) {
      this.currentPage++;
    }
  }

  prevPage() {
  if (this.currentPage > 1) {
  this.currentPage--;
}
}

// Called when fuel type changes
  onFuelTypeChange() {
    const fuelType = Number(this.companyTechincalDataFormGroup.get('fuelType')?.value);

    if (fuelType === 2) { // Electric
      this.companyTechincalDataFormGroup.get('transmissionType')?.setValue(1); // Automatic
      this.companyTechincalDataFormGroup.get('transmissionType')?.disable();
    } else {
      this.companyTechincalDataFormGroup.get('transmissionType')?.enable();
    }
  }


// Called when brand changes to fetch models
  onBrandChange(brandId: number, preselectModelId?: number) {
    this.vehicleModelsBrandsService.GetVehicleModelsByBrandId(brandId).subscribe({
      next: models => {
        this.vehicleModels = models;
        this.companyUpdateVehicleBasicInfoForm.get('vehicleModelID')?.reset();

        // if we’re editing, re-assign the model
        if (preselectModelId) {
          this.companyUpdateVehicleBasicInfoForm.patchValue({
            vehicleModelID: preselectModelId
          });
        }
      },
      error: err => {
        console.error('Error loading models:', err);
      }
    });
  }

// Image selection handler
  onVehicleImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      if (files.length + this.uploadedImages.length > 15) {
        alert('You can upload a maximum of 15 images.');
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result as string;
          this.uploadedImages.push(result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

// Submit the vehicle
  onSubmit() {
    if (
      !this.companyVehicleBasicInfoForm.valid ||
      !this.companyTechincalDataFormGroup.valid ||
      !this.companyDescriptionFormGroup.valid
    ) {
      return;
    }

    this.isLoading = true;

    const basic = this.companyVehicleBasicInfoForm.value;
    const technical = this.companyTechincalDataFormGroup.value;
    const description = this.companyDescriptionFormGroup.value;

    const formData = new FormData();

    formData.append('title', basic.title ?? '');
    formData.append('vehicleModelID', String(basic.vehicleModelID));
    formData.append('vehicleCategoryID', String(description.vehicleCategoryID));
    formData.append('pricePerDay', String(basic.pricePerDay));
    formData.append('engineDisplacement', String(technical.engineDisplacement));
    formData.append('enginePower', String(technical.enginePower));
    formData.append('transmissionType', String(technical.transmissionType));
    formData.append('fuelType', String(technical.fuelType));
    formData.append('airConditioning', String(technical.airConditioning));
    formData.append('numberOfSeats', String(technical.numberOfSeats));
    formData.append('towingHitch', String(technical.towingHitch ?? false));
    formData.append('productionYear', String(technical.productionYear));
    formData.append('description', description.description ?? '');
    formData.append('cityID', String(description.cityID));
    formData.append('avaliable', String(description.avaliable ?? false)); // ✅ watch spelling here
    formData.append('userID', String(this.companyAdminUserId));
    formData.append('averageRating', '0');

    this.uploadedFiles.forEach(file => formData.append('images', file, file.name));

    this.vehicleListingService.uploadVehicleWithImages(formData).subscribe({
      next: response => {
        console.log('Vehicle uploaded successfully:', response);
        this.addActivity(23,0,0,response.id);
        this.isLoading = false;
        this.closeAddVehicleForm();
        this.getVehicles();
      },
      error: err => console.error('Upload failed:', err)
    });
  }

  getCountries(){
    this.countryService.getAllCountries().subscribe(countries => this.countries = countries);
  }

  getCities(){
    this.cityService.GetAllCities().subscribe(cities => this.cities = cities);
  }


  protected readonly Math = Math;

  closeAddVehicleForm() {
    this.isVehicleFormVisible = false;
  }

  openAddVehicleForm() {
    this.isVehicleFormVisible = true;
  }

  getCompanyAdminId(){
    this.vehicleListingService.getCompanyAdminUserId(this.userId, this.companyAdminEmail).subscribe({
      next: (response) => {
        this.companyAdminUserId = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  showUpdateVehicleUpdateForm(vehicle: any) {
    this.isVehicleUpdateFormVisible = true;
    this.vehicleIdToUpdate = vehicle.id;

    console.log(vehicle);
    this.onBrandChange(vehicle.vehicleModel.vehicleBrandId);

    this.companyUpdateVehicleBasicInfoForm.patchValue({
      title: vehicle.title,
      brandId: vehicle.vehicleModel.vehicleBrandId,
      vehicleModelID: vehicle.vehicleModelID,
      pricePerDay:vehicle.pricePerDay,
    });

    this.companyUpdateTechincalDataFormGroup.patchValue({
      engineDisplacement: vehicle.engineDisplacement,
      enginePower: vehicle.enginePower,
      transmissionType: vehicle.transmissionType,
      fuelType: vehicle.fuelType,
      airConditioning: vehicle.airConditioning,
      numberOfSeats: vehicle.numberOfSeats,
      towingHitch: vehicle.towingHitch,
      productionYear: vehicle.productionYear
    });

    this.companyUpdateDescriptionFormGroup.patchValue({
      description: vehicle.description,
      vehicleCategoryID: vehicle.vehicleCategoryID,
      cityID: vehicle.cityID,
      avaliable: vehicle.avaliable
    });
  }

  deleteVehicle(vehicle: any): void {

    const deleteVehicleRef = this.dialog.open(DialogConfirmComponent, {
      width: '500px',
      data: {
        title: 'Confirm vehicle deletion',
        message: `Are you sure you want to delete "${vehicle.title}"?`,
        confirmButtonText: 'Delete'
      }
    });

    deleteVehicleRef.afterClosed().subscribe(result => {
      if (result) {
        this.addActivity(24,0,0,vehicle.id);

        this.vehicleListingService.deleteVehicle(vehicle.id).subscribe({
          next: () => {
            this.snackbarService.showSuccessMessage('Vehicle deleted successfully!');
            this.getVehicles();
          },
          error: (err) => {
            this.snackbarService.showErrorMessage('Failed to delete vehicle');
            console.error('Error deleting vehicle:', err);
          }
        });
      } else {
        console.log('User canceled vehicle deletion');
      }
    });
  }


  closeUpdateVehicleForm() {
    this.isVehicleUpdateFormVisible = false;
  }

  onUpdateVehicle() {
    if (
      this.companyUpdateVehicleBasicInfoForm.invalid ||
      this.companyUpdateTechincalDataFormGroup.invalid ||
      this.companyUpdateDescriptionFormGroup.invalid
    ) return;

    this.isLoading = true;

    const basic = this.companyUpdateVehicleBasicInfoForm.value;
    const technical = this.companyUpdateTechincalDataFormGroup.value;
    const description = this.companyUpdateDescriptionFormGroup.value;

    const formData = new FormData();

    // 🔹 Append exactly like upload
    formData.append('id', String(this.vehicleIdToUpdate));
    formData.append('title', basic.title ?? '');
    formData.append('vehicleModelID', String(basic.vehicleModelID));
    formData.append('vehicleCategoryID', String(description.vehicleCategoryID));
    formData.append('pricePerDay', String(basic.pricePerDay));
    formData.append('engineDisplacement', String(technical.engineDisplacement));
    formData.append('enginePower', String(technical.enginePower));
    formData.append('transmissionType', String(technical.transmissionType));
    formData.append('fuelType', String(technical.fuelType));
    formData.append('airConditioning', String(technical.airConditioning));
    formData.append('numberOfSeats', String(technical.numberOfSeats));
    formData.append('towingHitch', String(technical.towingHitch ?? false));
    formData.append('productionYear', String(technical.productionYear));
    formData.append('description', description.description ?? '');
    formData.append('cityID', String(description.cityID));
    formData.append('avaliable', String(description.avaliable ?? false));
    formData.append('userID', String(this.companyAdminUserId));
    formData.append('averageRating', '0');

    this.uploadedFiles.forEach(file => formData.append('newImages', file, file.name));

    this.vehicleListingService.updateVehicle(this.vehicleIdToUpdate, formData)
      .subscribe({
        next: response => {
          console.log('Vehicle updated successfully:', response);
          this.addActivity(25,0,0,response.id);
          this.closeUpdateVehicleForm();
          this.getVehicles();
          this.isLoading = false;
        },
        error: err => {
          console.error('Update failed:', err);
          this.isLoading = false;
        }
      });
  }

  prevImage(vehicle: any, direction: number) {
    vehicle.imageIndex += direction;
    if (vehicle.imageIndex < 0) {
      vehicle.imageIndex = vehicle.vehicleImages.length - 1; // wrap around
    }
  }

  nextImage(vehicle: any, direction: number) {
    vehicle.imageIndex += direction;
    if (vehicle.imageIndex >= vehicle.vehicleImages.length) {
      vehicle.imageIndex = 0; // wrap around
    }
  }


  RouteToListing(vehicleId:number) {
    this.router.navigate(['/vehicle/listing/' + vehicleId]);
  }

  onFileImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];

      // Only allow images
      if (!file.type.startsWith('image/')) continue;

      // Max 15 images
      if (this.uploadedFiles.length >= 15) {
        alert('You can upload a maximum of 15 images.');
        break;
      }

      this.uploadedFiles.push(file);

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => this.uploadedImages.push(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  ImageZoom() {
    this.zoomClicked = !this.zoomClicked;
  }
}



