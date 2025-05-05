import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VehicleService} from '../../../services/vehicle.service';
import {UserService} from '../../../services/user.service';
import {VehicleDto} from '../../../Models/VehicleDto';
import { transmissionTypes } from '../../../shared/shared-data';
@Component({
  selector: 'app-my-vehicles-page',
  templateUrl: './my-vehicles-page.component.html',
  styleUrl: './my-vehicles-page.component.css'
})
export class MyVehiclesPageComponent implements OnInit{
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
        console.log(err);
      }
    })
  }

  findTransmissionType(type:any){
    return this.transmisionTypes.find(t=>t.value==type)?.label
  }

}
