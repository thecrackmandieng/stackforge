import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { DemoPage } from './pages/demo/demo.page';
import { CategoriePage } from './pages/categorie/categorie.page';
import { UtilisateurPage } from './pages/utilisateur/utilisateur.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'demo', component: DemoPage },
  { path: 'categorie', component: CategoriePage },
  { path: 'utilisateur', component: UtilisateurPage },
  { path: '**', redirectTo: 'login' }
];
