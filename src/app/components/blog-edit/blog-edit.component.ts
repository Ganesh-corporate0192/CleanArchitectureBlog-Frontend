import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-blog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {

  blog: Blog = {
    id: 0,
    name: '',
    description: '',
    author: '',
    imageUrl: ''
  };

  id!: number;
  loading = false;

  // 🔥 Field-level error
  imageUrlError = '';

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private router: Router,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
      if (!this.id) {
        this.alert.error('Invalid blog id');
        return;
      }

      this.blogService.getById(this.id).subscribe({
        next: (data) => {
          this.blog.id = data.id;
          this.blog.name = data.name;
          this.blog.description = data.description;
          this.blog.author = data.author;
          this.blog.imageUrl = data.imageUrl;
        },
        error: () => {
          this.alert.error('Failed to load blog');
        }
      });
    });
  }

  update(): void {
    this.loading = true;
    this.imageUrlError = ''; // reset

    this.blogService.update(this.id, this.blog).subscribe({
      next: () => {
        this.loading = false;
        this.alert.success('Blog updated successfully ✅');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;

        const backendErrors = this.getBackendErrors(error);

        // Popup alert
        this.alert.error(backendErrors.join('\n'));

        // Inline ImageUrl error
        const imageError = backendErrors.find(e =>
          e.toLowerCase().includes('image')
        );

        if (imageError) {
          this.imageUrlError = imageError;
        }
      }
    });
  }

  // 🔧 Backend error extractor
  private getBackendErrors(error: any): string[] {

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors;
    }

    if (error?.error?.errors && typeof error.error.errors === 'object') {
      return Object.values(error.error.errors).flat() as string[];
    }

    return ['Invalid input'];
  }
}