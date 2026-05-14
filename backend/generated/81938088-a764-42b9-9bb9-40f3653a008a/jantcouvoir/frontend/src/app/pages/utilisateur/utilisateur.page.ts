import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Utilisateur } from './utilisateur.model';
import { UtilisateurService } from './utilisateur.service';

type FormState = Record<string, string | number | boolean | null>;

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons
  ],
  templateUrl: './utilisateur.page.html',
  styleUrl: './utilisateur.page.scss'
})
export class UtilisateurPage implements OnInit {
  items: Utilisateur[] = [];
  selected: Utilisateur | null = null;
  loading = false;
  error = '';
  form: FormState = this.createEmptyForm();

  constructor(private service: UtilisateurService) {}

  ngOnInit(): void {
    void this.load();
  }

  createEmptyForm(): FormState {
    return {
    nom: '',
    email: '',
    password: '',
    created_at: ''
    };
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.items = await this.service.list();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erreur inconnue';
    } finally {
      this.loading = false;
    }
  }

  edit(item: Utilisateur): void {
    this.selected = item;
    this.form = {
      nom: item.nom,
      email: item.email,
      password: item.password,
      created_at: item.createdAt
    };
  }

  cancel(): void {
    this.selected = null;
    this.form = this.createEmptyForm();
  }

  async save(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      if (this.selected) {
        await this.service.update(this.selected.idUtilisateur, this.form as Partial<Utilisateur>);
      } else {
        await this.service.create(this.form as Partial<Utilisateur>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible';
    } finally {
      this.loading = false;
    }
  }

  async delete(item: Utilisateur): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      await this.service.delete(item.idUtilisateur);
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Suppression impossible';
    } finally {
      this.loading = false;
    }
  }
}
