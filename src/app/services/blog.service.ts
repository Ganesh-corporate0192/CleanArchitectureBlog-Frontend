import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogResponse, CreateBlogCommand, UpdateBlogCommand } from '../models/blog';
import { UpsertBlogItemRequest } from '../models/requests/upsert-multiple-blogs.request';
import { UpsertMultipleBlogsResponse } from '../models/responses/upsert-multiple-blogs.response';
import { UiStateService } from './ui-state.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl = '/api/Blogs';

  constructor(private http: HttpClient, private uiState: UiStateService) {}

  private get apiKeyHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-Api-Key': this.uiState.adminApiKey() });
  }

  // GET — no API key required
  getAll(): Observable<BlogResponse[]> {
    return this.http.get<BlogResponse[]>(`${this.baseUrl}/GetAll`);
  }

  getById(id: number): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.baseUrl}/GetById/${id}`);
  }

  // CREATE — requires API key
  create(blog: CreateBlogCommand): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/Create`, blog, { headers: this.apiKeyHeaders });
  }

  // UPDATE — requires API key
  update(blog: UpdateBlogCommand): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/Update`, blog, { headers: this.apiKeyHeaders });
  }

  // UPSERT — requires API key
  upsertMultipleBlogs(blogs: UpsertBlogItemRequest[]): Observable<UpsertMultipleBlogsResponse> {
    return this.http.post<UpsertMultipleBlogsResponse>(
      `${this.baseUrl}/UpsertMultiple`,
      blogs,
      { headers: this.apiKeyHeaders }
    );
  }

  // DELETE — requires API key
  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/Delete/${id}`, { headers: this.apiKeyHeaders });
  }

  deleteMultiple(ids: number[]): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/DeleteMultiple`, ids, { headers: this.apiKeyHeaders });
  }
}