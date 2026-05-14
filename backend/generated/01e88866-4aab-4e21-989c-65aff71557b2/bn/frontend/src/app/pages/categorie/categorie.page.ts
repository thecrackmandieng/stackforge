import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categorie } from './categorie.model';
import { CategorieService } from './categorie.service';

@Component({
  selector: 'app-categorie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorie.page.html',
  styleUrl: './categorie.page.scss'
})
export class CategoriePage implements OnInit {
  items: Categorie[] = [];
  form: Record<string, string | number | boolean | null> = this.emptyForm();
  editingId: string | number | null = null;
  loading = false;
  error = '';

  constructor(private service: CategorieService) {}

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

  edit(item: Categorie): void {
    this.editingId = item.idCategorie as string | number;
    this.form = { ...item } as Record<string, string | number | boolean | null>;
  }

  cancel(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  async save(): Promise<void> {
    try {
      if (this.editingId === null) {
        await this.service.create(this.form as Partial<Categorie>);
      } else {
        await this.service.update(this.editingId, this.form as Partial<Categorie>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible.';
    }
  }

  async remove(item: Categorie): Promise<void> {
    await this.service.remove(item.idCategorie as string | number);
    await this.load();
  }

  private emptyForm(): Record<string, string | number | boolean | null> {
    return {
    nomCategorie: '',
    description: '',
    createdAt: ''
    };
  }
}
