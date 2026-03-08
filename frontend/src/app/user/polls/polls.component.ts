import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {UserService} from '../../services/user.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  standalone: false,
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.css']
})
export class PollsComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  accountService=inject(UserService);
  
  logout() {
    this.accountService.currentUser.set(null);
    localStorage.removeItem('user');
  }

  polls: any[] = [];
  private apiUrl = 'http://localhost:7000/api/Poll'; // API URL for the poll data
  private hubConnection: HubConnection;

  constructor(private http: HttpClient) {
    // Set up SignalR connection
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:7000/pollHub')  // The URL of the SignalR Hub
      .build();

    // Listen for "ReceiveVoteUpdate" messages from the SignalR Hub
    this.hubConnection.on('ReceiveVoteUpdate', (poll) => {
      this.updatePoll(poll);
    });

    this.startConnection();
  }

  ngOnInit(): void {
    this.loadPolls();
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
  }

  calculateVotePercentages(poll: any): any {
    const votes: { [key: string]: number } = poll.votes || {};
    const totalVotes: number = Object.values(votes).reduce((acc: number, voteCount: number) => acc + (voteCount || 0), 0);
  
    poll.options = poll.options.map((option: string) => ({
      option: option,
      votes: votes[option] || 0,
      percentage: totalVotes > 0 ? ((votes[option] || 0) / totalVotes) * 100 : 0, // Set percentage to 0 if no votes
    }));
  
    return poll;
  }
  

  castVote(pollId: number, option: string): void {
    const voteUrl = `http://localhost:7000/api/Poll/${pollId}/vote`;

    if (!option) {
      alert('Please select a valid option.');
      return;
    }

    // Sending the vote as a plain string
    this.http.post(voteUrl, JSON.stringify(option), {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response) => {
        //alert('Vote casted successfully!');
      },
      error: (error) => {
        console.error('Error casting vote:', error);
        alert('Failed to cast vote. Please try again.');
      },
    });
  }

  updatePoll(updatedPoll: any): void {
    const pollIndex = this.polls.findIndex(poll => poll.id === updatedPoll.id);
    if (pollIndex !== -1) {
        this.polls[pollIndex] = this.calculateVotePercentages(updatedPoll);
    }
}


  // Start the SignalR connection
  startConnection(): void {
    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection established'))
      .catch(err => console.error('Error establishing SignalR connection: ', err));
  }

  trackByIndex(index: number, item: any): number {
    return index; // return the index of each poll
  }
}
