"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReactNativeFrontend = generateReactNativeFrontend;
const path_1 = __importDefault(require("path"));
const file_writer_1 = require("../../core/file-writer");
function json(value) {
    return JSON.stringify(value, null, 2);
}
function packageJson(schema) {
    return json({
        name: `${schema.packageName}-mobile`,
        version: '1.0.0',
        private: true,
        main: 'expo/AppEntry.js',
        scripts: {
            start: 'expo start',
            android: 'expo start --android',
            ios: 'expo start --ios',
            web: 'expo start --web'
        },
        dependencies: {
            expo: '^54.0.0',
            react: '^19.0.0',
            'react-native': '^0.81.0',
            'react-native-safe-area-context': '^5.0.0',
            'react-native-screens': '^4.0.0'
        },
        devDependencies: {
            typescript: '~5.9.0',
            '@types/react': '^19.0.0'
        }
    });
}
function appJson(schema) {
    return json({
        expo: {
            name: schema.appTitle,
            slug: schema.packageName,
            version: '1.0.0',
            orientation: 'portrait',
            userInterfaceStyle: 'light',
            assetBundlePatterns: ['**/*']
        }
    });
}
function tsConfig() {
    return json({
        extends: 'expo/tsconfig.base',
        compilerOptions: {
            strict: true
        }
    });
}
function tableMeta(schema) {
    const tables = schema.tables.map((table) => ({
        name: table.name,
        title: table.className,
        routePath: table.routePath,
        primaryKey: table.primaryKey.propertyName,
        columns: table.columns.map((column) => ({
            propertyName: column.propertyName,
            label: column.label,
            inputType: column.htmlInputType,
            editable: !column.primaryKey && !column.autoIncrement
        }))
    }));
    return `
export type TableColumn = {
  propertyName: string;
  label: string;
  inputType: string;
  editable: boolean;
};

export type TableMeta = {
  name: string;
  title: string;
  routePath: string;
  primaryKey: string;
  columns: TableColumn[];
};

export const tables: TableMeta[] = ${json(tables)};
`;
}
function apiClient() {
    return `
const API_URL = 'http://localhost:3000/api';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(\`\${API_URL}\${path}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
`;
}
function appTsx(schema) {
    return `
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { tables, TableMeta } from './src/tables';
import { TableScreen } from './src/screens/TableScreen';

type ViewName = 'login' | 'demo' | string;

export default function App() {
  const [view, setView] = useState<ViewName>('login');
  const [login, setLogin] = useState('dieng.tech');
  const [password, setPassword] = useState('dieng123');
  const [error, setError] = useState('');
  const activeTable = tables.find((table: TableMeta) => table.routePath === view);

  function submitLogin() {
    if (login === 'dieng.tech' && password === 'dieng123') {
      setError('');
      setView('demo');
      return;
    }
    setError('Utilise le login dieng.tech et le mot de passe dieng123.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>SF</Text></View>
        <View>
          <Text style={styles.title}>${schema.appTitle}</Text>
          <Text style={styles.subtitle}>Application React Native generee</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, view === 'demo' && styles.tabActive]} onPress={() => setView('demo')}>
          <Text style={[styles.tabText, view === 'demo' && styles.tabTextActive]}>Demo</Text>
        </TouchableOpacity>
        {tables.map((table) => (
          <TouchableOpacity key={table.routePath} style={[styles.tab, view === table.routePath && styles.tabActive]} onPress={() => setView(table.routePath)}>
            <Text style={[styles.tabText, view === table.routePath && styles.tabTextActive]}>{table.title}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.tab, view === 'login' && styles.tabActive]} onPress={() => setView('login')}>
          <Text style={[styles.tabText, view === 'login' && styles.tabTextActive]}>Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {view === 'login' && (
          <View style={styles.card}>
            <Text style={styles.kicker}>Acces demo</Text>
            <Text style={styles.heading}>Connexion</Text>
            <TextInput style={styles.input} value={login} onChangeText={setLogin} placeholder="Login" />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.primaryButton} onPress={submitLogin}><Text style={styles.primaryButtonText}>Entrer</Text></TouchableOpacity>
          </View>
        )}

        {view === 'demo' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.kicker}>Demo</Text>
              <Text style={styles.heading}>Ecrans generes</Text>
              <Text style={styles.muted}>Ouvre chaque module pour tester les listes, formulaires et actions CRUD.</Text>
            </View>
            {tables.map((table) => (
              <TouchableOpacity key={table.routePath} style={styles.listCard} onPress={() => setView(table.routePath)}>
                <Text style={styles.listTitle}>{table.title}</Text>
                <Text style={styles.muted}>CRUD pour la table {table.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTable && <TableScreen table={activeTable} styles={styles} />}
      </ScrollView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef3f7' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#d9e3ef' },
  logo: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f766e' },
  logoText: { color: '#fff', fontWeight: '900' },
  title: { color: '#111827', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#64748b', marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#d9e3ef' },
  tab: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f8fafc' },
  tabActive: { backgroundColor: '#eef7f6' },
  tabText: { color: '#475569', fontWeight: '800' },
  tabTextActive: { color: '#0f766e' },
  content: { padding: 16, gap: 12 },
  card: { gap: 12, padding: 18, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d9e3ef' },
  kicker: { color: '#0f766e', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  heading: { color: '#111827', fontSize: 24, fontWeight: '900' },
  muted: { color: '#64748b', lineHeight: 20 },
  input: { minHeight: 44, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d9e3ef', backgroundColor: '#f8fafc' },
  primaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0f766e' },
  primaryButtonText: { color: '#fff', fontWeight: '900' },
  error: { color: '#dc2626', fontWeight: '800' },
  listCard: { gap: 6, marginTop: 12, padding: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d9e3ef' },
  listTitle: { color: '#111827', fontSize: 16, fontWeight: '900' },
  row: { gap: 8, padding: 12, marginTop: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d9e3ef' },
  rowActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryButton: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e0f2fe' },
  dangerButton: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#fee2e2' },
  secondaryText: { color: '#075985', fontWeight: '900' },
  dangerText: { color: '#b91c1c', fontWeight: '900' }
});
`;
}
function tableScreen() {
    return `
import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiRequest } from '../api';
import { TableMeta } from '../tables';

type RecordValue = string | number | boolean | null;
type DataRecord = Record<string, RecordValue>;

export function TableScreen({ table, styles }: { table: TableMeta; styles: any }) {
  const [rows, setRows] = useState<DataRecord[]>([]);
  const [form, setForm] = useState<DataRecord>({});
  const [editingId, setEditingId] = useState<RecordValue>(null);
  const [error, setError] = useState('');
  const editableColumns = useMemo(() => table.columns.filter((column) => column.editable), [table]);

  async function load() {
    try {
      setRows(await apiRequest<DataRecord[]>(\`/\${table.routePath}\`));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    }
  }

  useEffect(() => {
    setForm({});
    setEditingId(null);
    void load();
  }, [table.routePath]);

  async function submit() {
    const path = editingId ? \`/\${table.routePath}/\${editingId}\` : \`/\${table.routePath}\`;
    const method = editingId ? 'PUT' : 'POST';
    await apiRequest(path, { method, body: JSON.stringify(form) });
    setForm({});
    setEditingId(null);
    await load();
  }

  async function remove(row: DataRecord) {
    await apiRequest(\`/\${table.routePath}/\${row[table.primaryKey]}\`, { method: 'DELETE' });
    await load();
  }

  function edit(row: DataRecord) {
    setEditingId(row[table.primaryKey]);
    setForm(Object.fromEntries(editableColumns.map((column) => [column.propertyName, row[column.propertyName] ?? ''])));
  }

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.kicker}>CRUD</Text>
        <Text style={styles.heading}>{table.title}</Text>
        <Text style={styles.muted}>Table source: {table.name}</Text>
      </View>

      <View style={[styles.card, { marginTop: 12 }]}>
        {editableColumns.map((column) => (
          <TextInput
            key={column.propertyName}
            style={styles.input}
            value={String(form[column.propertyName] ?? '')}
            placeholder={column.label}
            onChangeText={(value) => setForm({ ...form, [column.propertyName]: value })}
          />
        ))}
        <TouchableOpacity style={styles.primaryButton} onPress={submit}><Text style={styles.primaryButtonText}>{editingId ? 'Modifier' : 'Creer'}</Text></TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {rows.map((row, index) => (
        <View key={String(row[table.primaryKey] ?? index)} style={styles.row}>
          {table.columns.map((column) => (
            <Text key={column.propertyName}><Text style={{ fontWeight: '900' }}>{column.label}: </Text>{String(row[column.propertyName] ?? '')}</Text>
          ))}
          <View style={styles.rowActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => edit(row)}><Text style={styles.secondaryText}>Editer</Text></TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={() => remove(row)}><Text style={styles.dangerText}>Supprimer</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
`;
}
async function generateReactNativeFrontend(schema, root) {
    const frontendRoot = path_1.default.join(root, 'frontend');
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'package.json'), packageJson(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'app.json'), appJson(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'tsconfig.json'), tsConfig());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'App.tsx'), appTsx(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/api.ts'), apiClient());
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/tables.ts'), tableMeta(schema));
    await (0, file_writer_1.writeTextFile)(path_1.default.join(frontendRoot, 'src/screens/TableScreen.tsx'), tableScreen());
}
//# sourceMappingURL=react-native-generator.js.map