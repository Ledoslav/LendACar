import {Component, inject, OnInit} from '@angular/core';
import {UserDto} from '../../Models/UserDto';
import {City} from '../../Models/City';
import {Country} from '../../Models/Country';
import {FormBuilder} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.css'
})
export class UserOverviewComponent  implements OnInit {
  ngOnInit(): void {
      this.loadUsers();
  }
  fb=inject(FormBuilder);
  router=inject(Router);
  userService=inject(UserService)
  users: UserDto[]=[];
  cities: City[]=[];
  countries: Country[]=[];

  loadUsers(){
    this.userService.GetAllUsers().subscribe({
     next:res=>this.users=res,
      error:err=>console.log(err),
    })
  }


  Update($event: any) {
    const userId=$event.target.value;

    const params={id:userId.toString()};

    void this.router.navigate(['/admin/user-update/'],{queryParams:params});
  }
}
