import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
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
  @Input() opened = false;

  @Output() save = new EventEmitter<Blog>();
  @Output() close = new EventEmitter<void>();

  imageUrlError = signal('');

  validateImageUrl() {
    if (!this.blog?.imageUrl) return;

    try {
      new URL(this.blog.imageUrl);
      this.imageUrlError.set('');
    } catch {
      this.imageUrlError.set('Invalid URL');
    }
  }

  submit() {
    if (!this.blog || this.imageUrlError()) return;
    this.save.emit({ ...this.blog });
  }

  cancel() {
    this.close.emit();
  }
}