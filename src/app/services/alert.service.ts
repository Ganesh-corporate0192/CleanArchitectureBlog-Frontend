import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AlertMessage {
  type: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {

  private alertSubject = new Subject<AlertMessage>();
  alert$ = this.alertSubject.asObservable();

  success(message: string) {
    this.alertSubject.next({ type: 'success', message });
  }

  error(message: string) {
    this.alertSubject.next({ type: 'error', message });
  }
}