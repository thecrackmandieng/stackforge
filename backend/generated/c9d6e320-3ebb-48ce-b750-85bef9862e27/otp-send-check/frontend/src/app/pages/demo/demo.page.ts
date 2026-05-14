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
    { name: "Clients", route: '/clients', description: 'CRUD pour la table clients' }
  ];
}
