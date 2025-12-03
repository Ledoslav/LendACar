import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PretragaRoutingModule } from './pretraga-routing.module';
import { PretragaHomeComponent } from './pretraga-home/pretraga-home.component';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {UserModule} from '../user/user.module';
import {MatPaginator} from '@angular/material/paginator';
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from "@angular/material/slider";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    PretragaHomeComponent
  ],
  imports: [
    CommonModule,
    PretragaRoutingModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    TranslatePipe,
    UserModule,
    MatPaginator,
    MatSlider,
    MatSliderThumb,
    MatSliderRangeThumb,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class PretragaModule { }
