import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog } from '../../models/blog';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-blog-edit-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './blog-edit-drawer.component.html'
})
export class BlogEditDrawerComponent {

  @Input() blog: Blog | null = null;
  @Input() imageUrlError: string = '';
  @Input() hasChanges: boolean = false;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() validate = new EventEmitter<void>();
  @Output() imageError = new EventEmitter<void>();
}