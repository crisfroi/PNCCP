# ETAPA 3: UX/UI + Flujos guiados (role-based) – Validación

## Objetivo

Interfaz institucional ultra‑intuitiva donde cada rol ve únicamente su mundo, sus tareas y sus decisiones. Diseño implementado íntegramente en el frontend (sin Lovable/Builder).

---

## 3.1 Roles y experiencia asociada

| Rol | Ve | Acciones |
|-----|-----|----------|
| **Admin Nacional** | Dashboard nacional, todas las instituciones, todos los expedientes | Crear instituciones, asignar admins, bloquear proveedores |
| **Admin Institucional** | Su institución, expedientes propios, proveedores habilitados | Crear expedientes, designar comités, publicar licitaciones |
| **Técnico** | Expedientes asignados, ofertas (sin datos sensibles cruzados) | Evaluar, puntuar, generar actas |
| **Auditor** | Todo (solo lectura) | Exportar, auditar |
| **Proveedor** | Su perfil, licitaciones abiertas, sus ofertas, sus contratos | Subir documentos, presentar ofertas |

**Estado:** ✔ Implementado en `AuthContext`, `Sidebar` (menú por rol), `Dashboard` (contenido por rol), listados con RLS.

---

## 3.2 Flujos guiados (wizards)

### Creación de expediente (Admin Institucional / Admin Nacional)

- **Paso 1:** Tipo de procedimiento (y institución si Admin Nacional)
- **Paso 2:** Objeto del contrato
- **Paso 3:** Presupuesto (XAF)
- **Paso 4:** Documentación obligatoria (placeholder)
- **Paso 5:** Validación automática (resumen)
- **Paso 6:** Confirmación y creación

El sistema bloquea errores (validación por paso), sugiere campos y muestra código previsto en paso 5.

**Estado:** ✔ Wizard en `frontend/src/pages/WizardNuevoExpediente.tsx`.

---

## 3.3 Diseño de interfaz

- **Colores:** institucional (primary #1e3a5f, secondary, accent), estados (activo, pendiente, cerrado, alerta).
- **Componentes:** `Button`, `Card`, `Badge`, tablas con filtros, estados visuales claros.
- **Layout:** `AppLayout`, `Sidebar` (navegación por rol), `Header` (usuario, institución, rol, salir).

**Estado:** ✔ `tailwind.config.js`, `styles/index.css`, componentes en `frontend/src/components`.

---

## 3.4 Componentes reutilizables

- UI: `Button`, `Card`, `Badge`, `ProtectedRoute`.
- Layout: `AppLayout`, `Sidebar`, `Header`.
- Páginas: `Login`, `Dashboard`, `ExpedientesList`, `WizardNuevoExpediente`, `ExpedienteDetail`, `InstitucionesList`, `LicitacionesList`, `ProveedoresList`, `ContratosList`, `AuditoriaPage`.

**Estado:** ✔ Lógica de rol respetada; datos no autorizados no expuestos (RLS + menú por rol).

---

## 3.5 Accesibilidad y adopción

- Textos guiados en wizard (títulos y descripciones por paso).
- Ayuda contextual: etiquetas y placeholders en formularios.
- Tooltips: preparado para ampliación; actualmente etiquetas claras en todos los campos.

**Estado:** ✔ Formularios con labels y placeholders; wizard con títulos por paso.

---

## 3.6 Resultado obligatorio ETAPA 3

| Criterio | Estado |
|----------|--------|
| Flujos cerrados por rol | ✔ |
| UI validada (institucional, clara, neutra) | ✔ |
| Listo para desarrollo funcional (ETAPA 4) | ✔ |
| Diseño encargado íntegramente (no Lovable/Builder) | ✔ |

---

## Cómo ejecutar el frontend

```bash
cd frontend
cp .env.example .env
# Editar .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Abrir `http://localhost:5173`. Login en `/login`; tras autenticación, redirección al dashboard según rol.

---

## NO avanzar a ETAPA 4 sin validación

Validación: frontend completo con rutas, auth, dashboards por rol, wizard de expediente, listados (expedientes, instituciones, licitaciones, proveedores, contratos, auditoría). Listo para ETAPA 4 (desarrollo modular módulo a módulo).
