import { Routes } from '@angular/router';
import { BlogListComponent } from './components/blog-list/blog-list.component';
//import { BlogCreateComponent } from './components/blog-create/blog-create.component';
import { BlogListResolver } from './resolvers/blog-list.resolver';
import { BlogViewComponent } from './components/blog-view/blog-view.component';

export const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
    resolve: { blogs: BlogListResolver }   
  },
  {
  path: 'blogs/view/:id',
    component: BlogViewComponent
  }

];