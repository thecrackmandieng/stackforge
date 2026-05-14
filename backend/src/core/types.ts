export type DatabaseProvider = 'mysql' | 'postgres';
export type FrontendFramework = 'ionic' | 'angular' | 'react' | 'react-native';

export type ColumnSchema = {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
};

export type TableSchema = {
  name: string;
  columns: ColumnSchema[];
};

export type DatabaseSchema = {
  provider: DatabaseProvider;
  database: string;
  tables: TableSchema[];
};

export type DatabaseConnectionConfig = {
  provider: DatabaseProvider;
  host: string;
  port?: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean;
};

export type GenerateRequest = {
  name: string;
  database?: DatabaseConnectionConfig;
  schema?: DatabaseSchema;
  frontend?: {
    framework?: FrontendFramework;
  };
};

export type NormalizedColumn = ColumnSchema & {
  propertyName: string;
  label: string;
  tsType: string;
  htmlInputType: string;
};

export type NormalizedTable = Omit<TableSchema, 'columns'> & {
  entityName: string;
  className: string;
  variableName: string;
  routePath: string;
  primaryKey: NormalizedColumn;
  columns: NormalizedColumn[];
  editableColumns: NormalizedColumn[];
};

export type NormalizedSchema = Omit<DatabaseSchema, 'tables'> & {
  projectName: string;
  packageName: string;
  appTitle: string;
  tables: NormalizedTable[];
};

export type GenerationResult = {
  jobId: string;
  projectName: string;
  outputPath: string;
  zipPath: string;
  downloadUrl: string;
  tables: string[];
  manifest: GeneratedProjectManifest;
};

export type GeneratedProjectSummary = {
  jobId: string;
  projectName: string;
  outputPath: string;
  zipPath: string;
  downloadUrl: string;
  createdAt: string;
  manifest?: GeneratedProjectManifest;
};

export type GeneratedEndpointDoc = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
};

export type GeneratedComponentDoc = {
  name: string;
  type: 'backend' | 'frontend';
  path: string;
  role: string;
};

export type GeneratedScreenDoc = {
  name: string;
  route: string;
  path: string;
  description: string;
};

export type GeneratedProjectManifest = {
  projectName: string;
  createdAt: string;
  demo: {
    login: string;
    password: string;
    otpCode: string;
    startRoute: string;
  };
  components: GeneratedComponentDoc[];
  screens: GeneratedScreenDoc[];
  endpoints: GeneratedEndpointDoc[];
};
