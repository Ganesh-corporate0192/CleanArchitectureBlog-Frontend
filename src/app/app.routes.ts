import { Routes } from '@angular/router';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { BlogCreateComponent } from './components/blog-create/blog-create.component';
import { BlogEditComponent } from './components/blog-edit/blog-edit.component';
import { BlogListResolver } from './resolvers/blog-list.resolver';

export const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
    resolve: { blogs: BlogListResolver }   // ✅ FIX
  },
  {
    path: 'create',
    component: BlogCreateComponent
  },
  {
    path: 'edit/:id',
    component: BlogEditComponent
  }
];