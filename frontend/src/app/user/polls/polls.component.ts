// polls.component.ts
import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MyConfig } from '../../my-config';

@Component({
  standalone: false,
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.css']
})
export class PollsComponent implements OnInit, OnDestroy {
  accountService = inject(UserService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  polls: any[] = [];
  private apiUrl = MyConfig.api_address + 'Poll';
  private hubConnection!: HubConnection;

  constructor() {}

  ngOnInit(): void {
    this.loadPolls();
    this.setupSignalRConnection();
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
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

  setupSignalRConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(MyConfig.server_address + '/pollHub')
      .build();

    this.hubConnection.on('ReceiveVoteUpdate', (updatedPoll) => {
      this.ngZone.run(() => {
        this.updatePollList(updatedPoll);
      });
    });

    this.hubConnection.start()
      .then(() => console.log('SignalR connection established'))
      .catch(err => console.error('Error establishing SignalR connection: ', err));
  }

  updatePollList(updatedPoll: any): void {
    const updatedId = updatedPoll.id ?? updatedPoll.Id;
    const pollIndex = this.polls.findIndex(poll => poll.id === updatedId);
    
    const processedPoll = this.processPollData(updatedPoll);
    
    if (pollIndex !== -1) {
      this.polls[pollIndex] = processedPoll;
    } else {
      this.polls.push(processedPoll);
    }
    this.cdr.detectChanges();
  }

  processPollData(poll: any): any {
    const user = this.accountService.currentUser();
    const userId = user?.id;
    
    poll.id = poll.id ?? poll.Id;
    poll.isClosed = poll.isClosed ?? poll.IsClosed;
    const votedIds = poll.votedUserIds || poll.VotedUserIds || [];
    poll.userHasVoted = userId ? votedIds.includes(userId) : false;

    const votes: { [key: string]: number } = poll.votes || poll.Votes || {};
    const totalVotes: number = Object.values(votes).reduce((acc: number, v: number) => acc + (v || 0), 0);
    poll.totalVotes = totalVotes;
  
    const optionsRaw = poll.options || poll.Options || [];
    poll.options = optionsRaw.map((opt: any) => {
      const optionText = typeof opt === 'string' ? opt : (opt.option ?? opt.Option);
      return {
        option: optionText,
        votes: votes[optionText] || 0,
        percentage: totalVotes > 0 ? ((votes[optionText] || 0) / totalVotes) * 100 : 0
      };
    });
  
    return poll;
  }

  castVote(pollId: number, option: string): void {
    const user = this.accountService.currentUser();
    if (!user) {
      alert('You must be logged in to vote.');
      return;
    }

    const voteUrl = `${this.apiUrl}/${pollId}/vote?userId=${user.id}`;

    if (!option) {
      alert('Please select a valid option.');
      return;
    }

    this.http.post(voteUrl, JSON.stringify(option), {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        // Vote casted successfully, SignalR handles update
      },
      error: (error) => {
        console.error('Error casting vote:', error);
        alert(error.error || 'Failed to cast vote.');
      },
    });
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
