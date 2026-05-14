import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss'
})
export class DemoPage {
  readonly screens = [
    { name: "Categorie", route: '/categorie', description: 'CRUD pour la table categorie' },
    { name: "Utilisateur", route: '/utilisateur', description: 'CRUD pour la table utilisateur' }
  ];
}
