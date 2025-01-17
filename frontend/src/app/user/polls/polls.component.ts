import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.css']
})
export class PollsComponent implements OnInit {
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
        this.polls = data;
      },
      (error) => {
        console.error('Error fetching polls:', error);
        alert('Failed to load polls. Please check the server.');
      }
    );
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
        alert('Vote casted successfully!');
      },
      error: (error) => {
        console.error('Error casting vote:', error);
        alert('Failed to cast vote. Please try again.');
      },
    });
  }

  updatePoll(updatedPoll: any) {
    // Update the poll with the new vote data
    const pollIndex = this.polls.findIndex(poll => poll.id === updatedPoll.id);
    if (pollIndex !== -1) {
      this.polls[pollIndex] = updatedPoll;
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
