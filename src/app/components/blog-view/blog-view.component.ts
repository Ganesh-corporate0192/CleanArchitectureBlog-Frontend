import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Kendo
import { LoaderModule } from '@progress/kendo-angular-indicators';

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  imports: [CommonModule, MaterialModule, MatCardModule, MatButtonModule, MatDividerModule, LoaderModule],
  styleUrls: ['./blog-view.component.css']
})
export class BlogViewComponent implements OnInit {

  blog = signal<Blog | null>(null);
loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  this.blogService.getById(id).subscribe({
    next: (res) => {
      this.blog.set(res); 
      this.loading.set(false);
    },
    error: () => {
      this.loading.set(false);
    }
  });
} 

  goBack() {
    this.router.navigate(['/']);
  }
}