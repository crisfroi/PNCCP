# PROMPT MAESTRO DE EJECUCIÓN GLOBAL
## Plataforma Nacional de Compras y Contratación Pública (PNCCP)

---

## ROL QUE DEBE ASUMIR LA IA

Actúa como un **equipo completo de alto nivel** compuesto por:
- Arquitecto de software gubernamental
- Experto en contratación pública
- Especialista en Supabase (PostgreSQL, RLS, Auth, Storage, Edge Functions)
- Diseñador UX/UI para sistemas críticos del Estado
- Ingeniero de automatización documental y reporting
- Analista de datos y estadística pública
- Experto en ciberseguridad y protección de datos
- Director de proyecto de transformación digital

Tu objetivo es **diseñar, ejecutar y documentar paso a paso** una plataforma nacional de última generación, lista para ser implementada por el Estado, sin dejar ambigüedades, vacíos técnicos ni conceptuales.

---

## OBJETIVO GENERAL DEL SISTEMA

Diseñar y desarrollar la **Plataforma Nacional de Compras y Contratación Pública (PNCCP)** de Guinea Ecuatorial, un sistema informático centralizado que digitalice **todo el ciclo de vida de la contratación pública**, garantizando:

- Transparencia total
- Trazabilidad jurídica y técnica
- Automatización extrema de procesos
- Control del gasto público
- Auditoría en tiempo real
- Escalabilidad nacional
- Protección estricta de datos

---

## PRINCIPIOS RECTORES (NO NEGOCIABLES)

1. **Digital by default**: ningún proceso crítico fuera del sistema.
2. **Automatización primero**: eliminar tareas manuales siempre que sea posible.
3. **Seguridad y privacidad por diseño**.
4. **Escalabilidad nacional** (ministerios, provincias, distritos).
5. **Usabilidad extrema** para funcionarios no técnicos.
6. **Auditoría permanente e inalterable**.

---

## TECNOLOGÍA BASE OBLIGATORIA

### Backend / Datos
- **Supabase** como núcleo:
  - PostgreSQL
  - Row Level Security (RLS) estricta
  - Supabase Auth (roles, usuarios institucionales, proveedores)
  - Storage para documentos oficiales
  - Edge Functions para lógica crítica y automatizaciones

### Frontend
- Desarrollo con **IA asistida (Lovable o Builder.io)**
- Componentes reutilizables
- Diseño institucional moderno
- Flujos guiados paso a paso

### Documentos y Reporting
- Generación automática de:
  - PDF oficiales
  - Word (.docx)
  - Excel (.xlsx)
- Informes descargables y programados

---

## ARQUITECTURA FUNCIONAL DEL SISTEMA

### MÓDULO 1: Gestión Institucional del Estado

- Registro jerárquico:
  - Administración Central
  - Ministerios
  - Entidades autónomas
  - Empresas públicas
- Asignación de responsables
- Permisos por nivel institucional

Automatizaciones:
- Creación automática de estructura interna
- Asignación de roles por defecto

---

### MÓDULO 2: Registro Nacional de Proveedores del Estado (RNP)

- Alta de proveedores (empresas, autónomos, consorcios)
- Validación documental automática
- Clasificación por:
  - Tipo de contrato
  - Sectores
  - Capacidad técnica
  - Capacidad financiera
- Estados:
  - Activo
  - Suspendido
  - Inhabilitado

Automatizaciones:
- Alertas de vencimiento documental
- Bloqueo automático por sanción
- Historial único nacional

---

### MÓDULO 3: Expedientes de Contratación

- Creación guiada del expediente
- Tipo de procedimiento:
  - Licitación abierta
  - Restringida
  - Concurso
  - Contratación directa (con justificación obligatoria)
- Asignación presupuestaria
- Cronograma automático

Automatizaciones:
- ID único nacional
- Validación de coherencia legal
- Alertas de plazos

---

### MÓDULO 4: Licitación Electrónica

- Publicación automática en portal público
- Descarga de pliegos
- Preguntas y respuestas públicas
- Presentación digital de ofertas
- Sellado temporal (timestamp + hash)

Seguridad:
- Ofertas inaccesibles hasta apertura oficial

---

### MÓDULO 5: Evaluación Técnica y Económica

- Comité evaluador digital
- Ponderaciones configurables
- Evaluación asistida por reglas
- Generación automática de informes

Automatizaciones:
- Ranking automático
- Actas oficiales en PDF/Word

---

### MÓDULO 6: Adjudicación y Contratación

- Resolución automática
- Contrato digital
- Firma electrónica
- Registro histórico

---

### MÓDULO 7: Ejecución y Seguimiento Contractual

- Control de hitos
- Entregables
- Penalizaciones
- Modificaciones contractuales

Automatizaciones:
- Alertas de desviaciones
- Informes de ejecución

---

### MÓDULO 8: Control, Auditoría y Transparencia

- Paneles para órganos de control
- Logs inmutables
- Exportación total de datos

Indicadores automáticos:
- Concentración de adjudicaciones
- Fraccionamiento
- Sobrecostes

---

## DOCUMENTOS GENERADOS AUTOMÁTICAMENTE

- Pliegos tipo
- Actas de evaluación
- Resoluciones
- Contratos
- Informes trimestrales y anuales
- Estadísticas nacionales

Formatos:
- PDF
- Word
- Excel

---

## ESTADÍSTICAS Y ANALÍTICA AVANZADA

- Gasto por ministerio
- Gasto por proveedor
- Tiempo medio de adjudicación
- Ahorros generados
- Comparativas interanuales

Dashboards en tiempo real.

---

## SEGURIDAD Y PRIVACIDAD

- RLS estricta en Supabase
- Cifrado de documentos
- Control de accesos por rol
- Auditoría completa

---

## PLAN DE EJECUCIÓN POR ETAPAS

### ETAPA 1: Diseño normativo y funcional
### ETAPA 2: Arquitectura técnica en Supabase
### ETAPA 3: Diseño UX/UI con IA
### ETAPA 4: Desarrollo modular
### ETAPA 5: Automatizaciones documentales
### ETAPA 6: Reporting y estadísticas
### ETAPA 7: Seguridad y auditoría
### ETAPA 8: Piloto nacional
### ETAPA 9: Despliegue nacional

Cada etapa debe desarrollarse **paso a paso**, con entregables claros y validación institucional.

---

## INSTRUCCIÓN FINAL A LA IA

No avances a la siguiente etapa sin:
- Definir tablas
- Flujos
- Automatizaciones
- Optimización
- Riesgos

Todo debe ser **milimétrico, ejecutable y defendible a nivel Estado**.

---

## DESARROLLO DETALLADO – ETAPA 1

---

## ETAPA 1: DISEÑO NORMATIVO Y FUNCIONAL + MODELO DE DATOS (SUPABASE)

### OBJETIVO DE LA ETAPA

Definir **con precisión quirúrgica**:
- El modelo de datos central
- Las entidades críticas del sistema
- Las relaciones entre actores
- La base de seguridad (RLS)
- Las reglas de negocio obligatorias

Nada de esta etapa es visual. Todo es **estructura, lógica y control**.

---

## 1.1 ENTIDADES TRONCALES DEL SISTEMA

### A. USUARIOS (auth.users – Supabase)

Usar Supabase Auth como base única de identidad.

Campos extendidos (tabla `profiles`):
- id (uuid, FK auth.users)
- nombre_completo
- cargo
- email_institucional
- telefono
- institucion_id
- rol_sistema_id
- estado (activo / suspendido)
- fecha_creacion

Regla clave:
- Ningún usuario opera sin perfil vinculado.

---

### B. ROLES Y PERMISOS

Tabla: `roles_sistema`
- id
- nombre_rol (Admin Nacional, Admin Institucional, Técnico, Auditor, Proveedor)
- nivel_acceso

Tabla: `permisos`
- id
- codigo_permiso
- descripcion

Tabla puente: `roles_permisos`

---

### C. INSTITUCIONES PÚBLICAS

Tabla: `instituciones`
- id
- nombre_oficial
- tipo (ministerio, entidad autónoma, empresa pública)
- nivel (central, provincial, distrital)
- institucion_padre_id
- estado

Automatización:
- Estructura jerárquica automática.

---

### D. PROVEEDORES DEL ESTADO (RNP)

Tabla: `proveedores`
- id
- razon_social
- tipo (empresa, autónomo, consorcio)
- nif
- pais
- estado
- fecha_registro

Tabla: `proveedor_documentos`
- proveedor_id
- tipo_documento
- url_storage
- fecha_vencimiento

Automatización:
- Bloqueo automático si documento vence.

---

### E. EXPEDIENTES DE CONTRATACIÓN

Tabla: `expedientes`
- id
- codigo_expediente (único nacional)
- institucion_id
- tipo_procedimiento
- objeto_contrato
- presupuesto
- estado
- fecha_creacion

Regla:
- El código se genera por Edge Function.

---

### F. LICITACIONES Y OFERTAS

Tabla: `licitaciones`
- expediente_id
- fecha_publicacion
- fecha_cierre

Tabla: `ofertas`
- licitacion_id
- proveedor_id
- monto
- hash_oferta
- fecha_envio

Seguridad:
- Ofertas cifradas hasta apertura.

---

### G. EVALUACIÓN

Tabla: `evaluaciones`
- oferta_id
- puntuacion_tecnica
- puntuacion_economica
- puntuacion_total

---

### H. CONTRATOS

Tabla: `contratos`
- expediente_id
- proveedor_id
- monto_adjudicado
- fecha_inicio
- fecha_fin
- estado

---

### I. EJECUCIÓN CONTRACTUAL

Tabla: `hitos_contrato`
- contrato_id
- descripcion
- fecha_prevista
- fecha_real
- estado

---

## 1.2 POLÍTICAS RLS (SEGURIDAD)

Principios:
- Proveedores solo ven su información.
- Instituciones solo ven sus expedientes.
- Auditores ven todo, no editan.

Ejemplo:
- `expedientes.institucion_id = auth.jwt()->>institucion_id`

---

## 1.3 EDGE FUNCTIONS CLAVE

- Generación de códigos oficiales
- Validación legal automática
- Generación de documentos
- Alertas y bloqueos

---

## 1.4 RESULTADO OBLIGATORIO DE LA ETAPA 1

✔ Modelo de datos aprobado
✔ Reglas RLS definidas
✔ Entidades cerradas
✔ Base lista para frontend

---

## NO AVANZAR A ETAPA 2 HASTA VALIDAR TODO LO ANTERIOR

---

## DESARROLLO DETALLADO – ETAPA 2

---

## ETAPA 2: ARQUITECTURA TÉCNICA SUPABASE (SIN FIRMA ELECTRÓNICA)

### OBJETIVO DE LA ETAPA

Definir una **arquitectura Supabase robusta, escalable y segura**, dejando la **firma electrónica como módulo desacoplado futuro**, sin comprometer validez jurídica, trazabilidad ni crecimiento.

---

## 2.1 ESTRUCTURA DE ESQUEMAS EN POSTGRESQL

Separar por esquemas lógicos:

- `auth` → gestionado por Supabase
- `core` → entidades troncales (instituciones, expedientes, contratos)
- `rnp` → proveedores y clasificación
- `procurement` → licitaciones, ofertas, evaluaciones
- `execution` → ejecución contractual
- `documents` → metadatos documentales
- `audit` → logs y trazabilidad

Beneficio:
- Claridad
- Seguridad
- Escalabilidad

---

## 2.2 NORMALIZACIÓN Y OPTIMIZACIÓN DE TABLAS

Ejemplo:

- `expedientes` NO almacena textos largos
- Textos legales → tabla `documents_text`
- Estados → tablas de catálogo (`estados_expediente`, `tipos_procedimiento`)

Uso intensivo de:
- UUID
- Índices por:
  - institucion_id
  - estado
  - fechas

---

## 2.3 POLÍTICAS RLS DETALLADAS

### Ejemplo: expedientes

- SELECT: solo usuarios de la institución
- INSERT: solo Admin Institucional
- UPDATE: solo responsable asignado
- DELETE: solo Admin Nacional

### Proveedores
- Solo ven su ficha y contratos

### Auditores
- SELECT global
- SIN permisos de escritura

---

## 2.4 EDGE FUNCTIONS (DETALLE OPERATIVO)

### A. `generate_expediente_code`

Input:
- institucion_id
- tipo_procedimiento

Output:
- Código único nacional

Lógica:
- Año + código institución + secuencia

---

### B. `validate_procedure`

- Verifica coherencia legal
- Bloquea si falta documentación

---

### C. `generate_documents`

- Usa plantillas
- Genera:
  - PDF
  - Word
  - Excel

---

### D. `alerts_engine`

- Plazos
- Vencimientos
- Riesgos

---

## 2.5 STORAGE (DOCUMENTOS OFICIALES)

Buckets:
- `institutional`
- `providers`
- `expedientes`
- `contracts`

Reglas:
- Versionado
- No borrado físico
- Acceso por RLS

---

## 2.6 AUTOMATIZACIONES CLAVE

- Alta proveedor → checklist automática
- Cierre licitación → bloqueo ofertas
- Evaluación completa → genera acta
- Adjudicación → crea contrato

---

## 2.7 PREPARACIÓN PARA ESCALADO

- Multi-institución
- Multi-rol
- Multi-idioma futuro

---

## 2.8 RESULTADO OBLIGATORIO ETAPA 2

✔ Arquitectura Supabase validada
✔ RLS cerrada
✔ Edge Functions definidas
✔ Sistema listo para frontend IA

---

NO AVANZAR A ETAPA 3 SIN VALIDACIÓN

---

## DESARROLLO DETALLADO – ETAPA 3

---

## ETAPA 3: UX/UI + FLUJOS GUIADOS (ROLE-BASED ESTRICTO)

### OBJETIVO DE LA ETAPA

Diseñar una **interfaz institucional ultra‑intuitiva**, donde **cada rol del sistema ve únicamente su mundo**, sus tareas y sus decisiones, eliminando errores operativos y reduciendo al mínimo la curva de aprendizaje.

Principio clave:
> *Un funcionario nunca debe preguntarse “¿qué hago ahora?”*

---

## 3.1 DEFINICIÓN DE ROLES Y EXPERIENCIA ASOCIADA

### A. ADMIN NACIONAL

Ve:
- Dashboard nacional
- Todas las instituciones
- Todos los expedientes
- Estadísticas globales

Acciones:
- Crear instituciones
- Asignar admins institucionales
- Bloquear proveedores
- Acceso total lectura/escritura

---

### B. ADMIN INSTITUCIONAL

Ve:
- Solo su institución
- Expedientes propios
- Proveedores habilitados

Acciones:
- Crear expedientes
- Designar comités
- Publicar licitaciones

---

### C. TÉCNICO / COMITÉ

Ve:
- Expedientes asignados
- Ofertas (sin datos sensibles cruzados)

Acciones:
- Evaluar
- Puntuar
- Generar actas

---

### D. AUDITOR / CONTROL

Ve:
- Todo (solo lectura)

Acciones:
- Exportar
- Auditar

---

### E. PROVEEDOR

Ve:
- Su perfil
- Licitaciones abiertas
- Sus ofertas
- Sus contratos

Acciones:
- Subir documentos
- Presentar ofertas

---

## 3.2 FLUJOS GUIADOS POR ROL (WIZARDS)

### Ejemplo: Creación de expediente (Admin Institucional)

Paso 1: Tipo de procedimiento
Paso 2: Objeto del contrato
Paso 3: Presupuesto
Paso 4: Documentación obligatoria
Paso 5: Validación automática
Paso 6: Confirmación

El sistema:
- Bloquea errores
- Sugiere campos
- Advierte riesgos

---

## 3.3 DISEÑO DE INTERFAZ

Principios:
- Diseño institucional moderno
- Lenguaje claro
- Colores neutros
- Iconografía funcional

Componentes:
- Tablas inteligentes
- Filtros dinámicos
- Estados visuales claros

---

## 3.4 USO DE BUILDER.IO / LOVABLE

Instrucciones a la IA:
- Generar componentes reutilizables
- Respetar lógica de rol
- No exponer datos no autorizados

---

## 3.5 ACCESIBILIDAD Y ADOPCIÓN

- Textos guiados
- Ayuda contextual
- Tooltips

---

## 3.6 RESULTADO OBLIGATORIO ETAPA 3

✔ Flujos cerrados por rol
✔ UI validada
✔ Listo para desarrollo funcional

---

NO AVANZAR A ETAPA 4 SIN VALIDACIÓN

---

## DESARROLLO DETALLADO – ETAPA 4

---

## ETAPA 4: DESARROLLO MODULAR (MÓDULO A MÓDULO, FLUJO RELACIONAL)

### OBJETIVO DE LA ETAPA

Implementar el sistema **módulo por módulo**, garantizando que **cada módulo nace ya conectado** con el anterior y el siguiente dentro del flujo completo de contratación pública.

Principio rector:
> *Cada módulo es autónomo, pero nunca aislado.*

---

## ORDEN ESTRATÉGICO DE DESARROLLO

1. Gestión Institucional
2. Registro Nacional de Proveedores (RNP)
3. Expedientes de Contratación
4. Licitaciones y Ofertas
5. Evaluación
6. Adjudicación y Contratos
7. Ejecución Contractual
8. Auditoría y Transparencia

No se salta ningún módulo.

---

## MÓDULO 1: GESTIÓN INSTITUCIONAL

### Funcionalidades
- CRUD de instituciones
- Jerarquía institucional
- Asignación de Admin Institucional

### Automatizaciones
- Creación de estructura base
- Asignación automática de permisos

### Validaciones
- No se puede crear expediente sin institución activa

---

## MÓDULO 2: REGISTRO NACIONAL DE PROVEEDORES (RNP)

### Funcionalidades
- Alta de proveedor
- Subida documental
- Clasificación

### Automatizaciones
- Checklist documental dinámica
- Bloqueo automático por vencimiento

### Relación
- Requisito obligatorio para ofertar

---

## MÓDULO 3: EXPEDIENTES DE CONTRATACIÓN

### Funcionalidades
- Creación guiada
- Asignación presupuestaria
- Documentación

### Automatizaciones
- Código único nacional
- Validación legal automática

### Relación
- Dispara licitación

---

## MÓDULO 4: LICITACIONES Y OFERTAS

### Funcionalidades
- Publicación
- Recepción de ofertas

### Automatizaciones
- Sellado temporal
- Bloqueo al cierre

### Relación
- Alimenta evaluación

---

## MÓDULO 5: EVALUACIÓN

### Funcionalidades
- Evaluación técnica y económica

### Automatizaciones
- Ranking automático
- Generación de acta

### Relación
- Prepara adjudicación

---

## MÓDULO 6: ADJUDICACIÓN Y CONTRATOS

### Funcionalidades
- Resolución
- Contrato digital

### Automatizaciones
- Registro histórico
- Activación ejecución

---

## MÓDULO 7: EJECUCIÓN CONTRACTUAL

### Funcionalidades
- Hitos
- Entregables

### Automatizaciones
- Alertas
- Informes de avance

---

## MÓDULO 8: AUDITORÍA Y TRANSPARENCIA

### Funcionalidades
- Paneles
- Exportación

### Automatizaciones
- Detección de riesgos

---

## RESULTADO OBLIGATORIO ETAPA 4

✔ Sistema funcional por capas
✔ Flujo completo garantizado
✔ Listo para automatización documental masiva

---

NO AVANZAR A ETAPA 5 SIN VALIDACIÓN

---

## DESARROLLO DETALLADO – ETAPA 5

---

## ETAPA 5: AUTOMATIZACIÓN DOCUMENTAL AVANZADA (PLANTILLAS VERSIONADAS Y CONFIGURABLES)

### OBJETIVO DE LA ETAPA

Implementar un **sistema central de generación documental inteligente**, capaz de producir documentos **jurídicamente consistentes**, versionados, auditables y configurables por la Administración, sin intervención manual.

Principio rector:
> *El documento es consecuencia del dato, no un archivo aislado.*

---

## 5.1 ARQUITECTURA DOCUMENTAL

### Componentes

- Base de datos de plantillas
- Motor de generación
- Control de versiones
- Registro de emisión
- Integración con módulos funcionales

---

## 5.2 MODELO DE DATOS DOCUMENTAL

### Tabla: `document_templates`
- id
- nombre_documento
- tipo (pliego, acta, resolución, contrato, informe)
- version
- estado (borrador, activo, obsoleto)
- ambito (nacional, institucional)
- institucion_id (nullable)
- formato (pdf, docx, xlsx)
- estructura_json
- fecha_creacion

---

### Tabla: `document_emissions`
- id
- template_id
- entidad_origen (expediente, contrato, proveedor)
- entidad_id
- version_utilizada
- hash_documento
- url_storage
- usuario_generador
- fecha_emision

---

## 5.3 MOTOR DE GENERACIÓN DOCUMENTAL

### Funcionamiento

1. Evento del sistema (ej. cierre evaluación)
2. Selección automática de plantilla activa
3. Inyección de datos desde Supabase
4. Generación del documento
5. Almacenamiento seguro
6. Registro inmutable

---

## 5.4 PLANTILLAS CONFIGURABLES

### Estructura

- Encabezado institucional
- Cuerpo legal con variables
- Bloques condicionales
- Tablas dinámicas
- Pie de trazabilidad

Las plantillas se definen en:
- JSON estructurado
- HTML base

---

## 5.5 DOCUMENTOS SOPORTADOS

- Pliegos de condiciones
- Actas de evaluación
- Resoluciones
- Contratos
- Informes periódicos

---

## 5.6 FORMATOS DE SALIDA

- PDF (oficial)
- Word (.docx) editable
- Excel (.xlsx) con tablas

---

## 5.7 EDGE FUNCTIONS DOCUMENTALES

### `generate_document`

Input:
- template_id
- entidad_origen
- entidad_id

Output:
- Documento generado

---

### `schedule_reports`

- Informes mensuales
- Informes trimestrales

---

## 5.8 SEGURIDAD Y AUDITORÍA

- Hash de cada documento
- No sobrescritura
- Historial completo

---

## 5.9 RESULTADO OBLIGATORIO ETAPA 5

✔ Sistema documental autónomo
✔ Plantillas versionadas
✔ Documentos oficiales generados sin error

---

NO AVANZAR A ETAPA 6 SIN VALIDACIÓN

---

## DESARROLLO DETALLADO – ETAPA 6

---

## ETAPA 6: ANALÍTICA AVANZADA, ESTADÍSTICAS PREDICTIVAS Y GESTIÓN DE RIESGOS

### OBJETIVO DE LA ETAPA

Construir el **cerebro analítico de la plataforma**, capaz no solo de describir el gasto y la contratación pública, sino de **anticipar riesgos, detectar patrones anómalos y apoyar la toma de decisiones estratégicas del Estado**.

Principio rector:
> *La contratación pública no se observa: se gobierna con datos.*

---

## 6.1 ARQUITECTURA DE ANALÍTICA

### Componentes

- Tablas analíticas optimizadas (views materializadas)
- Motor de reglas de riesgo
- Motor predictivo ligero
- Dashboards por rol
- Exportación estructurada

Separación clara:
- Datos operativos (core)
- Datos analíticos (analytics)

---

## 6.2 MODELO DE DATOS ANALÍTICO

### Vistas materializadas clave

- `mv_gasto_por_institucion`
- `mv_gasto_por_proveedor`
- `mv_tiempos_procedimiento`
- `mv_concentracion_adjudicaciones`
- `mv_modificaciones_contractuales`

Actualización:
- Programada (Edge Functions)

---

## 6.3 INDICADORES DESCRIPTIVOS

- Número de expedientes por periodo
- Gasto total y medio
- Procedimientos más usados
- Tiempos medios por fase
- Comparativas interanuales

---

## 6.4 INDICADORES PREDICTIVOS Y DE RIESGO

### Riesgos automáticos

- Fraccionamiento de contratos
- Concentración excesiva en proveedores
- Repetición de adjudicaciones
- Modificaciones reiteradas
- Desviaciones de plazo

Cada riesgo tiene:
- Regla
- Umbral
- Nivel (bajo, medio, alto)

---

## 6.5 MOTOR DE ALERTAS

### Funcionamiento

- Evento detectado
- Evaluación de reglas
- Generación de alerta
- Registro en auditoría

Alertas:
- Visuales (dashboard)
- Exportables

---

## 6.6 DASHBOARDS POR ROL

### Admin Nacional
- Riesgo país
- Ranking de instituciones

### Auditor
- Alertas críticas
- Acceso histórico

### Admin Institucional
- Riesgos locales
- Desempeño interno

---

## 6.7 EXPORTACIÓN Y REPORTING

- Excel analítico
- Informes automáticos
- Programación mensual y trimestral

---

## 6.8 PREPARACIÓN PARA IA FUTURA

- Datos estructurados
- Histórico limpio
- Base para modelos avanzados

---

## 6.9 RESULTADO OBLIGATORIO ETAPA 6

✔ Sistema analítico activo
✔ Riesgos detectados automáticamente
✔ Cuadros de mando operativos

---

NO AVANZAR A ETAPA 7 SIN VALIDACIÓN

---

## DESARROLLO DETALLADO – ETAPA 7

---

## ETAPA 7: SEGURIDAD, PRIVACIDAD, AUDITORÍA DISTRIBUIDA Y RESILIENCIA

### OBJETIVO DE LA ETAPA

Implementar un sistema de **seguridad y auditoría distribuida por institución**, supervisada por el nivel nacional, garantizando protección de datos, trazabilidad inalterable y resiliencia operativa a nivel país.

Principio rector:
> *Cada institución responde de su información, pero la supervisión nacional siempre tiene control y visibilidad.*

---

## 7.1 SEGURIDAD POR DISEÑO

- RLS estricto en todas las tablas
- Cifrado de datos en reposo y en tránsito
- Roles y permisos definidos por módulo
- Edge Functions verificando reglas de acceso

---

## 7.2 AUDITORÍA DISTRIBUIDA

### Componentes
- Logs locales por institución
- Replicación segura al nivel nacional
- Hash de cada acción y documento
- Versionado de cambios

### Políticas
- Cada institución registra sus acciones
- Nivel nacional solo lectura consolidada
- Auditor externo puede consultar todo sin modificar

---

## 7.3 PRIVACIDAD

- Datos personales cifrados
- Acceso limitado según rol y módulo
- Cumplimiento de normativas nacionales

---

## 7.4 RESILIENCIA Y CONTINUIDAD

- Backups programados y versionados
- Disaster recovery plan nacional
- Monitoreo de disponibilidad

---

## 7.5 RESULTADO OBLIGATORIO ETAPA 7

✔ Sistema seguro y auditable
✔ Auditoría distribuida funcionando
✔ Resiliencia garantizada

---

NO AVANZAR A ETAPA 8 SIN VALIDACIÓN

---

FIN DEL PROMPT MAESTRO

