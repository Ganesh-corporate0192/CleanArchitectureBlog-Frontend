import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],  // ⚠ VERY IMPORTANT
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {

  blogs: Blog[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs() {
    this.blogService.getAll().subscribe(data => {
      console.log("API Data:", data);
      this.blogs = data;
    });
  }

  delete(id: number) {
    this.blogService.delete(id).subscribe(() => {
      this.loadBlogs();
    });
  }
}