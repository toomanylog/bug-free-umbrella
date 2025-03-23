import React from 'react';
import { Link } from 'react-router-dom';

const CGV = () => {
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
          <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Conditions Générales de Vente</h1>
          
          <div className="space-y-6 text-gray-200">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">1. Objet</h2>
              <p>
                Les présentes conditions générales de vente régissent les relations contractuelles entre le fournisseur de services et l'utilisateur de la plateforme. Tout achat effectué sur notre plateforme implique l'acceptation sans réserve de ces conditions générales de vente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">2. Services proposés</h2>
              <p>
                Notre plateforme propose les services suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Formations en ligne dans le domaine de la cybersécurité et de la protection contre les fraudes</li>
                <li>Outils spécialisés pour les campagnes emails et la sécurité des systèmes</li>
                <li>Ressources éducatives et informatives</li>
                <li>Jeux de casino virtuels à des fins de divertissement utilisant une monnaie virtuelle sans valeur réelle</li>
              </ul>
              <p className="mt-2">
                Tous nos services sont fournis exclusivement à des fins éducatives et informatives. Ils visent à améliorer les connaissances des utilisateurs en matière de sécurité informatique et à les aider à se protéger contre les tentatives de fraude.
              </p>
              <p className="mt-2">
                Les jeux de casino proposés sur notre plateforme sont uniquement destinés au divertissement et n'impliquent aucune mise d'argent réel. La monnaie virtuelle utilisée dans ces jeux n'a aucune valeur monétaire et ne peut être échangée contre de l'argent réel ou des biens.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">3. Prix et modalités de paiement</h2>
              <p>
                Les prix de nos services sont indiqués en euros sur notre plateforme. Nous nous réservons le droit de modifier nos prix à tout moment, mais les services seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
              </p>
              <p className="mt-2">
                Pour préserver l'anonymat de nos utilisateurs et éviter les complications liées aux moyens de paiement traditionnels, nous acceptons uniquement les modalités de paiement suivantes :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Paiements en crypto-monnaies (Bitcoin, Ethereum, etc.)</li>
                <li>Coupons PCS (validation manuelle nécessaire)</li>
                <li>Coupons PSF (validation manuelle nécessaire)</li>
              </ul>
              <p className="mt-2">
                Le paiement est exigible intégralement le jour de la commande. L'accès aux services sera activé après confirmation du paiement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">4. Validation de la commande</h2>
              <p>
                La validation de la commande par l'utilisateur vaut acceptation sans réserve des présentes conditions générales de vente. Les données enregistrées par notre plateforme constituent la preuve de l'ensemble des transactions passées.
              </p>
              <p className="mt-2">
                Une fois le paiement effectué et validé, un email de confirmation sera envoyé à l'adresse email fournie lors de l'inscription. Cet email contiendra les détails de la commande ainsi que les instructions pour accéder aux services achetés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">5. Accès aux services</h2>
              <p>
                Après validation du paiement, l'utilisateur obtient un accès aux services achetés pour la durée spécifiée lors de l'achat. Cet accès est personnel et non transférable.
              </p>
              <p className="mt-2">
                L'accès aux services s'effectue via l'espace personnel de l'utilisateur sur notre plateforme, accessible à l'aide de ses identifiants de connexion. L'utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités effectuées via son compte.
              </p>
              <p className="mt-2">
                L'accès aux jeux de casino virtuels peut être soumis à des restrictions d'âge. L'utilisateur déclare être âgé d'au moins 18 ans pour accéder à ces fonctionnalités, même si elles n'impliquent pas d'argent réel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">6. Droit de rétractation</h2>
              <p>
                Conformément à la législation en vigueur, pour les contenus numériques fournis sans support matériel et avec l'accord préalable de l'utilisateur, le droit de rétractation ne peut pas être exercé une fois que l'exécution du service a commencé.
              </p>
              <p className="mt-2">
                En validant sa commande, l'utilisateur reconnaît expressément renoncer à son droit de rétractation pour les contenus numériques téléchargés ou auxquels il a accès immédiatement après l'achat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">7. Propriété intellectuelle</h2>
              <p>
                Tous les contenus disponibles sur notre plateforme, notamment les formations, documentations, outils et ressources, sont protégés par les lois relatives à la propriété intellectuelle. L'achat d'un service donne droit à un accès personnel et non exclusif au contenu concerné.
              </p>
              <p className="mt-2">
                L'utilisateur s'engage à ne pas reproduire, copier, vendre, échanger, revendre ou exploiter à des fins commerciales tout ou partie des services et contenus de notre plateforme. Toute utilisation non autorisée constitue une violation de nos droits et peut entraîner des poursuites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">8. Responsabilité et garanties</h2>
              <p>
                Nos services sont fournis "tels quels" sans garantie d'aucune sorte. Nous nous efforçons de fournir des contenus de qualité, mais ne garantissons pas l'exactitude, l'exhaustivité ou l'utilité de ces contenus.
              </p>
              <p className="mt-2">
                L'utilisateur reconnaît utiliser les services et outils sous sa propre responsabilité. Nous ne serons en aucun cas responsables des dommages directs ou indirects résultant de l'utilisation de nos services, y compris la perte de données, la perte de profits ou toute autre perte financière.
              </p>
              <p className="mt-2">
                Les connaissances et outils fournis sont destinés uniquement à des fins éducatives et informatives. Ils ne doivent pas être utilisés à des fins illégales ou malveillantes. L'utilisateur est seul responsable de l'usage qu'il fait des informations et outils mis à sa disposition.
              </p>
              <p className="mt-2">
                En ce qui concerne les jeux de casino virtuels, nous ne garantissons pas leur disponibilité continue et nous nous réservons le droit de les modifier ou de les supprimer à tout moment. Les résultats des jeux sont déterminés par un générateur de nombres aléatoires et nous ne garantissons pas de gains. Nous ne sommes pas responsables de toute perte de monnaie virtuelle due à des problèmes techniques ou des erreurs. Nous déclinons également toute responsabilité concernant d'éventuels comportements addictifs liés à l'utilisation de ces jeux.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">9. Disponibilité des services</h2>
              <p>
                Nous nous efforçons d'assurer la disponibilité de nos services 24h/24 et 7j/7. Toutefois, nous ne pouvons garantir une disponibilité ininterrompue et nous nous réservons le droit d'interrompre temporairement l'accès à la plateforme pour des raisons de maintenance ou d'amélioration.
              </p>
              <p className="mt-2">
                En cas d'interruption prolongée, nous nous engageons à informer les utilisateurs dans la mesure du possible et à prolonger la durée d'accès aux services concernés en conséquence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">10. Résiliation</h2>
              <p>
                Nous nous réservons le droit de résilier l'accès d'un utilisateur à nos services en cas de violation des présentes conditions générales de vente, notamment en cas d'utilisation frauduleuse ou à des fins illégales des services proposés.
              </p>
              <p className="mt-2">
                En cas de résiliation pour faute de l'utilisateur, aucun remboursement ne sera effectué. L'utilisateur perdra immédiatement l'accès à tous les services achetés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">11. Modification des conditions</h2>
              <p>
                Nous nous réservons le droit de modifier à tout moment les présentes conditions générales de vente. Les modifications prendront effet dès leur publication sur notre plateforme.
              </p>
              <p className="mt-2">
                Pour les commandes en cours, les conditions applicables sont celles en vigueur au moment de la validation de la commande.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-blue-400">12. Droit applicable et juridiction compétente</h2>
              <p>
                Les présentes conditions générales de vente sont soumises au droit applicable. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux compétents seront seuls habilités à connaître du litige.
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

export default CGV; 