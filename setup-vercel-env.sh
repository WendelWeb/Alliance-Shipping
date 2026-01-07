#!/bin/bash

# Script pour configurer rapidement les variables d'environnement sur Vercel
# Usage: ./setup-vercel-env.sh

echo "🚀 Configuration des variables d'environnement Vercel"
echo "=================================================="
echo ""

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé."
    echo "📦 Installation en cours..."
    npm i -g vercel
fi

echo "🔐 Connexion à Vercel..."
vercel login

echo ""
echo "📋 Ajout des variables OBLIGATOIRES..."
echo ""

# Clerk Authentication
echo "1️⃣  CLERK Authentication"
echo "Obtenez vos clés sur: https://dashboard.clerk.com/last-active?path=api-keys"
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development
vercel env add CLERK_SECRET_KEY production preview development

# Clerk URLs
echo ""
echo "2️⃣  CLERK URLs (valeurs par défaut)"
echo "/sign-in" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production preview development
echo "/sign-up" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production preview development
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production preview development
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production preview development

# Database
echo ""
echo "3️⃣  DATABASE"
echo "Obtenez votre connection string sur: https://console.neon.tech"
vercel env add DATABASE_URL production preview development

# App URL
echo ""
echo "4️⃣  APP URL"
echo "Entrez l'URL de votre application (ex: https://votre-app.vercel.app)"
vercel env add NEXT_PUBLIC_APP_URL production preview development

echo ""
echo "✅ Variables OBLIGATOIRES configurées!"
echo ""

# Demander si l'utilisateur veut configurer les variables optionnelles
read -p "Voulez-vous configurer les variables OPTIONNELLES ? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📋 Ajout des variables OPTIONNELLES..."

    # Resend Email
    echo ""
    echo "5️⃣  RESEND Email (optionnel)"
    read -p "Avez-vous une clé API Resend ? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel env add RESEND_API_KEY production preview development
        vercel env add EMAIL_FROM production preview development
    fi

    # Site Config
    echo ""
    echo "6️⃣  Site Configuration"
    vercel env add NEXT_PUBLIC_SITE_URL production preview development
    echo "Alliance Shipping" | vercel env add NEXT_PUBLIC_SITE_NAME production preview development

    # Social Media
    echo ""
    echo "7️⃣  Réseaux Sociaux (optionnel)"
    read -p "Voulez-vous configurer les liens réseaux sociaux ? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel env add NEXT_PUBLIC_FACEBOOK_URL production preview development
        vercel env add NEXT_PUBLIC_INSTAGRAM_URL production preview development
        vercel env add NEXT_PUBLIC_TWITTER_URL production preview development
        vercel env add NEXT_PUBLIC_LINKEDIN_URL production preview development
    fi

    # Contact Info
    echo ""
    echo "8️⃣  Informations de Contact"
    vercel env add NEXT_PUBLIC_PHONE production preview development
    vercel env add NEXT_PUBLIC_EMAIL production preview development
    vercel env add NEXT_PUBLIC_WHATSAPP production preview development
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "🚀 Redéploiement de l'application..."
vercel --prod --force

echo ""
echo "✨ Terminé! Votre application devrait maintenant fonctionner sur Vercel."
echo ""
