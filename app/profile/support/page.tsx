'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function SupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'Comment suivre mon colis ?',
      answer: 'Vous pouvez suivre votre colis en temps réel depuis la page "Mes Colis". Chaque colis possède un numéro de suivi unique commençant par "AS-" que vous pouvez utiliser pour voir l\'état actuel et l\'historique de livraison.',
    },
    {
      id: '2',
      question: 'Quels sont les délais de livraison ?',
      answer: 'Les délais de livraison varient selon la destination en Haïti : Port-au-Prince (3-5 jours), Cap-Haïtien (4-6 jours), Port-de-Paix (5-7 jours). Ces délais sont estimés à partir de la réception du colis à notre entrepôt de Miami.',
    },
    {
      id: '3',
      question: 'Comment calculer les frais d\'expédition ?',
      answer: 'Les frais sont calculés selon le poids de votre colis : $4 par livre + $5 de frais de service. Vous pouvez utiliser notre calculateur pour obtenir une estimation avant d\'envoyer votre colis.',
    },
    {
      id: '4',
      question: 'Quelles méthodes de paiement acceptez-vous ?',
      answer: 'Nous acceptons Moncash, Natcash et les cartes bancaires (Visa, Mastercard). Vous pouvez gérer vos méthodes de paiement depuis votre profil.',
    },
    {
      id: '5',
      question: 'Que faire si mon colis est endommagé ?',
      answer: 'Si votre colis arrive endommagé, contactez-nous immédiatement avec des photos. Nous examinerons votre cas et vous proposerons une solution adaptée (remboursement, remplacement, etc.).',
    },
    {
      id: '6',
      question: 'Puis-je modifier l\'adresse de livraison ?',
      answer: 'Oui, vous pouvez modifier l\'adresse de livraison tant que le colis n\'a pas encore été expédié vers Haïti. Contactez-nous dès que possible si vous devez changer l\'adresse.',
    },
  ];

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending message
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageSubject('');
      setMessageContent('');
    }, 3000);
  };

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au profil
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">Support & Aide</h1>
            <p className="text-gray-600 mt-2">
              Nous sommes là pour vous aider
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.a
              href="tel:+15555551234"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Téléphone</h3>
              <p className="text-sm text-gray-600">+1 (555) 555-1234</p>
              <p className="text-xs text-gray-500 mt-2">Lun-Ven: 9h-18h</p>
            </motion.a>

            <motion.a
              href="mailto:support@allianceshipping.com"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Email</h3>
              <p className="text-sm text-gray-600 break-all">support@allianceshipping.com</p>
              <p className="text-xs text-gray-500 mt-2">Réponse sous 24h</p>
            </motion.a>

            <motion.a
              href="https://wa.me/15555551234"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
              <p className="text-sm text-gray-600">+1 (555) 555-1234</p>
              <p className="text-xs text-gray-500 mt-2">Chat en direct</p>
            </motion.a>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary-600" />
              Questions Fréquentes
            </h2>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    )}
                  </button>

                  {expandedFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-gray-600"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary-600" />
              Envoyer un message
            </h2>

            {messageSent ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  Message envoyé !
                </h3>
                <p className="text-green-700">
                  Nous vous répondrons dans les 24 heures
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    required
                    placeholder="De quoi s'agit-il ?"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    required
                    rows={5}
                    placeholder="Décrivez votre problème ou votre question..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                  Envoyer le message
                </button>
              </form>
            )}
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
