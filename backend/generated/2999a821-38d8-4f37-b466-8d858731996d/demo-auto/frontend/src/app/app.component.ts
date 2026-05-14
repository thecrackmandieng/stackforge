import { Component } from '@angular/core';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albumsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor() {
    addIcons({ albumsOutline });
    document.title = "Demo Auto";
  }
}
