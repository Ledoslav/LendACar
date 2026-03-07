import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  show() {
    this.activeRequests++;
    this.updateState();
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.updateState();
  }

  private updateState() {
    this.loadingSubject.next(this.activeRequests > 0);
  }
}
