import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Categorie } from './categorie.model';
import { CategorieService } from './categorie.service';

type FormState = Record<string, string | number | boolean | null>;

@Component({
  selector: 'app-categorie',
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
    IonButton
  ],
  templateUrl: './categorie.page.html',
  styleUrl: './categorie.page.scss'
})
export class CategoriePage implements OnInit {
  items: Categorie[] = [];
  selected: Categorie | null = null;
  loading = false;
  error = '';
  form: FormState = this.createEmptyForm();

  constructor(private service: CategorieService) {}

  ngOnInit(): void {
    void this.load();
  }

  createEmptyForm(): FormState {
    return {
    nom_categorie: '',
    description: '',
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

  edit(item: Categorie): void {
    this.selected = item;
    this.form = {
      nom_categorie: item.nomCategorie,
      description: item.description,
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
        await this.service.update(this.selected.idCategorie, this.form as Partial<Categorie>);
      } else {
        await this.service.create(this.form as Partial<Categorie>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible';
    } finally {
      this.loading = false;
    }
  }

  async delete(item: Categorie): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      await this.service.delete(item.idCategorie);
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Suppression impossible';
    } finally {
      this.loading = false;
    }
  }
}
