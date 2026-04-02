import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VehicleService} from '../../../services/vehicle.service';
import {UserService} from '../../../services/user.service';
import {VehicleDto} from '../../../Models/VehicleDto';
import { transmissionTypes } from '../../../shared/shared-data';
@Component({
  standalone: false,
  selector: 'app-my-vehicles-page',
  templateUrl: './my-vehicles-page.component.html',
  styleUrl: './my-vehicles-page.component.css'
})
export class MyVehiclesPageComponent implements OnInit{
  private cdr = inject(ChangeDetectorRef);
  userVehicles:VehicleDto[]=[];
  vehiclesService=inject(VehicleService);
  accountService=inject(UserService);
  transmisionTypes= transmissionTypes;
  constructor(private fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.loadUserVehicles();
  }


  loadUserVehicles(): void {
    const userId=this.accountService.currentUser()!.id
    this.vehiclesService.GetVehiclesByUser(userId).subscribe({
      next:res=>{
        this.userVehicles=res;
      },
      error:err=>{
      }

    })
  }

  findTransmissionType(type:any){
    return this.transmisionTypes.find(t=>t.value==type)?.label
  }

}
