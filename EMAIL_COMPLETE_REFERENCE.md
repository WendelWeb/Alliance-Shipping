# 📧 Référence Complète des Emails - Alliance Shipping

## 🎯 Vue d'Ensemble

**27 Templates d'Email Professionnels** pour couvrir TOUS les événements du workflow utilisateur.

### 📊 Distribution par Catégorie

| Catégorie | Templates | Utilisation |
|-----------|-----------|-------------|
| **Workflow Utilisateur** | 3 | Soumission et suivi de requêtes |
| **Statuts Détaillés** | 4 | États avancés avec détails complets |
| **Package Requests** | 3 | Approbation/Rejet de base |
| **Status Changes** | 3 | Changements de statut généraux |
| **Modifications** | 3 | Poids, frais, informations |
| **Special Items** | 2 | Ajout/Retrait d'items |
| **Communications Admin** | 2 | Messages et notifications |
| **Événements Spéciaux** | 2 | Retards et problèmes |
| **Confirmations** | 2 | Confirmations et inspections |
| **Annonces** | 1 | Communications générales |
| **Account & Lifecycle** | 3 | Bienvenue et feedback |

---

## 🔄 WORKFLOW UTILISATEUR (Templates Détaillés)

### 1️⃣ Request Submitted Successfully ✅
**Fonction:** `sendRequestSubmittedSuccessEmail`
**Quand:** Immédiatement après la soumission réussie d'une requête
**Couleur:** Vert (🟢)

```typescript
await sendRequestSubmittedSuccessEmail(
  'user@example.com',
  'John Doe',
  'USPS1234567890',
  '24-48 hours'  // estimatedReviewTime
);
```

**Contenu:**
- ✅ Icône de succès géante
- 📦 Numéro de suivi externe
- 📋 Timeline complète du processus
- ✓ Étape actuelle marquée
- ○ Étapes futures
- 📧 Liste de tous les emails à venir
- 💡 Pro tip sur le délai de révision
- 🔗 Lien vers le dashboard

**Utilisation Recommandée:**
```typescript
// Dans app/api/package-requests/route.ts
const [packageRequest] = await db.insert(packageRequests).values({...}).returning();

await sendRequestSubmittedSuccessEmail(
  userEmail,
  userName,
  packageRequest.externalTrackingNumber,
  '24-48 hours'
);
```

---

### 2️⃣ Request Under Review 🔍
**Fonction:** `sendRequestUnderReviewEmail`
**Quand:** Quand un admin commence à réviser la requête
**Couleur:** Bleu (🔵)

```typescript
await sendRequestUnderReviewEmail(
  'user@example.com',
  'John Doe',
  'USPS1234567890',
  'Sarah Johnson'  // reviewerName
);
```

**Contenu:**
- 🔍 Icône de révision
- 📊 Barre de progression (33% complété)
- 👤 Avatar et nom du reviewer
- ✓ Checklist de ce qui est vérifié
- 📱 Note sur contact possible
- 🔗 Lien pour suivre la révision

**Utilisation:**
Envoyé quand un admin commence à travailler sur une requête, ou après 6 heures si pas encore traité.

---

### 3️⃣ First Package Congratulations 🎉
**Fonction:** `sendFirstPackageEmail`
**Quand:** Première requête soumise par un nouvel utilisateur
**Couleur:** Orange/Or (🟠)

```typescript
await sendFirstPackageEmail(
  'user@example.com',
  'John Doe',
  'USPS1234567890'
);
```

**Contenu:**
- 🎉🎊🎈 Célébration visuelle
- 📦 Premier tracking number
- 🎁 Welcome bonus et avantages
- 💡 Pro tips pour nouveaux expéditeurs
- 📋 Timeline complète expliquée
- 🔗 Liens vers dashboard et support

**Détection Automatique:**
```typescript
// Compter les packages de l'utilisateur
const userPackageCount = await db.query.packages.findMany({
  where: eq(packages.userId, userId)
});

if (userPackageCount.length === 0) {
  // C'est son premier package!
  await sendFirstPackageEmail(userEmail, userName, trackingNumber);
}
```

---

## 📦 STATUTS DÉTAILLÉS (Templates Avancés)

### 4️⃣ Package Received at Warehouse (Detailed) 📦
**Fonction:** `sendPackageReceivedDetailedEmail`
**Quand:** Package arrive et est inspecté à l'entrepôt
**Couleur:** Cyan (🔵)

```typescript
await sendPackageReceivedDetailedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Miami Warehouse',
  'January 15, 2026',
  7.5,  // actualWeight
  'Package in excellent condition, contents verified'  // inspectionNotes (optional)
);
```

**Contenu:**
- 📦 Icône de réception
- 📍 Badge du warehouse
- 📊 Grille d'informations (Date + Poids)
- ✅ Checklist de ce qui a été fait
- 📋 Prochaines étapes détaillées
- 📝 Notes d'inspection (si fournies)
- 🔗 Lien de tracking

---

### 5️⃣ Package In Transit to Haiti (Detailed) ✈️
**Fonction:** `sendPackageInTransitDetailedEmail`
**Quand:** Package part vers Haïti
**Couleur:** Violet (🟣)

```typescript
await sendPackageInTransitDetailedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'January 18, 2026',       // departureDate
  'January 20, 2026',       // estimatedArrival
  'Air Freight',            // transitMethod
  'In Flight to Haiti'      // currentLocation (optional)
);
```

**Contenu:**
- ✈️ Animation de voyage (🇺🇸 ✈️ ➡️ 🇭🇹)
- 📍 Location badge actuelle
- 📊 Grille d'infos (Départ + Méthode)
- 📅 ETA avec grosse date
- 📋 Timeline du voyage
- 💡 Ce qui arrive ensuite
- 🔗 Tracking live

---

### 6️⃣ Package Arrived in Haiti 🇭🇹
**Fonction:** `sendPackageArrivedHaitiEmail`
**Quand:** Package arrive en Haïti, avant customs
**Couleur:** Turquoise (🟢)

```typescript
await sendPackageArrivedHaitiEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'January 20, 2026',        // arrivalDate
  'In Customs Clearance',    // customsStatus
  '1-2 business days'        // estimatedClearance
);
```

**Contenu:**
- 🇭🇹 Grand drapeau haïtien
- 📦 Date d'arrivée
- 📋 Badge de statut customs
- ⚠️ Boîte explicative sur customs
- ✅ Checklist du processus
- 📱 Rassurance qu'ils seront notifiés
- 🔗 Lien de tracking customs

---

### 7️⃣ Customs Cleared ✅
**Fonction:** `sendCustomsClearedEmail`
**Quand:** Customs clearance complété
**Couleur:** Vert (🟢)

```typescript
await sendCustomsClearedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'January 21, 2026',          // clearanceDate
  'Port-au-Prince Office',     // destinationOffice
  'January 22, 2026'           // estimatedAvailability
);
```

**Contenu:**
- ✅ Grosse icône de succès
- 📊 Barre de progression (90% complété)
- 📍 Badge du bureau de destination
- 📋 3 prochaines étapes
- 💡 Ce qu'il faut apporter pour pickup
- 🔗 Lien vers détails du package

---

## 🔔 CONFIRMATIONS & INSPECTIONS

### 8️⃣ Information Updated Confirmation ✅
**Fonction:** `sendInfoUpdatedConfirmationEmail`
**Quand:** Admin modifie des infos package
**Couleur:** Vert (🟢)

```typescript
await sendInfoUpdatedConfirmationEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  [
    'Recipient Address',
    'Recipient Phone',
    'Package Description'
  ],
  'Sarah - Alliance Shipping Team'  // updatedBy
);
```

**Contenu:**
- ✅ Confirmation header
- 📦 Tracking number
- ✓ Liste des champs modifiés avec checkmarks
- 👤 Qui a fait la modification
- 📋 Invitation à vérifier
- 🔗 Lien vers détails mis à jour

---

### 9️⃣ Package Inspection Complete 🔍
**Fonction:** `sendInspectionCompleteEmail`
**Quand:** Inspection warehouse complétée
**Couleur:** Vert si passed, Orange si issues

```typescript
await sendInspectionCompleteEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'passed',  // or 'issues_found'
  'Package contents verified. All items match description. No damage detected.',
  'Package approved for shipping. Will be prepared for transit to Haiti.'
);
```

**Contenu:**
- ✅ ou ⚠️ selon résultat
- 📦 Tracking number
- 🏷️ Badge de résultat (PASSED / ISSUES FOUND)
- 📝 Notes d'inspection détaillées
- 📋 Prochaines étapes
- 📞 Contact si problèmes
- 🔗 Lien de suivi

---

## 📚 TEMPLATES EXISTANTS (Référence Rapide)

### Package Requests (3)
- `sendPackageRequestEmail` - Soumission basique
- `sendPackageApprovedEmail` - Approbation
- `sendPackageRejectedEmail` - Rejet

### Status Changes (3)
- `sendPackageStatusChangeEmail` - Changement général
- `sendPackageAvailableEmail` - Disponible pickup
- `sendPackageDeliveredEmail` - Livré

### Modifications (3)
- `sendWeightModifiedEmail` - Poids changé
- `sendFeesModifiedEmail` - Frais changés
- `sendPackageInfoModifiedEmail` - Infos changées

### Special Items (2)
- `sendSpecialItemAddedEmail` - Item ajouté
- `sendSpecialItemRemovedEmail` - Item retiré

### Admin Communications (2)
- `sendAdminMessageEmail` - Message personnalisé
- `sendImportantNotificationEmail` - Notification (high/medium/low)

### Special Events (2)
- `sendDeliveryDelayedEmail` - Retard
- `sendPackageIssueEmail` - Problème

### Announcements (1)
- `sendAnnouncementEmail` - Annonce générale

### Account & Lifecycle (3)
- `sendWelcomeEmail` - Bienvenue
- `sendFeedbackRequestEmail` - Demande avis
- `sendPackageReminderEmail` - Rappel

---

## 🎯 MAPPING COMPLET DES ÉVÉNEMENTS

### Workflow Complet d'un Package

```
1. USER SUBMITS REQUEST
   ↓
   📧 sendRequestSubmittedSuccessEmail
   (Si premier package) 📧 sendFirstPackageEmail

2. ADMIN STARTS REVIEW
   ↓
   📧 sendRequestUnderReviewEmail

3. ADMIN APPROVES
   ↓
   📧 sendPackageApprovedEmail

4. PACKAGE RECEIVED AT WAREHOUSE
   ↓
   📧 sendPackageReceivedDetailedEmail

5. INSPECTION
   ↓
   📧 sendInspectionCompleteEmail

6. IN TRANSIT TO HAITI
   ↓
   📧 sendPackageInTransitDetailedEmail

7. ARRIVES IN HAITI
   ↓
   📧 sendPackageArrivedHaitiEmail

8. CUSTOMS CLEARED
   ↓
   📧 sendCustomsClearedEmail

9. AVAILABLE FOR PICKUP
   ↓
   📧 sendPackageAvailableEmail

10. DELIVERED
    ↓
    📧 sendPackageDeliveredEmail

11. (2-3 DAYS LATER)
    ↓
    📧 sendFeedbackRequestEmail
```

### Événements Parallèles

**Modifications:**
- Poids changé → `sendWeightModifiedEmail`
- Frais changés → `sendFeesModifiedEmail`
- Infos changées → `sendPackageInfoModifiedEmail` ou `sendInfoUpdatedConfirmationEmail`

**Special Items:**
- Item ajouté → `sendSpecialItemAddedEmail`
- Item retiré → `sendSpecialItemRemovedEmail`

**Admin Actions:**
- Message → `sendAdminMessageEmail`
- Notification importante → `sendImportantNotificationEmail`

**Problèmes:**
- Retard → `sendDeliveryDelayedEmail`
- Issue → `sendPackageIssueEmail`

**Package en Attente:**
- 7+ jours → `sendPackageReminderEmail`

---

## 💻 EXEMPLES D'IMPLÉMENTATION

### Dans app/api/package-requests/route.ts

```typescript
import {
  sendRequestSubmittedSuccessEmail,
  sendFirstPackageEmail
} from '@/lib/email';

export async function POST(request: NextRequest) {
  // ... création du package request ...

  const [packageRequest] = await db.insert(packageRequests).values({...}).returning();

  // Email de confirmation
  await sendRequestSubmittedSuccessEmail(
    userEmail,
    userName,
    packageRequest.externalTrackingNumber,
    '24-48 hours'
  ).catch(err => console.error('Email error:', err));

  // Vérifier si premier package
  const userPackages = await db.query.packages.findMany({
    where: eq(packages.userId, userId)
  });

  if (userPackages.length === 0) {
    await sendFirstPackageEmail(
      userEmail,
      userName,
      packageRequest.externalTrackingNumber
    ).catch(err => console.error('Email error:', err));
  }

  return NextResponse.json({ success: true });
}
```

### Dans app/api/admin/package-requests/route.ts

```typescript
import {
  sendPackageApprovedEmail,
  sendPackageReceivedDetailedEmail
} from '@/lib/email';

// Lors de l'approbation
if (action === 'approve') {
  // ... création du package ...

  // Email d'approbation
  await sendPackageApprovedEmail(
    userEmail,
    userName,
    newPackage.trackingNumber,
    totalFee
  );

  // Si statut initial est "received", envoyer email détaillé
  if (initialStatus === 'received') {
    await sendPackageReceivedDetailedEmail(
      userEmail,
      userName,
      newPackage.trackingNumber,
      'Miami Warehouse',
      new Date().toLocaleDateString(),
      packageWeight,
      'Package verified and in good condition'
    );
  }
}
```

### Dans app/api/admin/packages/bulk-update/route.ts

```typescript
import {
  sendPackageInTransitDetailedEmail,
  sendPackageArrivedHaitiEmail,
  sendCustomsClearedEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail
} from '@/lib/email';

for (const pkg of updatedPackages) {
  // ... mise à jour du package ...

  // Email selon le nouveau statut
  if (status === 'received') {
    await sendPackageReceivedDetailedEmail(...);
  } else if (status === 'in-transit') {
    await sendPackageInTransitDetailedEmail(
      userEmail,
      userName,
      pkg.trackingNumber,
      new Date().toLocaleDateString(),
      'Estimated in 3 days',
      'Air Freight'
    );
  } else if (status === 'available') {
    // D'abord customs cleared
    await sendCustomsClearedEmail(
      userEmail,
      userName,
      pkg.trackingNumber,
      new Date().toLocaleDateString(),
      pkg.recipientCity + ' Office',
      'Today'
    );

    // Puis available
    await sendPackageAvailableEmail(
      userEmail,
      userName,
      pkg.trackingNumber,
      pkg.recipientCity + ' Office'
    );
  } else if (status === 'delivered') {
    await sendPackageDeliveredEmail(
      userEmail,
      userName,
      pkg.trackingNumber,
      pkg.recipientName
    );
  }
}
```

### Inspection Workflow

```typescript
// Après inspection
const inspectionPassed = true; // ou false selon résultat

await sendInspectionCompleteEmail(
  userEmail,
  userName,
  trackingNumber,
  inspectionPassed ? 'passed' : 'issues_found',
  inspectionPassed
    ? 'All items verified. Package in perfect condition.'
    : 'Some items do not match description. Please contact support.',
  inspectionPassed
    ? 'Package will proceed to shipping queue.'
    : 'Our team will contact you to resolve the discrepancies.'
);
```

---

## 🎨 DESIGN CONSISTENCY

Tous les 27 templates suivent les mêmes principes:

✅ **Structure Commune:**
- Header avec gradient coloré
- Tracking number bien visible
- Cards avec informations structurées
- Boutons call-to-action
- Footer standardisé

✅ **Responsive:**
- Mobile-friendly
- Polices adaptatives
- Marges optimisées

✅ **Branding:**
- Logo Alliance Shipping
- Couleurs cohérentes
- Message de signature

✅ **Accessibilité:**
- Contraste de couleurs
- Tailles de police lisibles
- Hiérarchie claire

---

## 📊 STATISTIQUES

- **27 Templates** au total
- **8 Catégories** d'emails
- **100% Workflow Coverage** - Chaque étape couverte
- **Mobile-Friendly** - Tous responsive
- **Professional Design** - Templates modernes

---

## 🚀 DÉMARRAGE RAPIDE

1. **Installez Resend:**
   ```bash
   npm install resend
   ```

2. **Configurez .env.local:**
   ```env
   RESEND_API_KEY=re_your_key_here
   SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Importez les templates:**
   ```typescript
   import {
     sendRequestSubmittedSuccessEmail,
     sendPackageReceivedDetailedEmail,
     // ... autres templates
   } from '@/lib/email';
   ```

4. **Utilisez-les:**
   ```typescript
   await sendRequestSubmittedSuccessEmail(
     email,
     name,
     tracking,
     '24-48 hours'
   );
   ```

---

## 📖 DOCUMENTATION COMPLÈTE

Consultez:
- `EMAIL_SETUP_GUIDE.md` - Configuration Resend
- `EMAIL_TEMPLATES_GUIDE.md` - Guide des 19 premiers templates
- `EMAIL_COMPLETE_REFERENCE.md` - Ce document (27 templates)

---

✅ **TOUS LES TEMPLATES SONT PRÊTS!** Configurez Resend et commencez à envoyer des emails professionnels automatiquement! 🚀
