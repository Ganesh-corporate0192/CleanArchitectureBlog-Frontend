import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-blog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {

  blog: Blog = {
    id: 0,
    name: '',
    description: '',
    author: '',
    imageUrl: ''
  };

  id!: number;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private router: Router,
    private alert: AlertService        // ✅ ALERT SERVICE
  ) {}

  ngOnInit(): void {
    console.log('BlogEditComponent loaded');

    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
      console.log('Route id:', this.id);

      if (!this.id) {
        this.alert.error('Invalid blog id');
        return;
      }

      this.loading = true;

      this.blogService.getById(this.id).subscribe({
        next: (data) => {
          console.log('API RESPONSE:', data);

          // ✅ Mutate existing object (keeps ngModel binding)
          this.blog.id = data.id;
          this.blog.name = data.name;
          this.blog.description = data.description;
          this.blog.author = data.author;
          this.blog.imageUrl = data.imageUrl;

          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.alert.error('Failed to load blog details');
        }
      });
    });
  }

  update(): void {
    this.loading = true;

    this.blogService.update(this.id, this.blog).subscribe({
      next: () => {
        this.loading = false;
        this.alert.success('Blog updated successfully ✅');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.alert.error('Failed to update blog ❌');
      }
    });
  }
}