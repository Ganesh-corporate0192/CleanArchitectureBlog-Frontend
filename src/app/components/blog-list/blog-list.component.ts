import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { AlertService } from '../../services/alert.service';
import { BlogEditDrawerComponent } from '../blog-edit-drawer/blog-edit-drawer.component';

import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';

import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

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
    FormsModule,
    BlogEditDrawerComponent // ✅ IMPORTANT
  ],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {

  blogs = signal<Blog[]>([]);
  originalBlogs = signal<Blog[]>([]);
  loading = signal<boolean>(true);

  drawerOpen = signal(false);
  selectedBlog = signal<Blog | null>(null);
  originalEditingBlog = signal<Blog | null>(null);

  editedBlogs = signal<Blog[]>([]);
  imageUrlError = signal('');

  searchText = signal('');
  deletedBlogIds = signal<number[]>([]);
  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private alert: AlertService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data['blogs'] ?? [];

    this.blogs.set(data);
    this.originalBlogs.set(JSON.parse(JSON.stringify(data)));
    this.loading.set(false);
  }

  filteredBlogs = computed(() => {
    const search = this.searchText().toLowerCase().trim();

    if (!search) return this.blogs();

    return this.blogs().filter(blog =>
      blog.name.toLowerCase().includes(search)
    );
  });

  // 🔥 EDIT START
  startEdit(blog: Blog): void {
    const cleaned = this.sanitizeBlog({ ...blog });

    this.selectedBlog.set(cleaned);
    this.originalEditingBlog.set({ ...cleaned });

    this.imageUrlError.set('');
    this.drawerOpen.set(true);
  }

  sanitizeBlog(blog: Blog): Blog {
    return {
      ...blog,
      name: blog.name?.trim() ?? '',
      description: blog.description?.trim() ?? '',
      author: blog.author?.trim() ?? '',
      imageUrl: blog.imageUrl?.trim() ?? ''
    };
  }

  // 🔥 CALLED FROM CHILD
  addToSaveListFromDrawer(): void {
    this.addToSaveList();
  }

  addToSaveList(): void {
    const blog = this.selectedBlog();
    if (!blog) return;

    const cleaned = this.sanitizeBlog(blog);

    if (!this.hasChanges()) {
      this.snackBar.open("Nothing edited", "Close", { duration: 2500 });
      return;
    }

    this.editedBlogs.update(list => {
      const index = list.findIndex(b => b.id === cleaned.id);

      if (index === -1) return [...list, cleaned];

      const newList = [...list];
      newList[index] = cleaned;
      return newList;
    });

    this.blogs.update(list => {
      const index = list.findIndex(b => b.id === cleaned.id);
      if (index === -1) return list;

      const newList = [...list];
      newList[index] = cleaned;
      return newList;
    });

    this.snackBar.open('Added to save list', 'Close', { duration: 2000 });

    this.drawerOpen.set(false);
  }

  hasChanges(): boolean {
    const edited = this.selectedBlog();
    const original = this.originalEditingBlog();

    if (!edited || !original) return false;

    const normalize = (v: string | undefined | null) => (v ?? '').trim();

    return (
      normalize(edited.name) !== normalize(original.name) ||
      normalize(edited.description) !== normalize(original.description) ||
      normalize(edited.author) !== normalize(original.author) ||
      normalize(edited.imageUrl) !== normalize(original.imageUrl)
    );
  }

  cancelEdit(): void {
    if (this.hasChanges()) {
      const confirmClose = confirm("You have unsaved changes. Do you really want to cancel?");
      if (!confirmClose) return;
    }

    this.drawerOpen.set(false);
    this.selectedBlog.set(null);
    this.originalEditingBlog.set(null);
  }

  isFieldEdited(blogId: number, field: keyof Blog): boolean {
    const original = this.originalBlogs().find(b => b.id === blogId);
    const current = this.blogs().find(b => b.id === blogId);

    if (!original || !current) return false;

    return original[field] !== current[field];
  }

  saveAll(): void {
    const edited = this.editedBlogs();
    const deleted = this.deletedBlogIds();

    if (edited.length === 0 && deleted.length === 0) return;

    this.loading.set(true);

    this.blogService.updateMultipleBlogs(edited)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (deleted.length > 0) {
            this.blogService.deleteMultiple(deleted)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => this.onSaveSuccess(),
                error: () => this.onSaveError()
              });
          } else {
            this.onSaveSuccess();
          }
        },
        error: () => this.onSaveError()
      });
  }

  private onSaveSuccess(): void {
    this.snackBar.open('Changes saved successfully ✅', 'Close', { duration: 3000 });
    this.editedBlogs.set([]);
    this.deletedBlogIds.set([]);
    this.loadBlogs();
  }

  private onSaveError(): void {
    this.loading.set(false);
    this.snackBar.open('Failed to save changes ❌', 'Close', { duration: 3000 });
  }

  loadBlogs(): void {
    this.loading.set(true);

    this.blogService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.blogs.set(data);
          this.originalBlogs.set(JSON.parse(JSON.stringify(data)));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('Failed to load blogs', 'Close', { duration: 3000 });
        }
      });
  }

  delete(id: number): void {
    if (!confirm('Add this blog to delete list?')) return;

    this.deletedBlogIds.update(ids =>
      ids.includes(id) ? ids : [...ids, id]
    );

    this.blogs.update(list => list.filter(b => b.id !== id));
  }

  onDrawerClosed(): void {

  // reset editor state when drawer closes
  this.drawerOpen.set(false);
  this.selectedBlog.set(null);
  this.originalEditingBlog.set(null);
  this.imageUrlError.set('');

}
  validateImageUrl(): void {

  const blog = this.selectedBlog();

  if (!blog?.imageUrl) {
    this.imageUrlError.set('');
    return;
  }

  try {
    new URL(blog.imageUrl);
    this.imageUrlError.set('');
  } catch {
    this.imageUrlError.set("Invalid Image URL");
  }

}

onImageError(): void {
  this.imageUrlError.set("Invalid Image URL");
}
}