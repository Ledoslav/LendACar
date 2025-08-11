// dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {CompanyService} from '../../services/company.service';
import {CompanyEmployeeService} from '../../services/companyemployee.service';
import {Observable} from 'rxjs';
import {MyAuthServiceService} from '../../services/auth-service/my-auth-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  isFormVisible = false;
  companyName = '';
  address = '';
  companyPhone = '';
  companyEmail = '';
  companyAddress = '';
  avatarPreview: string | ArrayBuffer | null = null;
  activeLink: string = 'home';
  companyDescription: string = '';
  accountService = inject(UserService); // Inject UserService
  username: any;
  isLoggedIn: boolean = false;
  hasCompany: boolean = false;  // Flag to check if the user has a company
  userId: any;
  updateFormVisible = false; // Visibility toggle for the update form
  selectedFileName: any;
  employeeSectionClicked: boolean = true;
  employeesFlag: boolean = false;
  isEmployeeFormVisible = false;
  hasEmployees = false;
  employeeSectionFlag = false;
  employees: employees[] = [];
  isUpdating: boolean = false;
  isAppUser: boolean = false;
  authService = inject(MyAuthServiceService);
  dropdownClicked: boolean = false;

  employee = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    title: '',
    companyAdminEmail: '',
  };

// Add employee form visibility control
  showEmployeeForm() {
    this.isEmployeeFormVisible = true; // Show the form
    this.hasEmployees = false; // Hide the "No employees" message if any
  }

// Hide the form and reset fields when "Cancel" is clicked
  cancelEmployeeForm() {
    this.isEmployeeFormVisible = false; // Hide the form
    this.hasEmployees = this.employees.length > 0; // Show the employee table if there are employees
    this.resetEmployeeForm(); // Reset form fields
  }

  submitEmployeeForm() {
    // Check if any of the required fields are empty
    if (!this.employee.companyAdminEmail) {
      alert('Company Admin Email is required.');
      return;
    }
    if (!this.employee.firstName) {
      alert('First Name is required.');
      return;
    }
    if (!this.employee.lastName) {
      alert('Last Name is required.');
      return;
    }
    if (!this.employee.email) {
      alert('Email is required.');
      return;
    }
    if (!this.employee.phoneNumber) {
      alert('Phone Number is required.');
      return;
    }
    if (!this.employee.title) {
      alert('Title is required.');
      return;
    }

    console.log('Submitting Employee Form:', this.employee);
    this.companyEmployeeService.addEmployee(this.employee).subscribe(
      (response) => {
        console.log('Current Employee Data:', this.employee);
        console.log('Employee added successfully:', response);
        this.isEmployeeFormVisible = false;
        this.resetEmployeeForm();
        this.fetchEmployees();
      },
      (error) => {
        console.error('Error adding employee:', error);

        // Check if error has a response body and it is JSON
        if (error.error && error.error.message) {
          // Show the message from the JSON response
          alert(`Error adding employee: ${error.error.message}`);
        } else {
          // Fallback for non-JSON errors
          alert(`Error adding employee: ${error.message}`);
        }
      }
    );
  }

  // Reset the form fields
  resetEmployeeForm() {
    const adminEmail = this.employee.companyAdminEmail; // Preserve value
    this.employee = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      title: '',
      companyAdminEmail: adminEmail, // Restore after reset
    };
  }

  constructor(private userService: UserService, private companyService: CompanyService, private companyEmployeeService: CompanyEmployeeService) {
  }

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAppUser = this.authService.isAppUser();

    if (this.isAppUser) {
      this.username = this.accountService.currentUser()?.username;
      this.userId = this.accountService.currentUser()?.id;

      // Fetch employees based on companyId
      this.fetchEmployees();

      // Fetch company data when the component is initialized
      this.companyService.getCompanyByUserId(this.userId).subscribe((company) => {
        // Populate form with fetched company data
        this.companyName = company.companyName;
        this.companyPhone = company.companyPhone;
        this.companyEmail = company.companyEmail;
        this.companyDescription = company.companyDescription;
        this.address = company.companyAddress;
      });

      console.log('isLoggedIn:', this.isLoggedIn);
      console.log('hasCompany:', this.hasCompany);

      // Call the service to check if the user has a company
      this.companyService.checkIfCompanyExists(this.userId).subscribe(
        (exists: boolean) => {
          this.hasCompany = exists;  // Set the flag based on response
        },
        (error: any) => {
          console.error('Error checking if company exists:', error);
          this.hasCompany = false;  // Default to false if there's an error
        }
      );

      // Check if user is Company Admin
      await this.companyEmployeeService
        .getCompanyAdminEmail(this.userId)
        .toPromise()
        .then((adminEmail) => {
          this.employee.companyAdminEmail = adminEmail || '';
          console.log(adminEmail);
        })
        .catch((error) => {
          console.error('Error fetching company admin email:', error);
        });
    } else {
      console.log('No user logged in');  // Log if there's no user
    }
  }

// Fetch employees for the company based on the current user
  fetchEmployees(): void {
    const currentUser = this.userService.getCurrentUser(); // Get the current user
    if (currentUser) {
      this.companyEmployeeService.getAllEmployeesForAdmin().subscribe(
        (response: any) => {
          if (response && response.length > 0) {
            this.employees = response.map((employee: any) => ({
              employeeId: employee.user.id,
              firstName: employee.user.firstName,
              lastName: employee.user.lastName,
              phoneNumber: employee.user.phoneNumber,
              companyTitle: employee.companyPosition?.name || 'N/A',
              email: employee.user.emailAdress,
              workingHour: employee.workingHour
                ? `${employee.workingHour.startTime} - ${employee.workingHour.endTime}`
                : 'N/A',
            }));

            this.employeesFlag = true;   // Show employee table
            this.hasEmployees = true;    // Indicate employees exist
          } else {
            this.handleNoEmployees();    // Handle empty employee response
          }
        },
        (error: any) => {
          console.error('Error fetching employees:', error);
          if (error.status === 404) {
            this.handleNoEmployees();    // Show "no employees" message on 404
          } else {
            this.employeesFlag = false;  // Handle other errors
          }
        }
      );
    }
  }

// Helper method to handle no employees found
  private handleNoEmployees(): void {
    this.employees = [];               // Clear the employee array
    this.employeesFlag = false;        // Indicate no employee table
    this.hasEmployees = false;         // Indicate no employees available
  }

  employeeIdToUpdate: number = 0;

// Method to handle update logic (this will fetch data for a specific employee by ID)
  updateEmployee(employeeId: number): void {
    // Store the employeeId for later use
    this.employeeIdToUpdate = employeeId;
    // Use the service to fetch employee data by ID
    this.companyEmployeeService.getEmployeeForAdmin(employeeId).subscribe(
      (employeeData: any) => {
        // Assign the fetched data to the employee object
        // Assuming employeeData.user contains the details you want to populate in the form
        this.employee = {
          firstName: employeeData.user.firstName,
          lastName: employeeData.user.lastName,
          email: employeeData.user.emailAdress,
          phoneNumber: employeeData.user.phoneNumber,
          title: employeeData.companyPosition.name,
          companyAdminEmail: this.employee.companyAdminEmail // Assuming this field is directly available
        };

        console.log('Fetched employee data:', employeeData); // Check if data is correct
        this.isUpdating = true; // Set flag to show the update form
      },
      (error: any) => {
        console.error('Error fetching employee data:', error);
      }
    );
  }

  updateEmployeeForm(): void {
    const currentUser = this.userService.getCurrentUser();
    // Fetch the company admin email using the service
    // @ts-ignore
    this.companyEmployeeService.getCompanyAdminEmail(currentUser.id).subscribe(
      (companyAdminEmail: string | null) => {
        const updatedEmployee = {
          ...this.employee,  // Spread all employee data
          companyAdminEmail: companyAdminEmail,  // Add the admin email for authorization
          userId: this.employeeIdToUpdate  // Add the employee ID from the stored variable
        };

        console.log(updatedEmployee); // Log the updated employee to verify that the ID and email are included

        // Call the updateEmployee service with the updated employee data
        this.companyEmployeeService.updateEmployee(updatedEmployee).subscribe(
          (response: any) => {
            console.log('Employee updated successfully:', response);
            this.isUpdating = false; // Close the update form
            this.fetchEmployees(); // Refresh the employee list
            this.employeeIdToUpdate = 0; // Reset the employeeIdToUpdate variable
          },
          (error: any) => {
            console.error('Error updating employee:', error);
          }
        );
      },
      (error: any) => {
        console.error('Error fetching company admin email:', error);
      }
    );
  }


  cancelUpdateEmployeeForm(): void {
    this.isUpdating = false; // Hide the form without submitting
    this.resetEmployeeForm();
  }

  // Method to handle delete logic
  deleteEmployee(employeeId: number): void {
    console.log('Deleting employee with ID:', employeeId);

    this.companyEmployeeService.deleteEmployee(employeeId).subscribe(
      (response) => {
        console.log('Employee deleted:', response);
        this.fetchEmployees();
        // Option 1: Remove the employee from the local array
        this.employees = this.employees.filter(employee => employee.employeeId !== employeeId);

        // Check if the employees array is empty
        if (this.employees.length === 0) {
          this.employeesFlag = false;  // No employees left, show "no employees" message
        }
      },
      (error) => {
        console.error('Error deleting employee:', error);
      }
    );
  }

// Method to handle add employee logic (display the form)
  addEmployee() {
    this.isEmployeeFormVisible = true; // Show the form
    this.hasEmployees = false; // Hide the table
  }

  // Show the form
  showForm() {
    this.isFormVisible = true;
  }

  // Submit the company creation form
  submitForm() {
    // Log each field
    console.log("Company Name:", this.companyName);
    console.log("Address:", this.address);
    console.log("Phone:", this.companyPhone);
    console.log("Email:", this.companyEmail);
    console.log("Description:", this.companyDescription);
    console.log("Avatar Preview:", this.avatarPreview);

    const companyData = {
      companyName: this.companyName,
      address: this.address,
      companyPhone: this.companyPhone,
      companyEmail: this.companyEmail,
      companyDescription: this.companyDescription,
      avatar: this.avatarPreview,
      userId: this.userId,
    };

    this.companyService.createCompany(companyData).subscribe(
      (response) => {
        console.log('Company created successfully:', response);
        this.isFormVisible = false;
        this.resetForm();
        window.location.reload(); // Refresh the page after success
      },
      (error) => {
        console.error('Error creating company:', error);
      }
    );
  }

  // Reset the form fields after submission and log each reset action
  private resetForm() {
    console.log("Resetting Company Name");
    this.companyName = '';
    console.log("Resetting Address");
    this.address = '';
    console.log("Resetting Phone");
    this.companyPhone = '';
    console.log("Resetting Email");
    this.companyEmail = '';
    console.log("Resetting Description");
    this.companyDescription = '';
    console.log("Resetting Avatar Preview");
    this.avatarPreview = null;
  }

  // Cancel the form without saving
  cancelForm() {
    this.isFormVisible = false;
    this.resetForm();
  }

  // Handle file selection for avatar
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle PDF selection
  onPdfSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      console.log('Selected PDF:', file);
    }
  }

  // Set active link (navigation)
  setActive(link: string) {
    this.activeLink = link;
    //Employee section
    if (link == 'employees') {
      this.employeeSectionClicked = false;
      this.employeeSectionFlag = true;
      this.employeesFlag = this.employees.length > 0;
    } else {
      this.employeeSectionClicked = true;
    }

    if (link == 'home') {
      this.employeeSectionFlag = false;
    }
  }

  deleteCompany(): void {
    const isConfirmed = window.confirm('Are you sure you want to delete the company?');

    if (isConfirmed) {
      if (!this.userId) {
        console.error('User not logged in.');
        return;
      }

      // Call the service to delete the company
      this.companyService.deleteCompanyByUserId(this.userId).subscribe(
        () => {
          console.log('Company deleted successfully.');
          this.hasCompany = false; // Update the UI state to reflect the absence of a company
          window.location.reload(); // Refresh the page
        },
        (error) => {
          console.error('Error deleting company:', error);
        }
      );
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file;
    }
  }

  updateCompany(): void {
    const isConfirmed = window.confirm('Are you sure you want to update the company?');
    if (isConfirmed) {
      const updatedCompanyData = {
        companyName: this.companyName,
        companyPhone: this.companyPhone,
        companyEmail: this.companyEmail,
        companyDescription: this.companyDescription,
        companyAddress: this.address,
        userId: this.userId, // Use UserId to identify the company
        companyAvatar: this.selectedFileName // Attach the selected file here
      };

      this.companyService.updateCompanyByUserId(this.userId, updatedCompanyData).subscribe(
        () => {
          console.log('Company updated successfully.');
          this.updateFormVisible = false; // Hide the update form
          window.location.reload(); // Refresh the page
        },
        (error) => {
          console.error('Error updating company:', error);
          if (error.status === 400 && error.error && error.error.errors) {
            console.log('Validation errors:', error.error.errors);
            Object.entries(error.error.errors).forEach(([field, messages]) => {
              window.alert(`All fields are required. The field ${field} is empty`);
              console.error(`Validation error on ${field}:`, messages);
            });
          }
        }
      );
    }
  }


  showUpdateForm() {
    this.updateFormVisible = true;
  }

  toggleDropdown() {
    this.dropdownClicked = !this.dropdownClicked;
  }
}

interface employees {
  employeeId: number;
  lastName: string;
  firstName: string;
  phoneNumber: string;
  companyTitle: string;
  email: string;
  workingHour: string;
}
