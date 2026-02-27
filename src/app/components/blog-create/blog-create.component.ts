import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './blog-create.component.html'
})
export class BlogCreateComponent {

  blog: Blog = {
    name: '',
    description: '',
    author: '',
    imageUrl: ''
  };

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  submit() {
    this.blogService.create(this.blog).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}