import { Injectable } from '@angular/core';
import { BlogService } from '../services/blog.service';


@Injectable({ providedIn: 'root' })
export class BlogListResolver {

  constructor(private service: BlogService) {}

  resolve() {
    return this.service.getAll();   // ✅ API call BEFORE page loads
  }
}