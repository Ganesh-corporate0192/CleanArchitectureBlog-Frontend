import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog } from '../models/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl = 'http://localhost:5020/Blogs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/GetAll`);
  }

  getById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/GetById/${id}`);
  }

  create(blog: Blog): Observable<any> {
    return this.http.post(`${this.baseUrl}/Create`, blog);
  }

  update(id: number, blog: Blog): Observable<any> {
    return this.http.put(`${this.baseUrl}/Update`, blog);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`);
  }
}