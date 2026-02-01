# Plataforma Nacional de Compras y Contratación Pública (PNCCP)
## República de Guinea Ecuatorial

---

## 📋 Descripción General

Sistema informático centralizado que digitaliza **todo el ciclo de vida de la contratación pública**, garantizando transparencia, trazabilidad jurídica, automatización de procesos, control del gasto público y auditoría en tiempo real.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Backend/Datos**: Supabase (PostgreSQL, RLS, Auth, Storage, Edge Functions)
- **Frontend**: React + Vite + TypeScript + Tailwind (diseño institucional implementado en el proyecto)
- **Documentos**: Generación automática (PDF, Word, Excel)

### Esquemas de Base de Datos

- `auth` → Gestionado por Supabase
- `core` → Entidades troncales (instituciones, expedientes, contratos)
- `rnp` → Proveedores y clasificación
- `procurement` → Licitaciones, ofertas, evaluaciones
- `execution` → Ejecución contractual
- `documents` → Metadatos documentales
- `audit` → Logs y trazabilidad

---

## 📁 Estructura del Proyecto

```
PNCCP/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions_triggers.sql
│   ├── functions/
│   │   ├── generate-expediente-code/
│   │   ├── validate-procedure/
│   │   ├── generate-documents/
│   │   └── alerts-engine/
│   └── storage/
│       └── buckets-config.sql
├── frontend/
│   ├── src/
│   │   ├── components/   (layout, ui, ProtectedRoute)
│   │   ├── contexts/     (AuthContext)
│   │   ├── pages/        (Login, Dashboard, Expedientes, Wizard, Instituciones, etc.)
│   │   ├── styles/       (Tailwind, diseño institucional)
│   │   └── lib/          (supabase client)
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── arquitectura.md
│   ├── modelo-datos.md
│   ├── seguridad.md
│   ├── etapa2-validacion.md
│   └── etapa3-validacion.md
└── README.md
```

---

## 🚀 Estado del Desarrollo

### ✅ ETAPA 1: Diseño Normativo y Funcional + Modelo de Datos
- [x] Modelo de datos completo (`supabase/migrations/001_initial_schema.sql`)
- [x] Políticas RLS definidas (`supabase/migrations/002_rls_policies.sql`)
- [x] Funciones y triggers (`supabase/migrations/003_functions_triggers.sql`)
- [x] Edge Functions: `generate-expediente-code`, `validate-procedure`, `generate-documents`, `alerts-engine`
- [x] Documentación: `docs/modelo-datos.md`, `docs/arquitectura.md`, `docs/seguridad.md`
- [x] Configuración Storage: `supabase/storage/buckets-config.sql`

### ✅ ETAPA 2: Arquitectura Técnica Supabase
- [x] Normalización: tabla `core.documents_text` para textos legales largos
- [x] Índices adicionales (estado+fecha, licitaciones, contratos vigentes)
- [x] RLS para `documents_text`
- [x] Validación documentada en `docs/etapa2-validacion.md`

### ✅ ETAPA 3: UX/UI + Flujos guiados (role-based)
- [x] Diseño institucional (colores, componentes, layout) en `frontend/`
- [x] Auth y detección de rol (`AuthContext`), menú por rol (`Sidebar`)
- [x] Dashboards por rol (Admin Nacional, Institucional, Técnico, Auditor, Proveedor)
- [x] Wizard creación de expediente (6 pasos): tipo, objeto, presupuesto, documentación, validación, confirmación
- [x] Listados con filtros: Expedientes, Instituciones, Licitaciones, Proveedores, Contratos, Auditoría
- [x] Detalle de expediente; Login; rutas protegidas
- [x] Validación en `docs/etapa3-validacion.md`

### ⏳ ETAPA 4: Desarrollo modular (módulo a módulo)

---

## 🖥️ Cómo ejecutar el frontend

```bash
cd frontend
cp .env.example .env
# Editar .env: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (proyecto Supabase)
npm install
npm run dev
```

Abrir http://localhost:5173. Iniciar sesión en `/login`; el menú y el dashboard se adaptan al rol del usuario.

---

## 🔐 Seguridad

- Row Level Security (RLS) estricta en todas las tablas
- Control de accesos por rol institucional
- Auditoría completa e inalterable
- Cifrado de documentos sensibles

---

## 📊 Módulos del Sistema

1. **Gestión Institucional del Estado**
2. **Registro Nacional de Proveedores (RNP)**
3. **Expedientes de Contratación**
4. **Licitación Electrónica**
5. **Evaluación Técnica y Económica**
6. **Adjudicación y Contratación**
7. **Ejecución y Seguimiento Contractual**
8. **Control, Auditoría y Transparencia**

---

## 📝 Licencia

Sistema desarrollado para el Estado de Guinea Ecuatorial.

---

## 👥 Equipo

Desarrollado con asistencia de IA especializada en sistemas gubernamentales.

