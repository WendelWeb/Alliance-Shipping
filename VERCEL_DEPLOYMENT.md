# Guide de Déploiement Vercel

## Variables d'Environnement Requises

Pour que votre application fonctionne sur Vercel, vous **DEVEZ** configurer les variables d'environnement suivantes :

### 1. Clerk Authentication (OBLIGATOIRE)

Allez sur https://dashboard.clerk.com/last-active?path=api-keys et copiez vos clés :

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

URLs Clerk (utilisez ces valeurs exactes) :
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Database - Neon PostgreSQL (OBLIGATOIRE)

Allez sur https://console.neon.tech et copiez votre connection string :

```
DATABASE_URL=postgresql://user:password@host.aws.neon.tech/database?sslmode=require
```

### 3. Configuration de l'Application (OBLIGATOIRE)

```
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

### 4. Variables Optionnelles

Ces variables sont optionnelles mais recommandées :

```
# Email (optionnel)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@votre-domaine.com

# Site
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
NEXT_PUBLIC_SITE_NAME=Alliance Shipping

# Social Media
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/votrepage
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/votrepage
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/votrepage
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/votrepage

# Contact
NEXT_PUBLIC_PHONE=+1 (305) 555-0100
NEXT_PUBLIC_EMAIL=info@votre-domaine.com
NEXT_PUBLIC_WHATSAPP=+15055550100
```

## Comment Configurer sur Vercel

### Méthode 1 : Via l'Interface Web

1. Allez sur votre projet Vercel
2. Cliquez sur **Settings** → **Environment Variables**
3. Pour chaque variable :
   - Cliquez sur **Add New**
   - Entrez le **Name** (ex: `DATABASE_URL`)
   - Entrez la **Value**
   - Sélectionnez les environnements : **Production**, **Preview**, **Development**
   - Cliquez sur **Save**

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_APP_URL

# Redéployer
vercel --prod
```

### Méthode 3 : Import depuis .env.local

1. Allez sur **Settings** → **Environment Variables**
2. Cliquez sur **⋮** (trois points) en haut à droite
3. Sélectionnez **Import from .env**
4. Copiez le contenu de votre fichier `.env.local`
5. Collez-le et importez

## Vérification

Après avoir configuré les variables, redéployez votre application :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur **⋮** → **Redeploy**

Ou via CLI :
```bash
vercel --prod --force
```

## Résolution des Problèmes

### Erreur: "Missing publishableKey"
- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` est bien configurée
- Assurez-vous qu'elle commence par `pk_test_` ou `pk_live_`

### Erreur: "DATABASE_URL is not defined"
- Vérifiez que `DATABASE_URL` est bien configurée
- Testez la connexion depuis https://console.neon.tech

### Build réussi mais l'app ne fonctionne pas
- Vérifiez que TOUTES les variables OBLIGATOIRES sont configurées
- Vérifiez que vous avez sélectionné **Production**, **Preview**, ET **Development**
- Redéployez après avoir ajouté les variables

## Checklist de Déploiement

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` configurée
- [ ] `CLERK_SECRET_KEY` configurée
- [ ] `DATABASE_URL` configurée
- [ ] Toutes les URLs Clerk configurées
- [ ] `NEXT_PUBLIC_APP_URL` configurée avec l'URL Vercel
- [ ] Variables configurées pour Production, Preview, et Development
- [ ] Redéploiement effectué après configuration des variables
- [ ] Build réussi sans erreurs
- [ ] Application accessible et fonctionnelle

## Support

Pour plus d'informations :
- Documentation Vercel: https://vercel.com/docs/environment-variables
- Documentation Clerk: https://clerk.com/docs/deployments/overview
- Documentation Neon: https://neon.tech/docs/introduction
