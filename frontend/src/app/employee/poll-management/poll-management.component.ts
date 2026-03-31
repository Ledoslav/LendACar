// poll-management.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, inject, NgZone, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Chart, registerables, ChartItem } from 'chart.js';
import {EmployeeService} from '../../services/employee.service';
import { jsPDF } from 'jspdf';
import { MyConfig } from '../../my-config';

Chart.register(...registerables);

@Component({
  standalone: false,
  selector: 'app-poll-management',
  templateUrl: './poll-management.component.html',
  styleUrls: ['./poll-management.component.css'],
})
export class PollManagementComponent implements OnInit, OnDestroy, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  employeeService = inject(EmployeeService);
  router = inject(Router);

  @ViewChildren('pollChart') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  polls: any[] = [];
  newPoll = {
    question: '',
    options: [''],
  };

  private apiUrl = MyConfig.api_address + 'Poll';
  private hubConnection!: HubConnection;
  private chartInstances = new Map<number, Chart>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPolls();
    this.setupSignalRConnection();
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
    this.chartInstances.forEach(chart => chart.destroy());
    this.chartInstances.clear();
  }

  ngAfterViewInit(): void {
    this.chartCanvases.changes.subscribe(() => {
      this.renderCharts();
    });
    this.renderCharts();
  }

  loadPolls(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.polls = (data || []).map((poll) => this.processPollData(poll));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching polls:', error);
      }
    });
  }

  updatePollList(updatedPoll: any): void {
    const updatedId = updatedPoll.id ?? updatedPoll.Id;
    const pollIndex = this.polls.findIndex((poll) => (poll.id ?? poll.Id) === updatedId);
    
    const processedPoll = this.processPollData(updatedPoll);
    
    if (pollIndex !== -1) {
      this.polls[pollIndex] = processedPoll;
    } else {
      this.polls.push(processedPoll);
    }
    
    this.cdr.detectChanges();
  }

  processPollData(poll: any): any {
    poll.id = poll.id ?? poll.Id;
    poll.isClosed = poll.isClosed ?? poll.IsClosed;
    
    const votes: { [key: string]: number } = poll.votes || poll.Votes || {};
    const totalVotes: number = Object.values(votes).reduce((acc: number, v: number) => acc + (v || 0), 0);
    poll.totalVotes = totalVotes; // store for PDF

    const optionsRaw = poll.options || poll.Options || [];
    poll.options = optionsRaw.map((opt: any) => {
      const optionText = typeof opt === 'string' ? opt : (opt.option ?? opt.Option);
      return {
        option: optionText,
        votes: votes[optionText] || 0,
        percentage: totalVotes > 0 ? ((votes[optionText] || 0) / totalVotes) * 100 : 0
      };
    });

    poll.chartData = {
      labels: poll.options.map((o: any) => o.option),
      datasets: [{
        data: poll.options.map((o: any) => o.votes),
        backgroundColor: ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"],
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    };

    return poll;
  }

  renderCharts(): void {
    if (!this.chartCanvases) return;

    this.chartCanvases.forEach((canvasRef) => {
      const canvasElement = canvasRef.nativeElement;
      const pollIdStr = canvasElement.getAttribute('data-poll-id');
      const pollId = pollIdStr ? parseInt(pollIdStr) : null;
      
      if (pollId === null) return;

      const poll = this.polls.find(p => p.id === pollId);
      
      if (poll && poll.chartData) {
        if (this.chartInstances.has(pollId)) {
          this.chartInstances.get(pollId)?.destroy();
          this.chartInstances.delete(pollId);
        }
        
        const chartInstance = new Chart(canvasElement as ChartItem, {
          type: 'pie',
          data: poll.chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
          }
        });
        
        this.chartInstances.set(pollId, chartInstance);
      }
    });
  }

  setupSignalRConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(MyConfig.server_address + '/pollHub')
      .build();

    this.hubConnection.on('ReceiveVoteUpdate', (updatedPoll) => {
      this.ngZone.run(() => {
        this.updatePollList(updatedPoll);
      });
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
    if (!this.newPoll.question || this.newPoll.options.some((o) => !o)) {
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
      },
    });
  }

  closePoll(pollId: number): void {
    if (confirm('Are you sure you want to close this poll? User voting will be disabled.')) {
        this.http.post(`${this.apiUrl}/${pollId}/close`, {}).subscribe({
            next: () => {
                alert('Poll closed successfully!');
            },
            error: (err) => {
                console.error('Error closing poll:', err);
                alert('Could not close poll.');
            }
        });
    }
  }

  printResults(poll: any): void {
    const doc = new jsPDF();
    const chart = this.chartInstances.get(poll.id);
    
    // Header
    doc.setFillColor(33, 37, 41); // Dark background
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Poll Results Report', 10, 25);
    
    // Question Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(`Question: ${poll.question}`, 10, 55);
    
    doc.setFontSize(14);
    doc.text(`Total Votes: ${poll.totalVotes}`, 10, 65);
    
    // Statistics Table
    doc.setFontSize(16);
    doc.text('Option Breakdown:', 10, 80);
    
    let y = 90;
    doc.setFontSize(12);
    poll.options.forEach((opt: any) => {
      doc.text(`${opt.option}:`, 15, y);
      doc.text(`${opt.votes} votes`, 80, y);
      doc.text(`${opt.percentage.toFixed(1)}%`, 140, y);
      y += 8;
    });

    // Chart
    if (chart) {
      const canvas = chart.canvas as HTMLCanvasElement;
      const chartImage = canvas.toDataURL('image/png', 1.0);
      doc.text('Visual Statistics:', 10, y + 10);
      doc.addImage(chartImage, 'PNG', 50, y + 15, 110, 110);
    }

    // Footer
    const date = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Report generated on: ${date}`, 10, 285);
    
    doc.save(`Poll_Results_${poll.id}.pdf`);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
