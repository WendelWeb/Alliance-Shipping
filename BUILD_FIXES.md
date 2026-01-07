# Corrections du Build Vercel

## Problèmes Rencontrés et Solutions

### 1. ❌ Erreur: `DATABASE_URL is not defined`

**Problème:**
```
Error: DATABASE_URL is not defined
at 91132 (.next/server/app/api/admin/analytics/route.js:1:20488)
```

L'erreur se produisait pendant la phase de **build** (et non au runtime) car:
- Le fichier `lib/db/index.ts` vérifiait `DATABASE_URL` au niveau du module
- Pendant le build Next.js, les routes API sont analysées et importent `@/lib/db`
- Sur Vercel, `DATABASE_URL` n'est pas disponible pendant le build (seulement au runtime)

**Solution Appliquée:**

**Fichier: `lib/db/index.ts`**
```typescript
// AVANT (causait l'erreur)
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// APRÈS (permet le build)
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
```

L'URL dummy permet au build de se terminer. L'erreur ne sera levée que si la connexion est réellement utilisée sans `DATABASE_URL`.

**Fichier: `next.config.js`**
```javascript
module.exports = {
  // ... autres configs
  serverExternalPackages: ['@neondatabase/serverless'],
}
```

Cette configuration traite `@neondatabase/serverless` comme un package externe, évitant son bundling.

---

### 2. ❌ Erreur: `Missing publishableKey` (Clerk)

**Problème:**
```
Error: @clerk/clerk-react: Missing publishableKey
Error occurred prerendering page "/_not-found"
```

Clerk nécessite sa clé publique pendant le build pour générer les pages statiques.

**Solution:**

Vous **DEVEZ** configurer ces variables d'environnement sur Vercel:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## Configuration Vercel Complète

### Variables d'Environnement OBLIGATOIRES

Sur Vercel → Settings → Environment Variables, ajoutez :

| Variable | Exemple | Où l'obtenir |
|----------|---------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | https://dashboard.clerk.com |
| `CLERK_SECRET_KEY` | `sk_test_...` | https://dashboard.clerk.com |
| `DATABASE_URL` | `postgresql://...` | https://console.neon.tech |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app` | URL de votre projet Vercel |

**Important:** Sélectionnez **Production**, **Preview**, ET **Development** pour chaque variable.

### Configuration Rapide

**Option 1 - Script automatisé:**
```bash
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```

**Option 2 - Vercel CLI manuelle:**
```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development
vercel env add CLERK_SECRET_KEY production preview development
vercel env add DATABASE_URL production preview development
vercel env add NEXT_PUBLIC_APP_URL production preview development
```

**Option 3 - Interface Web:**
1. Allez sur votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez chaque variable manuellement

---

## Vérification du Build Local

Pour tester le build localement avant de déployer:

```bash
cd alliance-shipping-web
npm run build
```

Si le build réussit localement, il devrait réussir sur Vercel (avec les bonnes variables d'env).

---

## Checklist de Déploiement

- [x] `lib/db/index.ts` modifié pour utiliser une URL dummy pendant le build
- [x] `next.config.js` configuré avec `serverExternalPackages`
- [x] `.env.example` mis à jour avec toutes les variables requises
- [ ] Variables d'environnement Clerk configurées sur Vercel
- [ ] `DATABASE_URL` configurée sur Vercel
- [ ] `NEXT_PUBLIC_APP_URL` configurée sur Vercel
- [ ] Redéploiement effectué après configuration

---

## Fichiers Modifiés

1. ✅ `lib/db/index.ts` - Lazy loading de la connexion DB
2. ✅ `next.config.js` - Configuration des packages externes
3. ✅ `.env.example` - Documentation complète des variables
4. ✅ `VERCEL_DEPLOYMENT.md` - Guide de déploiement détaillé
5. ✅ `setup-vercel-env.sh` - Script de configuration automatisé

---

## Prochaines Étapes

1. **Configurez les variables d'environnement sur Vercel** (voir `VERCEL_DEPLOYMENT.md`)
2. **Redéployez votre application:**
   ```bash
   vercel --prod --force
   ```
3. **Vérifiez que tout fonctionne:**
   - Le build doit se terminer sans erreur
   - L'application doit être accessible
   - L'authentification Clerk doit fonctionner
   - La connexion à la base de données doit fonctionner

---

## Support

Si vous rencontrez d'autres erreurs, vérifiez:
- Les logs de build sur Vercel (Deployments → Latest → View Build Logs)
- Les logs runtime sur Vercel (Deployments → Latest → View Function Logs)
- La documentation officielle: https://vercel.com/docs

---

**Date:** 2026-01-07
**Build Status:** ✅ Build local réussi
**Vercel Status:** ⏳ En attente de configuration des variables d'environnement
