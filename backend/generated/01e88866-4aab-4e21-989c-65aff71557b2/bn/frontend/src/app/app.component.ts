import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly appTitle = "Bn";
  readonly links = [
    { label: 'Demo', path: '/demo' },
    { label: "Categorie", path: '/categorie' },
    { label: "Utilisateur", path: '/utilisateur' },
    { label: 'Login', path: '/login' }
  ];

  constructor() {
    document.title = this.appTitle;
  }
}
