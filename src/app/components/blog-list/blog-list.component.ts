import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Blog } from '../../models/blog';
import { BlogService } from '../../services/blog.service';
import { AlertService } from '../../services/alert.service';
import { BlogEditDrawerComponent } from '../blog-edit-drawer/blog-edit-drawer.component';
import { UpsertBlogItemRequest } from '../../models/requests/upsert-multiple-blogs.request';


import { MaterialModule } from '../../material/material.module';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';

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
    BlogEditDrawerComponent,
    MatPaginatorModule    
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

  isCreateMode = signal(false);

  searchText = signal('');
  deletedBlogIds = signal<number[]>([]);

  pageSize = signal(6);
pageIndex = signal(0);
pageSizeOptions = [6, 9, 12, 18];

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
    this.resetPagination();
  }

  filteredBlogs = computed(() => {
    const search = this.searchText().toLowerCase().trim();

    if (!search) return this.blogs();    

    return this.blogs().filter(blog =>
      blog.name.toLowerCase().includes(search)
    );
  });
paginatedBlogs = computed(() => {
  const start = this.pageIndex() * this.pageSize();
  const end = start + this.pageSize();
  return this.filteredBlogs().slice(start, end);
});

onPageChange(event: PageEvent): void {
  this.pageIndex.set(event.pageIndex);
  this.pageSize.set(event.pageSize);
}

resetPagination(): void {
  this.pageIndex.set(0);
}

onSearchChange(value: string): void {
  this.searchText.set(value);
  this.resetPagination();
}
  createNewBlog(): void {
  const newBlog: Blog = {
    id: 0,
    clientId: crypto.randomUUID(),
    name: '',
    description: '',
    author: '',
    imageUrl: ''
  };

  const cleaned = this.sanitizeBlog({ ...newBlog });

  this.selectedBlog.set(cleaned);
  this.originalEditingBlog.set({ ...cleaned });
  this.imageUrlError.set('');
  this.drawerOpen.set(true);
  this.isCreateMode.set(true);
}

  //  EDIT START
  startEdit(blog: Blog): void {
    const cleaned = this.sanitizeBlog({ ...blog });

    this.selectedBlog.set(cleaned);
    this.originalEditingBlog.set({ ...cleaned });

    this.imageUrlError.set('');
    this.drawerOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  sanitizeBlog(blog: Blog): Blog {
  return {
    ...blog,
    clientId: blog.clientId,
    id: blog.id ?? 0,
    name: blog.name?.trim() ?? '',
    description: blog.description?.trim() ?? '',
    author: blog.author?.trim() ?? '',
    imageUrl: blog.imageUrl?.trim() ?? ''
  };
}

isSameBlog(a: Blog, b: Blog): boolean {
  if ((a.id ?? 0) > 0 && (b.id ?? 0) > 0) {
    return a.id === b.id;
  }

  return !!a.clientId && a.clientId === b.clientId;
}

  //  CALLED FROM CHILD
  addToSaveListFromDrawer(): void {
    this.addToSaveList();
  }

addToSaveList(): void {
  const blog = this.selectedBlog();
  if (!blog) return;

  const cleaned = this.sanitizeBlog(blog);

  if (!this.hasChanges()) {
    this.snackBar.open('Nothing edited', 'Close', { duration: 2500 });
    return;
  }

  if (this.isCreateMode()) {
    this.blogs.update(list => [{ ...cleaned }, ...list]);

    this.editedBlogs.update(list => [{ ...cleaned }, ...list]);

    this.snackBar.open('New blog added to save list', 'Close', { duration: 2000 });

    this.isCreateMode.set(false);
    this.onDrawerClosed();
    return;
  }

  this.editedBlogs.update(list => {
    const index = list.findIndex(b => this.isSameBlog(b, cleaned));

    if (index === -1) return [...list, cleaned];

    const newList = [...list];
    newList[index] = cleaned;
    return newList;
  });

  this.blogs.update(list => {
    const index = list.findIndex(b => this.isSameBlog(b, cleaned));
    if (index === -1) return list;

    const newList = [...list];
    newList[index] = cleaned;
    return newList;
  });

  this.snackBar.open('Added to save list', 'Close', { duration: 2000 });

  this.onDrawerClosed();
  this.resetPagination();
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

  if (edited.length === 0 && deleted.length === 0) {
    return;
  }

  this.loading.set(true);

const payload: UpsertBlogItemRequest[] = edited.map(blog => ({
  id: blog.id ?? 0,
  name: blog.name,
  description: blog.description,
  author: blog.author,
  imageUrl: blog.imageUrl
}));

  //  CASE 1: Only delete
  if (payload.length === 0 && deleted.length > 0) {
    this.blogService.deleteMultiple(deleted)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError()
      });

    return;
  }

  //  CASE 2: Only upsert
  if (payload.length > 0 && deleted.length === 0) {
    this.blogService.upsertMultipleBlogs(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError()
      });

    return;
  }

  // CASE 3: Both upsert + delete
  this.blogService.upsertMultipleBlogs(payload)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.blogService.deleteMultiple(deleted)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.onSaveSuccess(),
            error: () => this.onSaveError()
          });
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
      this.resetPagination();
  }

  delete(blog: Blog): void {
  if (!confirm('Add this blog to delete list?')) return;

  const isUnsavedNewBlog = (blog.id ?? 0) === 0;

  //  If blog is only local (not saved in DB yet),
  // remove it from UI + edited queue only.
  if (isUnsavedNewBlog) {
    this.blogs.update(list =>
      list.filter(item => !this.isSameBlog(item, blog))
    );

    this.editedBlogs.update(list =>
      list.filter(item => !this.isSameBlog(item, blog))
    );

    this.snackBar.open(
      'Unsaved blog removed',
      'Close',
      { duration: 2500 }
    );
    this.resetPagination();
    return;
  }

  //  Existing saved blog → add to delete queue
  this.deletedBlogIds.update(ids => {
    if (ids.includes(blog.id!)) return ids;
    return [...ids, blog.id!];
  });

  this.blogs.update(list =>
    list.filter(item => item.id !== blog.id)
  );

  this.snackBar.open(
    'Added to delete list 🗑️ (Save to confirm)',
    'Close',
    { duration: 2500 }
  );
}

  onDrawerClosed(): void {

  // reset editor state when drawer closes
  this.drawerOpen.set(false);
  this.selectedBlog.set(null);
  this.originalEditingBlog.set(null);
  this.imageUrlError.set('');
  document.body.style.overflow = '';

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