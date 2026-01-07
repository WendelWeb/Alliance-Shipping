# Système de Gestion des Images - Alliance Shipping

## 📁 Structure des Dossiers

Toutes les images sont organisées par section dans des dossiers séparés :

```
public/images/
├── hero/                  ✅ 4 images (carousel automatique)
├── how-it-works/          ✅ 5 images (carousel automatique)
├── fees/                  ✅ 7 images (carousel automatique)
├── delivery/              ⏳ Vide (à remplir)
├── testimonials/          ⏳ Vide (à remplir)
├── faq/                   ⏳ Vide (à remplir)
├── tracking/              ⏳ Vide (à remplir)
└── contact/               ⏳ Vide (à remplir)
```

## 🎯 Comment Ça Marche

### Système Automatique Intelligent

Le système détecte **automatiquement** le nombre d'images dans chaque dossier :

- **1 seule image** → Affichage simple (statique)
- **Plusieurs images** → Diaporama/Carousel automatique (rotation toutes les 5 secondes)
- **0 image** → Rien n'est affiché

### Pas Besoin de Renommer !

Vous pouvez nommer vos images comme vous voulez :
- `1.png`, `2.png`, `3.png`, etc.
- Ou garder les noms actuels comme `hero-shipping.jpg`, `hero-shipping-1.jpg`

Le système s'adapte automatiquement !

## 📝 Configuration

Le fichier `lib/images-config.ts` contrôle tout :

```typescript
export const IMAGES_CONFIG = {
  hero: {
    folder: 'hero',      // Nom du dossier
    count: 4,            // Nombre d'images
    extension: 'jpg',    // Extension des fichiers
    alt: '...'          // Description pour accessibilité
  },
  // ... autres sections
}
```

## ➕ Comment Ajouter des Images à une Section

### Exemple : Ajouter des images à la section "delivery"

1. **Placez vos images** dans le dossier correspondant :
   ```
   public/images/delivery/
   ├── 1.png
   ├── 2.png
   └── 3.png
   ```

2. **Mettez à jour la configuration** dans `lib/images-config.ts` :
   ```typescript
   delivery: {
     folder: 'delivery',
     count: 3,  // ← Changez de 0 à 3
     extension: 'png',
     alt: 'Modern map illustration...',
   },
   ```

3. **C'est tout !** 🎉
   - Si vous avez mis 1 image → Affichage simple
   - Si vous avez mis 3 images → Carousel automatique

## 🔄 Sections Actuelles

### ✅ Sections avec Images (Carousels Actifs)

| Section | Dossier | Nombre | Type |
|---------|---------|--------|------|
| Hero | `hero/` | 4 | Carousel |
| How It Works | `how-it-works/` | 5 | Carousel |
| Pricing/Fees | `fees/` | 7 | Carousel |

### ⏳ Sections Sans Images (À Compléter)

| Section | Dossier | Quand Ajouté | Affichage |
|---------|---------|--------------|-----------|
| Delivery Map | `delivery/` | `count > 0` | Auto |
| Testimonials | `testimonials/` | `count > 0` | Auto |
| FAQ Support | `faq/` | `count > 0` | Auto |
| Tracking | `tracking/` | `count > 0` | Auto |
| Contact Team | `contact/` | `count > 0` | Auto |

## 🎨 Caractéristiques du Carousel

Quand une section a plusieurs images :

- ✨ **Rotation automatique** toutes les 5 secondes
- 🎯 **Indicateurs cliquables** en bas pour navigation manuelle
- 🎬 **Animations fluides** (fade + zoom)
- 📱 **Responsive** sur tous les écrans
- ⚡ **Performance optimisée** avec Next.js Image

## 🛠️ Composants Créés

### `ImageGallery` - Composant Réutilisable
Utilisé automatiquement dans toutes les sections :

```tsx
<ImageGallery
  section="hero"           // Nom de la section
  className="w-full h-full"
  imageClassName="object-cover"
/>
```

### Fichiers du Système

1. **`lib/images-config.ts`** - Configuration centrale
2. **`components/ImageGallery.tsx`** - Composant de gallery/carousel
3. **Toutes les sections** mises à jour pour utiliser `ImageGallery`

## 📋 Checklist pour Ajouter des Images

- [ ] Créer/Générer vos images
- [ ] Les placer dans le bon dossier `public/images/[section]/`
- [ ] Mettre à jour `count` dans `lib/images-config.ts`
- [ ] Rafraîchir le navigateur
- [ ] ✅ Ça marche !

## 🚀 Avantages du Système

1. **Flexible** : Fonctionne avec 1 ou plusieurs images
2. **Automatique** : Détecte le type d'affichage (simple vs carousel)
3. **Facile** : Pas besoin de renommer les fichiers
4. **Maintenable** : Configuration centralisée
5. **Performant** : Utilise Next.js Image optimization
6. **Extensible** : Facile d'ajouter de nouvelles sections

---

**Note** : Le système est 100% opérationnel. Ajoutez simplement vos images et mettez à jour le `count` ! 🎉
