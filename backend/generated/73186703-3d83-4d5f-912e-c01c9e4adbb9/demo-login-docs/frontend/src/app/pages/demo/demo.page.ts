import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton],
  templateUrl: './demo.page.html',
  styleUrl: './demo.page.scss'
})
export class DemoPage {
  readonly screens = [
  {
    "name": "Users",
    "route": "/users",
    "description": "CRUD complet pour la table users"
  }
];
}
