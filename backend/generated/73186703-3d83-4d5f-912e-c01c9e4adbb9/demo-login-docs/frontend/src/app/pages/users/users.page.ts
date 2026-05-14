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
import { Users } from './users.model';
import { UsersService } from './users.service';

type FormState = Record<string, string | number | boolean | null>;

@Component({
  selector: 'app-users',
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
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss'
})
export class UsersPage implements OnInit {
  items: Users[] = [];
  selected: Users | null = null;
  loading = false;
  error = '';
  form: FormState = this.createEmptyForm();

  constructor(private service: UsersService) {}

  ngOnInit(): void {
    void this.load();
  }

  createEmptyForm(): FormState {
    return {
    name: '',
    email: ''
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

  edit(item: Users): void {
    this.selected = item;
    this.form = {
      name: item.name,
      email: item.email
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
        await this.service.update(this.selected.id, this.form as Partial<Users>);
      } else {
        await this.service.create(this.form as Partial<Users>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible';
    } finally {
      this.loading = false;
    }
  }

  async delete(item: Users): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      await this.service.delete(item.id);
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Suppression impossible';
    } finally {
      this.loading = false;
    }
  }
}
