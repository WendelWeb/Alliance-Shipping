# Guide Complet des Templates d'Email - Alliance Shipping

Ce guide liste TOUS les templates d'email disponibles dans l'application Alliance Shipping.

## 📋 Table des Matières

1. [Package Requests & Approval](#package-requests--approval)
2. [Status Changes](#status-changes)
3. [Package Modifications](#package-modifications)
4. [Special Items](#special-items)
5. [Admin Communications](#admin-communications)
6. [Special Events](#special-events)
7. [Announcements](#announcements)
8. [Account & Lifecycle](#account--lifecycle)

---

## 📦 Package Requests & Approval

### 1. Package Request Submitted
**Fonction:** `sendPackageRequestEmail`
**Quand:** Un utilisateur soumet une nouvelle requête de package
**Couleur:** Bleu/Violet (🟣)

**Paramètres:**
```typescript
sendPackageRequestEmail(
  userEmail: string,        // Email de l'utilisateur
  userName: string,          // Nom de l'utilisateur
  trackingNumber: string     // Numéro de suivi externe
)
```

**Exemple d'utilisation:**
```typescript
import { sendPackageRequestEmail } from '@/lib/email';

await sendPackageRequestEmail(
  'user@example.com',
  'John Doe',
  'USPS1234567890'
);
```

**Contenu de l'email:**
- ✅ Confirmation de réception de la requête
- 📦 Numéro de suivi externe
- 📝 Prochaines étapes
- 🔗 Lien vers le dashboard

---

### 2. Package Request Approved
**Fonction:** `sendPackageApprovedEmail`
**Quand:** Un admin approuve une requête de package
**Couleur:** Vert (🟢)

**Paramètres:**
```typescript
sendPackageApprovedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,    // Nouveau tracking AS-XXXX
  totalCost: number          // Coût total en USD
)
```

**Exemple:**
```typescript
await sendPackageApprovedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  37.00
);
```

**Contenu:**
- ✅ Confirmation d'approbation
- 🔢 Nouveau numéro de suivi Alliance Shipping
- 💰 Coût total détaillé
- 📊 Statut actuel (RECEIVED)

---

### 3. Package Request Rejected
**Fonction:** `sendPackageRejectedEmail`
**Quand:** Un admin rejette une requête
**Couleur:** Rouge (🔴)

**Paramètres:**
```typescript
sendPackageRejectedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  reason?: string            // Raison du rejet (optionnel)
)
```

**Exemple:**
```typescript
await sendPackageRejectedEmail(
  'user@example.com',
  'John Doe',
  'USPS1234567890',
  'Package contains prohibited items'
);
```

**Contenu:**
- ❌ Notification de rejet
- 📝 Raison du rejet (si fournie)
- 📋 Que faire ensuite
- 🔗 Contact support

---

## 🚚 Status Changes

### 4. Package Status Changed (General)
**Fonction:** `sendPackageStatusChangeEmail`
**Quand:** Le statut change (received, in-transit)
**Couleur:** Variable selon statut

**Paramètres:**
```typescript
sendPackageStatusChangeEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  newStatus: string,         // 'received', 'in-transit', etc.
  statusMessage: string      // Message descriptif
)
```

**Exemple:**
```typescript
await sendPackageStatusChangeEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'in-transit',
  'Your package is on its way to Haiti and will arrive soon.'
);
```

**Contenu:**
- 📦 Nouveau statut avec emoji
- 📍 Message descriptif
- 🔗 Lien de tracking

---

### 5. Package Available for Pickup
**Fonction:** `sendPackageAvailableEmail`
**Quand:** Package prêt pour retrait
**Couleur:** Vert (🟢)

**Paramètres:**
```typescript
sendPackageAvailableEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  pickupLocation: string     // Lieu de retrait
)
```

**Exemple:**
```typescript
await sendPackageAvailableEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Port-au-Prince Office'
);
```

**Contenu:**
- ✅ Package prêt pour retrait
- 📍 Lieu de retrait
- 🕐 Heures d'ouverture
- 📋 Ce qu'il faut apporter

---

### 6. Package Delivered
**Fonction:** `sendPackageDeliveredEmail`
**Quand:** Package livré avec succès
**Couleur:** Vert foncé (🟢)

**Paramètres:**
```typescript
sendPackageDeliveredEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  recipientName: string      // Nom du destinataire
)
```

**Exemple:**
```typescript
await sendPackageDeliveredEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Marie Johnson'
);
```

**Contenu:**
- 🎉 Confirmation de livraison
- ✅ Nom du destinataire
- 📝 Invitation à donner feedback

---

## ⚖️ Package Modifications

### 7. Weight Modified
**Fonction:** `sendWeightModifiedEmail`
**Quand:** Le poids du package est modifié
**Couleur:** Orange (🟠)

**Paramètres:**
```typescript
sendWeightModifiedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  oldWeight: number,         // Ancien poids en lbs
  newWeight: number,         // Nouveau poids en lbs
  oldCost: number,           // Ancien coût total
  newCost: number            // Nouveau coût total
)
```

**Exemple:**
```typescript
await sendWeightModifiedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  5.0,   // Old: 5 lbs
  7.5,   // New: 7.5 lbs
  25.00, // Old cost
  35.00  // New cost
);
```

**Contenu:**
- ⚖️ Comparaison ancien vs nouveau poids
- 💰 Comparaison ancien vs nouveau coût
- 📊 Différence (+/- avec couleur)
- 📝 Explication de l'ajustement

---

### 8. Fees Modified
**Fonction:** `sendFeesModifiedEmail`
**Quand:** Les frais sont modifiés
**Couleur:** Violet (🟣)

**Paramètres:**
```typescript
sendFeesModifiedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  oldTotal: number,          // Ancien total
  newTotal: number,          // Nouveau total
  reason: string             // Raison de l'ajustement
)
```

**Exemple:**
```typescript
await sendFeesModifiedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  37.00,
  42.00,
  'Additional handling fee for fragile items'
);
```

**Contenu:**
- 💰 Comparaison des coûts
- 📝 Raison détaillée
- 📊 Montant ajouté/réduit
- 🔗 Lien vers facture mise à jour

---

### 9. Package Information Modified
**Fonction:** `sendPackageInfoModifiedEmail`
**Quand:** Informations du package modifiées
**Couleur:** Bleu (🔵)

**Paramètres:**
```typescript
sendPackageInfoModifiedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  modifiedFields: string[]   // Liste des champs modifiés
)
```

**Exemple:**
```typescript
await sendPackageInfoModifiedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  [
    'Recipient Address',
    'Recipient Phone Number',
    'Package Description'
  ]
);
```

**Contenu:**
- 📝 Liste des champs modifiés
- ✓ Checklist visuelle
- 🔗 Invitation à vérifier les détails

---

## 🎁 Special Items

### 10. Special Item Added
**Fonction:** `sendSpecialItemAddedEmail`
**Quand:** Un item spécial est ajouté
**Couleur:** Rose (🌸)

**Paramètres:**
```typescript
sendSpecialItemAddedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  itemName: string,          // Nom de l'item
  itemFee: number,           // Frais de l'item
  newTotal: number           // Nouveau total
)
```

**Exemple:**
```typescript
await sendSpecialItemAddedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Laptop Computer',
  15.00,
  52.00
);
```

**Contenu:**
- 🎁 Nom de l'item ajouté
- 💰 Frais supplémentaires
- 📊 Nouveau coût total

---

### 11. Special Item Removed
**Fonction:** `sendSpecialItemRemovedEmail`
**Quand:** Un item spécial est retiré
**Couleur:** Indigo (🔵)

**Paramètres:**
```typescript
sendSpecialItemRemovedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  itemName: string,
  refundAmount: number,      // Montant remboursé
  newTotal: number
)
```

**Exemple:**
```typescript
await sendSpecialItemRemovedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Laptop Computer',
  15.00,
  37.00
);
```

**Contenu:**
- 🔄 Item retiré
- 💚 Montant remboursé
- 📊 Nouveau total

---

## 💬 Admin Communications

### 12. Admin Message
**Fonction:** `sendAdminMessageEmail`
**Quand:** Admin envoie un message personnalisé
**Couleur:** Cyan (🔵)

**Paramètres:**
```typescript
sendAdminMessageEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  message: string,           // Message de l'admin
  adminName: string          // Nom de l'admin
)
```

**Exemple:**
```typescript
await sendAdminMessageEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Your package requires additional documentation. Please provide a copy of your ID.',
  'Sarah - Alliance Shipping Team'
);
```

**Contenu:**
- 💬 Message personnalisé
- 👤 Signature de l'admin
- 🔗 Option de répondre

---

### 13. Important Notification
**Fonction:** `sendImportantNotificationEmail`
**Quand:** Notification urgente ou importante
**Couleur:** Variable selon priorité

**Paramètres:**
```typescript
sendImportantNotificationEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  title: string,             // Titre de la notification
  message: string,           // Message détaillé
  priority: 'high' | 'medium' | 'low'
)
```

**Exemple:**
```typescript
await sendImportantNotificationEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Action Required: Package Inspection',
  'Your package has been selected for random customs inspection. This may cause a delay of 1-2 days.',
  'high'
);
```

**Contenu:**
- 🚨 Badge de priorité
- 📢 Titre et message
- ⚠️ Indication si action requise
- Couleurs: Rouge (high), Orange (medium), Bleu (low)

---

## 🚨 Special Events

### 14. Delivery Delayed
**Fonction:** `sendDeliveryDelayedEmail`
**Quand:** Un retard de livraison est prévu
**Couleur:** Orange (🟠)

**Paramètres:**
```typescript
sendDeliveryDelayedEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  reason: string,            // Raison du retard
  estimatedDelay: string,    // Délai estimé (ex: "2-3 days")
  newEstimatedDate?: string  // Nouvelle date estimée (optionnel)
)
```

**Exemple:**
```typescript
await sendDeliveryDelayedEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Due to weather conditions in Haiti, shipments are experiencing delays.',
  '2-3 business days',
  'January 25, 2026'
);
```

**Contenu:**
- ⏰ Notification de retard
- 📝 Raison détaillée
- 📅 Nouveau délai/date estimée
- 🔧 Actions prises

---

### 15. Package Issue Reported
**Fonction:** `sendPackageIssueEmail`
**Quand:** Un problème est détecté avec le package
**Couleur:** Rouge (🔴)

**Paramètres:**
```typescript
sendPackageIssueEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  issueType: string,         // Type de problème
  issueDescription: string,  // Description détaillée
  resolutionSteps: string    // Étapes de résolution
)
```

**Exemple:**
```typescript
await sendPackageIssueEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'Damaged Package',
  'The outer box shows signs of water damage during transit.',
  'Our team is inspecting the contents to assess damage. We will contact you within 24 hours with a full report and compensation options if needed.'
);
```

**Contenu:**
- ⚠️ Type de problème
- 📝 Description détaillée
- ✅ Étapes de résolution
- 📞 Contact support

---

## 📢 Announcements

### 16. General Announcement
**Fonction:** `sendAnnouncementEmail`
**Quand:** Annonce générale aux utilisateurs
**Couleur:** Turquoise (🔵)

**Paramètres:**
```typescript
sendAnnouncementEmail(
  userEmail: string,
  userName: string,
  title: string,             // Titre de l'annonce
  content: string,           // Contenu détaillé
  actionLabel?: string,      // Texte du bouton (optionnel)
  actionUrl?: string         // URL du bouton (optionnel)
)
```

**Exemple:**
```typescript
await sendAnnouncementEmail(
  'user@example.com',
  'John Doe',
  'New Office Opening in Cap-Haïtien',
  'We are excited to announce the opening of our new office in Cap-Haïtien! Starting February 1st, 2026, you can pick up your packages at our new location.',
  'View Office Details',
  'https://allianceshipping.com/locations/cap-haitien'
);
```

**Contenu:**
- 📢 Titre de l'annonce
- 📝 Contenu détaillé
- 🔘 Bouton d'action (optionnel)

---

## 👤 Account & Lifecycle

### 17. Welcome Email
**Fonction:** `sendWelcomeEmail`
**Quand:** Nouvel utilisateur s'inscrit
**Couleur:** Violet (🟣)

**Paramètres:**
```typescript
sendWelcomeEmail(
  userEmail: string,
  userName: string
)
```

**Exemple:**
```typescript
await sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

**Contenu:**
- 🎉 Message de bienvenue
- 🚀 3 étapes pour commencer
- ✨ Nos avantages
- 📍 Nos locations
- 💡 Pro tips
- 🔗 Liens vers dashboard

---

### 18. Feedback Request
**Fonction:** `sendFeedbackRequestEmail`
**Quand:** Après livraison d'un package
**Couleur:** Jaune/Or (⭐)

**Paramètres:**
```typescript
sendFeedbackRequestEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string
)
```

**Exemple:**
```typescript
await sendFeedbackRequestEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123'
);
```

**Contenu:**
- ⭐ Demande d'évaluation
- 📝 Questions rapides
- 🔘 Bouton d'évaluation rapide
- 🔗 Lien vers feedback détaillé

---

### 19. Package Reminder
**Fonction:** `sendPackageReminderEmail`
**Quand:** Package en attente depuis longtemps
**Couleur:** Violet (🟣)

**Paramètres:**
```typescript
sendPackageReminderEmail(
  userEmail: string,
  userName: string,
  trackingNumber: string,
  status: string,            // Statut actuel
  daysWaiting: number        // Nombre de jours d'attente
)
```

**Exemple:**
```typescript
await sendPackageReminderEmail(
  'user@example.com',
  'John Doe',
  'AS-2026-00123',
  'available',
  7
);
```

**Contenu:**
- 🔔 Rappel de statut
- 📊 Nombre de jours d'attente
- ⚠️ Alerte spéciale si "available"
- 🔗 Lien de tracking

---

## 📊 Résumé Complet

### Catégories d'Emails

| Catégorie | Nombre de Templates | Codes Couleur |
|-----------|-------------------|---------------|
| **Package Requests** | 3 | 🟣🟢🔴 |
| **Status Changes** | 3 | Variable🟢🟢 |
| **Modifications** | 3 | 🟠🟣🔵 |
| **Special Items** | 2 | 🌸🔵 |
| **Communications** | 2 | 🔵Variable |
| **Special Events** | 2 | 🟠🔴 |
| **Announcements** | 1 | 🔵 |
| **Account** | 3 | 🟣⭐🟣 |
| **TOTAL** | **19 Templates** | |

### Tous les Événements Couverts

✅ **Package Lifecycle:**
- Création de requête
- Approbation/Rejet
- Changements de statut (tous)
- Modifications (poids, frais, infos)
- Livraison
- Feedback

✅ **Special Items:**
- Ajout d'items spéciaux
- Retrait d'items spéciaux

✅ **Communications:**
- Messages admin personnalisés
- Notifications importantes (3 niveaux de priorité)

✅ **Événements Spéciaux:**
- Retards de livraison
- Problèmes avec package

✅ **Annonces:**
- Annonces générales

✅ **Account:**
- Email de bienvenue
- Demande de feedback
- Rappels de packages

---

## 🎨 Design & Caractéristiques

### Toutes les emails incluent:
- 📱 Design responsive (mobile-friendly)
- 🎨 En-têtes avec dégradés de couleurs
- 📦 Numéros de tracking bien visibles
- 🔘 Boutons d'action call-to-action
- 🔗 Liens vers le dashboard
- 🏢 Branding Alliance Shipping
- 📧 Footer avec informations de contact

### Palette de Couleurs:
- 🟣 Violet: Package requests, Account
- 🟢 Vert: Approbations, Disponible, Livré
- 🔴 Rouge: Rejets, Problèmes, Priorité haute
- 🟠 Orange: Poids modifié, Retards, Priorité moyenne
- 🔵 Bleu: Informations modifiées, Messages, Priorité basse
- 🌸 Rose: Special items ajoutés
- ⭐ Jaune: Feedback

---

## 💻 Utilisation dans le Code

### Import Simple:
```typescript
import {
  sendPackageRequestEmail,
  sendWeightModifiedEmail,
  sendAdminMessageEmail,
  // ... autres templates
} from '@/lib/email';
```

### Gestion des Erreurs:
Tous les templates gèrent automatiquement les erreurs:
```typescript
// L'email ne bloque jamais l'opération principale
await sendPackageApprovedEmail(...).catch(error => {
  console.error('Failed to send email:', error);
  // L'erreur est loguée mais n'interrompt pas le flux
});
```

### Async/Await:
```typescript
// Attendre l'envoi
await sendWelcomeEmail(email, name);

// Ou fire-and-forget
sendFeedbackRequestEmail(email, name, tracking);
```

---

## 🔧 Configuration Requise

Assurez-vous d'avoir configuré dans `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Voir `EMAIL_SETUP_GUIDE.md` pour la configuration complète.

---

## 📞 Support

Pour toute question sur les templates d'email, consultez:
- 📖 `EMAIL_SETUP_GUIDE.md` - Configuration de Resend
- 💻 `lib/email/service.ts` - Templates de base
- 💻 `lib/email/email-templates.ts` - Templates additionnels
- 📦 Documentation Resend: [https://resend.com/docs](https://resend.com/docs)

---

✅ **Tous les templates sont prêts à l'emploi!** Configurez simplement votre clé API Resend et commencez à envoyer des emails professionnels automatiquement.
