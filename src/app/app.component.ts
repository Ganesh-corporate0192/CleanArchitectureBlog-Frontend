import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div style="padding:20px;">
      <h1>Clean Architecture Blog</h1>

      <nav style="margin-bottom:20px;">
        <a routerLink="/">Home</a> |
        <a routerLink="/create">Create Blog</a>
      </nav>

      <hr>

      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}