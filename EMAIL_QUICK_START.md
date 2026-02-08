# 🚀 Quick Start Guide - Email Templates

## Quel Template Utiliser Quand?

### 📦 QUAND UN UTILISATEUR SOUMET UNE REQUÊTE

```typescript
// Option 1: Email de confirmation simple
import { sendPackageRequestEmail } from '@/lib/email';
await sendPackageRequestEmail(email, name, trackingNumber);

// Option 2: Email de confirmation détaillé avec timeline (RECOMMANDÉ)
import { sendRequestSubmittedSuccessEmail } from '@/lib/email';
await sendRequestSubmittedSuccessEmail(email, name, trackingNumber, '24-48 hours');

// Option 3: Si c'est le PREMIER package de l'utilisateur
import { sendFirstPackageEmail } from '@/lib/email';
await sendFirstPackageEmail(email, name, trackingNumber);
```

**Recommandation:** Utilisez `sendRequestSubmittedSuccessEmail` pour tous, et ajoutez `sendFirstPackageEmail` si c'est leur premier package.

---

### ✅ QUAND UN ADMIN APPROUVE UNE REQUÊTE

```typescript
import { sendPackageApprovedEmail } from '@/lib/email';
await sendPackageApprovedEmail(
  email,
  name,
  'AS-2026-00123',  // Nouveau tracking Alliance Shipping
  37.00             // Coût total
);
```

---

### 📦 QUAND LE PACKAGE EST REÇU À L'ENTREPÔT

```typescript
// Option 1: Simple
import { sendPackageStatusChangeEmail } from '@/lib/email';
await sendPackageStatusChangeEmail(
  email, name, tracking, 'received',
  'Your package has been received at our warehouse.'
);

// Option 2: Détaillé avec inspection (RECOMMANDÉ)
import { sendPackageReceivedDetailedEmail } from '@/lib/email';
await sendPackageReceivedDetailedEmail(
  email, name, tracking,
  'Miami Warehouse',
  'January 15, 2026',
  7.5,  // poids réel
  'Package in excellent condition'  // notes (optionnel)
);
```

**Recommandation:** Utilisez la version détaillée pour une meilleure expérience utilisateur.

---

### ✈️ QUAND LE PACKAGE EST EN TRANSIT

```typescript
// Option 1: Simple
import { sendPackageStatusChangeEmail } from '@/lib/email';
await sendPackageStatusChangeEmail(
  email, name, tracking, 'in-transit',
  'Your package is on its way to Haiti.'
);

// Option 2: Détaillé avec ETA (RECOMMANDÉ)
import { sendPackageInTransitDetailedEmail } from '@/lib/email';
await sendPackageInTransitDetailedEmail(
  email, name, tracking,
  'January 18, 2026',     // date départ
  'January 20, 2026',     // ETA
  'Air Freight',          // méthode
  'In flight to Haiti'    // location actuelle (optionnel)
);
```

---

### 🇭🇹 QUAND LE PACKAGE ARRIVE EN HAÏTI

```typescript
import { sendPackageArrivedHaitiEmail } from '@/lib/email';
await sendPackageArrivedHaitiEmail(
  email, name, tracking,
  'January 20, 2026',
  'In Customs Clearance',
  '1-2 business days'
);
```

---

### ✅ QUAND CUSTOMS EST COMPLÉTÉ

```typescript
import { sendCustomsClearedEmail } from '@/lib/email';
await sendCustomsClearedEmail(
  email, name, tracking,
  'January 21, 2026',
  'Port-au-Prince Office',
  'January 22, 2026'  // quand sera disponible
);
```

---

### ✅ QUAND LE PACKAGE EST DISPONIBLE POUR PICKUP

```typescript
import { sendPackageAvailableEmail } from '@/lib/email';
await sendPackageAvailableEmail(
  email, name, tracking,
  'Port-au-Prince Office'
);
```

---

### 🎉 QUAND LE PACKAGE EST LIVRÉ

```typescript
import { sendPackageDeliveredEmail } from '@/lib/email';
await sendPackageDeliveredEmail(
  email, name, tracking,
  'John Doe'  // nom du destinataire
);
```

---

### ⚖️ QUAND LE POIDS EST MODIFIÉ

```typescript
import { sendWeightModifiedEmail } from '@/lib/email';
await sendWeightModifiedEmail(
  email, name, tracking,
  5.0,   // ancien poids
  7.5,   // nouveau poids
  25.00, // ancien coût
  35.00  // nouveau coût
);
```

---

### 💰 QUAND LES FRAIS SONT MODIFIÉS

```typescript
import { sendFeesModifiedEmail } from '@/lib/email';
await sendFeesModifiedEmail(
  email, name, tracking,
  37.00,  // ancien total
  42.00,  // nouveau total
  'Additional handling fee for fragile items'  // raison
);
```

---

### 🎁 QUAND UN SPECIAL ITEM EST AJOUTÉ

```typescript
import { sendSpecialItemAddedEmail } from '@/lib/email';
await sendSpecialItemAddedEmail(
  email, name, tracking,
  'Laptop Computer',  // nom de l'item
  15.00,             // frais de l'item
  52.00              // nouveau total
);
```

---

### 💬 QUAND UN ADMIN ENVOIE UN MESSAGE

```typescript
import { sendAdminMessageEmail } from '@/lib/email';
await sendAdminMessageEmail(
  email, name, tracking,
  'Your package requires additional documentation. Please provide a copy of your ID.',
  'Sarah - Alliance Shipping Team'
);
```

---

### ⚠️ QUAND IL Y A UN RETARD

```typescript
import { sendDeliveryDelayedEmail } from '@/lib/email';
await sendDeliveryDelayedEmail(
  email, name, tracking,
  'Weather conditions in Haiti',
  '2-3 business days',
  'January 25, 2026'  // nouvelle date (optionnel)
);
```

---

### 🚨 QUAND IL Y A UN PROBLÈME

```typescript
import { sendPackageIssueEmail } from '@/lib/email';
await sendPackageIssueEmail(
  email, name, tracking,
  'Damaged Package',
  'The outer box shows signs of water damage during transit.',
  'Our team is inspecting the contents and will contact you within 24 hours.'
);
```

---

### 🔔 RAPPEL POUR PACKAGE EN ATTENTE

```typescript
import { sendPackageReminderEmail } from '@/lib/email';
await sendPackageReminderEmail(
  email, name, tracking,
  'available',  // statut actuel
  7            // jours d'attente
);
```

---

### 🎉 EMAIL DE BIENVENUE (NOUVEAUX UTILISATEURS)

```typescript
import { sendWelcomeEmail } from '@/lib/email';
await sendWelcomeEmail(email, name);
```

---

### ⭐ DEMANDE DE FEEDBACK (APRÈS LIVRAISON)

```typescript
import { sendFeedbackRequestEmail } from '@/lib/email';
await sendFeedbackRequestEmail(email, name, tracking);
```

---

## 🎯 WORKFLOW RECOMMANDÉ COMPLET

### Dans `app/api/package-requests/route.ts`

```typescript
import {
  sendRequestSubmittedSuccessEmail,
  sendFirstPackageEmail
} from '@/lib/email';

// Après création de la requête
await sendRequestSubmittedSuccessEmail(
  userEmail,
  userName,
  externalTracking,
  '24-48 hours'
);

// Si premier package
if (isFirstPackage) {
  await sendFirstPackageEmail(userEmail, userName, externalTracking);
}
```

### Dans `app/api/admin/package-requests/route.ts`

```typescript
import {
  sendPackageApprovedEmail,
  sendPackageReceivedDetailedEmail,
  sendPackageRejectedEmail
} from '@/lib/email';

if (action === 'approve') {
  // Email d'approbation
  await sendPackageApprovedEmail(
    userEmail, userName, asTracking, totalCost
  );

  // Si statut initial = received, envoyer détails
  if (initialStatus === 'received') {
    await sendPackageReceivedDetailedEmail(
      userEmail, userName, asTracking,
      'Miami Warehouse',
      new Date().toLocaleDateString(),
      weight,
      'Package verified and ready for shipping'
    );
  }
}

if (action === 'reject') {
  await sendPackageRejectedEmail(
    userEmail, userName, externalTracking, rejectionReason
  );
}
```

### Dans `app/api/admin/packages/bulk-update/route.ts`

```typescript
import {
  sendPackageReceivedDetailedEmail,
  sendPackageInTransitDetailedEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail,
  sendCustomsClearedEmail
} from '@/lib/email';

for (const pkg of updatedPackages) {
  const userEmail = pkg.user.email;
  const userName = pkg.user.name;

  switch (newStatus) {
    case 'received':
      await sendPackageReceivedDetailedEmail(
        userEmail, userName, pkg.trackingNumber,
        'Miami Warehouse',
        new Date().toLocaleDateString(),
        pkg.weight,
        'Package received and inspected'
      );
      break;

    case 'in-transit':
      await sendPackageInTransitDetailedEmail(
        userEmail, userName, pkg.trackingNumber,
        new Date().toLocaleDateString(),
        estimateArrival(3),  // 3 jours
        'Air Freight'
      );
      break;

    case 'available':
      // D'abord customs cleared
      await sendCustomsClearedEmail(
        userEmail, userName, pkg.trackingNumber,
        new Date().toLocaleDateString(),
        pkg.recipientCity + ' Office',
        'Today'
      );

      // Puis available
      await sendPackageAvailableEmail(
        userEmail, userName, pkg.trackingNumber,
        pkg.recipientCity + ' Office'
      );
      break;

    case 'delivered':
      await sendPackageDeliveredEmail(
        userEmail, userName, pkg.trackingNumber,
        pkg.recipientName
      );

      // Feedback après 2-3 jours (via cron job)
      setTimeout(() => {
        sendFeedbackRequestEmail(userEmail, userName, pkg.trackingNumber);
      }, 3 * 24 * 60 * 60 * 1000);
      break;
  }
}
```

---

## ⚙️ CONFIGURATION REQUISE

1. **Installer Resend:**
   ```bash
   npm install resend
   ```

2. **Configurer `.env.local`:**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Obtenir une clé API Resend:**
   - Allez sur [resend.com](https://resend.com)
   - Créez un compte gratuit
   - Allez dans "API Keys"
   - Créez une nouvelle clé
   - Copiez-la dans `.env.local`

---

## 🎨 TOUS LES TEMPLATES DISPONIBLES

```typescript
import {
  // Workflow Utilisateur
  sendRequestSubmittedSuccessEmail,
  sendRequestUnderReviewEmail,
  sendFirstPackageEmail,

  // Statuts Détaillés
  sendPackageReceivedDetailedEmail,
  sendPackageInTransitDetailedEmail,
  sendPackageArrivedHaitiEmail,
  sendCustomsClearedEmail,

  // Confirmations
  sendInfoUpdatedConfirmationEmail,
  sendInspectionCompleteEmail,

  // Package Requests (Base)
  sendPackageRequestEmail,
  sendPackageApprovedEmail,
  sendPackageRejectedEmail,

  // Status Changes (Base)
  sendPackageStatusChangeEmail,
  sendPackageAvailableEmail,
  sendPackageDeliveredEmail,

  // Modifications
  sendWeightModifiedEmail,
  sendFeesModifiedEmail,
  sendPackageInfoModifiedEmail,

  // Special Items
  sendSpecialItemAddedEmail,
  sendSpecialItemRemovedEmail,

  // Communications
  sendAdminMessageEmail,
  sendImportantNotificationEmail,

  // Événements Spéciaux
  sendDeliveryDelayedEmail,
  sendPackageIssueEmail,

  // Annonces
  sendAnnouncementEmail,

  // Lifecycle
  sendWelcomeEmail,
  sendFeedbackRequestEmail,
  sendPackageReminderEmail,
} from '@/lib/email';
```

---

## 📚 DOCUMENTATION COMPLÈTE

- `EMAIL_SETUP_GUIDE.md` - Configuration Resend détaillée
- `EMAIL_TEMPLATES_GUIDE.md` - Guide des 19 premiers templates
- `EMAIL_COMPLETE_REFERENCE.md` - Référence complète des 27 templates
- `EMAIL_QUICK_START.md` - Ce guide (Quick Start)

---

✅ **Prêt à envoyer des emails!** Choisissez le template approprié et appelez la fonction. C'est aussi simple que ça! 🚀
