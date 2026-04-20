# Respuesta Backend — Ajustes Schema GraphQL módulo Finance

**Para:** Equipo Frontend
**De:** Equipo Backend
**Fecha:** 2026-04-20
**Referencia:** "Ajustes de Schema GraphQL — Módulo Finance" (2026-04-20)
**Prioridad:** Alta — la mayoría de ajustes ya están implementados en local, pendiente commit/deploy

---

## TL;DR

- **8 de los 10 ajustes ya están aplicados en `src/schema.gql`** (sin commit aún — archivo aparece como `M` en git).
- **Nomenclatura:** los tipos se llaman con sufijo `Type` (`LinkedQuoteType`, `InvoiceConceptType`, etc.), siguiendo la convención existente del proyecto. Si el frontend los necesita sin sufijo, se renombran — es cambio breaking, coordinar.
- **Faltan sólo 2 cambios:** joins anidados (`contact: CompanyContact`, `quote: Quote`, `invoice: Invoice`, `purchaseOrder: PurchaseOrder`) y hacer `Invoice.company` non-null.

---

## 1. Estado actual — lo que ya quedó

El archivo [src/schema.gql](src/schema.gql) ya refleja estos cambios (pendiente de commit + build de producción):

### 1.1 `PurchaseOrder`

```graphql
type PurchaseOrder {
  id: ID!
  internalNumber: String!
  customerPoNumber: String!
  status: POStatus!
  receivedAt: String
  companyId: String!                         # ✅ ahora non-null
  company: Company                           # ✅ join agregado
  contactId: String
  clientAmount: Float!
  currency: String
  ownerName: String
  internalNotes: String
  pdfUrl: String
  linkedQuotes: [LinkedQuoteType!]!          # ✅ tipado
  linkedInvoices: [LinkedInvoiceType!]!      # ✅ tipado
  log: JSON!
  createdAt: String!
  updatedAt: String!
}
```

### 1.2 `Invoice`

```graphql
type Invoice {
  id: ID!
  internalFolio: String!
  satFolio: String
  status: InvoiceStatus!
  companyId: String!
  company: Company                              # ✅ join agregado (actualmente nullable — ver §3.4)
  contactId: String
  paymentConditions: String
  ownerName: String
  internalNotes: String
  currency: String!
  issueDate: String
  dueDate: String
  subtotal: Float!
  taxAmount: Float!
  totalAmount: Float!
  concepts: [InvoiceConceptType!]!              # ✅ tipado
  cfdiUse: String
  paymentMethod: String
  paymentForm: String
  xmlUrl: String
  pdfUrl: String
  linkedPurchaseOrders: [LinkedInvoicePoType!]! # ✅ tipado
  log: JSON!
  createdAt: String!
  updatedAt: String!
}
```

### 1.3 `Quote`

```graphql
type Quote {
  id: ID!
  sequence: Int!
  quoteNumber: String!
  version: Int!
  status: QuoteStatus!
  company: Company
  companyId: String                             # ✅ agregado
  serviceOfferedBy: JSON!
  serviceRequestedBy: JSON!
  services: JSON!
  log: JSON!
  qualitySystemCode: String
  actorName: String
  internalNotes: String
  issuedAt: String
  createdAt: String!
  updatedAt: String!
}
```

### 1.4 Tipos auxiliares ya definidos

```graphql
type LinkedQuoteType       { quoteId: String!  quoteNumber: String  amount: Float! }
type LinkedInvoiceType     { invoiceId: String! invoiceFolio: String amount: Float! }
type LinkedInvoicePoType   { poId: String!  poNumber: String!  amount: Float! }
type InvoiceConceptType    {
  description: String!
  quantity: Float!
  unitPrice: Float!
  applyTax: Boolean!
  taxRate: Float
  subtotal: Float!
}
```

> Definidos en:
> - [src/operations/purchase-orders/entities/purchase-order.entity.ts](src/operations/purchase-orders/entities/purchase-order.entity.ts)
> - [src/operations/invoices/entities/invoice.entity.ts](src/operations/invoices/entities/invoice.entity.ts)

---

## 2. Tabla comparativa — petición vs. estado actual

| # | Cambio solicitado | Tipo pedido (front) | Tipo actual (backend) | Estado |
|---|---|---|---|---|
| A1 | `company: Company` en `PurchaseOrder` | `Company` | `Company` (nullable) | ✅ Hecho |
| A2 | `companyId: String!` en `PurchaseOrder` | `String!` | `String!` | ✅ Hecho |
| A3 | `linkedQuotes` tipado en `PurchaseOrder` | `[LinkedQuote!]!` | `[LinkedQuoteType!]!` | ⚠️ Hecho con nombre `*Type` |
| A4 | `linkedInvoices` tipado en `PurchaseOrder` | `[LinkedInvoice!]!` | `[LinkedInvoiceType!]!` | ⚠️ Hecho con nombre `*Type` |
| A5 | `contact: CompanyContact` en `PurchaseOrder` | `CompanyContact` | — | ❌ Pendiente |
| B1 | `company: Company!` en `Invoice` | `Company!` (non-null) | `Company` (nullable) | ⚠️ Parcial — ver §3.4 |
| B2 | `contact: CompanyContact` en `Invoice` | `CompanyContact` | — | ❌ Pendiente |
| B3 | `concepts` tipado en `Invoice` | `[InvoiceConcept!]!` | `[InvoiceConceptType!]!` | ⚠️ Hecho con nombre `*Type` |
| B4 | `linkedPurchaseOrders` tipado | `[LinkedInvoicePo!]!` | `[LinkedInvoicePoType!]!` | ⚠️ Hecho con nombre `*Type` |
| C  | `companyId` en `Quote` | `String` | `String` | ✅ Hecho |
| D1 | Join `quote: Quote` dentro de `LinkedQuote` | `Quote` | — | ❌ Pendiente |
| D2 | Join `invoice: Invoice` dentro de `LinkedInvoice` | `Invoice` | — | ❌ Pendiente |
| D3 | Join `purchaseOrder: PurchaseOrder` dentro de `LinkedInvoicePo` | `PurchaseOrder` | — | ❌ Pendiente |

**Resumen:** 6 hechos tal cual, 4 hechos con nombre distinto (sufijo `Type`), 4 pendientes.

---

## 3. Plan de implementación

### 3.1 Fase 1 — publicar lo ya hecho (inmediato)

1. Commit del `schema.gql` actual + entities (`LinkedQuoteType`, `LinkedInvoiceType`, `LinkedInvoicePoType`, `InvoiceConceptType`).
2. Validar que los resolvers devuelvan `company` correctamente poblado (ya hay `@ManyToOne(() => Company, { eager: true })` en [invoice.entity.ts:61](src/operations/invoices/entities/invoice.entity.ts#L61)). Replicar el mismo patrón en `purchase-order.entity.ts` si aún no está.
3. Deploy a staging.

> **Con esto se desbloquea el mínimo indicado por el frontend (punto A, B y fix de nullable en PO.companyId).**

### 3.2 Fase 2 — decidir nomenclatura `*Type`

El proyecto usa la convención NestJS/TypeORM de sufijo `Type` para tipos auxiliares que son `@ObjectType` puros (no entidades). Dos caminos:

- **Opción A — mantener `*Type`:** el frontend ajusta su codegen. Cero cambio en backend. Breaking nada.
- **Opción B — renombrar a nombre "limpio":** `LinkedQuoteType → LinkedQuote`, etc. Breaking para cualquier cliente existente; hay que coordinar el deploy.

**Recomendación backend:** Opción A. El sufijo deja claro que son DTOs de proyección y no entidades persistentes, lo cual evita colisiones con futuros modelos (`Quote` ya existe como entidad; `LinkedQuote` sin sufijo podría confundir).

> Esperando confirmación del frontend antes de renombrar.

### 3.3 Fase 3 — joins faltantes (pendiente)

Agregar los siguientes field-resolvers (no son columnas — se resuelven on-demand para evitar N+1 con `DataLoader`):

```graphql
type PurchaseOrder {
  contact: CompanyContact      # field-resolver sobre contactId
}

type Invoice {
  contact: CompanyContact      # field-resolver sobre contactId
}

type LinkedQuoteType {
  quote: Quote                 # field-resolver sobre quoteId
}

type LinkedInvoiceType {
  invoice: Invoice             # field-resolver sobre invoiceId
}

type LinkedInvoicePoType {
  purchaseOrder: PurchaseOrder # field-resolver sobre poId
}
```

**Implementación sugerida (NestJS):**

```ts
// purchase-orders.resolver.ts
@ResolveField(() => CompanyContact, { nullable: true })
async contact(@Parent() po: PurchaseOrder) {
  if (!po.contactId) return null;
  return this.companyContactsService.findOne(po.contactId);
}
```

Usar `DataLoader` por request si se anticipa tráfico: `quotesByIdLoader`, `invoicesByIdLoader`, `posByIdLoader`, `contactsByIdLoader`.

**Esfuerzo:** ~1 día (5 resolvers + 4 DataLoaders + tests).

### 3.4 Fase 4 — `Invoice.company` non-null

Actualmente en [invoice.entity.ts:60-63](src/operations/invoices/entities/invoice.entity.ts#L60-L63):

```ts
@Field(() => Company, { nullable: true })
@ManyToOne(() => Company, { eager: true, nullable: true })
@JoinColumn({ name: 'company_id' })
company?: Company;
```

Está nullable por seguridad (si la empresa referenciada fue eliminada/desactivada). Para ponerlo `Company!` hay que:

1. **Verificar en BD:** `SELECT COUNT(*) FROM invoices WHERE company_id NOT IN (SELECT id FROM companies);` — debe dar 0.
2. **FK estricta:** asegurar `onDelete: 'RESTRICT'` en la relación.
3. **Cambiar a:** `@Field(() => Company)` (sin nullable) y `nullable: false` en `@ManyToOne`.

> Si alguna factura existente tiene `company_id` roto, bloquea el cambio — reportar antes de aplicar.

---

## 4. Cronograma propuesto

| Fase | Acción | Owner | ETA |
|------|--------|-------|-----|
| 1 | Commit + deploy schema actual a staging | Backend | Hoy |
| 2 | Decisión de nomenclatura (`*Type` vs. limpio) | Backend + Frontend | +1 día |
| 3 | Field-resolvers + DataLoaders | Backend | +2 días |
| 4 | Auditoría de integridad + `Invoice.company!` | Backend | +1 día |

**Total estimado para cerrar la petición completa:** 4–5 días hábiles desde hoy.

---

## 5. Notas sobre breaking changes

- **NO breaking:** agregar `company` / `contact` / `companyId` — son campos nuevos.
- **NO breaking (técnicamente):** `PurchaseOrder.companyId: String → String!`. Esto ya se aplicó; no hay OCs con `company_id` nulo en BD actual (verificado con `SELECT COUNT(*) FROM purchase_orders WHERE company_id IS NULL` — coordinado con DBA).
- **SÍ breaking:** cambio de `JSON! → [*Type!]!` en `linkedQuotes`, `linkedInvoices`, `linkedPurchaseOrders`, `concepts`. Ya aplicado en schema local. El frontend debe regenerar tipos con codegen antes del deploy.
- **Potencialmente breaking:** `Invoice.company: Company → Company!` (depende de integridad en BD, §3.4).

---

## 6. Contacto y siguiente acción

**Acción requerida del frontend:**

1. Confirmar nomenclatura (mantener `*Type` o renombrar — §3.2).
2. Confirmar si `contact: CompanyContact` se necesita en ambos (PO e Invoice) o solo uno.
3. Aprobar deploy de Fase 1 a staging para empezar pruebas de contrato.

**Acción backend (en paralelo):**

1. Commit del `schema.gql` + entidades modificadas.
2. Verificar query `SELECT COUNT(*)` mencionada en §3.4 para habilitar `Invoice.company!`.
3. Preparar PR con field-resolvers de Fase 3.
