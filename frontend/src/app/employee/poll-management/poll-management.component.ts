// poll-management.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Chart, registerables, ChartItem } from 'chart.js';
import {EmployeeService} from '../../services/employee.service';


Chart.register(...registerables);

// canvas.d.ts
interface HTMLCanvasElement {
  chartInstance?: Chart;  // Optional chart instance property
}

@Component({
  standalone: false,
  selector: 'app-poll-management',
  templateUrl: './poll-management.component.html',
  styleUrls: ['./poll-management.component.css'],
})
export class PollManagementComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  private cdr = inject(ChangeDetectorRef);
  employeeService=inject(EmployeeService);
  router=inject(Router);

  polls: any[] = [];
  newPoll = {
    question: '',
    options: [''],
  };

  private apiUrl = 'http://localhost:7000/api/Poll';
  private hubConnection!: HubConnection;
  private isChartsRendered = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPolls();
    this.setupSignalRConnection();
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 0);
  }

  ngAfterViewChecked(): void {
    if (this.polls.length && !this.isChartsRendered) {
      this.renderCharts();
      this.isChartsRendered = true;
    }
  }

  loadPolls(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        this.polls = data.map((poll) => this.calculateVotePercentages(poll));
      
    this.cdr.detectChanges();
  },
      (error) => {
        console.error('Error fetching polls:', error);
        alert('Failed to load polls. Please check the server.');
      
    this.cdr.detectChanges();
  }
    );
  }

  updatePollList(updatedPoll: any): void {
    const pollIndex = this.polls.findIndex((poll) => poll.id === updatedPoll.id);
    if (pollIndex !== -1) {
      this.polls[pollIndex] = this.calculateVotePercentages(updatedPoll);
    } else {
      this.polls.push(this.calculateVotePercentages(updatedPoll));
    }
    this.isChartsRendered = false;
  }

  calculateVotePercentages(poll: any): any {
    const votes: { [key: string]: number } = poll.votes;
    const totalVotes: number = Object.values(votes).reduce((acc: number, voteCount: number) => acc + (voteCount || 0), 0);

    if (totalVotes === 0) {
      return poll;
    }

    poll.options = poll.options.map((option: string) => ({
      option: option,
      votes: votes[option] || 0,
      percentage: ((votes[option] || 0) / totalVotes) * 100
    }));

    poll.chartData = {
      labels: poll.options.map((option: any) => option.option),
      datasets: [{
        data: poll.options.map((option: any) => option.votes),
        backgroundColor: ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"],
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    };

    return poll;
  }

  renderCharts(): void {
    this.polls.forEach((poll) => {
      if (poll.chartData) {
        const canvasElement = document.getElementById(`pollChart${poll.id}`) as HTMLCanvasElement;
        if (canvasElement) {
          // Destroy any existing chart instance before creating a new one
          if (canvasElement.chartInstance) {
            canvasElement.chartInstance.destroy();
          }

          // Cast the canvas element to ChartItem
          const chartInstance = new Chart(canvasElement as ChartItem, {
            type: 'pie',
            data: poll.chartData
          });

          // Store the chart instance in the canvas element to reuse later
          canvasElement.chartInstance = chartInstance;
        }
      }
    });
  }

  setupSignalRConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:7000/pollHub')
      .build();

    this.hubConnection.on('ReceiveVoteUpdate', (updatedPoll) => {
      this.updatePollList(updatedPoll);
    });

    this.hubConnection.start().then(() => {
      console.log('SignalR connection established');
    }).catch((err) => {
      console.error('SignalR connection failed: ', err);
    });
  }

  addOption(): void {
    this.newPoll.options.push('');
  }

  removeOption(index: number): void {
    this.newPoll.options.splice(index, 1);
  }

  createPoll(): void {
    if (!this.newPoll.question || this.newPoll.options.some((option) => !option)) {
      alert('Please fill in the question and all options.');
      return;
    }

    this.http.post(this.apiUrl, this.newPoll).subscribe({
      next: () => {
        alert('Poll created successfully!');
        this.newPoll = { question: '', options: [''] };
        this.loadPolls();
      },
      error: (error) => {
        console.error('Error creating poll:', error);
        alert('Failed to create the poll. Please try again.');
      },
    });
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
