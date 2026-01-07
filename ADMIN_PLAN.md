# 🔐 Plan Complet - Dashboard Admin Alliance Shipping

## 📊 Pages du Dashboard Admin

### 1. **Dashboard Principal** (`/admin`)
- Overview général
- Statistiques clés
- Graphiques revenue
- Alertes importantes

### 2. **Users** (`/admin/users`)
- Liste de tous les utilisateurs
- Recherche et filtres
- Voir détails utilisateur
- Statistiques par utilisateur
- Bloquer/Débloquer utilisateur

### 3. **Packages - Vue Globale** (`/admin/packages`)
- Tous les colis (toutes statuts)
- Recherche avancée
- Filtres multiples
- Export CSV/Excel

### 4. **Request Packages** (`/admin/packages/requested`)
- Colis demandés (pas encore reçus)
- Approuver/Rejeter demandes
- Assigner tracking number

### 5. **Received Packages** (`/admin/packages/received`)
- Colis reçus à Miami
- Prêts pour traitement
- Scanner et enregistrer

### 6. **In Transit** (`/admin/packages/in-transit`)
- Colis en cours de transport
- Mettre à jour localisation
- Statut douanes

### 7. **Available for Pickup** (`/admin/packages/available`)
- Colis arrivés en Haïti
- Prêts pour retrait
- Notifier clients

### 8. **Delivered** (`/admin/packages/delivered`)
- Colis livrés
- Historique complet
- Signature/Photo de livraison

### 9. **Analytics** (`/admin/analytics`)
- Revenue par jour/semaine/mois
- Graphiques
- Top clients
- Performance par destination

### 10. **Fees Management** (`/admin/fees`)
- Frais de service ($5)
- Prix par livre ($4)
- Frais parfum
- Modifier les tarifs

### 11. **Special Items Fees** (`/admin/special-items`)
- iPhone 7 → iPhone 17 (prix fixe)
- Samsung Galaxy S6 → Latest (prix fixe)
- Starlink (prix fixe)
- Autres items spéciaux
- CRUD complet

### 12. **Announcements** (`/admin/announcements`)
- Publier messages
- News pour la page publique
- Notifications push
- Programmer publications

---

## 🗄️ Schéma Base de Données (Nouvelles Tables)

### Tables à Créer/Modifier:

#### 1. `admins`
```sql
- id (serial primary key)
- user_id (foreign key → users)
- role (enum: super_admin, admin, moderator)
- permissions (jsonb)
- created_at, updated_at
```

#### 2. `package_requests` (Nouvelles demandes)
```sql
- id (serial primary key)
- user_id (foreign key)
- description
- estimated_weight
- sender_info (jsonb)
- recipient_info (jsonb)
- status (pending, approved, rejected)
- admin_notes
- created_at, updated_at
```

#### 3. `service_fees` (Configuration des frais)
```sql
- id (serial primary key)
- fee_type (service_fee, per_pound, perfume_extra)
- amount (decimal)
- currency (default: USD)
- effective_from (date)
- is_active (boolean)
- created_by (foreign key → admins)
- created_at, updated_at
```

#### 4. `special_item_fees` (Items spéciaux)
```sql
- id (serial primary key)
- category (enum: phone, tablet, electronics, other)
- brand (varchar)
- model (varchar)
- min_generation (varchar) // Ex: iPhone 7
- max_generation (varchar) // Ex: iPhone 17
- fixed_fee (decimal)
- description
- is_active (boolean)
- created_at, updated_at
```

#### 5. `announcements`
```sql
- id (serial primary key)
- title
- content (text)
- type (news, alert, promo, maintenance)
- target_audience (all, users, specific_users)
- published (boolean)
- publish_date (timestamp)
- expiry_date (timestamp)
- created_by (foreign key → admins)
- created_at, updated_at
```

#### 6. `delivery_proof` (Preuves de livraison)
```sql
- id (serial primary key)
- package_id (foreign key)
- signature_image_url
- photo_url
- recipient_name
- delivered_to_alternate (boolean)
- alternate_recipient_name
- notes
- delivered_at (timestamp)
```

#### 7. `revenue_records` (Enregistrements revenus)
```sql
- id (serial primary key)
- package_id (foreign key)
- amount (decimal)
- payment_method (cash, card, mobile)
- transaction_id
- recorded_by (foreign key → admins)
- recorded_at (timestamp)
```

#### 8. `admin_activity_logs` (Logs admin)
```sql
- id (serial primary key)
- admin_id (foreign key)
- action (string)
- target_type (user, package, announcement, etc.)
- target_id (integer)
- details (jsonb)
- ip_address
- created_at
```

#### 9. Modifier `packages` table (Ajouter colonnes)
```sql
ALTER TABLE packages ADD COLUMN:
- assigned_to_admin (foreign key → admins)
- location_details (jsonb) // Localisation détaillée
- special_item_id (foreign key → special_item_fees)
- delivery_proof_id (foreign key → delivery_proof)
- priority (enum: normal, urgent, express)
```

---

## 🎨 UI/UX Admin Dashboard

### Layout Structure:
```
┌─────────────────────────────────────────┐
│  Top Bar: Logo | Search | Notifications │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │      Main Content            │
│          │                              │
│ - Users  │  [Dashboard Content Here]    │
│ - Pkgs   │                              │
│ - Fees   │                              │
│ - News   │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Design System:
- **Couleurs**: Primary blue (#0066CC), Success green, Warning yellow, Danger red
- **Tables**: DataTables avec pagination, tri, export
- **Charts**: Recharts pour analytics
- **Forms**: React Hook Form + Zod validation
- **Modals**: Headless UI
- **Toast**: Sonner pour notifications

---

## 🔐 Système de Permissions

### Rôles:
1. **Super Admin** - Accès total
2. **Admin** - Gestion packages, users (read-only fees)
3. **Moderator** - Voir packages, update status

### Permissions Granulaires:
```typescript
{
  users: { read, create, update, delete, block },
  packages: { read, create, update, delete, assign },
  fees: { read, update },
  special_items: { read, create, update, delete },
  announcements: { read, create, update, delete, publish },
  analytics: { read, export },
}
```

---

## 📱 API Routes à Créer

### Admin Auth:
- `POST /api/admin/login` - Login admin
- `GET /api/admin/verify` - Vérifier session

### Users:
- `GET /api/admin/users` - Liste users
- `GET /api/admin/users/[id]` - User détails
- `PATCH /api/admin/users/[id]` - Update user
- `POST /api/admin/users/[id]/block` - Block/unblock

### Packages:
- `GET /api/admin/packages` - Tous les colis
- `GET /api/admin/packages/[status]` - Par statut
- `PATCH /api/admin/packages/[id]` - Update package
- `POST /api/admin/packages/[id]/assign` - Assigner admin
- `POST /api/admin/packages/[id]/location` - Update location

### Fees:
- `GET /api/admin/fees` - Liste fees
- `POST /api/admin/fees` - Créer nouveau fee
- `PATCH /api/admin/fees/[id]` - Update fee

### Special Items:
- `GET /api/admin/special-items` - Liste items
- `POST /api/admin/special-items` - Créer item
- `PATCH /api/admin/special-items/[id]` - Update
- `DELETE /api/admin/special-items/[id]` - Delete

### Announcements:
- `GET /api/admin/announcements` - Liste
- `POST /api/admin/announcements` - Créer
- `PATCH /api/admin/announcements/[id]` - Update
- `POST /api/admin/announcements/[id]/publish` - Publier

### Analytics:
- `GET /api/admin/analytics/revenue` - Revenue data
- `GET /api/admin/analytics/packages` - Package stats
- `GET /api/admin/analytics/users` - User stats

---

## 🚀 Ordre d'Implémentation

### Phase 1: Database & Auth (Jour 1)
1. ✅ Créer schéma Drizzle complet
2. ✅ Push schema to database
3. ✅ Créer table admins
4. ✅ Système auth admin (separate from Clerk)
5. ✅ Middleware protection routes admin

### Phase 2: Layout & Navigation (Jour 1-2)
6. ✅ Layout admin avec sidebar
7. ✅ Top bar avec search/notifications
8. ✅ Navigation menu
9. ✅ Dashboard principal (stats)

### Phase 3: Users Management (Jour 2)
10. ✅ Page liste users
11. ✅ User details modal
12. ✅ Block/unblock functionality
13. ✅ Search & filters

### Phase 4: Packages Management (Jour 3-4)
14. ✅ Page packages globale
15. ✅ Pages par statut (requested, received, etc.)
16. ✅ Update status workflow
17. ✅ Assign to admin
18. ✅ Location tracking
19. ✅ Delivery proof upload

### Phase 5: Fees Management (Jour 5)
20. ✅ Page service fees
21. ✅ CRUD fees
22. ✅ Special items management
23. ✅ CRUD special items (iPhone, Samsung, Starlink)

### Phase 6: Announcements (Jour 5)
24. ✅ Page announcements
25. ✅ Create/edit announcements
26. ✅ Publish system
27. ✅ Schedule publishing

### Phase 7: Analytics (Jour 6)
28. ✅ Revenue charts
29. ✅ Package statistics
30. ✅ User analytics
31. ✅ Export functionality

### Phase 8: Polish & Testing (Jour 7)
32. ✅ Activity logs
33. ✅ Notifications system
34. ✅ Error handling
35. ✅ Loading states
36. ✅ Testing complet

---

## 📦 Dépendances Supplémentaires

```json
{
  "@tanstack/react-table": "latest",  // Tables
  "recharts": "latest",               // Charts
  "react-hot-toast": "latest",        // Notifications
  "@headlessui/react": "latest",      // Modals
  "date-fns": "latest",               // Dates (déjà installé)
  "react-dropzone": "latest",         // Upload files
  "xlsx": "latest",                   // Export Excel
  "bcryptjs": "latest",               // Hash passwords admin
  "jose": "latest"                    // JWT pour admin auth
}
```

---

## 🔒 Sécurité

1. **Auth Admin Séparée** - Pas Clerk, système custom
2. **JWT Tokens** - Short lived (1h)
3. **Refresh Tokens** - Long lived (7 days)
4. **Rate Limiting** - Protection API
5. **Activity Logs** - Toutes les actions admin
6. **2FA** - Optionnel pour super admin
7. **IP Whitelist** - Optionnel

---

## 📊 Métriques à Tracker

- Revenue total (jour/semaine/mois/année)
- Nombre de colis par statut
- Temps moyen de livraison
- Top 10 clients
- Revenue par destination
- Items spéciaux les plus envoyés
- Performance par admin

---

**Temps Estimé Total: 7 jours de dev intensif**
**Niveau de Complexité: ⭐⭐⭐⭐⭐ (Expert)**
