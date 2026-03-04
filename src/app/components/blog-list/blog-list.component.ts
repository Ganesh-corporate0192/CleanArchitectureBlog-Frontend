import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

  blogs: Blog[] = [];

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    // ✅ Resolver data (works on refresh & first load)
    this.blogs = this.route.snapshot.data['blogs'] ?? [];
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    this.blogService.delete(id).subscribe({
      next: () => {
        this.alert.success('Blog deleted successfully 🗑️');

        // Reload list after delete
        this.blogService.getAll().subscribe(data => {
          this.blogs = data;
        });
      },
      error: (error) => {
        // ❌ NO console.error
        const message = this.extractErrorMessage(error);
        this.alert.error(message);
      }
    });
  }

  // 🔥 Centralized backend error handling
  private extractErrorMessage(error: any): string {

    // Case 1: Swagger-style validation errors (array)
    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join(', ');
    }

    // Case 2: ASP.NET ModelState errors (object)
    if (error?.error?.errors && typeof error.error.errors === 'object') {
      return Object.values(error.error.errors).flat().join(', ');
    }

    // Case 3: Backend message
    if (error?.error?.message) {
      return error.error.message;
    }

    // Fallback
    return 'Failed to delete blog. Please try again.';
  }
}