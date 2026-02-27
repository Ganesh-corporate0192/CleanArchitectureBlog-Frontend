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
    // ✅ DATA COMES FROM RESOLVER (SAFE ON REFRESH)
    this.blogs = this.route.snapshot.data['blogs'];
  }

  delete(id: number): void {
  if (!confirm('Are you sure you want to delete this blog?')) {
    return;
  }

  this.blogService.delete(id).subscribe({
    next: () => {
      this.alert.success('Blog deleted successfully 🗑️');
      this.blogService.getAll().subscribe(data => {
        this.blogs = data;
      });
    },
    error: (err) => {
      console.error(err);
      this.alert.error('Failed to delete blog ❌');
    }
  });
}
}