import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from './utilisateur.model';
import { UtilisateurService } from './utilisateur.service';

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateur.page.html',
  styleUrl: './utilisateur.page.scss'
})
export class UtilisateurPage implements OnInit {
  items: Utilisateur[] = [];
  form: Record<string, string | number | boolean | null> = this.emptyForm();
  editingId: string | number | null = null;
  loading = false;
  error = '';

  constructor(private service: UtilisateurService) {}

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

  edit(item: Utilisateur): void {
    this.editingId = item.idUtilisateur as string | number;
    this.form = { ...item } as Record<string, string | number | boolean | null>;
  }

  cancel(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  async save(): Promise<void> {
    try {
      if (this.editingId === null) {
        await this.service.create(this.form as Partial<Utilisateur>);
      } else {
        await this.service.update(this.editingId, this.form as Partial<Utilisateur>);
      }
      this.cancel();
      await this.load();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Enregistrement impossible.';
    }
  }

  async remove(item: Utilisateur): Promise<void> {
    await this.service.remove(item.idUtilisateur as string | number);
    await this.load();
  }

  private emptyForm(): Record<string, string | number | boolean | null> {
    return {
    nom: '',
    email: '',
    password: '',
    createdAt: ''
    };
  }
}
