import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albumsOutline, appsOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonApp, IonRouterOutlet, IonIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor() {
    addIcons({ albumsOutline, appsOutline, logInOutline });
    document.title = "Click Fix Check";
  }
}
