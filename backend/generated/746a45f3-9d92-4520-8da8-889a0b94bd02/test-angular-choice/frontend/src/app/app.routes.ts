import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DemoPage } from './pages/demo/demo.page';
import { ClientsPage } from './pages/clients/clients.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'demo', component: DemoPage },
  { path: 'clients', component: ClientsPage },
  { path: '**', redirectTo: 'login' }
];
