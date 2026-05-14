import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DemoPage } from './pages/demo/demo.page';
import { UsersPage } from './pages/users/users.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'demo', component: DemoPage },
  { path: 'users', component: UsersPage },
  { path: '**', redirectTo: 'login' }
];
