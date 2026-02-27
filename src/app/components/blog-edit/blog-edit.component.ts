import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';   // ✅ ADD THIS
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';

@Component({
  selector: 'app-blog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],   // ✅ ADD CommonModule here
  templateUrl: './blog-edit.component.html'
})
export class BlogEditComponent implements OnInit {

  blog!: Blog;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {

  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));

    if (!id) return;

    console.log("Route ID:", id);

    this.blogService.getById(id).subscribe({
      next: (data) => {
        console.log("API Data:", data);
        this.blog = { ...data };  // spread ensures fresh object
      },
      error: (err) => {
        console.error(err);
      }
    });

  });
}

  update() {
    this.blogService.update(this.id,this.blog).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}