import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'   
})
export class UiStateService {

  viewMode = signal(true);

  /** Stores the API key entered by the user at runtime (never from environment directly) */
  adminApiKey = signal('');

}