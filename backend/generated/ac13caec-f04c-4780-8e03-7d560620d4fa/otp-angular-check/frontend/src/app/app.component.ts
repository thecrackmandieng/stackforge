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
  readonly appTitle = "Otp Angular Check";
  readonly links = [
    { label: 'Demo', path: '/demo' },
    { label: "Clients", path: '/clients' },
    { label: 'Login', path: '/login' }
  ];

  constructor() {
    document.title = this.appTitle;
  }
}
