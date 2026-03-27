import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog } from '../models/blog';
import { UpsertBlogItemRequest } from '../models/requests/upsert-multiple-blogs.request';
import { UpsertMultipleBlogsResponse } from '../models/responses/upsert-multiple-blogs.response';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl = 'http://localhost:5020/Blogs';

  constructor(private http: HttpClient) {}

  // GET
  getAll(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/GetAll`);
  }

  getById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/GetById/${id}`);
  }

  // CREATE
  create(blog: Blog): Observable<Blog> {
    return this.http.post<Blog>(`${this.baseUrl}/Create`, blog);
  }

  // UPDATE
  update(blog: Blog): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/Update`, blog);
  }


  // UPSERT
  upsertMultipleBlogs(
    blogs: UpsertBlogItemRequest[]
  ): Observable<UpsertMultipleBlogsResponse> {
    return this.http.post<UpsertMultipleBlogsResponse>(
      `${this.baseUrl}/UpsertMultiple`,
      blogs
    );
  }

  // DELETE
  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/Delete/${id}`);
  }

  deleteMultiple(ids: number[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/DeleteMultiple`, ids);
  }
}