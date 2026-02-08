# Guide de Configuration des Emails - Alliance Shipping

Ce guide explique comment configurer l'envoi automatique d'emails pour l'application Alliance Shipping.

## Service d'Email: Resend

L'application utilise **Resend** pour l'envoi d'emails. Resend est un service moderne, fiable et facile à configurer.

## Étapes de Configuration

### 1. Créer un Compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Cliquez sur "Sign Up" (Créer un compte)
3. Inscrivez-vous avec votre email professionnel
4. Vérifiez votre email

### 2. Obtenir votre Clé API

1. Une fois connecté, allez dans **API Keys** dans le menu de gauche
2. Cliquez sur **Create API Key**
3. Donnez un nom à votre clé (exemple: "Alliance Shipping Production")
4. Sélectionnez les permissions:
   - **Sending access**: Activé (nécessaire pour envoyer des emails)
5. Cliquez sur **Add**
6. **IMPORTANT**: Copiez immédiatement la clé API qui s'affiche. Elle commence par `re_` (exemple: `re_123abc456def789ghi`)
7. **Sauvegardez-la dans un endroit sûr** - vous ne pourrez plus la voir après avoir fermé cette fenêtre!

### 3. Configurer votre Domaine (Optionnel mais Recommandé)

Pour envoyer des emails depuis votre propre domaine (exemple: noreply@allianceshipping.com):

1. Dans Resend, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (exemple: `allianceshipping.com`)
4. Resend vous donnera des enregistrements DNS à ajouter:
   - **SPF** record
   - **DKIM** records
   - **DMARC** record (optionnel)
5. Ajoutez ces enregistrements dans les paramètres DNS de votre domaine (chez votre registrar ou hébergeur)
6. Attendez la vérification (peut prendre quelques minutes à quelques heures)

**Note**: Si vous n'avez pas de domaine personnalisé, vous pouvez utiliser le domaine de test de Resend pour tester (limité à 100 emails/jour).

### 4. Ajouter la Clé API dans votre Application

1. Ouvrez le fichier `.env.local` à la racine de votre projet
2. Ajoutez la ligne suivante avec votre clé API:

```env
RESEND_API_KEY=re_votre_cle_api_ici
```

3. Si vous avez configuré un domaine personnalisé, ajoutez aussi:

```env
SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>
```

4. Ajoutez l'URL de votre application (pour les liens dans les emails):

```env
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

**Exemple complet du fichier `.env.local`:**

```env
# Resend Email Configuration
RESEND_API_KEY=re_abc123def456ghi789jkl012mno345pqr678
SMTP_FROM=Alliance Shipping <noreply@allianceshipping.com>

# Application URL
NEXT_PUBLIC_APP_URL=https://allianceshipping.com

# Autres variables d'environnement...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 5. Redémarrer l'Application

Après avoir ajouté les variables d'environnement, redémarrez votre application:

```bash
npm run dev
```

Ou en production:

```bash
npm run build
npm start
```

## Emails Envoyés Automatiquement

L'application envoie automatiquement des emails dans les situations suivantes:

### 1. **Création de Requête de Package** (`sendPackageRequestEmail`)
- **Quand**: Un utilisateur soumet une nouvelle requête de package
- **À qui**: L'utilisateur qui a fait la requête
- **Contenu**: Confirmation de la réception de la requête avec le numéro de suivi externe

### 2. **Approbation de Package** (`sendPackageApprovedEmail`)
- **Quand**: Un admin approuve une requête de package
- **À qui**: L'utilisateur dont la requête a été approuvée
- **Contenu**: Confirmation de l'approbation, nouveau numéro de suivi Alliance Shipping (AS-XXXX), coût total

### 3. **Rejet de Package** (`sendPackageRejectedEmail`)
- **Quand**: Un admin rejette une requête de package
- **À qui**: L'utilisateur dont la requête a été rejetée
- **Contenu**: Notification du rejet avec la raison (si fournie)

### 4. **Changement de Statut** (`sendPackageStatusChangeEmail`)
- **Quand**: Un admin change le statut d'un package (received, in-transit)
- **À qui**: L'utilisateur propriétaire du package
- **Contenu**: Notification du nouveau statut avec description

### 5. **Package Disponible pour Retrait** (`sendPackageAvailableEmail`)
- **Quand**: Un admin marque un package comme "available"
- **À qui**: L'utilisateur propriétaire du package
- **Contenu**: Notification que le package est prêt à être récupéré, lieu de retrait, heures d'ouverture

### 6. **Package Livré** (`sendPackageDeliveredEmail`)
- **Quand**: Un admin marque un package comme "delivered"
- **À qui**: L'utilisateur propriétaire du package
- **Contenu**: Confirmation de la livraison avec le nom du destinataire

## Templates d'Emails

Tous les emails ont un design professionnel avec:
- En-têtes avec dégradés de couleurs
- Mise en page responsive (mobile-friendly)
- Boutons d'action pour accéder au dashboard
- Informations de contact
- Branding Alliance Shipping

Les couleurs varient selon le type d'email:
- **Bleu/Violet**: Création de requête
- **Vert**: Approbation, disponible, livré
- **Rouge**: Rejet
- **Couleurs variées**: Changements de statut

## Test des Emails

### Mode Développement

En développement, vous pouvez utiliser le domaine de test de Resend:

1. Allez sur [resend.com/emails](https://resend.com/emails)
2. Vous verrez tous les emails envoyés
3. Cliquez sur un email pour voir son contenu et son statut de livraison

### Tester l'Envoi

1. Créez une nouvelle requête de package depuis l'interface utilisateur
2. Vérifiez votre email (ou l'interface Resend si vous utilisez le domaine de test)
3. Approuvez la requête depuis l'interface admin
4. Vérifiez le deuxième email reçu

## Limites et Tarification

### Plan Gratuit de Resend
- **100 emails/jour**
- **1 domaine vérifié**
- Parfait pour tester

### Plan Pro de Resend
- À partir de **$20/mois**
- **50,000 emails/mois** (puis $1 par 1,000 emails supplémentaires)
- **Domaines illimités**
- Support prioritaire

Pour Alliance Shipping, le plan gratuit devrait suffire pour commencer. Passez au plan Pro si vous envoyez plus de 100 emails/jour.

## Dépannage

### Les emails ne sont pas envoyés

1. **Vérifiez la clé API**:
   - Assurez-vous que `RESEND_API_KEY` est bien défini dans `.env.local`
   - Vérifiez que la clé commence bien par `re_`

2. **Vérifiez les logs**:
   - Ouvrez la console de votre terminal où l'app tourne
   - Cherchez les messages d'erreur contenant "email" ou "resend"

3. **Vérifiez le domaine**:
   - Si vous utilisez un domaine personnalisé, assurez-vous qu'il est vérifié dans Resend
   - Les enregistrements DNS peuvent prendre jusqu'à 48h pour se propager

4. **Limites dépassées**:
   - Vérifiez sur resend.com si vous n'avez pas atteint la limite quotidienne
   - Le plan gratuit est limité à 100 emails/jour

### Les emails vont dans les spams

1. **Configurez SPF, DKIM et DMARC** correctement sur votre domaine
2. **Utilisez un domaine professionnel** plutôt que Gmail/Yahoo
3. **Évitez les mots "spam"** dans le contenu (déjà fait dans nos templates)
4. **Réchauffez votre domaine**: Commencez par envoyer peu d'emails et augmentez progressivement

## Support

### Resend Support
- Documentation: [https://resend.com/docs](https://resend.com/docs)
- Support: [https://resend.com/support](https://resend.com/support)

### Alliance Shipping
- Pour des questions sur l'implémentation, contactez votre développeur

## Sécurité

⚠️ **IMPORTANT**:
- Ne partagez JAMAIS votre clé API publiquement
- Ne commitez JAMAIS le fichier `.env.local` sur Git
- Utilisez des clés API différentes pour développement et production
- Renouvelez vos clés API régulièrement

---

✅ **Configuration complète!** Votre application peut maintenant envoyer des emails automatiquement.
