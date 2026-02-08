# 🔧 Email Troubleshooting Guide - Alliance Shipping

## 📋 Comment Vérifier Si Les Emails Fonctionnent

### 1. Vérifier les Logs

Quand vous créez une requête de package ou effectuez une action, les logs d'email s'affichent automatiquement dans votre terminal/console.

**Format des Logs:**

```
================================================================================
[EMAIL START] 2026-01-12T10:30:45.123Z
================================================================================
📧 EMAIL CONFIGURATION:
   API Key: ✅ Present (length: 47)
   From Email: Alliance Shipping <noreply@allianceshipping.com>
   To: user@example.com
   Subject: 📦 Package Request Submitted - Alliance Shipping

🚀 ATTEMPTING TO SEND EMAIL...
================================================================================


================================================================================
[EMAIL SUCCESS] 2026-01-12T10:30:46.456Z
================================================================================
📧 EMAIL CONFIGURATION:
   API Key: ✅ Present (length: 47)
   From Email: Alliance Shipping <noreply@allianceshipping.com>
   To: user@example.com
   Subject: 📦 Package Request Submitted - Alliance Shipping

✅ EMAIL SENT SUCCESSFULLY!
   Response: {
     "id": "abc123...",
     "from": "noreply@allianceshipping.com",
     "to": "user@example.com"
   }
================================================================================
```

---

## ❌ ERREURS COMMUNES ET SOLUTIONS

### Erreur 1: API Key Manquante

**Log:**
```
   API Key: ❌ MISSING
   ⚠️  RESEND_API_KEY is missing in .env.local
   → Get your key from: https://resend.com/api-keys
```

**Solution:**
1. Allez sur [https://resend.com/api-keys](https://resend.com/api-keys)
2. Créez une API key
3. Copiez la clé (commence par `re_`)
4. Ajoutez dans `.env.local`:
   ```env
   RESEND_API_KEY=re_votre_cle_ici
   ```
5. Redémarrez l'application: `npm run dev`

---

### Erreur 2: API Key Invalide

**Log:**
```
   API Key: ✅ Present (length: 10)
   ⚠️  RESEND_API_KEY might be invalid (should start with "re_")
   ⚠️  Authentication failed - Check your API key
```

**Solution:**
1. Vérifiez que votre clé commence par `re_`
2. Vérifiez qu'il n'y a pas d'espaces avant/après la clé
3. Créez une nouvelle clé sur Resend si nécessaire
4. Mettez à jour `.env.local`
5. Redémarrez l'app

---

### Erreur 3: Domaine Non Vérifié

**Log:**
```
   ⚠️  Domain not verified - Verify your domain in Resend dashboard
   → Or use: onboarding@resend.dev for testing
```

**Solution Option 1 (Rapide pour tester):**
```env
# Dans .env.local
SMTP_FROM=onboarding@resend.dev
```

**Solution Option 2 (Production):**
1. Allez sur [https://resend.com/domains](https://resend.com/domains)
2. Ajoutez votre domaine
3. Ajoutez les enregistrements DNS fournis
4. Attendez la vérification (peut prendre quelques heures)
5. Utilisez votre domaine:
   ```env
   SMTP_FROM=Alliance Shipping <noreply@votre-domaine.com>
   ```

---

### Erreur 4: Limite d'Emails Dépassée

**Log:**
```
   Error Message: Rate limit exceeded
   Status Code: 429
```

**Solution:**
1. **Plan Gratuit:** 100 emails/jour
   - Attendez 24 heures
   - Ou passez au plan payant
2. **Plan Payant:** 50,000 emails/mois
   - Contactez Resend pour augmenter

---

### Erreur 5: Email Destinataire Invalide

**Log:**
```
   Error Message: Invalid recipient email
   Status Code: 400
```

**Solution:**
1. Vérifiez l'email de l'utilisateur dans la base de données
2. Assurez-vous que l'email est valide
3. Vérifiez qu'il n'y a pas d'espaces

---

## 🔍 COMMENT TESTER

### Test 1: Vérifier la Configuration

```typescript
// Dans n'importe quel fichier API
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'PRESENT' : 'MISSING');
console.log('SMTP_FROM:', process.env.SMTP_FROM);
console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
```

### Test 2: Envoyer un Email de Test

Créez un fichier `app/api/test-email/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/service';

export async function GET() {
  const result = await sendEmail({
    to: 'votre-email@example.com',  // Changez ceci
    subject: 'Test Email from Alliance Shipping',
    html: '<h1>Test Email</h1><p>If you receive this, emails are working!</p>'
  });

  return NextResponse.json(result);
}
```

Puis visitez: `http://localhost:3000/api/test-email`

---

## 📋 COPIER LES LOGS POUR DEBUGGING

Quand une erreur se produit, les logs incluent une section "COPY THIS LOG TO SHARE":

```json
{
  "timestamp": "2026-01-12T10:30:45.123Z",
  "status": "ERROR",
  "to": "user@example.com",
  "subject": "📦 Package Request Submitted",
  "from": "Alliance Shipping <noreply@allianceshipping.com>",
  "hasApiKey": true,
  "apiKeyLength": 47,
  "error": {
    "name": "ResendError",
    "message": "Domain not verified",
    "statusCode": 400
  }
}
```

**Copiez ce JSON et partagez-le pour obtenir de l'aide.**

---

## 🔧 CHECKLIST DE DEBUGGING

Avant de demander de l'aide, vérifiez:

- [ ] `.env.local` existe à la racine du projet
- [ ] `RESEND_API_KEY` est défini et commence par `re_`
- [ ] `SMTP_FROM` est défini
- [ ] L'application a été redémarrée après modification du `.env.local`
- [ ] Les logs d'email apparaissent dans le terminal
- [ ] Vous avez copié les logs complets (incluant la section JSON)

---

## 🚀 VÉRIFIER SI UN EMAIL A ÉTÉ ENVOYÉ

### Sur Resend Dashboard:

1. Allez sur [https://resend.com/emails](https://resend.com/emails)
2. Vous verrez tous les emails envoyés
3. Cliquez sur un email pour voir:
   - Statut de livraison
   - Contenu de l'email
   - Erreurs éventuelles

### Dans les Logs:

Cherchez `[EMAIL SUCCESS]` dans votre terminal.

---

## 💡 ASTUCES

### Activer les Logs Détaillés

Les logs sont déjà activés automatiquement. Vous verrez:
- ✅ Succès en vert
- ❌ Erreurs en rouge
- 📧 Configuration à chaque tentative

### Désactiver les Logs (Production)

Si vous voulez désactiver les logs en production, modifiez `lib/email/service.ts`:

```typescript
const ENABLE_LOGS = process.env.NODE_ENV === 'development';

const logEmailAttempt = (...args) => {
  if (!ENABLE_LOGS) return;
  // ... reste du code
};
```

### Tester Avec Plusieurs Destinataires

```typescript
// Envoyer à plusieurs personnes
const recipients = ['user1@example.com', 'user2@example.com'];

for (const email of recipients) {
  await sendPackageRequestEmail(email, userName, tracking);
}
```

---

## 📊 STATUTS D'EMAIL

### Codes de Statut HTTP:

| Code | Signification | Action |
|------|---------------|--------|
| 200 | ✅ Succès | Email envoyé |
| 400 | ❌ Requête invalide | Vérifier les données |
| 401 | ❌ Non autorisé | Vérifier API key |
| 403 | ❌ Interdit | Vérifier permissions |
| 422 | ❌ Validation failed | Vérifier email destinataire |
| 429 | ⚠️ Limite dépassée | Attendre ou upgrade |
| 500 | ❌ Erreur serveur | Réessayer plus tard |

---

## 🆘 OBTENIR DE L'AIDE

### 1. Logs Complets

Copiez les logs depuis votre terminal, incluant:
- La section `[EMAIL START]`
- La section `[EMAIL ERROR]` (si erreur)
- La section JSON "COPY THIS LOG TO SHARE"

### 2. Configuration

Partagez (sans la vraie clé API):
```env
RESEND_API_KEY=re_*************** (longueur: 47)
SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Étapes pour Reproduire

Décrivez:
1. Quelle action avez-vous effectuée?
2. Quel email devrait être envoyé?
3. Qu'est-ce qui s'est passé?
4. Que disent les logs?

---

## 📞 SUPPORT

### Resend Support:
- Documentation: [https://resend.com/docs](https://resend.com/docs)
- Support: [https://resend.com/support](https://resend.com/support)

### Vérifications Rapides:

**API Key fonctionne?**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_votre_cle" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "votre-email@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

**Réponse attendue:**
```json
{
  "id": "abc123...",
  "from": "onboarding@resend.dev",
  "to": "votre-email@example.com"
}
```

---

## ✅ TOUT FONCTIONNE?

Si vous voyez dans les logs:

```
✅ EMAIL SENT SUCCESSFULLY!
   Response: {
     "id": "...",
     "from": "...",
     "to": "..."
   }
```

**Félicitations!** Vos emails fonctionnent correctement! 🎉

Vérifiez votre boîte email (et spam) pour voir l'email reçu.

---

## 🔄 PROCESSUS COMPLET DE RÉSOLUTION

1. **Vérifier les logs** - Lire les messages d'erreur
2. **Identifier le problème** - Utiliser les hints fournis
3. **Appliquer la solution** - Suivre les instructions ci-dessus
4. **Redémarrer l'app** - `npm run dev`
5. **Tester à nouveau** - Créer une requête de package
6. **Vérifier les logs** - Chercher `[EMAIL SUCCESS]`

Si le problème persiste après avoir tout vérifié, **copiez les logs complets** et partagez-les.

---

**Bonne chance avec vos emails! 📧✨**
