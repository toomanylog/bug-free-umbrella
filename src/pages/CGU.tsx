import React from 'react';
import { Link } from 'react-router-dom';

const CGU = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="ml-2">Retour à l'accueil</span>
          </Link>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Conditions Générales d'Utilisation</h1>
          
          <div className="space-y-6 text-gray-200">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant ce site web, vous acceptez de vous conformer et d'être lié par les présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">2. Description du service</h2>
              <p>
                Notre plateforme propose des services de formation à but éducatif et informatif dans le domaine de la cybersécurité et de la protection contre les fraudes. Nous mettons également à disposition des outils légaux destinés aux campagnes emails et à la sécurité des systèmes de nos utilisateurs.
              </p>
              <p className="mt-2">
                Tous nos contenus et services sont fournis à des fins strictement éducatives et informatives. L'objectif est de permettre aux utilisateurs de mieux comprendre et se protéger contre les tentatives de fraude et les menaces de sécurité.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">3. Compte utilisateur</h2>
              <p>
                Pour accéder à certaines fonctionnalités de notre plateforme, vous devrez créer un compte utilisateur. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.
              </p>
              <p className="mt-2">
                Nous ne vérifions pas l'exactitude des adresses email fournies lors de l'inscription. Toutefois, vous vous engagez à fournir des informations exactes, complètes et à jour lors de la création de votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">4. Utilisation autorisée</h2>
              <p>
                En utilisant notre plateforme, vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Ne pas utiliser nos services à des fins illégales ou non autorisées</li>
                <li>Ne pas tenter d'accéder sans autorisation à des parties restreintes de la plateforme</li>
                <li>Ne pas copier, modifier, distribuer, vendre ou louer une partie de nos services sans autorisation explicite</li>
                <li>Ne pas utiliser les connaissances et outils fournis à des fins malveillantes ou préjudiciables</li>
                <li>Ne pas utiliser nos services d'une manière qui pourrait endommager, désactiver, surcharger ou altérer notre plateforme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">5. Propriété intellectuelle</h2>
              <p>
                Tout le contenu disponible sur notre plateforme, y compris mais sans s'y limiter, les textes, graphiques, logos, icônes, images, clips audio, téléchargements numériques et compilations de données, est notre propriété exclusive et est protégé par les lois relatives à la propriété intellectuelle.
              </p>
              <p className="mt-2">
                Le contenu de nos formations est strictement protégé et ne doit pas être partagé, redistribué, revendu ou mis à disposition d'autres personnes sans notre autorisation explicite. Toute utilisation non autorisée du contenu constitue une violation de nos droits et peut donner lieu à des poursuites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">6. Limitation de responsabilité</h2>
              <p>
                Nos services sont fournis "tels quels" sans garantie d'aucune sorte, expresse ou implicite. Nous ne garantissons pas que nos services seront ininterrompus, opportuns, sûrs ou exempts d'erreurs.
              </p>
              <p className="mt-2">
                Nous ne pourrons en aucun cas être tenus responsables de tout dommage direct, indirect, accessoire, spécial ou consécutif résultant de l'utilisation ou de l'incapacité d'utiliser nos services.
              </p>
              <p className="mt-2">
                Les connaissances et outils fournis sont destinés à des fins éducatives et informatives uniquement. L'utilisateur assume l'entière responsabilité de l'utilisation qu'il fait de ces informations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">7. Liens vers des sites tiers</h2>
              <p>
                Notre plateforme peut contenir des liens vers des sites web tiers. Ces liens sont fournis uniquement pour votre commodité. Nous n'avons aucun contrôle sur le contenu de ces sites et n'assumons aucune responsabilité pour leur contenu, leurs pratiques de confidentialité ou leur fonctionnement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">8. Modification des conditions</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions générales d'utilisation à tout moment. Les modifications entreront en vigueur dès leur publication sur la plateforme. Il est de votre responsabilité de consulter régulièrement ces conditions.
              </p>
              <p className="mt-2">
                En continuant à utiliser notre plateforme après la publication des modifications, vous acceptez d'être lié par les conditions mises à jour.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">9. Résiliation</h2>
              <p>
                Nous nous réservons le droit, à notre seule discrétion, de suspendre ou de résilier votre accès à tout ou partie de notre plateforme, à tout moment et pour quelque raison que ce soit, y compris, sans limitation, la violation des présentes conditions générales d'utilisation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">10. Droit applicable</h2>
              <p>
                Les présentes conditions générales d'utilisation sont régies et interprétées conformément aux lois en vigueur. Tout litige relatif à l'utilisation de notre plateforme sera soumis à la compétence exclusive des tribunaux compétents.
              </p>
            </section>

            <p className="mt-8 text-sm text-gray-400">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGU; 