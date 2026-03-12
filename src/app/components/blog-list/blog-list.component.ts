import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute ,Router} from '@angular/router';

import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { AlertService } from '../../services/alert.service';

import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';

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
    IndicatorsModule,
    FormsModule
  ],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

  blogs: Blog[] = [];
  originalBlogs: Blog[] = [];
  loading: boolean = true;

  drawerOpen = false;
  selectedBlog: Blog | null = null;
  originalEditingBlog: Blog | null = null;

  editedBlogs: Blog[] = [];

  imageUrlError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private alert: AlertService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {

  this.blogs = this.route.snapshot.data['blogs'] ?? [];

  // store original copy for comparison
  this.originalBlogs = JSON.parse(JSON.stringify(this.blogs));

  this.loading = false;

}

  /**
   * Open sliding edit panel
   */
  startEdit(blog: Blog): void {

    this.selectedBlog = { ...blog };

    // store original copy
  this.originalEditingBlog = { ...blog };

    // reset validation when opening editor
    this.imageUrlError = '';

    this.drawerOpen = true;
  }

  /**
   * Add edited blog to save list
   */
addToSaveList(): void {

  if (!this.selectedBlog) return;

  // ⭐ Check if anything actually changed
  if (!this.hasChanges()) {

    this.snackBar.open(
      "Nothing edited",
      "Close",
      { duration: 2500 }
    );

    return;
  }

  const index = this.editedBlogs.findIndex(b => b.id === this.selectedBlog!.id);

  if (index === -1) {
    this.editedBlogs.push({ ...this.selectedBlog });
  } else {
    this.editedBlogs[index] = { ...this.selectedBlog };
  }

  // ⭐ Update UI card immediately (preview changes)
  const blogIndex = this.blogs.findIndex(b => b.id === this.selectedBlog!.id);

  if (blogIndex !== -1) {
    this.blogs[blogIndex] = { ...this.selectedBlog };
  }

  this.snackBar.open(
    'Added to save list',
    'Close',
    { duration:2000 }
  );

  this.drawerOpen = false;

}

// ⭐ Check if specific field is edited compared to original
isFieldEdited(blogId: number, field: keyof Blog): boolean {

  const original = this.originalBlogs.find(b => b.id === blogId);
  const current = this.blogs.find(b => b.id === blogId);

  if (!original || !current) return false;

  return original[field] !== current[field];

}
// ⭐ Check if any field has changes compared to original
hasChanges(): boolean {

  if (!this.selectedBlog || !this.originalEditingBlog) return false;

  const normalize = (value: string | undefined | null) =>
    (value ?? '').trim();

  return (
    normalize(this.selectedBlog.name) !== normalize(this.originalEditingBlog.name) ||
    normalize(this.selectedBlog.description) !== normalize(this.originalEditingBlog.description) ||
    normalize(this.selectedBlog.author) !== normalize(this.originalEditingBlog.author) ||
    normalize(this.selectedBlog.imageUrl) !== normalize(this.originalEditingBlog.imageUrl)
  );

}

cancelEdit(): void {

  if (this.hasChanges()) {

    const confirmClose = confirm(
      "You have unsaved changes. Do you really want to cancel?"
    );

    if (!confirmClose) return;

  }

  this.drawerOpen = false;
  this.selectedBlog = null;
  this.originalEditingBlog = null;

}

  /**
   * Save all edited blogs
   */
saveAll(): void {

  if (this.editedBlogs.length === 0) {
    return;
  }

  this.loading = true;

  this.blogService.updateMultipleBlogs(this.editedBlogs).subscribe({

    next: () => {

      this.snackBar.open(
        'All changes saved successfully ✅',
        'Close',
        { duration: 3000 }
      );

      // Reload latest data from server
      setTimeout(() => {
        // Reset edited blogs
      this.editedBlogs = [];

      // Update original snapshot so highlight disappears
      this.originalBlogs = JSON.parse(JSON.stringify(this.blogs));
        this.loadBlogs();
      });

    },

    error: () => {

      this.loading = false;

      this.snackBar.open(
        'Failed to update blogs',
        'Close',
        { duration: 3000 }
      );

    }

  });

}

  /**
   * Validate image URL format
   */
validateImageUrl(): void {

  if (!this.selectedBlog?.imageUrl) {
    this.imageUrlError = '';
    return;
  }

  try {
    new URL(this.selectedBlog.imageUrl);
    this.imageUrlError = '';
  } catch {
    this.imageUrlError = "Invalid Image URL";
  }

}

  /**
   * Handle broken image link
   */
  onImageError(): void {
    this.imageUrlError = "Invalid Image URL";
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
        this.cdr.markForCheck();
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