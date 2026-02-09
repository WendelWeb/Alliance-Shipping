# Comment Redémarrer l'App Correctement

Les traductions ont été modifiées et vous devez redémarrer l'application pour que les changements prennent effet.

## Étapes pour Redémarrer:

### Option 1: Restart Rapide (Recommandé)
1. Dans le terminal Metro Bundler, appuyez sur `R` ou `r` pour recharger
2. Si ça ne marche pas, passez à l'Option 2

### Option 2: Restart Complet avec Clear Cache
1. Arrêtez le serveur Metro (Ctrl+C dans le terminal)
2. Exécutez:
   ```bash
   cd alliance-shipping-mobile
   npx expo start -c
   ```
3. Scannez le QR code à nouveau avec votre téléphone

### Option 3: Si l'erreur persiste
1. Fermez complètement l'application sur votre téléphone
2. Dans le terminal:
   ```bash
   cd alliance-shipping-mobile
   rm -rf .expo node_modules/.cache
   npx expo start -c
   ```
3. Rouvrez l'application

## Ce qui a été corrigé:
✅ Les traductions `rewards` ont été déplacées au niveau supérieur
✅ Ajout d'une vérification de sécurité dans rewards.tsx
✅ Toutes les clés de traduction ont été corrigées

L'erreur devrait disparaître après le redémarrage!
