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
import { Customers } from './customers.model';
import { CustomersService } from './customers.service';

type FormState = Record<string, string | number | boolean | null>;

@Component({
  selector: 'app-customers',
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
  templateUrl: './customers.page.html',
  styleUrl: './customers.page.scss'
})
export class CustomersPage implements OnInit {
  items: Customers[] = [];
  selected: Customers | null = null;
  loading = false;
  error = '';
  form: FormState = this.createEmptyForm();

  constructor(private service: CustomersService) {}

  ngOnInit(): void {
    void this.load();
  }

  createEmptyForm(): FormState {
    return {
    name: '',
    email: '',
    phone: '',
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

  edit(item: Customers): void {
    this.selected = item;
    this.form = {
      name: item.name,
      email: item.email,
      phone: item.phone,
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
        await this.service.update(this.selected.id, this.form as Partial<Customers>);
      } else {
        await this.service.create(this.form as Partial<Customers>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible';
    } finally {
      this.loading = false;
    }
  }

  async delete(item: Customers): Promise<void> {
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
