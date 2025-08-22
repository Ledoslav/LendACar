import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import {LayoutComponent} from './layout/layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from '@angular/material/stepper';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatToolbar} from '@angular/material/toolbar';
import {TranslatePipe} from '@ngx-translate/core';
import {ImageCropperComponent} from 'ngx-image-cropper';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatCheckbox} from "@angular/material/checkbox";
import {MatPaginator} from '@angular/material/paginator';
import {MatIcon} from '@angular/material/icon';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatNativeDateModule, MatOption} from '@angular/material/core';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {UserModule} from '../user/user.module';
import {MatSelect} from '@angular/material/select';


@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    FormsModule,
    MatStepper,
    MatStep,
    ReactiveFormsModule,
    MatButton,
    MatStepperNext,
    MatFormField,
    MatStepperPrevious,
    MatInput,
    MatStepLabel,
    MatLabel,
    MatToolbar,
    TranslatePipe,
    ImageCropperComponent,
    MatProgressSpinner,
    NgOptimizedImage,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatNoDataRow,
    MatCheckbox,
    MatPaginator,
    MatIcon,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    NgxMaterialTimepickerModule,
    UserModule,
    MatSelect,
    MatOption,
    MatIconButton
  ],providers: [
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class CompanyModule { }
