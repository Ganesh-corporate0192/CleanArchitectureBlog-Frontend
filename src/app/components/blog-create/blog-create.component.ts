import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { MaterialModule } from '../../material/material.module';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, MatSnackBarModule],
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
  imageUrlError = '';

  constructor(
    private blogService: BlogService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Trim all values before sending to backend
   */
  sanitizeBlog(blog: Blog): Blog {
    return {
      ...blog,
      name: blog.name?.trim() ?? '',
      description: blog.description?.trim() ?? '',
      author: blog.author?.trim() ?? '',
      imageUrl: blog.imageUrl?.trim() ?? ''
    };
  }

  /**
   * Validate URL format
   */
  validateImageUrl(): void {

    if (!this.blog.imageUrl) {
      this.imageUrlError = '';
      return;
    }

    try {
      new URL(this.blog.imageUrl);
      this.imageUrlError = '';
    } catch {
      this.imageUrlError = 'Invalid Image URL';
    }

  }

  /**
   * Detect broken images
   */
  onImageError(): void {
    this.imageUrlError = 'Invalid Image URL';
  }

  /**
   * Submit blog
   */
  submit(): void {

    if (this.imageUrlError) {
      return;
    }

    this.loading = true;

    const cleanedBlog = this.sanitizeBlog(this.blog);

    this.blogService.create(cleanedBlog).subscribe({

      next: () => {

        this.loading = false;

        this.snackBar.open(
          'Blog created successfully ✅',
          'Close',
          { duration: 3000 }
        );

        this.router.navigate(['/']);

      },

      error: (error) => {

        this.loading = false;

        this.imageUrlError = '';

        const backendErrors = this.getBackendErrors(error);

        const imageError = backendErrors.find(e =>
          e.toLowerCase().includes('image')
        );

        if (imageError) {
          this.imageUrlError = imageError;
        }

      }

    });

  }

  /**
   * Extract backend validation errors
   */
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