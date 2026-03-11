import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute ,Router} from '@angular/router';

import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { AlertService } from '../../services/alert.service';

import { MaterialModule } from '../../material/material.module';

import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';

import { switchMap } from 'rxjs/operators';

import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar,MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSnackBarModule,    
    MaterialModule,
    LayoutModule,
    ButtonsModule,
    IndicatorsModule    
  ],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

  blogs: Blog[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private alert: AlertService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {

    // Resolver data (first load)
    this.blogs = this.route.snapshot.data['blogs'] ?? [];

    this.loading = false;
  }

  /**
   * Reload blogs from API
   */
  loadBlogs(): void {

    this.loading = true;

    this.blogService.getAll().subscribe({

      next: (data) => {
        this.blogs = data;
        this.loading = false;
        this.cdr.markForCheck();  // Ensure view updates after async data load
      },

      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load blogs. Please try again.', 'Close', {
          duration: 3000
        });
        this.cdr.markForCheck();
      }

    });
  }

delete(id: number): void {

  if (!confirm('Are you sure you want to delete this blog?')) {
    return;
  }

  this.loading = true;

  this.blogService.delete(id).pipe(

    switchMap(() => {
      this.snackBar.open('Blog deleted successfully ✅', 'Close', {
        duration: 3000
      });
      return this.blogService.getAll();
    })

  ).subscribe({

    next: (blogs) => {
      this.blogs = blogs;
      this.loading = false;
      this.cdr.markForCheck();
    },

    error: (error) => {
      this.loading = false;
      const message = this.extractErrorMessage(error);
      this.alert.error(message);
    }

  });

}

  /**
   * Centralized backend error handling
   */
  private extractErrorMessage(error: any): string {

    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join(', ');
    }

    if (error?.error?.errors && typeof error.error.errors === 'object') {
      return Object.values(error.error.errors).flat().join(', ');
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    return 'Failed to delete blog. Please try again.';
  }

}