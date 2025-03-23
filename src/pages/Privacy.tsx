import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Politique de Confidentialité</h1>
          
          <div className="space-y-6 text-gray-200">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">1. Introduction</h2>
              <p>
                La protection de vos données personnelles et le respect de votre vie privée sont au cœur de nos préoccupations. Cette politique de confidentialité vise à vous informer sur la manière dont nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.
              </p>
              <p className="mt-2">
                En utilisant notre plateforme, vous acceptez les pratiques décrites dans la présente politique de confidentialité. Si vous n'êtes pas d'accord avec ces pratiques, nous vous invitons à ne pas utiliser nos services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">2. Engagement pour l'anonymat et la protection des données</h2>
              <p>
                Nous sommes fermement engagés à préserver l'anonymat de nos utilisateurs et à minimiser la collecte de données personnelles. Nous avons conçu notre plateforme selon les principes suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Collecte minimale de données : nous limitons la collecte d'informations au strict nécessaire pour fournir nos services</li>
                <li>Non-conservation des adresses IP : nous ne stockons pas les adresses IP des utilisateurs</li>
                <li>Absence de traceurs publicitaires : nous n'utilisons pas de cookies ou autres technologies similaires à des fins publicitaires</li>
                <li>Non-vérification des adresses email : nous ne vérifions pas la validité des adresses email fournies lors de l'inscription</li>
                <li>Acceptation de moyens de paiement préservant l'anonymat : nous acceptons uniquement les crypto-monnaies et coupons prépayés</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">3. Données collectées</h2>
              <p>
                Nous collectons uniquement les informations suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Données de compte</strong> : adresse email (non vérifiée), nom d'utilisateur, mot de passe crypté et identifiant Telegram (optionnel)
                </li>
                <li>
                  <strong>Données d'utilisation des services</strong> : informations sur les formations suivies, progression et résultats d'apprentissage
                </li>
                <li>
                  <strong>Données de transactions</strong> : historique des achats effectués sur la plateforme (sans informations bancaires)
                </li>
                <li>
                  <strong>Données de jeu</strong> : historique des parties jouées dans les jeux de casino, mises virtuelles, gains virtuels et performances
                </li>
              </ul>
              <p className="mt-2">
                Nous ne collectons pas :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Adresses IP</li>
                <li>Données de géolocalisation</li>
                <li>Informations d'identification réelle (nom, adresse, etc.)</li>
                <li>Données de navigation (cookies de traçage, empreinte digitale, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">4. Utilisation des données</h2>
              <p>
                Les données que nous collectons sont utilisées uniquement aux fins suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et vous permettre d'accéder aux services achetés</li>
                <li>Suivre votre progression dans les formations</li>
                <li>Communiquer avec vous concernant votre compte ou vos achats</li>
                <li>Assurer la sécurité de notre plateforme</li>
                <li>Gérer les jeux de casino virtuels et suivre les statistiques de jeu</li>
                <li>Prévenir la fraude et les abus dans l'utilisation des jeux</li>
              </ul>
              <p className="mt-2">
                Nous n'utilisons pas vos données à des fins de marketing, de profilage ou de publicité ciblée. Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">5. Conservation des données</h2>
              <p>
                Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services ou tant que votre compte est actif. Si vous supprimez votre compte, toutes vos données personnelles seront supprimées de nos systèmes, à l'exception des informations que nous sommes légalement tenus de conserver.
              </p>
              <p className="mt-2">
                Vos données de progression dans les formations et votre historique d'achats sont conservés tant que votre compte est actif, pour vous permettre d'accéder aux services que vous avez achetés.
              </p>
              <p className="mt-2">
                Les données relatives aux jeux de casino virtuels (historique des parties, statistiques) sont également conservées tant que votre compte est actif. Ces données nous permettent de surveiller l'utilisation des jeux, de prévenir les abus et d'améliorer l'expérience utilisateur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">6. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction. Ces mesures comprennent notamment :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Chiffrement des mots de passe</li>
                <li>Connexions sécurisées (HTTPS)</li>
                <li>Accès restreint aux données par notre personnel</li>
                <li>Surveillance continue de notre infrastructure contre les attaques</li>
              </ul>
              <p className="mt-2">
                Malgré ces précautions, aucune méthode de transmission ou de stockage électronique n'est totalement sécurisée. Nous ne pouvons donc pas garantir une sécurité absolue de vos données.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">7. Vos droits</h2>
              <p>
                Vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Droit d'accès : vous pouvez accéder à vos données personnelles via votre espace personnel</li>
                <li>Droit de rectification : vous pouvez modifier vos informations de profil à tout moment</li>
                <li>Droit à l'effacement : vous pouvez supprimer votre compte et toutes les données associées</li>
                <li>Droit à la limitation du traitement : vous pouvez nous demander de limiter le traitement de vos données</li>
                <li>Droit d'opposition : vous pouvez vous opposer au traitement de vos données dans certaines circonstances</li>
                <li>Droit à la portabilité : vous pouvez nous demander de vous fournir vos données dans un format structuré</li>
              </ul>
              <p className="mt-2">
                Pour exercer ces droits, vous pouvez utiliser les options disponibles dans votre espace personnel ou nous contacter via le formulaire de contact de la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">8. Cookies et technologies similaires</h2>
              <p>
                Notre plateforme utilise uniquement des cookies essentiels au fonctionnement du site, notamment pour maintenir votre session de connexion. Nous n'utilisons pas de cookies à des fins de traçage, de publicité ou d'analyse comportementale.
              </p>
              <p className="mt-2">
                Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour être averti lorsqu'un cookie est envoyé. Toutefois, certaines fonctionnalités de notre plateforme peuvent ne pas fonctionner correctement si vous désactivez les cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">9. Services tiers</h2>
              <p>
                Notre plateforme peut contenir des liens vers des sites web tiers. Cette politique de confidentialité ne s'applique qu'à notre plateforme. Nous vous encourageons à lire les politiques de confidentialité de tout site tiers que vous visitez.
              </p>
              <p className="mt-2">
                Nous pouvons utiliser des services tiers pour certaines fonctionnalités de notre plateforme, notamment pour le traitement des paiements en crypto-monnaies. Ces services tiers ont leur propre politique de confidentialité et nous n'assumons aucune responsabilité quant à leurs pratiques.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">10. Modification de la politique de confidentialité</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour.
              </p>
              <p className="mt-2">
                Nous vous encourageons à consulter régulièrement cette page pour rester informé des changements. En continuant à utiliser notre plateforme après la publication des modifications, vous acceptez la politique de confidentialité mise à jour.
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

export default Privacy; 