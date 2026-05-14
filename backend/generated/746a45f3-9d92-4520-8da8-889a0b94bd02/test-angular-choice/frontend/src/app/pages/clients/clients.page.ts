import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Clients } from './clients.model';
import { ClientsService } from './clients.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.page.html',
  styleUrl: './clients.page.scss'
})
export class ClientsPage implements OnInit {
  items: Clients[] = [];
  form: Record<string, string | number | boolean | null> = this.emptyForm();
  editingId: string | number | null = null;
  loading = false;
  error = '';

  constructor(private service: ClientsService) {}

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.items = await this.service.list();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Chargement impossible.';
    } finally {
      this.loading = false;
    }
  }

  edit(item: Clients): void {
    this.editingId = item.id as string | number;
    this.form = { ...item } as Record<string, string | number | boolean | null>;
  }

  cancel(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  async save(): Promise<void> {
    try {
      if (this.editingId === null) {
        await this.service.create(this.form as Partial<Clients>);
      } else {
        await this.service.update(this.editingId, this.form as Partial<Clients>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible.';
    }
  }

  async remove(item: Clients): Promise<void> {
    await this.service.remove(item.id as string | number);
    await this.load();
  }

  private emptyForm(): Record<string, string | number | boolean | null> {
    return {
    name: '',
    email: ''
    };
  }
}
