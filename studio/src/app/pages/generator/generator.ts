import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {
  ApiService,
  DatabaseProvider,
  FrontendFramework,
  GeneratedProjectManifest,
  GeneratedProjectSummary,
  GenerateResponse
} from '../../services/api';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTextarea
  ],
  templateUrl: './generator.html',
  styleUrl: './generator.scss'
})
export class GeneratorComponent implements OnInit {
  projectName = 'jantcouvoir';
  mode: 'schema' | 'database' = 'schema';
  frontendFramework: FrontendFramework = 'ionic';
  provider: DatabaseProvider = 'mysql';
  host = '127.0.0.1';
  port = 3306;
  user = 'root';
  password = '';
  database = 'jantcouvoir';
  ssl = false;
  schemaJson = JSON.stringify(
    {
      provider: 'mysql',
      database: 'jantcouvoir',
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', nullable: false, primaryKey: true, autoIncrement: true },
            { name: 'name', type: 'varchar', nullable: false },
            { name: 'email', type: 'varchar', nullable: false }
          ]
        },
        {
          name: 'products',
          columns: [
            { name: 'id', type: 'int', nullable: false, primaryKey: true, autoIncrement: true },
            { name: 'label', type: 'varchar', nullable: false },
            { name: 'price', type: 'decimal', nullable: false }
          ]
        }
      ]
    },
    null,
    2
  );
  loading = false;
  message = '';
  error = '';
  result: GenerateResponse | null = null;
  generations: GeneratedProjectSummary[] = [];
  selectedProject: GeneratedProjectSummary | null = null;
  selectedManifest: GeneratedProjectManifest | null = null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    void this.loadGenerations();
  }

  private refreshView(): void {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private setLoading(value: boolean): void {
    this.zone.run(() => {
      this.loading = value;
      this.refreshView();
    });
  }

  async loadGenerations(): Promise<void> {
    try {
      this.generations = await this.api.listGenerations();
      if (!this.selectedProject && this.generations[0]) {
        await this.selectGeneration(this.generations[0]);
      }
      this.refreshView();
    } catch (err) {
      console.error(err);
    }
  }

  async selectGeneration(project: GeneratedProjectSummary): Promise<void> {
    this.selectedProject = project;

    if (project.manifest) {
      this.selectedManifest = project.manifest;
      this.refreshView();
      return;
    }

    try {
      this.selectedManifest = await this.api.getGeneration(project.jobId);
    } catch (err) {
      console.error(err);
      this.selectedManifest = null;
    } finally {
      this.refreshView();
    }
  }

  async generate() {
    this.zone.run(() => {
      this.loading = true;
      this.message = '';
      this.error = '';
      this.result = null;
      this.refreshView();
    });

    try {
      const payload =
        this.mode === 'schema'
          ? {
              name: this.projectName,
              frontend: { framework: this.frontendFramework },
              schema: JSON.parse(this.schemaJson)
            }
          : {
              name: this.projectName,
              frontend: { framework: this.frontendFramework },
              database: {
                provider: this.provider,
                host: this.host,
                port: Number(this.port),
                user: this.user,
                password: this.password,
                database: this.database,
                ssl: this.ssl
              }
            };

      const result = await this.api.generateProject(payload);

      this.zone.run(() => {
        this.message = result.message;
        this.result = result;
        this.selectedManifest = result.manifest;
        this.selectedProject = {
          jobId: result.jobId,
          projectName: result.projectName,
          outputPath: result.outputPath,
          zipPath: '',
          downloadUrl: result.downloadUrl,
          createdAt: result.manifest.createdAt,
          manifest: result.manifest
        };
        this.loading = false;
        this.refreshView();
      });
      window.setTimeout(() => void this.loadGenerations(), 0);
    } catch (err) {
      console.error(err);
      this.zone.run(() => {
        this.error =
          err instanceof Error
            ? err.message
            : 'Erreur lors de la generation. Verifie le JSON ou la connexion a la base.';
        this.loading = false;
        this.refreshView();
      });
    } finally {
      this.setLoading(false);
    }
  }
}
