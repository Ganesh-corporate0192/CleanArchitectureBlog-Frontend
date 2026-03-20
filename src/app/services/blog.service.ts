import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Blog } from '../models/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl = 'http://localhost:5020/Blogs';

  // ⭐ Local state using signal
  blogs = signal<Blog[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Fetch all blogs once and store in signal
   */
  getAll(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/GetAll`).pipe(
      tap(data => this.blogs.set(data))
    );
  }

  /**
   * Get blog by id
   */
  getById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/GetById/${id}`);
  }

  /**
   * Create blog
   * Adds new blog to local signal to avoid extra API call
   */
  create(blog: Blog): Observable<Blog> {
    return this.http.post<Blog>(`${this.baseUrl}/Create`, blog).pipe(
      tap(newBlog => {
        this.blogs.update(list => [...list, newBlog]);
      })
    );
  }

  /**
   * Update single blog
   */
  update(id: number, blog: Blog): Observable<any> {
    return this.http.put(`${this.baseUrl}/Update`, blog).pipe(
      tap(() => {
        this.blogs.update(list =>
          list.map(b => b.id === id ? blog : b)
        );
      })
    );
  }

  /**
   * Update multiple blogs
   */
  updateMultipleBlogs(blogs: Blog[]) {
    return this.http.put(`${this.baseUrl}/UpdateMultiple`, blogs).pipe(
      tap(() => {
        this.blogs.update(list =>
          list.map(b => {
            const updated = blogs.find(x => x.id === b.id);
            return updated ? updated : b;
          })
        );
      })
    );
  }
upsertMultipleBlogs(blogs: any[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/UpsertMultiple`, blogs);
}
  /**
   * Delete blog
   * Removes blog locally instead of calling getAll again
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`).pipe(
      tap(() => {
        this.blogs.update(list => list.filter(b => b.id !== id));
      })
    );
  }


  deleteMultiple(ids: number[]) {
  return this.http.post(`${this.baseUrl}/DeleteMultiple`, ids).pipe(
    tap(() => {
      // update local state like your other methods
      this.blogs.update(list =>
        list.filter(blog => !ids.includes(blog.id!))
      );
    })
  );
}
}