import { Injectable } from '@angular/core';
import { BlogService } from '../services/blog.service';
import { Blog } from '../models/blog';

@Injectable({ providedIn: 'root' })
export class BlogListResolver {

  constructor(private service: BlogService) {}

  resolve() {
    return this.service.getAll();   // ✅ API call BEFORE page loads
  }
}