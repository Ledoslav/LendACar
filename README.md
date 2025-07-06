# LendACar - Rent a Car Service

## Project Overview
LendACar is a full-stack web application for managing a car rental service. It provides features for administrators, employees, companies, and end-users, including vehicle management, user registration, company dashboards, and more. The project is built with a .NET 8 backend and an Angular 18 frontend.

---

## Prerequisites
Before running the application, it is necessary to install
- **.NET SDK:** 8.0+
- **Node.js:** 18.x or 20.x recommended
- **Angular CLI:** 18.x (`npm install -g @angular/cli@18`)
- **SQL Server:** LocalDB or full SQL Server instance

---

## Backend Setup
1. **Navigate to the backend directory:**
   ```sh
   cd backend/LendACarAPI
   ```
2. **Restore NuGet packages:**
   ```sh
   dotnet restore
   ```
3. **Apply database migrations:**
   ```sh
   dotnet ef database update
   ```
4. **Run the backend API:**
   ```sh
   dotnet run
   ```
   The API will be available at `http://localhost:7000`.
5. **Seed the database:**
   After starting the API seed the data with the DataSeedGenerateEndpoint thru swagger. You first need to seed the referal data and then the person data, otherview you will get errors.

---

## Frontend Setup
1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the Angular development server:**
   ```sh
   ng serve
   ```
   The app will be available at `http://localhost:4200`.

---

## Test Login Credentials
### Administrator
- **Email:** admin.main@lendacar.ba
- **Password:** admin

### Employees
- **Email:**  john.doe@lendacar.ba 
- **Password:** password

### App Users (examples)
- **Username:** Vaha 
- **Password:** password

> All seeded users and employees use the password `password` unless otherwise specified.

---

## Notes   
- For email and cloud storage features, configure the relevant settings in `appsettings.json`.
- Uncomment the code getting the values from `appsettings.json` in `GmailService.cs` and `PhotoService.cs`    
