import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.css']
})
export class BlogCreateComponent {

  blog: Blog = {
    id: 0,
    name: '',
    description: '',
    author: '',
    imageUrl: ''
  };

  loading = false;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private alert: AlertService        // ✅ ALERT SERVICE
  ) {}

  submit(): void {
    this.loading = true;

    this.blogService.create(this.blog).subscribe({
      next: () => {
        this.loading = false;
        this.alert.success('Blog created successfully ✅');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.alert.error('Failed to create blog ❌');
      }
    });
  }
}