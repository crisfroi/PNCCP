# ETAPA 6: Integraciones de Automatización Documental + Analítica Avanzada

## 📋 Objetivo General

Integrar el sistema de generación automática de documentos (Etapa 5) en los flujos de contratación existentes (M4-M7) y crear capacidades de **análisis avanzado** con dashboards, reportería y KPIs para mejorar la visibilidad y toma de decisiones en la administración pública.

**Principios rectores:**
> *La administración debe disponer de datos en tiempo real para la toma de decisiones estratégicas*  
> *Cada documento generado es una oportunidad de auditoría y análisis*  
> *La transparencia se construye con datos estructurados y accesibles*

---

## 🏗️ Estructura de Implementación

### FASE 1: Integraciones de Documentos Automáticos (Semanas 1-2)

#### 1.1 **Licitaciones (M4) → Pliego de Condiciones**

**Archivo:** `frontend/src/pages/LicitacionesList.tsx`

**Cambios:**
1. Agregar función `generarPliego()` al publicar licitación
   - Llamar Edge Function `generate-documents`
   - Variables: objeto, presupuesto, fecha_cierre, requisitos
   - Template: `categoria = 'pliego_tipo'`
   - Format: PDF
   - Mostrar spinner mientras se genera
   - Guardar `document_emission_id` en licitación (nueva columna `pliego_emission_id`)

2. Mostrar botón "Descargar Pliego" si ya fue generado

3. En vista expandible:
   - Mostrar fecha de generación del pliego
   - Hash de integridad (primeros 16 caracteres)
   - Opción de regenerar si cambia algo

**Base de datos:**
- Agregar columna `pliego_emission_id UUID FK` en `procurement.licitaciones`
- Índice en esta columna

---

#### 1.2 **Evaluaciones (M5) → Acta de Evaluación**

**Archivo:** `frontend/src/pages/EvaluacionesPage.tsx`

**Cambios:**
1. Agregar función `generarActaEvaluacion()` cuando estado = "completada"
   - Llamar Edge Function con variables de evaluación
   - Variables: ofertas_evaluadas, puntajes, observaciones, fecha_evaluacion
   - Template: `categoria = 'acta_evaluacion'`
   - Format: PDF o Excel
   - Estado: generado automáticamente
   - Guardar `acta_emission_id` en `procurement.licitaciones`

2. Mostrar badge "📄 Acta Generada" si existe

3. Link a "Ver Acta" en listado de evaluaciones

**Base de datos:**
- Agregar columna `acta_emission_id UUID FK` en `procurement.licitaciones`

---

#### 1.3 **Adjudicaciones (M6) → Resolución + Contrato**

**Archivo:** `frontend/src/pages/AdjudicacionesPage.tsx`

**Cambios:**
1. Al adjudicar oferta ganadora:
   - Generar automáticamente **Resolución de Adjudicación**
   - Variables: ganador (nombre proveedor), monto, fundamentación
   - Template: `categoria = 'resolucion'`
   - Mostrar enlace al documento

2. Al crear contrato (post-adjudicación):
   - Generar automáticamente **Contrato Público**
   - Variables: partes (institución + proveedor), objeto, monto, fechas
   - Template: `categoria = 'contrato'`
   - Format: PDF + Word (2 emisiones)
   - Marcar como "listo para firma" en UI

3. Guardar IDs de emisión en tabla `core.contratos`:
   - `resolucion_emission_id UUID`
   - `contrato_emission_id UUID`

**Base de datos:**
- Agregar 2 columnas en `core.contratos`
- Índices para búsqueda

---

#### 1.4 **Ejecución Contractual (M7) → Informes + Certificados**

**Archivo:** `frontend/src/pages/ContratosList.tsx`

**Cambios:**
1. Crear hito contractual:
   - Opción checkbox "Generar informe de cumplimiento"
   - Si activado: generar **Informe de Ejecución**
   - Variables: hito_descripcion, cumplimiento_porcentaje, fecha_real_vs_prevista
   - Template: `categoria = 'informe'`

2. Al finalizar contrato (cambiar estado a "cerrado"):
   - Generar automáticamente **Certificado de Cumplimiento**
   - Variables: responsable, monto_ejecutado, fechas, conclusiones
   - Template: `categoria = 'certificado'`
   - Guardar `certificado_emission_id`

3. Mostrar historial de documentos generados en vista expandible

**Base de datos:**
- Agregar columna `certificado_emission_id UUID` en `core.contratos`
- Agregar columna `informe_emission_id UUID` en `execution.hitos_contrato`

---

### FASE 2: Dashboard de Analítica (Semanas 3-4)

#### 2.1 **Crear DashboardAnalytics.tsx**

**Ruta:** `/analytics` o `/dashboard-avanzado`

**Componentes:**

1. **KPIs de Expedientes**
   ```
   ┌─────────────────────────────────┐
   │ Total Expedientes:    156        │
   │ En Licitación:        42         │
   │ Evaluando:            18         │
   │ Adjudicados:          96         │
   │ Valor Total:          $8.2M XAF  │
   └─────────────────────────────────┘
   ```

2. **Gráfico: Expedientes por Estado**
   - Tipo: Pie chart
   - Segmentos: borrador, licitacion, evaluacion, adjudicado, ejecutando, cerrado
   - Query: `COUNT(*) GROUP BY estado FROM core.expedientes`

3. **Gráfico: Presupuesto por Institución**
   - Tipo: Bar chart horizontal
   - X: Institución
   - Y: Suma presupuesto
   - Top 10 instituciones

4. **KPIs de Licitaciones**
   ```
   ┌──────────────┬──────────────┬──────────────┐
   │ Publicadas   │ Cerradas     │ Promedio     │
   │ Este mes: 12 │ Este mes: 8   │ ofertas: 6.2 │
   └──────────────┴──────────────┴──────────────┘
   ```

5. **Gráfico: Tiempo Promedio de Ciclo**
   - X: Fase (licitación → evaluación → adjudicación)
   - Y: Días promedio
   - Benchmark vs meta

6. **KPIs de Documentos Generados**
   ```
   ┌──────────────────────────────────┐
   │ Documentos Generados (Mes): 84   │
   │ Pliegos:        34               │
   │ Actas:          28               │
   │ Resoluciones:   12               │
   │ Contratos:      10               │
   └──────────────────────────────────┘
   ```

7. **Tabla: Últimos Expedientes Adjudicados**
   - Código, objeto, monto, ganador, fecha
   - Con indicador visual de estado de contrato

8. **Tabla: Contratos Próximos a Vencer**
   - Código contrato, objeto, fecha fin, días restantes
   - Color rojo si < 30 días

#### 2.2 **Crear ReportePorInstitución.tsx**

**Ruta:** `/reporte-institucion`

**Funcionalidades:**
1. Selector de institución (Admin Nacional)
   - O mostrar solo la propia (Admin Institucional)

2. Metrics por institución:
   - Total expedientes creados
   - Valor total en procesos
   - Promedio de expedientes/mes
   - Tasa de adjudicación
   - Tiempo promedio de ciclo

3. Gráficos:
   - Timeline de expedientes creados (últimos 12 meses)
   - Distribución por tipo de procedimiento
   - Proveedores más contratados (top 5)

4. Exportar a Excel:
   - Botón "Descargar Reporte"
   - Generar archivo con métricas + gráficos

#### 2.3 **Crear AnalyticsCards.tsx** (Componente)

**Uso:** Reutilizable en dashboards

```tsx
<AnalyticsCard
  title="Total Expedientes"
  value="156"
  change="+12 vs. mes anterior"
  changePercent={8.3}
  trend="up"
  icon={<FileText />}
  color="blue"
/>
```

---

### FASE 3: Mejoras de Reportería (Semana 4-5)

#### 3.1 **Mejorar AuditoriaPage.tsx**

**Cambios:**
1. Agregar filtro por tabla (no solo operación)
2. Agregar visualización JSON formateado en vista expandible
3. Botón "Exportar período" (genera CSV/JSON de todo el período)
4. Indicador visual de cambios significativos (monto, estado)

#### 3.2 **Crear ExportManager.tsx**

**Funcionalidad:**
1. Exportación de:
   - Expedientes → Excel con datos completos
   - Licitaciones → Excel con ofertas y evaluaciones
   - Contratos → Excel con hitos y estado
   - Documentos → CSV con metadata y hashes

2. Formato estándar:
   - Header PNCCP
   - Fecha de generación
   - Usuario que exportó
   - Período cubierto
   - Plantilla para cada entidad

#### 3.3 **Crear ReportePeriodico.tsx**

**Ruta:** `/reporte-periodico`

**Periodo selector:** 
- Semanal
- Mensual
- Trimestral
- Anual

**Contenido:**
1. Resumen ejecutivo (KPIs principales)
2. Análisis por módulo
3. Alertas (documentos vencidos, contratos a punto de vencer)
4. Top instituciones por actividad
5. Proveedores más activos

---

### FASE 4: Optimizaciones y Preparación para Producción (Semana 5-6)

#### 4.1 **Performance Optimization**

**Queries:**
1. Crear vistas (materialized) para:
   - `v_expedientes_stats` (stats precalculadas)
   - `v_licitaciones_por_mes` (timeline)
   - `v_documentos_por_categoria` (resumen documental)

2. Índices adicionales:
   - `idx_expedientes_institucion_estado_fecha` (compound)
   - `idx_licitaciones_fecha_estado`
   - `idx_contratos_fecha_fin_estado` (para alertas)

3. Caching a nivel de aplicación:
   - React Query para cachear KPIs
   - Invalidar en mutaciones

#### 4.2 **Seguridad y Auditoría**

1. Verificar RLS en nuevas columnas
2. Agregar log en `audit.logs` para:
   - Generación de documentos
   - Descargas de reportes
   - Acceso a datos sensibles

3. Rate limiting en exportaciones (máximo 1 por minuto)

#### 4.3 **Documentación**

1. Guía de uso de Dashboard
2. Explicación de cada métrica
3. Cómo generar reportes personalizados
4. Troubleshooting común

---

## 📊 Especificaciones Técnicas

### Frontend - Nuevos Componentes

```typescript
// AnalyticsCard.tsx
interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: string
  changePercent?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

// DocumentStatusBadge.tsx
interface DocumentStatusBadgeProps {
  status: 'generado' | 'enviado' | 'archivado' | 'revocado'
  emissionDate: string
  hash?: string
}

// ExportButton.tsx
interface ExportButtonProps {
  data: any[]
  format: 'csv' | 'xlsx' | 'json'
  filename: string
}
```

### Backend - Nuevas Queries

```sql
-- Vista de estadísticas de expedientes
CREATE VIEW v_expedientes_stats AS
SELECT
  estado,
  COUNT(*) as total,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as dias_promedio,
  SUM(presupuesto) as presupuesto_total
FROM core.expedientes
GROUP BY estado;

-- Vista de documentos por mes
CREATE VIEW v_documentos_por_mes AS
SELECT
  DATE_TRUNC('month', fecha_emision)::DATE as mes,
  categoria,
  COUNT(*) as total
FROM documents.document_emissions
GROUP BY DATE_TRUNC('month', fecha_emision), categoria;

-- Vista de contratos próximos a vencer
CREATE VIEW v_contratos_vencimiento_proximo AS
SELECT
  id, codigo_contrato, objeto_contrato, 
  fecha_fin, 
  (fecha_fin - CURRENT_DATE) as dias_restantes
FROM core.contratos
WHERE estado = 'vigente' 
  AND fecha_fin > CURRENT_DATE 
  AND fecha_fin <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY fecha_fin ASC;
```

### Edge Functions - Mejoras

**Opcional:** Crear Edge Function para reportes programados
- `generate-scheduled-report`
- Invocable por cron job (cada lunes 8 AM)
- Envía resumen por email

---

## 📋 Checklist de Implementación

### FASE 1: Integraciones
- [ ] LicitacionesList → generación de pliego
- [ ] EvaluacionesPage → generación de acta
- [ ] AdjudicacionesPage → resolución + contrato
- [ ] ContratosList → informes + certificados
- [ ] Pruebas de flujo end-to-end
- [ ] Migración de BD para nuevas columnas

### FASE 2: Dashboard
- [ ] DashboardAnalytics.tsx creado
- [ ] Componente AnalyticsCard
- [ ] KPIs implementados
- [ ] Gráficos funcionales
- [ ] ReportePorInstitución.tsx
- [ ] Integración con Supabase

### FASE 3: Reportería
- [ ] Mejoras a AuditoriaPage
- [ ] ExportManager.tsx
- [ ] ReportePeriodico.tsx
- [ ] Formatos (CSV, XLSX, JSON)

### FASE 4: Optimización
- [ ] Vistas materializadas creadas
- [ ] Índices adicionales
- [ ] React Query configurado
- [ ] RLS verificado
- [ ] Auditoría de accesos
- [ ] Documentación completada

### Testing
- [ ] Generar documento en cada módulo
- [ ] Verificar integridad (hash)
- [ ] Dashboard carga correctamente
- [ ] Exportar reporte sin errores
- [ ] Performance aceptable

---

## 🎯 Criterios de Aceptación

| Criterio | Éxito | Evidencia |
|----------|-------|-----------|
| Documentos auto-generados en M4-M7 | ✅ | Función genera + registra |
| Dashboard operativo | ✅ | Métricas cargan en <2s |
| Reportería funcional | ✅ | Export genera archivo válido |
| RLS en nuevas columnas | ✅ | Policies aplicadas |
| Performance optimizado | ✅ | Queries < 500ms |
| Documentación completa | ✅ | Etapa6-implementacion.md |
| Tests pasados | ✅ | E2E tests ejecutados |

---

## 📈 Impacto Esperado

### Para Administradores
- ✅ Visibilidad en tiempo real del ciclo de contratación
- ✅ Alertas automáticas de eventos clave
- ✅ Reportes ejecutivos para toma de decisiones

### Para Auditores
- ✅ Trazabilidad completa de documentos
- ✅ Hashes verificables de integridad
- ✅ Exportación de datos para análisis externo

### Para Proveedores
- ✅ Documentos generados automáticamente (más rápido)
- ✅ Transparencia en evaluaciones
- ✅ Acceso a historia de contratos

### Indicadores Clave (KPI)
- ⏱️ Reducción de tiempo de ciclo (meta: -25%)
- 📄 Aumento de documentos versionados
- 📊 Mejora en acceso a información
- 🔒 Auditoría 100% trazable

---

## ⏱️ Timeline

| Fase | Duración | Hito |
|------|----------|------|
| 1. Integraciones | 2 semanas | Documentos auto en M4-M7 |
| 2. Dashboard | 2 semanas | Analítica operativa |
| 3. Reportería | 1.5 semanas | Exportes funcionando |
| 4. Optimización | 1.5 semanas | Production-ready |
| **Total** | **~7 semanas** | ETAPA 6 Completada ✅ |

---

## 🚀 Próximos Pasos (ETAPA 7+)

### ETAPA 7: Firma Electrónica
- Integración con prestador de servicios de firma
- Flujo de firma para documentos críticos
- Validación de firmas

### ETAPA 8: Notificaciones y Alertas
- Sistema de email automático
- SMS para eventos críticos
- Dashboard de notificaciones en UI

### ETAPA 9: Internacionalización
- Soporte multi-idioma
- Conversión de monedas
- Formatos regionales

### ETAPA 10: Escalabilidad
- Replicación de BD
- CDN para archivos
- Auto-scaling de Edge Functions

---

## 📚 Documentos a Crear

- ✅ `docs/etapa6-plan.md` (este documento)
- [ ] `docs/etapa6-implementacion.md` (durante desarrollo)
- [ ] `docs/etapa6-validacion.md` (después de completar)

---

**PLAN ETAPA 6 APROBADO PARA EJECUCIÓN** ✅

Próximo paso: Iniciar FASE 1 (Integraciones de Documentos)
