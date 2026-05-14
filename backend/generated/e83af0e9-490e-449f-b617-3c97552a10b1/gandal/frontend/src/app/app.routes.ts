import { Routes } from '@angular/router';
import { CategoriePage } from './pages/categorie/categorie.page';
import { UtilisateurPage } from './pages/utilisateur/utilisateur.page';

export const routes: Routes = [
  { path: '', redirectTo: 'categorie', pathMatch: 'full' },
  { path: 'categorie', component: CategoriePage },
  { path: 'utilisateur', component: UtilisateurPage },
  { path: '**', redirectTo: 'categorie' }
];
