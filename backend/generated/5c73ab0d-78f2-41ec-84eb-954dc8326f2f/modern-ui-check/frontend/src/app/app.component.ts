import { Component } from '@angular/core';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albumsOutline, appsOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor() {
    addIcons({ albumsOutline, appsOutline, logInOutline });
    document.title = "Modern Ui Check";
  }
}
