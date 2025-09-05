import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-activity-home',
  templateUrl: './activity-home.component.html',
  styleUrl: './activity-home.component.css'
})
export class ActivityHomeComponent implements OnInit{

  ngOnInit() {
  }

  activities: { time: string; description: string }[] = [
    {
      time: '10:15 AM',
      description: 'New employee Jamie Oliver added to company <b>Sparkwave</b>.'
    },
    {
      time: '10:20 AM',
      description: 'New vehicle <b>BMW E46</b> added to <b>Sparkwave</b> by Jamie Oliver.'
    }
  ];
}
