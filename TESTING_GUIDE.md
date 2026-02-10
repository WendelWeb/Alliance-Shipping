# Guide de Test - Articles Spéciaux + Frais Douane

## 📋 Pré-requis

### 1. Seed des Articles Spéciaux

**Exécuter avec connexion internet:**
```bash
cd alliance-shipping-web
npx tsx lib/db/seed-special-items.ts
```

**Vérifier que 5 articles sont créés:**
- iPhone 15/16 ($45)
- Samsung Galaxy S24 ($40)
- iPad ($55)
- Starlink Kit ($120)
- MacBook ($85)

### 2. Vérifier les Migrations

```bash
cd alliance-shipping-web
npx drizzle-kit push
```

**Colonnes ajoutées:**
- `packages.customsFees` (decimal)
- `packages.chargeByWeight` (boolean)
- `specialItemFees.itemName_fr/ht/es` (varchar)
- `specialItemFees.description_fr/ht/es` (text)

---

## 🧪 Scénarios de Test

### Scénario 1: User - Requête Colis Normal ✅

**Mobile:**
1. Ouvrir app mobile → Onglet Packages
2. Cliquer "Réclamer un Colis"
3. Sélectionner **"Colis Normal"**
4. Remplir:
   - Tracking: `TEST-NORMAL-001`
   - Description: `Vêtements et chaussures pour la famille`
   - Catégorie: Clothing
5. Submit

**Résultat attendu:**
- ✅ Requête créée avec `specialItemId = null`
- ✅ Email envoyé
- ✅ Statut "pending"

---

### Scénario 2: User - Requête Article Spécial (iPhone) ✅

**Mobile:**
1. Ouvrir modal "Réclamer un Colis"
2. Sélectionner **"Article Spécial"**
3. Grid de cards s'affiche
4. Cliquer sur **iPhone ($45)**
5. Remplir tracking: `TEST-IPHONE-001`
6. Description: `iPhone 15 Pro Max neuf`
7. Catégorie: Electronics
8. Submit

**Résultat attendu:**
- ✅ Requête créée avec `specialItemId = 1` (iPhone)
- ✅ Email envoyé mentionnant "Article Spécial"
- ✅ Prix fixe $45 + service fee

---

### Scénario 3: Duplicate - Même User ⚠️

**Mobile:**
1. Soumettre tracking `TEST-DUP-001`
2. Attendre succès
3. **Re-soumettre le même tracking `TEST-DUP-001`**

**Résultat attendu:**
- ❌ Erreur HTTP 409
- ✅ Message: "Vous avez déjà fait une demande pour ce numéro de suivi"
- ✅ `conflictType: 'same_user'`
- ✅ Affichage du statut actuel

---

### Scénario 4: Duplicate - Autre User ❌

**Prérequis:** Créer 2 comptes users

**User A:**
1. Soumettre tracking `TEST-CONFLICT-001`

**User B (différent compte):**
1. Soumettre **même tracking** `TEST-CONFLICT-001`

**Résultat attendu:**
- ❌ Erreur HTTP 409
- ✅ Message: "Un autre utilisateur a déjà fait une demande pour ce colis"
- ✅ `conflictType: 'other_user_request'`

---

### Scénario 5: Colis Déjà Réclamé 🚫

**Prérequis:** Admin a créé un colis assigné à User A

**User B:**
1. Tenter de réclamer le même tracking number

**Résultat attendu:**
- ❌ Erreur HTTP 409
- ✅ Message: "Ce colis appartient déjà à un autre utilisateur"
- ✅ `conflictType: 'package_claimed'`

---

### Scénario 6: Admin - Créer Colis avec Article Spécial 📦

**Admin Web:**
1. Aller sur `/admin/packages/new`
2. Section "Type de Colis":
   - Cliquer **"Article Spécial"**
   - Sélectionner **Starlink ($120)**
3. ✅ Cocher **"Charger aussi par poids"**
4. Remplir:
   - Tracking externe: `TEST-STARLINK-001`
   - Poids: `15 lbs`
   - User: Sélectionner un user avec ville "Port-au-Prince"
   - Description: `Starlink Standard Kit`
   - Statut: Received
5. Submit

**Calcul attendu:**
```
Prix fixe Starlink: $120.00
Service Fee:         $5.00
Poids (15 × $4):    $60.00
------------------------
TOTAL:             $185.00
```

**Résultat attendu:**
- ✅ Colis créé avec:
  - `specialItemId = 4` (Starlink)
  - `chargeByWeight = true`
  - `serviceFee = 5.00`
  - `weightCost = 60.00`
  - `totalCost = 185.00`
  - `customsFees = 0.00`

---

### Scénario 7: Admin - Article Spécial SANS poids 📱

**Admin Web:**
1. `/admin/packages/new`
2. Type: **Article Spécial** → **iPad ($55)**
3. ❌ **NE PAS cocher** "Charger par poids"
4. Poids: `3 lbs` (ignoré)
5. User: Port-au-Prince
6. Submit

**Calcul attendu:**
```
Prix fixe iPad:     $55.00
Service Fee:         $5.00
Poids:               $0.00  (ignoré)
------------------------
TOTAL:              $60.00
```

**Résultat attendu:**
- ✅ `specialItemId = 3` (iPad)
- ✅ `chargeByWeight = false`
- ✅ `weightCost = 0.00`
- ✅ `totalCost = 60.00`

---

### Scénario 8: Admin - Ajouter Frais Douane 💰

**Admin Web:**
1. Aller sur `/admin/packages/in-transit` (ou received/available)
2. Trouver un colis (ex: total actuel $50)
3. Cliquer **"Ajouter Frais"**
4. Modal s'ouvre:
   - Ancien total: $50.00
   - Input: Entrer `$15.00`
   - Nouveau total preview: $65.00
5. Cliquer "Ajouter Frais"

**Résultat attendu:**
- ✅ DB updated:
  - `customsFees = 15.00`
  - `totalCost = 65.00`
  - `updatedAt = NOW()`
- ✅ Log dans `adminActivityLogs`:
  - `action = 'added_customs_fees'`
  - `targetType = 'package'`
  - Details: oldTotal, newTotal, customsFees
- ✅ **Email envoyé au user:**
  - Subject: "⚠️ Frais de douane ajoutés"
  - Body: Ancien $50 → Nouveau $65 (+$15)
  - Bouton "Voir Mon Colis"
- ✅ Toast success: "Frais de douane ajoutés - Email envoyé"

---

### Scénario 9: Mobile - Affichage Badges 🏷️

**Mobile:**
1. User qui a un colis avec `specialItemId = 1` (iPhone)
2. Ouvrir app → Packages
3. Voir la carte du colis

**Résultat attendu:**
- ✅ Badge violet: "📱 Article Spécial"
- ✅ Prix affiché: "Prix fixe: $45.00"

**Si colis a customsFees > 0:**
- ✅ Alert rouge:
  - Icon ⚠️ "Frais de douane"
  - Montant: "+$15.00"

---

### Scénario 10: Calculatrice - Special Items 🧮

**Web:**
1. Aller sur `/calculator`
2. Cliquer onglet **"Articles Spéciaux"**

**Résultat attendu:**
- ✅ Grid de 5 cards:
  - iPhone $45
  - Samsung $40
  - iPad $55
  - Starlink $120
  - MacBook $85
- ✅ Prix fetched depuis DB (pas hardcodés)
- ✅ Note: "+ Service fee selon votre ville"

---

## 🔍 Vérifications DB

### Vérifier un Colis avec Special Item

```sql
SELECT
  trackingNumber,
  specialItemId,
  chargeByWeight,
  serviceFee,
  weightCost,
  totalCost,
  customsFees
FROM packages
WHERE specialItemId IS NOT NULL;
```

### Vérifier Frais Douane

```sql
SELECT
  trackingNumber,
  totalCost,
  customsFees,
  updatedAt
FROM packages
WHERE customsFees > 0;
```

### Vérifier Log Admin

```sql
SELECT
  action,
  targetType,
  targetId,
  details,
  createdAt
FROM admin_activity_logs
WHERE action = 'added_customs_fees'
ORDER BY createdAt DESC;
```

---

## 📧 Vérifier Emails

### Email Frais Douane

**Vérifier dans console Resend:**
1. Subject: `⚠️ Frais de douane ajoutés - Colis AS-XXXXXXXXXX`
2. To: Email du user
3. Body contient:
   - Numéro de suivi
   - Ancien total
   - Frais de douane (+$XX.XX)
   - Nouveau total (en rouge)
   - Bouton "Voir Mon Colis"

**Traductions:**
- Français: "Frais de douane"
- Créole: "Frè dwan"
- Anglais: "Customs fees"
- Espagnol: "Tasas aduaneras"

---

## ✅ Checklist Finale

### Backend
- [ ] DB migrations appliquées
- [ ] 5 special items seedés
- [ ] Route `/api/special-items/public` retourne items
- [ ] Validation duplicates (3 types)
- [ ] Calcul prix dynamique fonctionne
- [ ] Frais douane ajoutables
- [ ] Email frais douane envoyé

### Mobile
- [ ] Sélection type colis fonctionne
- [ ] Grid special items s'affiche
- [ ] Validation avant submit
- [ ] specialItemId envoyé à API
- [ ] Badges affichés correctement
- [ ] Alert frais douane visible

### Admin Web
- [ ] Formulaire special items fonctionne
- [ ] Checkbox "Charger par poids" fonctionne
- [ ] Calcul prix correct
- [ ] Modal frais douane s'ouvre
- [ ] Frais douane ajoutés avec succès

### Général
- [ ] Traductions 4 langues complètes
- [ ] Build web sans erreurs TypeScript
- [ ] Build mobile sans erreurs
- [ ] Pas de console errors critiques

---

## 🐛 Dépannage

### Seed échoue
```bash
# Vérifier connexion DB
cd alliance-shipping-web
echo $DATABASE_URL

# Vérifier .env.local existe
cat .env.local | grep DATABASE_URL
```

### API retourne 500
```bash
# Check logs serveur
npm run dev
# Vérifier console pour erreurs
```

### Email non envoyé
```bash
# Vérifier Resend API key
echo $RESEND_API_KEY
# Check logs email service
```

---

## 📊 Résultats Attendus

**Tous les scénarios doivent passer ✅**

Si un scénario échoue:
1. Vérifier logs console
2. Vérifier DB (colonnes existent?)
3. Vérifier API response (status + body)
4. Vérifier traductions chargées

**Système prêt pour production quand:**
- ✅ 10/10 scénarios passent
- ✅ Aucune erreur console critique
- ✅ Emails reçus correctement
- ✅ DB logs corrects
