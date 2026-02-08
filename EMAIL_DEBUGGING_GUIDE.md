# 🐛 Guide de Debugging des Emails - Alliance Shipping

## 🚀 TEST RAPIDE

### 1. Tester l'envoi d'email (5 secondes)

Visitez dans votre navigateur:
```
http://localhost:3000/api/test-email?to=votre-email@example.com
```

**Changez `votre-email@example.com` par votre vraie adresse email!**

---

## 📋 CE QUI SE PASSE AUTOMATIQUEMENT

Chaque fois qu'un email est envoyé, vous verrez des logs détaillés dans votre terminal:

### ✅ Exemple de Succès

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
     "id": "abc123-def456-ghi789",
     "from": "noreply@allianceshipping.com",
     "to": "user@example.com"
   }
================================================================================
```

### ❌ Exemple d'Erreur

```
================================================================================
[EMAIL ERROR] 2026-01-12T10:30:45.123Z
================================================================================
📧 EMAIL CONFIGURATION:
   API Key: ❌ MISSING
   From Email: Alliance Shipping <noreply@allianceshipping.com>
   To: user@example.com
   Subject: 📦 Package Request Submitted - Alliance Shipping

❌ EMAIL SEND FAILED!
   Error Type: ConfigurationError
   Error Message: RESEND_API_KEY is not defined

💡 TROUBLESHOOTING HINTS:
   ⚠️  RESEND_API_KEY is missing in .env.local
   → Get your key from: https://resend.com/api-keys

📋 COPY THIS LOG TO SHARE:
{
  "timestamp": "2026-01-12T10:30:45.123Z",
  "status": "ERROR",
  "to": "user@example.com",
  "subject": "📦 Package Request Submitted",
  "from": "Alliance Shipping <noreply@allianceshipping.com>",
  "hasApiKey": false,
  "apiKeyLength": 0,
  "error": {
    "name": "ConfigurationError",
    "message": "RESEND_API_KEY is not defined",
    "statusCode": null
  }
}
================================================================================
```

---

## 🔍 COMMENT LIRE LES LOGS

### 1. Vérifier l'API Key

```
API Key: ✅ Present (length: 47)  ← BON
API Key: ❌ MISSING                ← MAUVAIS
```

Si vous voyez `❌ MISSING`:
1. Créez un compte sur [resend.com](https://resend.com)
2. Allez dans "API Keys"
3. Créez une nouvelle clé
4. Ajoutez dans `.env.local`:
   ```env
   RESEND_API_KEY=re_votre_cle_ici
   ```
5. Redémarrez l'app: `npm run dev`

### 2. Vérifier le Résultat

```
✅ EMAIL SENT SUCCESSFULLY!  ← BON
❌ EMAIL SEND FAILED!        ← MAUVAIS
```

Si vous voyez `✅ EMAIL SENT SUCCESSFULLY!`, tout fonctionne!

Si vous voyez `❌ EMAIL SEND FAILED!`, lisez les "TROUBLESHOOTING HINTS" en dessous.

### 3. Copier les Logs pour Support

Si vous avez besoin d'aide, copiez la section JSON "COPY THIS LOG TO SHARE":

```json
{
  "timestamp": "2026-01-12T10:30:45.123Z",
  "status": "ERROR",
  "to": "user@example.com",
  ...
}
```

**Partagez ce JSON quand vous demandez de l'aide.**

---

## 🛠️ RÉSOLUTION RAPIDE DES PROBLÈMES

### Problème: API Key Manquante

**Symptôme:**
```
API Key: ❌ MISSING
```

**Solution:**
```bash
# 1. Créez un fichier .env.local à la racine du projet
# 2. Ajoutez:
RESEND_API_KEY=re_votre_cle_ici
SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. Redémarrez
npm run dev
```

---

### Problème: Domaine Non Vérifié

**Symptôme:**
```
⚠️  Domain not verified
```

**Solution Rapide (Test):**
```env
# Dans .env.local, changez:
SMTP_FROM=onboarding@resend.dev
```

**Solution Production:**
1. Allez sur [resend.com/domains](https://resend.com/domains)
2. Ajoutez votre domaine
3. Configurez les DNS
4. Attendez la vérification

---

### Problème: Limite Dépassée

**Symptôme:**
```
Status Code: 429
Error Message: Rate limit exceeded
```

**Solution:**
- Plan Gratuit: 100 emails/jour → Attendez 24h
- Plan Payant: 50,000 emails/mois → Contactez Resend

---

## 📧 TESTER MANUELLEMENT

### Option 1: Via Navigateur

Visitez:
```
http://localhost:3000/api/test-email?to=votre-email@example.com
```

Vous verrez une réponse JSON:
```json
{
  "success": true,
  "message": "Test email sent successfully!",
  "emailSentTo": "votre-email@example.com",
  "emailId": "abc123...",
  "logs": "Check your terminal for detailed logs"
}
```

### Option 2: Via Curl

```bash
curl "http://localhost:3000/api/test-email?to=votre-email@example.com"
```

### Option 3: Créer une Requête de Package

1. Allez sur votre app
2. Créez une nouvelle requête de package
3. Regardez les logs dans votre terminal
4. Vérifiez votre email

---

## 🎯 CHECKLIST AVANT DE TESTER

- [ ] **Resend compte créé** sur [resend.com](https://resend.com)
- [ ] **API Key créée** dans Resend dashboard
- [ ] **`.env.local` existe** à la racine du projet
- [ ] **`RESEND_API_KEY` défini** dans `.env.local`
- [ ] **`SMTP_FROM` défini** dans `.env.local`
- [ ] **App redémarrée** après modification du `.env.local`
- [ ] **Terminal ouvert** pour voir les logs

---

## 📊 INTERPRÉTER LES LOGS

### Logs de Démarrage

```
🚀 ATTEMPTING TO SEND EMAIL...
```
→ L'email est en cours d'envoi

### Logs de Succès

```
✅ EMAIL SENT SUCCESSFULLY!
   Response: { "id": "..." }
```
→ Email envoyé! Vérifiez votre boîte email

### Logs d'Erreur

```
❌ EMAIL SEND FAILED!
   Error Message: ...
```
→ Lisez le message d'erreur et les hints

---

## 🔧 COMMANDES UTILES

### Vérifier Configuration

```bash
# Dans votre terminal, au démarrage de l'app
# Vous verrez si les variables sont chargées
```

### Tester Email

```bash
# Méthode 1: Navigateur
# Visitez: http://localhost:3000/api/test-email?to=votre-email@example.com

# Méthode 2: Curl
curl "http://localhost:3000/api/test-email?to=votre-email@example.com"
```

### Voir Tous les Emails Envoyés

Allez sur: [https://resend.com/emails](https://resend.com/emails)

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

1. **Copiez les logs complets** du terminal (section JSON)
2. **Partagez:**
   - Les logs
   - Votre configuration (sans la vraie API key)
   - Ce que vous avez essayé
3. **Vérifiez:**
   - Spam/Junk folder
   - Resend dashboard pour voir les emails

---

## ✅ VALIDATION FINALE

Pour confirmer que tout fonctionne:

1. ✅ Visitez `/api/test-email?to=votre-email@example.com`
2. ✅ Vérifiez les logs → Doit dire `EMAIL SENT SUCCESSFULLY`
3. ✅ Vérifiez votre email → Vous devriez recevoir un email de test
4. ✅ Créez une requête de package → Devrait envoyer un email automatiquement

Si les 4 points ✅ sont bons, **tout fonctionne parfaitement!** 🎉

---

## 📚 DOCUMENTATION COMPLÈTE

- **EMAIL_SETUP_GUIDE.md** - Configuration Resend
- **EMAIL_TROUBLESHOOTING.md** - Guide de dépannage complet
- **EMAIL_DEBUGGING_GUIDE.md** - Ce document
- **EMAIL_QUICK_START.md** - Guide de démarrage

---

**Bon debugging! 🐛✨**
