import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertMessage } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  alert?: AlertMessage;
  visible = false;
  private timeoutId: any;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.alert$.subscribe(alert => {
      // Clear any existing alert timer
      clearTimeout(this.timeoutId);

      this.alert = alert;
      this.visible = true;

      // ⏱ AUTO-DISMISS AFTER 5 SECONDS
      this.timeoutId = setTimeout(() => {
        this.visible = false;
      }, 5000);
    });
  }
}