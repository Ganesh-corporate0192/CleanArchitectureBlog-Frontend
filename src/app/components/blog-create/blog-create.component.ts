import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { AlertService } from '../../services/alert.service';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, FormsModule,MaterialModule],
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
  imageUrlError = '';
  submit(): void {
  this.loading = true;

  this.blogService.create(this.blog).subscribe({
    next: () => {
      this.loading = false;
      this.alert.success('Blog created successfully ✅');
      this.router.navigate(['/']);
    },
   error: (error) => {
  this.loading = false;

  this.imageUrlError = ''; // reset

  const backendErrors = this.getBackendErrors(error);

  // Show popup
  this.alert.error(backendErrors.join('\n'));

  // Show below ImageUrl input
  const imageError = backendErrors.find(e =>
    e.toLowerCase().includes('image')
  );

  if (imageError) {
    this.imageUrlError = imageError;
  }
}
  });
}

private getBackendErrors(error: any): string[] {

  if (error?.error?.errors && Array.isArray(error.error.errors)) {
    return error.error.errors;
  }

  if (error?.error?.errors && typeof error.error.errors === 'object') {
    return Object.values(error.error.errors).flat() as string[];
  }

  return ['Invalid input'];
}
// private extractBackendErrors(error: any): string {

//   // FluentValidation array style
//   if (error?.error?.errors && Array.isArray(error.error.errors)) {
//     return error.error.errors.join('\n');
//   }

//   // FluentValidation ModelState style
//   if (error?.error?.errors && typeof error.error.errors === 'object') {
//     return Object.values(error.error.errors).flat().join('\n');
//   }

//   return 'Invalid input. Please check your data.';
// }
}