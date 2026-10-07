import type { TranslationMap } from './schema';

/**
 * French translations.
 * Structure mirrors en.ts — see that file for key documentation.
 */
export const translations: TranslationMap = {

  // ═══════════════════════════════════════════════════════════════════════════
  // LABELS — Field names, buttons, navigation, column headers, short UI text
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Common UI ──
  'common.save': 'Enregistrer les modifications',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.view': 'Voir',
  'common.create': 'Cr\u00e9er',
  'common.search': 'Rechercher',
  'common.back': 'Retour',
  'common.loading': 'Chargement\u2026',
  'common.error': 'Erreur',
  'common.success': 'Succ\u00e8s',
  'common.confirm': 'Confirmer',
  'common.yes': 'Oui',
  'common.no': 'Non',
  'common.upload': 'T\u00e9l\u00e9verser',
  'common.download': 'T\u00e9l\u00e9charger',
  'common.preview': 'Aper\u00e7u',
  'common.publish': 'Publier',
  'common.unpublish': 'D\u00e9publier',
  'common.published': 'Public',
  'common.unpublished': 'Priv\u00e9',
  'common.required': 'Obligatoire',
  'common.optional': 'Facultatif',
  'common.actions': 'Actions',
  'common.language': 'Langue',
  'common.all': 'Tous',
  'common.filter': 'Filtrer',
  'common.sortBy': 'Trier par',
  'common.notAvailable': 'N/D',
  'common.select': 'S\u00e9lectionner\u2026',
  'common.clickOrDragToUpload': 'Cliquez ou faites glisser le fichier pour le t\u00e9l\u00e9verser',
  'common.remove': 'Retirer',
  'common.viewDocument': 'Voir le document',
  'common.retry': 'Réessayer',
  'common.tryAgain': 'Une erreur est survenue lors du chargement de cette page. Veuillez réessayer plus tard.',
  'common.version': 'v1.0',

  // ── Navigation ──
  'nav.home': 'Accueil',
  'nav.dashboard': 'Tableau de bord',
  'nav.login': 'Connexion',
  'nav.logout': 'D\u00e9connexion',
  'nav.newProfile': 'Nouveau profil',
  'nav.adminBadge': 'ADMIN',
  'nav.shop': 'Boutique',
  'nav.account': 'Mon compte',
  'nav.signup': 'S\u2019inscrire',
  'nav.inboxBell': 'Signalements',
  'nav.inboxBell.unread': 'Signalements : {count} non lu(s)',
  'nav.inboxBell.admin': 'Drones et signalements',

  // ── Consumer auth ──
  'auth.consumerEyebrow': 'IDENTIT\u00c9 NUM\u00c9RIQUE POUR OP\u00c9RATEURS UAS',
  'auth.google': 'Continuer avec Google',
  'auth.or': 'ou',
  'auth.googleError': 'Connexion Google \u00e9chou\u00e9e. Veuillez r\u00e9essayer.',

  // ── Login form ──
  'login.email': 'Adresse e-mail',
  'login.password': 'Mot de passe',
  'login.submit': 'Se connecter',
  'login.noAccount': 'Pas encore de compte ?',
  'login.signupCta': 'S\u2019inscrire',
  'login.adminProvisioned': 'Les comptes sont créés par un administrateur. Contactez-nous si vous avez besoin d’identifiants.',

  // ── Sign-up form ──
  'signup.title': 'Inscrivez-vous sur DroneTag',
  'signup.subtitle': 'Cr\u00e9ez votre identit\u00e9 num\u00e9rique d\u2019op\u00e9rateur : profil, certificats, assurances et drones au m\u00eame endroit.',
  'signup.submit': 'S\u2019inscrire',
  'signup.passwordConfirm': 'Confirmer le mot de passe',
  'signup.haveAccount': 'Vous avez déjà un compte ?',
  'signup.errorPasswordShort': 'Le mot de passe doit contenir au moins 6 caractères.',
  'signup.errorPasswordMismatch': 'Les mots de passe ne correspondent pas.',
  'signup.errorEmailInUse': 'Un compte existe déjà avec cet e-mail.',
  'signup.errorGeneric': 'Impossible de créer le compte. Veuillez réessayer.',

  'signup.otp.title': 'Vérifiez votre contact',
  'signup.otp.subtitle': 'Nous vous avons envoyé un code de confirmation. Vous pouvez vérifier maintenant ou plus tard.',
  'signup.otp.gateSubtitle': 'Vous devez vérifier au moins votre e-mail ou votre téléphone avant d’accéder à votre compte.',
  'signup.otp.chooseChannels': 'Comment souhaitez-vous vous vérifier ?',
  'signup.otp.verifyPhoneOption': 'Vérifier le téléphone (SMS OTP)',
  'signup.otp.verifyEmailOption': 'Vérifier l’e-mail (code OTP)',
  'signup.otp.channelHint': 'Choisissez au moins une méthode. Vous pouvez sélectionner les deux.',
  'signup.otp.channelRequired': 'Sélectionnez au moins l’e-mail ou le téléphone à vérifier.',
  'signup.otp.phoneRequired': 'Saisissez votre numéro de téléphone pour la vérification SMS.',
  'signup.otp.emailSection': 'Vérification e-mail',
  'signup.otp.phoneSection': 'Vérification téléphone',
  'signup.otp.sendEmail': 'Envoyer le code par e-mail',
  'signup.otp.sendPhone': 'Envoyer le code par SMS',
  'signup.otp.resend': 'Renvoyer le code',
  'signup.otp.codeLabel': 'Code à 6 chiffres',
  'signup.otp.verify': 'Vérifier',
  'signup.otp.verified': 'Vérifié',
  'signup.otp.continue': 'Continuer',
  'signup.otp.errorSend': 'Impossible d’envoyer le code. Veuillez réessayer.',
  'signup.otp.errorCode': 'Code invalide ou expiré.',
  'signup.otp.errorPhone': 'Numéro de téléphone invalide.',
  'signup.otp.errorIncomplete': 'Terminez la vérification pour tous les canaux sélectionnés.',
  'signup.otp.devCode': 'Dev : code e-mail {code}',

  // ── Account area ──
  'account.eyebrow': 'Compte',
  'account.title': 'Bienvenue, {name}',
  'account.subtitle': 'Consultez votre profil et suivez vos commandes.',
  'account.nav.home': 'Accueil',
  'account.nav.more': 'Plus',
  'account.nav.mobile': 'Navigation du compte',
  'account.nav.sidebar': 'Menu du compte',
  'account.nav.section.workspace': 'Espace de travail',
  'account.nav.section.library': 'Bibliothèque',
  'account.nav.section.account': 'Compte',
  'account.tab.settings': 'Paramètres',
  'settings.title': 'Paramètres',
  'settings.subtitle': 'Gérez l’apparence, la langue et les préférences du compte.',
  'settings.appearance': 'Apparence',
  'settings.theme': 'Thème',
  'settings.theme.hint': 'Choisissez clair, sombre ou le réglage de votre appareil.',
  'settings.theme.light': 'Clair',
  'settings.theme.dark': 'Sombre',
  'settings.theme.system': 'Système',
  'settings.language': 'Langue',
  'settings.language.hint': 'La langue de l’interface est enregistrée sur cet appareil.',
  'settings.account': 'Compte',
  'settings.profile': 'Profil et identité visuelle',
  'settings.profile.hint': 'Photo, logo et bannière publics',
  'settings.billing': 'Facturation',
  'settings.billing.hint': 'Offre et informations de paiement',
  'settings.demo.persona': 'Personas de démo',
  'settings.demo.persona.hint': 'Changez d’identité pour explorer les scénarios admin et utilisateur.',
  'demo.banner': 'Mode démo — données d’exemple, Firebase non connecté',
  'demo.resetData': 'Réinitialiser les données de démo',
  'demo.scenarios.title': 'Scénarios de démo client',
  'demo.scenarios.subtitle': 'Ouvrez la page QR publique, puis modifiez les données en tant qu’admin — actualisez l’onglet public pour voir les badges se mettre à jour.',
  'demo.scenarios.openPublic': 'Ouvrir le profil public',
  'demo.scenarios.verifyPath': 'Approuver ici :',
  'demo.scenario.green.title': 'Tout au vert — Michele',
  'demo.scenario.green.badges': 'Utilisateur vérifié · Certificats OK · Assurance active',
  'demo.scenario.green.steps': 'Persona « OK · Michele ». Montrez /u/sj58afq8 comme vraie fiche publique (photo, logo, bannière).',
  'demo.scenario.review.title': 'En cours de vérification — Anna (SkyMap)',
  'demo.scenario.review.badges': 'Certificats en attente · Assurance expirant bientôt',
  'demo.scenario.review.steps': 'Ouvrez /u/citymapper-anna (utilisateur + certificats en orange ; assurance expirant bientôt). Admin → Vérification → File d’attente : Certificats + Assurances (ouvrez le PDF de démo) → marquez comme vérifié (la démo renouvelle l’assurance de +1 an). Documents et Drones peuvent rester en file d’attente si vous voulez aussi montrer ces onglets. Rechargez /u/citymapper-anna → utilisateur/certificats en vert + police active.',
  'demo.scenario.critical.title': 'Critique — Carlos',
  'demo.scenario.critical.badges': 'Certificats OK · Assurance expirée',
  'demo.scenario.critical.steps': 'Montrez /u/vistaone-carlos (assurance en rouge). La boîte Signalements contient des messages non lus.',
  'demo.scenario.fleet.title': 'Flotte / remplacement — Alpine',
  'demo.scenario.fleet.badges': 'Opérateur entreprise · police multi-drones',
  'demo.scenario.fleet.steps': 'Persona Alpine. Page publique /u/alpine-mavic. Admin → Drones affiche les remplacements temporaires d’opérateur.',
  'admin.verify.demoHint':
    'Certificates badge on the public page = certificate verification here. Insurance colour = expiry date (marking verified in demo also renews the policy +1 year so the badge goes green). Demo changes are saved in the browser — refresh the public page after verifying.',

  'account.dashboard.greeting': 'Bonjour, {name}',
  'account.dashboard.subtitle': 'Vos justificatifs UAS en un coup d’œil.',
  'account.dashboard.credentialsStatus': 'Statut des justificatifs',
  'account.dashboard.completeness': 'Profil complet à {pct} %',
  'account.dashboard.quickActions': 'Actions rapides',
  'account.dashboard.actionPublic': 'Profil public',
  'account.dashboard.actionPublicDesc': 'Consultez ou partagez votre page QR',
  'account.dashboard.actionDocument': 'Ajouter un document',
  'account.dashboard.actionDocumentDesc': 'Téléversez un PDF ou un fichier',
  'account.dashboard.actionBadge': 'Commander un badge',
  'account.dashboard.actionBadgeDesc': 'Badge NFC ou kit physique',
  'account.dashboard.actionDrone': 'Enregistrer un drone',
  'account.dashboard.actionDroneDesc': 'Ajoutez un nouvel aéronef',
  'account.dashboard.seeAll': 'Tout voir',
  'account.dashboard.expiryAlerts': 'Expiration dans les 30 jours',
  'account.dashboard.expiryInDays': 'Expire dans {days} j',
  'account.dashboard.expiryExpired': 'Expiré',
  'account.dashboard.verifyAlerts': 'En attente de vérification admin',
  'account.dashboard.verifyWaiting': 'En cours de vérification',
  'account.dashboard.verifyRejected': 'Refusé — contactez le support',
  'account.dashboard.verifyHint': 'Ces éléments attendent la vérification d’un administrateur. Nous vous prévenons dans Support dès que leur statut change.',
  'account.verification.uploadHint': 'Si vous confirmez les informations lues dans le document sans les modifier, la vérification est immédiate. Si vous les corrigez, un administrateur les compare au document et vous informe du résultat.',
  'account.verification.documentUploadHint': 'Après le téléversement, un administrateur vérifie le document et vous informe du résultat.',
  'account.verification.notifyVerified': 'Nous avons vérifié {kind} : {label}. Votre profil public est à jour.',
  'account.verification.notifyRejected': 'Nous n’avons pas pu vérifier {kind} : {label}. Ouvrez Support ou téléversez un document corrigé.',
  'account.verification.kind.certificate': 'le certificat',
  'account.verification.kind.insurance': 'l’assurance',
  'account.verification.kind.document': 'le document',
  'account.verification.kind.drone': 'le drone',
  'account.verification.kind.authorization': 'l’autorisation',
  'account.verification.threadSubject': 'Mises à jour de la vérification des documents',
  'nav.menuOpen': 'Ouvrir le menu',
  'nav.menuClose': 'Fermer le menu',
  'account.tabProfile': 'Profil',
  'account.tabOrders': 'Commandes',
  'account.personalInfo': 'Informations personnelles',
  'account.shippingAddress': 'Adresse de livraison',
  'account.readOnly': 'Lecture seule',
  'account.noAddress': 'Aucune adresse enregistrée.',
  'account.editNotice': 'La modification du profil sera bientôt disponible. Pour toute modification, contactez notre support.',
  'account.memberSince': 'Membre depuis le {date}',
  'account.notProvisioned.title': 'Impossible de préparer votre compte',
  'account.notProvisioned.body': 'Un problème est survenu lors de l’activation de votre profil. Vérifiez votre connexion et réessayez ; si le problème persiste, contactez le support DroneTag.',

  // ── Orders ──
  'orders.emptyTitle': 'Aucune commande',
  'orders.emptyDesc': 'Dès votre première commande, vous la trouverez ici avec son suivi et sa traçabilité complète.',
  'orders.emptyCta': 'Aller à la boutique',
  'orders.orderNumber': 'Commande n°',
  'orders.placedOn': 'Passée le {date}',
  'orders.viewDetails': 'Voir le détail',
  'orders.backToOrders': 'Retour aux commandes',
  'orders.progress': 'Avancement',
  'orders.shippingTitle': 'Expédition',
  'orders.carrier': 'Transporteur',
  'orders.openTracking': 'Ouvrir le suivi',
  'orders.shipTo': 'Livré à',
  'orders.eta': 'Livraison estimée · {date}',
  'orders.deliveredOn': 'Livré le {date}',
  'orders.items': 'Articles de la commande',
  'orders.professionalTrace': 'Traçabilité professionnelle',
  'orders.showTrace': 'Afficher la traçabilité',
  'orders.hideTrace': 'Masquer la traçabilité',
  'orders.subtotal': 'Sous-total',
  'orders.shippingFee': 'Livraison',
  'orders.total': 'Total',
  'orders.timeline': 'Chronologie complète',
  'orders.notFound': 'Commande introuvable ou inaccessible.',

  // ── Order status labels ──
  'orderStatus.pending': 'En attente',
  'orderStatus.paid': 'Payée',
  'orderStatus.in_production': 'En production',
  'orderStatus.assembled': 'Assemblée',
  'orderStatus.quality_check': 'Contrôle qualité',
  'orderStatus.packed': 'Emballée',
  'orderStatus.shipped': 'Expédiée',
  'orderStatus.in_transit': 'En transit',
  'orderStatus.delivered': 'Livrée',
  'orderStatus.cancelled': 'Annulée',

  // ── Traceability detail fields ──
  'trace.batch': 'Lot',
  'trace.material': 'Matériau / filament',
  'trace.printedAt': 'Imprimé le',
  'trace.printer': 'Imprimante',
  'trace.assembledAt': 'Assemblé le',
  'trace.assembledBy': 'Assemblé par',
  'trace.qcAt': 'CQ validé le',
  'trace.qcBy': 'Inspecteur CQ',
  'trace.notes': 'Notes',

  // ── Field labels ──
  'field.language': 'Langue pr\u00e9f\u00e9r\u00e9e',
  'field.firstName': 'Pr\u00e9nom',
  'field.lastName': 'Nom',
  'field.operatorCode': 'Numéro d’enregistrement d’opérateur UAS',
  'field.email': 'E-mail',
  'field.phone': 'T\u00e9l\u00e9phone',
  'field.emergencyContact': 'Contact d\u2019urgence',
  'field.photo': 'Photo de profil',
  'field.visibility': 'Visibilit\u00e9',
  'field.birthDate': 'Date de naissance',
  'field.nationality': 'Nationalit\u00e9',
  'field.operatorLicense': 'Licence d’opérateur UAS',
  'field.companyName': 'Raison sociale',
  'field.companyDetails': 'Coordonn\u00e9es de l\u2019entreprise',
  'field.companyAddress': 'Adresse de l\u2019entreprise',
  'field.companyVatOrRegistration': 'TVA / Num\u00e9ro d\u2019enregistrement',
  'field.droneName': 'Nom du drone',
  'field.droneModel': 'Mod\u00e8le',
  'field.serialNumber': 'N\u00ba de s\u00e9rie',
  'field.droneRegNumber': 'Immatriculation',
  'field.logo': 'Logo',
  'field.banner': 'Image de banni\u00e8re',
  'field.insuranceProvider': 'Assureur',
  'field.policyNumber': 'Num\u00e9ro de police',
  'field.holderName': 'Assur\u00e9',
  'field.issuedAt': 'Date d\u2019\u00e9mission',
  'field.expiresAt': 'Date d\u2019expiration',
  'field.policyPdf': 'Document de police (PDF)',
  'field.insuranceNotes': 'Notes sur la police',
  'field.qrImage': 'Image du code QR',
  'field.slug': 'Slug d\u2019URL publique',
  'field.lastEditedBy': 'Derni\u00e8re modification par',
  'field.publishedAt': 'Publi\u00e9 le',
  'field.lastVerifiedAt': 'Derni\u00e8re v\u00e9rification le',
  'field.adminNotes': 'Notes internes administrateur',

  // ── Dashboard table columns ──
  'dashboard.organization': 'Organisation',
  'dashboard.operatorCode': 'Code op\u00e9rateur',
  'dashboard.verification': 'V\u00e9rification',
  'dashboard.insuranceStatus': 'Assurance',
  'dashboard.expiryDate': 'Date d\u2019expiration',
  'dashboard.updatedAt': 'Mis \u00e0 jour',
  'dashboard.completeness': 'Compl\u00e9tude',
  'dashboard.policyExpiry': 'Expiration de la police',
  'dashboard.draft': 'Brouillon',
  'dashboard.status': 'Statut',
  'dashboard.incomplete': 'Incomplet',

  // ── Dashboard filters ──
  'dashboard.filterByStatus': 'Filtrer par statut',
  'dashboard.filterByPolicy': 'Filtrer par police',
  'dashboard.filterByVerification': 'V\u00e9rification',
  'dashboard.filterByVisibility': 'Visibilit\u00e9',
  'dashboard.sortName': 'Nom',
  'dashboard.sortExpiry': 'Expiration de la police',
  'dashboard.sortPriority': 'Urgence documentaire',
  'dashboard.sortUpdated': 'Derni\u00e8re mise \u00e0 jour',

  // ── Document type labels ──
  'docType.insurancePolicy': 'Police d\u2019assurance',
  'docType.operatorLicense': 'Licence d\u2019op\u00e9rateur',
  'docType.droneRegistration': 'Immatriculation du drone',
  'docType.trainingCertificate': 'Certificat de formation',
  'docType.other': 'Autre document',

  // ── Public page data labels ──
  'profile.operatorId': 'ID op\u00e9rateur',
  'profile.registrationCode': 'Enregistrement',
  'profile.provider': 'Assureur',
  'profile.policyNumber': 'N\u00ba de police',
  'profile.coverage': 'Couverture',
  'profile.validFrom': 'Valide du',
  'profile.validUntil': 'Valide jusqu\u2019au',
  'profile.notes': 'Notes',
  'profile.viewPolicy': 'Voir le document de police original',
  'profile.downloadPolicy': 'T\u00e9l\u00e9charger le document de police',
  'profile.droneId': 'ID drone',
  'profile.droneModel': 'Mod\u00e8le',
  'profile.serialNumber': 'N\u00ba de s\u00e9rie',
  'profile.droneRegNumber': 'Immatriculation',
  'profile.category': 'Cat\u00e9gorie',
  'profile.contact': 'Contact',
  'profile.emergencyContact': 'Urgence',
  'profile.documents': 'Documents',
  'profile.verifiedOn': 'V\u00e9rifi\u00e9 le',
  'profile.lastUpdated': 'Derni\u00e8re mise \u00e0 jour',

  // ── Toggle / action labels ──
  'toggle.makePublic': 'Publier',
  'toggle.makePrivate': 'D\u00e9publier',
  'form.generateSlug': 'G\u00e9n\u00e9rer l\u2019URL',
  'form.publicUrlPreview': 'URL publique\u00a0:',
  'form.profileId': 'ID du profil\u00a0:',

  // ── Verification links labels ──
  'field.nfcReference': 'R\u00e9f\u00e9rence tag NFC',
  'field.publicUrl': 'URL de la page publique',
  'links.copyUrl': 'Copier',
  'links.copied': 'Copi\u00e9',
  'links.nfcNotAssigned': 'Non attribu\u00e9',

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — State indicators, badges, computed statuses
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Profile lifecycle ──
  'status.active': 'Actif',
  'status.draft': 'Brouillon',
  'status.archived': 'Archiv\u00e9',
  'status.suspended': 'Suspendu',

  // ── Visibility ──
  'visibility.private': 'Priv\u00e9',
  'visibility.public': 'Public',

  // ── Verification ──
  'verification.unverified': 'Non v\u00e9rifi\u00e9',
  'verification.pending': 'En attente de validation',
  'verification.verified': 'V\u00e9rifi\u00e9',
  'verification.rejected': 'Refus\u00e9',
  'verification.status': 'Statut de v\u00e9rification',
  'verification.lastVerified': 'Derni\u00e8re v\u00e9rification',
  'verification.verifiedBy': 'V\u00e9rifi\u00e9 par',
  'verification.notes': 'Notes de v\u00e9rification',

  // ── Insurance policy ──
  'policy.valid': 'Valide',
  'policy.expiring': 'Expire bient\u00f4t',
  'policy.expired': 'Expir\u00e9e',
  'policy.missing': 'Manquante',
  'policy.status': 'Statut de la police',

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGES — Errors, alerts, hints, descriptions, dynamic text
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Login & auth ──
  'login.error': '\u00c9chec de l\u2019authentification. V\u00e9rifiez vos identifiants.',
  'login.restrictedNotice': 'R\u00e9serv\u00e9 aux administrateurs autoris\u00e9s.',

  // ── Form validation & feedback ──
  'form.validation.required': 'Ce champ est obligatoire',
  'form.validation.slugRequired': 'Un slug d\u2019URL publique est requis avant la publication.',
  'form.validation.slugFormat': 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets',
  'form.saving': 'Enregistrement\u2026',
  'form.saved': 'Toutes les modifications ont \u00e9t\u00e9 enregistr\u00e9es avec succ\u00e8s.',
  'form.submitError': '\u00c9chec de l\u2019enregistrement. V\u00e9rifiez votre connexion.',

  // ── Form hints ──
  'form.photoHint': 'Image carr\u00e9e recommand\u00e9e, minimum 200\u00d7200 px.',
  'form.pdfHint': 'T\u00e9l\u00e9versez le PDF original de la police d\u2019assurance.',
  'form.qrHint': 'T\u00e9l\u00e9versez ou g\u00e9n\u00e9rez le code QR pour ce profil.',

  // ── Dashboard alerts ──
  'dashboard.alerts': 'Alertes op\u00e9rationnelles',
  'dashboard.alertNoPdf': '{count} profil(s) sans PDF de police',
  'dashboard.alertExpiring': '{count} police(s) expire(nt) dans les 30 jours',
  'dashboard.alertCompleteNotPublished': '{count} profil(s) complet(s) non encore publi\u00e9(s)',
  'dashboard.alertPublishedNotVerified': '{count} profil(s) publi\u00e9(s) non v\u00e9rifi\u00e9(s)',
  'dashboard.noAlerts': 'Aucune alerte op\u00e9rationnelle. Tout est en ordre.',

  // ── Dashboard messages ──
  'dashboard.confirmDelete': 'Ce profil op\u00e9rateur sera supprim\u00e9 de fa\u00e7on d\u00e9finitive et irr\u00e9versible. Les titres associ\u00e9s et les liens de v\u00e9rification seront perdus. Souhaitez-vous continuer\u00a0?',
  'dashboard.deleteModalNote': 'Les liens publics QR et NFC cesseront imm\u00e9diatement d\u2019\u00eatre valides et les donn\u00e9es ne seront plus accessibles aux tiers. Cette action est irr\u00e9versible.',
  'dashboard.adjustFilters': 'Ajustez la recherche ou les filtres pour afficher les profils pertinents ou affiner la liste des r\u00e9sultats.',
  'dashboard.searchPlaceholder': 'Nom, entreprise ou code op\u00e9rateur\u2026',
  'common.noResults': 'Aucun profil correspondant',
  'common.filtersActive': '{count} filtre(s) actif(s)',
  'common.clearFilters': 'Effacer tous les filtres',
  'common.noDocument': 'Aucun document t\u00e9l\u00e9vers\u00e9',
  'common.pdfPreviewLoading': 'Chargement de l\u2019aper\u00e7u PDF…',
  'common.pdfPreviewFailed': 'Aper\u00e7u indisponible. Ouvrez le document dans un nouvel onglet.',
  'common.noQr': 'Aucun code QR t\u00e9l\u00e9vers\u00e9',

  // ── Policy descriptions (dynamic) ──
  'policy.daysLeft': '{days} jours restants',
  'policy.expiredDaysAgo': 'Expir\u00e9e depuis {days} jours',
  'policy.desc.validUntil': 'Valide jusqu\u2019au {date}',
  'policy.desc.expiringOn': 'Expire le {date} \u2014 {days} jours restants',
  'policy.desc.expiredOn': 'Expir\u00e9e le {date} (il y a {days} jours)',
  'policy.desc.noPolicyOnFile': 'Aucun document de police enregistr\u00e9',

  // ── Public page messages ──
  'public.insuranceValid': 'La couverture d\u2019assurance est active et valide.',
  'public.insuranceExpiring': 'La couverture d\u2019assurance expire dans {days} jours.',
  'public.insuranceExpired': 'La couverture d\u2019assurance a expir\u00e9. Contactez l\u2019op\u00e9rateur ou l\u2019organisation pour une documentation mise \u00e0 jour.',
  'public.insuranceMissing': 'Aucune information d\u2019assurance enregistr\u00e9e pour cet op\u00e9rateur.',
  'public.noInformation': 'Non fourni',
  'public.policyNotAvailable': 'Document de police original non disponible.',
  'public.policyNotAvailableHint': 'L\u2019organisation \u00e9mettrice n\u2019a pas t\u00e9l\u00e9charg\u00e9 le document de police pour ce profil.',
  'public.latestRecord': 'Cette page refl\u00e8te le dernier enregistrement publi\u00e9 \u00e0 la date indiqu\u00e9e ci-dessus.',
  'public.scanToVerify': 'Scannez ce code pour v\u00e9rifier le profil de l\u2019op\u00e9rateur',

  // ── Profile unavailable messages ──
  'profile.notFoundDesc': 'Le profil d\u2019op\u00e9rateur recherch\u00e9 n\u2019existe pas ou a \u00e9t\u00e9 supprim\u00e9.',
  'profile.notPublishedDesc': 'Ce profil d\u2019op\u00e9rateur n\u2019est actuellement pas disponible pour consultation publique. Il est peut-\u00eatre en cours de r\u00e9vision ou a \u00e9t\u00e9 retir\u00e9.',
  'profile.disclaimer': 'Ces informations sont fournies \u00e0 des fins de v\u00e9rification uniquement. L\u2019exactitude des donn\u00e9es rel\u00e8ve de l\u2019organisation \u00e9mettrice.',
  'profile.expiringInDays': 'Expire dans {days} jours',

  // ── Verification links descriptions ──
  'links.publicUrlDesc': 'Ceci est l\u2019URL publique permanente de ce profil op\u00e9rateur. Partagez-la directement ou encodez-la dans le code QR.',
  'links.publicUrlNotReady': 'D\u00e9finissez un slug et publiez le profil pour g\u00e9n\u00e9rer une URL publique.',
  'links.qrDesc': 'T\u00e9l\u00e9versez ou g\u00e9n\u00e9rez une image de code QR pointant vers la page de v\u00e9rification publique de cet op\u00e9rateur.',
  'links.nfcDesc': 'Le badge NFC contient le lien public DroneTag de ce profil. Il suffit d’en approcher un smartphone pour ouvrir la page ci-dessous — aucune app requise.',  // TODO: translate

  // ── Empty states ──
  'empty.noProfilesIcon': 'Aucun op\u00e9rateur enregistr\u00e9',
  'empty.noResultsIcon': 'Aucun r\u00e9sultat correspondant',

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTIONS — Page titles, section headers, subtitles, content blocks
  // ═══════════════════════════════════════════════════════════════════════════

  // ── App identity ──
  'app.title': 'DroneTag',
  'app.description': 'V\u00e9rification professionnelle des titres d\u2019op\u00e9rateur et gestion centralis\u00e9e des documents pour les op\u00e9rations de drones.',

  // ── Login page ──
  'login.title': 'Connexion \u00e0 DroneTag',
  'login.subtitle': 'Acc\u00e9dez \u00e0 votre profil, documents, certificats et drones.',

  // ── Home page ──
  'home.hero': 'V\u00e9rification des titres d\u2019op\u00e9rateur de drones',
  'home.subtitle': 'Plateforme professionnelle pour \u00e9mettre, auditer et suivre les titres op\u00e9rationnels des op\u00e9rations UAS.',
  'home.feature1Title': 'Titres d\u2019op\u00e9rateur',
  'home.feature1Desc': '\u00c9mission d\u2019identification num\u00e9rique et de titres pour les op\u00e9rateurs de syst\u00e8mes a\u00e9riens sans pilote.',
  'home.feature2Title': 'V\u00e9rification en temps r\u00e9el',
  'home.feature2Desc': 'Contr\u00f4le imm\u00e9diat des profils valides par scan QR, sans friction.',
  'home.feature3Title': 'Suivi de la conformit\u00e9',
  'home.feature3Desc': 'Suivi automatis\u00e9 des \u00e9ch\u00e9ances d\u2019assurance et de documentation pour maintenir la conformit\u00e9.',
  'home.cta': 'Connexion administrateur',
  'home.footer': 'DroneTag \u00a9 {year}. V\u00e9rification des op\u00e9rateurs et gestion documentaire.',
  'home.learnMore': 'Fonctionnement',
  'home.systemDesc': 'DroneTag aide les organisations \u00e0 conserver et \u00e0 prouver en toute s\u00e9curit\u00e9 les qualifications op\u00e9rationnelles et les polices.',

  'home.nav.howItWorks': 'Fonctionnement',
  'home.nav.features': 'Fonctionnalit\u00e9s',
  'home.nav.nfcBadge': 'Badges NFC',
  'home.nav.signIn': 'Se connecter',
  'home.nav.signUp': 'S\u2019inscrire',
  'home.nav.adminArea': 'Espace administrateur',
  'home.nav.openDashboard': 'Ouvrir le tableau de bord',

  'home.hero.eyebrow': 'IDENTIT\u00c9 NUM\u00c9RIQUE POUR OP\u00c9RATEURS UAS',
  'home.hero.title': 'Toutes vos credentials drone, toujours disponibles.',
  'home.hero.subtitle': 'DroneTag regroupe profil, certificats, assurances et drones dans une identit\u00e9 num\u00e9rique accessible via badge NFC et l\u2019application officielle.',
  'home.hero.ctaPrimary': 'Acc\u00e9der \u00e0 la plateforme',
  'home.hero.ctaSecondary': 'Voir le fonctionnement',
  'home.hero.ctaDashboard': 'Aller au tableau de bord',
  'home.hero.trustNfc': 'Acc\u00e8s NFC rapide',
  'home.hero.trustDocs': 'Documents prot\u00e9g\u00e9s',
  'home.hero.trustExpiry': 'Suivi des \u00e9ch\u00e9ances',

  'home.preview.operatorName': 'Marco Bianchi',
  'home.preview.operatorRole': 'Télépilote · AeroFly Srl',
  'home.preview.insurance': 'Assurance RC',
  'home.preview.insuranceDetail': 'Police valide jusqu\u2019\u00e0 d\u00e9c. 2026',
  'home.preview.certificate': 'Certificat A2',
  'home.preview.certificateDetail': 'Cat\u00e9gorie ouverte \u2014 sous-cat\u00e9gorie A2',
  'home.preview.drone': 'Drone enregistr\u00e9',
  'home.preview.droneDetail': 'DJI Mavic 3 \u00b7 IT-DRN-4821',
  'home.preview.valid': 'Valide',
  'home.preview.expiring': 'Expire bient\u00f4t',
  'home.preview.showCredentials': 'Afficher les credentials',
  'home.preview.nfcDetected': 'Badge d\u00e9tect\u00e9',
  'home.preview.nfcSuccess': 'Profil ouvert avec succ\u00e8s',

  'home.audience.operator.title': 'Je suis op\u00e9rateur',
  'home.audience.operator.desc': 'Consultez et partagez certificats, assurances et drones.',
  'home.audience.operator.cta': 'Acc\u00e9der au profil',
  'home.audience.admin.title': 'Je suis administrateur',
  'home.audience.admin.desc': 'G\u00e9rez utilisateurs, v\u00e9rifications, documents, badges et \u00e9ch\u00e9ances.',
  'home.audience.admin.cta': 'Ouvrir l\u2019espace admin',
  'home.audience.verifier.title': 'Je dois v\u00e9rifier un op\u00e9rateur',
  'home.audience.verifier.desc': 'Consultez le profil public via NFC, QR ou lien.',
  'home.audience.verifier.cta': 'Ouvrir la v\u00e9rification',

  'home.how.title': 'Fonctionnement',
  'home.how.step1.title': 'Cr\u00e9er le profil',
  'home.how.step1.desc': 'Enregistrez op\u00e9rateur, organisation et drones.',
  'home.how.step2.title': 'T\u00e9l\u00e9verser les credentials',
  'home.how.step2.desc': 'Ajoutez certificats, assurances et documents.',
  'home.how.step3.title': 'Partager au besoin',
  'home.how.step3.desc': 'Partagez le profil via badge NFC, QR ou lien.',

  'home.features.title': 'Fonctionnalit\u00e9s principales',
  'home.features.subtitle': 'Tout pour g\u00e9rer identit\u00e9 et conformit\u00e9 UAS au m\u00eame endroit.',
  'home.features.profile.title': 'Profil op\u00e9rateur',
  'home.features.profile.desc': 'Identit\u00e9, r\u00f4les et donn\u00e9es professionnelles.',
  'home.features.certificates.title': 'Certificats',
  'home.features.certificates.desc': 'A1/A3, A2, STS et autres qualifications.',
  'home.features.insurances.title': 'Assurances',
  'home.features.insurances.desc': 'Polices, validit\u00e9 et documents associ\u00e9s.',
  'home.features.drones.title': 'Drones',
  'home.features.drones.desc': 'Donn\u00e9es d\u2019identification, statut et associations.',
  'home.features.nfc.title': 'Badge NFC et app officielle',
  'home.features.nfc.desc': 'Acc\u00e8s imm\u00e9diat au profil num\u00e9rique.',
  'home.features.expiry.title': 'Suivi des \u00e9ch\u00e9ances',
  'home.features.expiry.desc': 'Alertes pour documents expirants ou manquants.',

  'home.nfc.title': 'Du badge au profil num\u00e9rique en un geste.',
  'home.nfc.subtitle': 'Approchez un smartphone du badge NFC ou scannez le QR pour ouvrir le profil v\u00e9rifiable.',
  'home.nfc.benefit1': 'Aucune app requise',
  'home.nfc.benefit2': 'Acc\u00e8s imm\u00e9diat',
  'home.nfc.benefit3': 'Donn\u00e9es publiques et prot\u00e9g\u00e9es s\u00e9par\u00e9es',
  'home.nfc.scanHint': 'Page publique de v\u00e9rification',

  'home.verify.title': 'Con\u00e7u pour des contr\u00f4les rapides.',
  'home.verify.subtitle': 'Autorit\u00e9s et clients lisent l\u2019essentiel en quelques secondes.',
  'home.verify.point1': 'Statut v\u00e9rifi\u00e9 en un coup d\u2019\u0153il',
  'home.verify.point2': 'Assurance et certificats actifs list\u00e9s',
  'home.verify.point3': 'Documents prot\u00e9g\u00e9s sur demande',
  'home.verify.operatorId': 'ID DT-2024-0847',
  'home.verify.rowInsurance': 'Assurance',
  'home.verify.rowCertificates': 'Certificats actifs',
  'home.verify.certificatesValue': 'A1/A3, A2',
  'home.verify.rowUpdated': 'Derni\u00e8re mise \u00e0 jour',
  'home.verify.updatedValue': '19 juin 2026',
  'home.verify.viewProtected': 'Voir les documents prot\u00e9g\u00e9s',
  'home.verify.footerNote': 'Donn\u00e9es publiques uniquement \u2014 documents sensibles sur autorisation.',

  'home.ctaFinal.title': 'Emportez vos credentials partout.',
  'home.ctaFinal.subtitle': 'Connectez-vous \u00e0 DroneTag et g\u00e9rez profil, documents, certificats et drones depuis une plateforme.',

  'home.footer.desc': 'Identit\u00e9 num\u00e9rique priv\u00e9e et gestion documentaire pour op\u00e9rateurs UAS.',
  'home.footer.legal': 'Mentions l\u00e9gales',
  'home.footer.privacy': 'Confidentialit\u00e9',
  'home.footer.terms': 'Conditions',
  'home.footer.contact': 'Contact',

  // ── Dashboard ──
  'dashboard.title': 'Profils op\u00e9rateurs',
  'dashboard.subtitle': 'G\u00e9rez les titres, les polices et la v\u00e9rification depuis une interface unique.',
  'dashboard.createNew': 'Enregistrer un op\u00e9rateur',
  'dashboard.viewPublicProfile': 'Voir le profil public',
  'dashboard.noProfiles': 'Aucun profil op\u00e9rateur enregistr\u00e9',
  'dashboard.noProfilesHint': 'Enregistrez d\u2019abord un profil op\u00e9rateur pour saisir les titres, les publier et en assurer la v\u00e9rification.',
  'dashboard.deleteModalTitle': 'Supprimer d\u00e9finitivement le profil op\u00e9rateur\u00a0?',

  // ── Dashboard KPI labels ──
  'dashboard.stats.total': 'Profils au total',
  'dashboard.stats.published': 'Publics',
  'dashboard.stats.verified': 'V\u00e9rifi\u00e9s',
  'dashboard.stats.expiring': 'Expire bient\u00f4t',
  'dashboard.stats.expired': 'Expir\u00e9es',
  'dashboard.stats.incomplete': 'Incomplets',

  // ── Admin pages ──
  'admin.createProfileTitle': 'Enregistrer un nouvel op\u00e9rateur',
  'admin.editProfileTitle': 'Modifier le profil op\u00e9rateur',
  'admin.environment': 'Administration',

  // ── Form section headers ──
  'form.person': 'Identit\u00e9 de l\u2019op\u00e9rateur',
  'form.person.desc': 'Donn\u00e9es d\u2019identification personnelle de l\u2019op\u00e9rateur UAS certifi\u00e9.',
  'form.organization': 'Organisation',
  'form.organization.desc': 'Rattachement \u00e0 l\u2019entreprise et informations sur l\u2019organisation \u00e9mettrice.',
  'form.insurance': 'Couverture d\u2019assurance',
  'form.insurance.desc': 'D\u00e9tails de la responsabilit\u00e9 civile et documents de police associ\u00e9s.',
  'form.drone': 'Drone enregistr\u00e9',
  'form.drone.desc': 'Identification et donn\u00e9es du syst\u00e8me a\u00e9rien sans pilote (UAS) enregistr\u00e9.',
  'form.documents': 'Documents compl\u00e9mentaires',
  'form.verification': 'V\u00e9rification et audit',
  'form.verification.desc': 'Statut de v\u00e9rification et historique de contr\u00f4le tra\u00e7able.',
  'form.assets': 'M\u00e9dias et documents',
  'form.assets.desc': 'Photos, logos et codes de v\u00e9rification (p.\u00a0ex. QR) pour la page de profil publique.',
  'form.statusAndAccess': 'Publication et contr\u00f4le d\u2019acc\u00e8s',
  'form.statusAndAccess.desc': 'Cycle de vie du profil, visibilit\u00e9 et autorisation de v\u00e9rification publique.',
  'form.adminSection': 'Notes internes',
  'form.adminSection.desc': 'Annotations administratives non visibles sur la page publique.',

  // ── Verification links section ──
  'form.verificationLinks': 'V\u00e9rification et liens d\u2019acc\u00e8s',
  'form.verificationLinks.desc': 'URL publique, code QR et r\u00e9f\u00e9rence NFC pour la v\u00e9rification externe de ce profil op\u00e9rateur.',
  'links.publicUrlTitle': 'URL de la page publique',
  'links.qrTitle': 'Code QR',
  'links.nfcTitle': 'Tag NFC',

  // ── Form card headers ──
  'form.publicDataTitle': 'Donn\u00e9es op\u00e9rateur',
  'form.publicDataSubtitle': 'Ces champs apparaissent sur la page de profil publique.',
  'form.mediaTitle': 'M\u00e9dias et codes de v\u00e9rification',
  'form.mediaSubtitle': 'Supports visuels et codes pour la v\u00e9rification externe du profil.',
  'form.adminTitle': 'Administration',
  'form.adminSubtitle': 'Param\u00e8tres et notes internes non expos\u00e9s au public.',

  // ── Public profile section headers ──
  'profile.organization': 'Organisation',
  'profile.orgDetails': 'D\u00e9tails de l\u2019organisation',
  'profile.insurance': 'Couverture d\u2019assurance',
  'profile.qrCode': 'V\u00e9rification QR',
  'profile.droneInfo': 'Drone enregistr\u00e9',
  'profile.notFound': 'Profil introuvable',
  'profile.notPublished': 'Profil non disponible',
  'public.operatorProfile': 'Profil Op\u00e9rateur',
  'public.verifiedOperator': 'Op\u00e9rateur V\u00e9rifi\u00e9',
  'public.identity': 'Identit\u00e9 de l\u2019Op\u00e9rateur',
  'public.operatorCode': 'Code Op\u00e9rateur',
  'public.licenseNumber': 'N\u00b0 Licence',
  'public.droneInformation': 'Informations Drone',
  'public.insuranceCoverage': 'Couverture d\u2019Assurance',
  'public.policyDetails': 'D\u00e9tails de la Police',
  'public.policyDocument': 'Document de Police',
  'public.qrVerification': 'Code QR de V\u00e9rification',
  'public.verificationRecord': 'Registre de V\u00e9rification',
  'public.profileReference': 'R\u00e9f\u00e9rence du Profil',
  'public.poweredBy': 'Propulsé par DroneTag',

  // ═══════════════════════════════════════════════════════════════════════════
  // M2 — User dashboard (English-source strings; pending FR polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'account.tab.operators': 'Opérateurs',
  'account.tab.drones': 'Drones',
  'account.tab.insurances': 'Assurances',
  'account.tab.certificates': 'Certificats',
  'account.tab.documents': 'Documents',
  'account.tab.permits': 'Autorisations',
  'account.tab.archive': 'Archives',

  'account.section.accountType': 'Type de compte',
  'account.accountType.private': 'Particulier',
  'account.accountType.company': 'Entreprise',
  'account.section.privateInfo': 'Informations personnelles',
  'account.section.companyInfo': 'Informations sur l’entreprise',
  'account.section.address': 'Adresse',
  'account.section.media': 'Images du profil public',
  'account.mediaHint': 'La photo, le logo et la bannière apparaissent sur la page publique de votre drone (/u/…). Vos coordonnées et votre adresse restent privées.',
  'account.lockedIdentityHint': 'Vous pouvez modifier librement la photo, le logo et la bannière. Pour changer vos données personnelles, votre téléphone, votre e-mail ou votre adresse, contactez un administrateur.',
  'account.saved': 'Modifications enregistrées',
  'account.saveError': 'Impossible d’enregistrer les modifications. Veuillez réessayer.',
  'account.storageBillingRequired': 'Cloud Storage nécessite le forfait Firebase Blaze. Ouvrez la console Firebase → Paramètres du projet → Utilisation et facturation, associez un compte de facturation, passez au forfait Blaze, puis réessayez.',
  'entity.noPdfAttached': 'Aucun PDF joint — ouvrez Modifier et téléversez le fichier.',
  'account.editHint': 'Edit your account details and pilot identity. None of these fields are shown publicly.',

  'field.addressLine1': 'Adresse ligne 1',
  'field.addressLine2': 'Adresse ligne 2 (facultatif)',
  'field.city': 'Ville',
  'field.postalCode': 'Code postal',
  'field.country': 'Pays',
  'field.companyContactPerson': 'Personne de contact',
  'field.companyVat': 'N° de TVA / numéro fiscal',
  'field.companyUniqueNumber': 'N° au registre du commerce (facultatif)',

  'operator.list.title': 'Opérateurs',
  'operator.list.subtitle': 'Jusqu’à {max} opérateurs par compte.',
  'operator.list.empty': 'Aucun opérateur pour l’instant',
  'operator.list.emptyDesc': 'Ajoutez un opérateur à associer à vos drones.',
  'operator.list.new': 'Nouvel opérateur',
  'operator.list.atCap': 'Vous avez atteint la limite d’opérateurs.',
  'operator.kind.private': 'Personne physique',
  'operator.kind.company': 'Entreprise',
  'operator.field.kind': 'Type d’opérateur',
  'operator.field.label': 'Libellé affiché',
  'operator.field.isDefault': 'Opérateur par défaut',
  'operator.field.isDefaultHint': 'Utilisé lorsqu’aucun opérateur temporaire n’est actif.',
  'operator.current.badge': 'Opérateur actuel',
  'operator.current.hint': 'Sélectionnez ici votre opérateur actuel. Il est prérempli à la création d’un drone et utilisé lorsqu’aucun remplacement temporaire n’est actif sur un vol.',
  'operator.current.set': 'Définir {name} comme opérateur actuel',
  'operator.current.setShort': 'Définir comme actuel',
  'operator.create.title': 'Nouvel opérateur',
  'operator.edit.title': 'Modifier l’opérateur',
  'operator.delete.title': 'Supprimer l’opérateur ?',
  'operator.delete.warningPublic': 'Cet exploitant est celui par défaut de {count} drones publics. En le supprimant, ces drones n’auront plus d’exploitant par défaut.',

  'drone.list.title': 'Drones',
  'drone.list.empty': 'Aucun drone pour l’instant',
  'drone.list.emptyDesc': 'Ajoutez votre premier drone pour publier un profil public.',
  'drone.list.new': 'Nouveau drone',
  'drone.list.atCap': 'Vous avez utilisé tous vos emplacements de drone.',
  'drone.field.manufacturer': 'Fabricant',
  'drone.field.model': 'Modèle / nom',
  'drone.field.classMarking': 'Marquage de classe',
  'drone.field.serialNumber': 'Numéro de série du drone',
  'drone.field.controllerSerial': 'Numéro de série de la radiocommande',
  'drone.field.defaultOperator': 'Opérateur par défaut',
  'drone.field.linkedPilot': 'Pilote associé',
  'drone.field.insurance': 'Police d’assurance',
  'drone.field.insuranceNone': 'Aucune assurance associée',
  'drone.field.status': 'Statut',
  'drone.field.visibility': 'Visibilité',
  'drone.field.slug': 'Slug d’URL publique',
  'drone.publicUrl': 'URL publique',
  'drone.copySlug': 'Copier l’URL publique',
  'drone.slugCopied': 'URL publique copiée',
  'drone.create.title': 'Nouveau drone',
  'drone.edit.title': 'Détails du drone',
  'drone.delete.title': 'Supprimer le drone ?',
  'drone.delete.warning': 'Ce drone est actuellement public à l’adresse {url}. La carte QR/NFC cessera immédiatement de fonctionner.',
  'drone.class.c0': 'C0 (moins de 250 g)',
  'drone.class.c1': 'C1 (moins de 900 g)',
  'drone.class.c2': 'C2 (moins de 4 kg)',
  'drone.class.c3': 'C3 (moins de 25 kg)',
  'drone.class.c4': 'C4 (moins de 25 kg, sans automatisation)',
  'drone.class.unknown': 'Inconnue / sans classe',
  'drone.catalog.title': 'Catalogue de modèles',
  'drone.catalog.search': 'Trouvez votre drone',
  'drone.catalog.searchPlaceholder': 'Rechercher DJI Mini, Air 3S, Autel…',
  'drone.catalog.hint': 'Choisissez un modèle courant : marque, nom et classe UE sont remplis automatiquement. Ajoutez seulement le numéro de série et l’opérateur.',
  'drone.catalog.empty': 'Aucun modèle trouvé. Essayez une autre recherche ou choisissez un modèle personnalisé.',
  'drone.catalog.custom': 'Autre modèle — saisir les données manuellement',
  'drone.catalog.selectedClass': 'Classe UE',
  'drone.catalog.required': 'Sélectionnez un modèle du catalogue ou choisissez un modèle personnalisé.',
  'drone.catalog.serialHint': 'Numéro de série inscrit sur l’aéronef',
  'drone.detail.basics': 'Informations de base',
  'drone.detail.identity': 'Identité et numéros de série',
  'drone.detail.publish': 'Publication',
  'drone.detail.linked': 'Éléments associés',
  'drone.backToList': 'Retour aux drones',
  'drone.confirmCreate.title': 'Confirmer les données du drone',
  'drone.confirmCreate.message': 'Vérifiez les informations : une fois enregistrés, le fabricant, le modèle, la classe et le numéro de série ne pourront plus être modifiés. Pour les corriger, vous devrez supprimer le drone et l’enregistrer à nouveau.',
  'drone.confirmLock.title': 'Verrouiller les données du drone',
  'drone.confirmLock.message': 'Vérifiez les informations : une fois enregistrés, ces champs ne pourront plus être modifiés. Pour les corriger, vous devrez supprimer le drone et l’enregistrer à nouveau.',
  'drone.locked.hint': 'Les informations du drone sont verrouillées. Pour les corriger, supprimez le drone et enregistrez-le à nouveau, ou contactez le support.',

  'insurance.list.title': 'Polices d’assurance',
  'insurance.list.subtitle': 'Une police peut couvrir plusieurs drones. Associez le souscripteur, puis sélectionnez chaque aéronef couvert.',
  'insurance.list.empty': 'Aucune police d’assurance',
  'insurance.list.emptyDesc': 'Téléversez le PDF d’une police — un seul document peut couvrir toute votre flotte.',
  'insurance.list.new': 'Nouvelle police',
  'insurance.field.link': 'Associée à',
  'insurance.link.drone': 'Drone',
  'insurance.link.operator': 'Opérateur',
  'insurance.field.drone': 'Drone associé',
  'insurance.field.coveredDrones': 'Drones couverts',
  'insurance.field.coveredDronesHint': 'Sélectionnez tous les drones couverts par cette police. Une seule assurance peut protéger plusieurs aéronefs.',
  'insurance.field.noDrones': 'Aucun drone dans votre flotte pour l’instant — ajoutez d’abord un drone, ou enregistrez la police et associez-la plus tard.',
  'insurance.coveredCount': '{count} drone(s)',
  'insurance.field.operator': 'Opérateur associé',
  'insurance.create.title': 'Nouvelle police d’assurance',
  'insurance.edit.title': 'Modifier la police d’assurance',
  'insurance.delete.title': 'Supprimer la police ?',
  'insurance.confirmCreate.title': 'Confirmer les données de la police',
  'insurance.confirmCreate.message': 'Confirmer ces informations ? Si elles correspondent à celles lues dans le document, la police est vérifiée immédiatement ; si vous les avez modifiées, un administrateur la contrôlera. Une fois enregistrés, les champs ne sont plus modifiables : pour les corriger, supprimez la police et téléversez-la à nouveau.',
  'insurance.locked.hint': 'Les informations de la police sont verrouillées. Pour les corriger, supprimez la police et téléversez-la à nouveau, ou contactez le support.',
  'insurance.view.title': 'Détails de la police',
  'insurance.delete.warningPublic': 'Cette police est actuellement associée à un drone public. Si vous la supprimez, le statut d’assurance disparaîtra de ce profil public.',
  'insurance.field.validity': 'Valide du – au',
  'insurance.parse.hint': 'Nous lisons dans le PDF le souscripteur, le numéro de police, les dates et les drones couverts : il vous suffit de vérifier et de confirmer.',
  'insurance.parse.parsing': 'Lecture des données de la police depuis le PDF…',
  'insurance.parse.success': 'Informations lues dans le document : vérifiez-les et confirmez. Si vous ne les modifiez pas, la vérification est immédiate.',
  'insurance.parse.partial': 'Certains champs ont été extraits — complétez le reste manuellement.',
  'insurance.parse.failed': 'Impossible de lire ce PDF automatiquement. Saisissez les informations manuellement.',
  'insurance.parse.droneDetected': 'Drone issu du PDF',
  'insurance.parse.dronesDetected': '{count} aéronef(s) trouvé(s) dans la police',
  'insurance.parse.dronesMatched': '{count} associé(s) à votre flotte',
  'insurance.parse.droneMatched': 'associé à votre flotte',
  'insurance.parse.droneNotMatched': 'sélectionnez le drone manuellement',
  'insurance.coverdrone.cta': 'Obtenir un devis Coverdrone',
  'insurance.coverdrone.hint': 'Votre police expire bientôt ou a expiré ? Renouvelez-la ou souscrivez une RC drone UE avec Coverdrone.',

  'cert.list.title': 'Certificats',
  'cert.list.subtitle': 'A1/A3, A2, STS théorique, STS-01, STS-02 ou personnalisé.',
  'cert.list.empty': 'Aucun certificat',
  'cert.list.emptyDesc': 'Ajoutez vos certificats A1/A3, A2 ou STS.',
  'cert.list.new': 'Nouveau certificat',
  'cert.list.atCap': 'Vous avez utilisé tous vos emplacements de certificat.',
  'cert.field.kind': 'Type de certificat',
  'cert.field.label': 'Libellé affiché',
  'cert.field.registrationNumber': 'Numéro d’enregistrement',
  'cert.field.registrationNumberHint': 'Lu automatiquement dans le PDF, ou à saisir manuellement',
  'cert.field.issuedBy': 'Délivré par',
  'cert.field.fileUrl': 'URL du certificat',
  'cert.field.filePdf': 'Document du certificat (PDF)',
  'cert.field.number': 'Numéro du certificat',
  'cert.field.notes': 'Notes',
  'cert.kind.a1a3': 'A1 / A3',
  'cert.kind.a2': 'A2',
  'cert.kind.stsTheoretical': 'STS théorique',
  'cert.kind.sts01': 'STS-01',
  'cert.kind.sts02': 'STS-02',
  'cert.kind.custom': 'Certificat personnalisé',
  'cert.create.title': 'Nouveau certificat',
  'cert.edit.title': 'Modifier le certificat',
  'cert.delete.title': 'Supprimer le certificat ?',
  'cert.confirmCreate.title': 'Confirmer les données du certificat',
  'cert.confirmCreate.message': 'Confirmer ces informations ? Si elles correspondent à celles lues dans le document, le certificat est vérifié immédiatement ; si vous les avez modifiées, un administrateur le contrôlera. Une fois enregistrés, les champs ne sont plus modifiables : pour les corriger, supprimez le certificat et téléversez-le à nouveau.',
  'cert.locked.hint': 'Les informations du certificat sont verrouillées. Pour les corriger, supprimez le certificat et téléversez-le à nouveau, ou contactez le support.',
  'cert.view.title': 'Détails du certificat',
  'cert.parse.hint': 'Pour les certificats italiens, nous lisons automatiquement le code ITA-…, les dates et le type : il vous suffit de vérifier et de confirmer.',
  'cert.parse.parsing': 'Lecture des données du certificat depuis le PDF…',
  'cert.parse.success': 'Informations lues dans le document : vérifiez-les et confirmez. Si vous ne les modifiez pas, la vérification est immédiate.',
  'cert.parse.partial': 'Certains champs ont été extraits — complétez le reste manuellement.',
  'cert.parse.failed': 'Impossible de lire ce PDF automatiquement. Saisissez les informations manuellement.',

  'doc.list.title': 'Documents téléversés',
  'doc.list.subtitle': '{used} sur {max} emplacements de document utilisés.',
  'doc.list.empty': 'Aucun document',
  'doc.list.emptyDesc': 'Téléversez des PDF (police d’assurance, immatriculation, certificat de formation, etc.).',
  'doc.list.new': 'Nouveau document',
  'doc.list.atCap': 'Vous avez utilisé tous vos emplacements de document.',
  'doc.field.kind': 'Type de document',
  'doc.field.label': 'Nom',
  'doc.field.labelHint': 'Facultatif — par défaut, le nom du fichier',
  'doc.field.file': 'Fichier',
  'doc.field.fileUrl': 'URL du fichier',
  'doc.field.fileName': 'Nom du fichier',
  'doc.field.notes': 'Notes',
  'doc.kind.insurance_policy': 'Police d’assurance',
  'doc.kind.operator_license': 'Licence d’opérateur',
  'doc.kind.drone_registration': 'Immatriculation du drone',
  'doc.kind.training_certificate': 'Certificat de formation',
  'doc.kind.identity': 'Pièce d’identité',
  'doc.kind.other': 'Autre',
  'doc.create.title': 'Nouveau document',
  'doc.edit.title': 'Modifier le document',
  'doc.delete.title': 'Supprimer le document ?',
  'doc.urlHint': 'Collez l’URL publique du fichier (URL Firebase Storage, lien signé, etc.).',

  'permits.list.title': 'Permis et autorisations',
  'permits.list.subtitle': 'Autorisations journalières, nullaosta et permis opérationnels. Les éléments expirés sont déplacés dans les Archives.',
  'permits.list.new': 'Nouvelle autorisation',
  'permits.list.empty': 'Aucune autorisation active',
  'permits.list.emptyDesc': 'Téléversez vos autorisations journalières, nullaosta, autorisations horaires et autres documents opérationnels similaires.',
  'permits.list.atCap': 'Vous avez utilisé tous les emplacements d’autorisations actives.',
  'permits.hint.parser': 'Indiquez la zone, les conditions, les dates et le drone concerné.',
  'permits.hint.storage': 'Joignez le PDF ou une photo de l’autorisation.',
  'permits.hint.admin': 'Un administrateur DroneTag le vérifiera.',
  'permits.archiveNotice': '{count} élément(s) expiré(s) déplacé(s) dans les Archives.',
  'permits.create.title': 'Nouvelle autorisation',
  'permits.edit.title': 'Modifier l’autorisation',
  'permits.delete.title': 'Supprimer l’autorisation ?',
  'permits.delete.message': 'Cette autorisation sera définitivement supprimée.',
  'permits.kind.daily': 'Autorisation journalière',
  'permits.kind.nullaosta': 'Nullaosta',
  'permits.kind.hourly_nullaosta': 'Nullaosta horaire',
  'permits.kind.temporary': 'Autorisation temporaire',
  'permits.kind.other': 'Autre',
  'permits.field.kind': 'Type',
  'permits.field.label': 'Titre',
  'permits.field.issuedBy': 'Délivrée par',
  'permits.field.area': 'Zone / secteur',
  'permits.field.validFrom': 'Valide du',
  'permits.field.validTo': 'Valide jusqu’au',
  'permits.field.notes': 'Notes',
  'permits.field.file': 'Document (PDF ou image)',

  'archive.list.title': 'Archives',
  'archive.list.subtitle': 'Certificats, polices et autorisations expirés. Augmentez l’espace depuis la facturation.',
  'archive.list.new': 'Téléverser dans les archives',
  'archive.list.empty': 'Les archives sont vides',
  'archive.list.emptyDesc': 'Lorsque des certificats, polices d’assurance ou autorisations expirent, ils apparaissent ici automatiquement.',
  'archive.hint.storage': 'Espace d’archives inclus : 30 Mo',
  'archive.hint.autoMove': 'Les versions expirées sont déplacées ici automatiquement',
  'archive.hint.upgrade': 'Acheter plus d’espace d’archives',
  'archive.cta.buySpace': 'Acheter de l’espace',
  'archive.storage.title': 'Espace d’archives',
  'archive.storage.used': '{used} Mo utilisés sur {max} Mo',
  'archive.expiredOn': 'Expiré le',
  'archive.openSource': 'Ouvrir la section',
  'archive.delete.title': 'Supprimer des archives ?',
  'archive.delete.message': 'Le document expiré sera définitivement supprimé et l’espace libéré.',

  'slot.usage': '{used} sur {max} utilisés',
  'slot.atCap': 'Limite atteinte',
  'slot.contactToUpgrade': 'Contactez l’administrateur pour ajouter des emplacements.',

  'confirm.continue': 'Continuer',
  'confirm.dangerWarning': 'Cette action est irréversible.',

  'form.errors.title': 'Veuillez corriger les champs en surbrillance.',
  'form.errors.invalidEmail': 'Saisissez une adresse e-mail valide.',
  'form.errors.invalidUrl': 'Saisissez une URL valide.',
  'form.errors.urlNotAllowed': 'L’URL doit être hébergée sur Firebase Storage ou sur un hôte de confiance configuré par l’administrateur.',
  'form.errors.expiryBeforeIssue': 'La date d’expiration doit être postérieure à la date d’émission.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M3 — Public drone page + Report found drone (English source; pending FR).
  // ═══════════════════════════════════════════════════════════════════════════

  'publicDrone.eyebrow': 'Identification du drone',
  'publicDrone.holderPilot': 'Télépilote',
  'publicDrone.holderOperatorPrivate': 'Opérateur UAS',
  'publicDrone.holderOperatorCompany': 'Opérateur UAS (entreprise)',
  'publicDrone.holderName': 'Nom',
  'publicDrone.classification': 'Classe du drone',
  'publicDrone.identifier': 'Numéro de série',
  'publicDrone.policyNumberMasked': 'Référence de la police',
  'publicDrone.validUntil': 'Valide jusqu’au',
  'publicDrone.userVerified': 'Utilisateur vérifié',
  'publicDrone.userPending': 'Utilisateur en cours de vérification',
  'publicDrone.userUnverified': 'Utilisateur non vérifié',
  'publicDrone.userRejected': 'Utilisateur non approuvé',
  'publicDrone.insuranceUnknown': 'Aucune information d’assurance enregistrée',
  'publicDrone.insuranceActive': 'Assurance active',
  'publicDrone.insuranceExpiring': 'Assurance expirant bientôt',
  'publicDrone.insuranceExpired': 'Assurance expirée',
  'publicDrone.certificatesVerified': 'Certificats vérifiés',
  'publicDrone.certificatesPending': 'Certificats en cours de vérification',
  'publicDrone.certificatesUnverified': 'Certificats non vérifiés',
  'publicDrone.certificatesRejected': 'Certificats refusés',
  'publicDrone.viewPolicyPdf': 'Voir le document de police',
  'publicDrone.openApp': 'Ouvrir l’app / se connecter',
  'publicDrone.reportFound': 'J’ai trouvé ce drone',
  'publicDrone.reportFoundShort': 'Signaler un drone trouvé',
  'publicDrone.lastVerified': 'Dernière vérification',
  'publicDrone.publishedOn': 'Publié le',
  'publicDrone.disclaimer': 'DroneTag est une plateforme privée d’identification numérique. Elle ne remplace pas l’enregistrement officiel de l’opérateur, la certification du télépilote, les obligations d’assurance ni les documents délivrés par les autorités.',

  'reportFound.title': 'Signaler un drone trouvé',
  'reportFound.subtitle': 'Aidez-nous à rendre ce drone à son propriétaire. Le partage de vos coordonnées est facultatif.',
  'reportFound.field.finderName': 'Votre nom (facultatif)',
  'reportFound.field.finderEmail': 'Votre e-mail (facultatif)',
  'reportFound.field.message': 'Message au propriétaire (facultatif)',
  'reportFound.field.locationText': 'Lieu approximatif (facultatif)',
  'reportFound.field.locationTextHint': 'Texte libre : adresse, point de repère, quartier, etc.',
  'reportFound.geolocation.add': 'Partager ma position GPS',
  'reportFound.geolocation.added': 'Position GPS enregistrée',
  'reportFound.geolocation.remove': 'Retirer la position GPS',
  'reportFound.geolocation.error': 'Impossible d’accéder à la position. Vous pouvez toujours la décrire dans le champ ci-dessus.',
  'reportFound.privacy': 'Votre message n’est transmis qu’au propriétaire du drone et à l’équipe DroneTag : il n’est jamais affiché sur la page publique.',
  'reportFound.submit': 'Envoyer le signalement',
  'reportFound.submitting': 'Envoi en cours…',
  'reportFound.successTitle': 'Merci pour votre signalement',
  'reportFound.successBody': 'Le propriétaire du drone a été prévenu. Il pourra vous contacter grâce aux coordonnées fournies, le cas échéant.',
  'reportFound.errorBody': 'Nous n’avons pas pu envoyer votre signalement. Réessayez dans un instant.',
  'reportFound.cooldown': 'Patientez quelques secondes avant d’envoyer un autre signalement.',

  'inbox.title': 'Signalements',
  'inbox.subtitle': 'Messages de personnes ayant trouvé l’un de vos drones.',
  'inbox.tab': 'Signalements',
  'inbox.empty': 'Aucun signalement pour l’instant',
  'inbox.emptyDesc': 'Lorsqu’une personne scanne l’une de vos cartes publiques de drone et utilise le bouton « Signaler un drone trouvé », son message apparaît ici.',
  'inbox.unread': 'Non lu',
  'inbox.read': 'Lu',
  'inbox.markRead': 'Marquer comme lu',
  'inbox.viewLocation': 'Voir sur la carte',
  'inbox.locationCoords': '{lat}, {lng} (±{accuracy} m)',
  'inbox.fromAnonymous': 'Expéditeur anonyme',
  'inbox.contact': 'Contact',
  'inbox.location': 'Lieu indiqué',
  'inbox.message': 'Message',
  'inbox.about': 'Drone concerné',
  'inbox.openDrone': 'Ouvrir le drone',
  'inbox.receivedAt': 'Reçu le {date}',


  'support.title': 'Support',
  'support.subtitle': 'Écrivez à l’équipe DroneTag pour les changements d’identité et tout ce que seul un administrateur peut modifier.',
  'support.nav': 'Support',
  'support.empty': 'Aucun message pour l’instant',
  'support.emptyDesc': 'Écrivez ci-dessous pour ouvrir une conversation. Utilisez-la pour corriger votre nom, changer de téléphone ou d’e-mail, ou modifier d’autres champs verrouillés.',
  'support.composer.placeholder': 'Écrivez votre message…',
  'support.composer.subjectPlaceholder': 'Objet (facultatif)',
  'support.send': 'Envoyer',
  'support.sending': 'Envoi…',
  'support.closed': 'Cette conversation est fermée. Envoyez un message pour la rouvrir.',
  'support.you': 'Vous',
  'support.admin': 'Support',
  'support.hint.nameChange': 'Besoin de changer votre nom ou d’autres données verrouillées ? Écrivez ici — un administrateur mettra à jour votre compte.',
  'support.status.open': 'Ouverte',
  'support.status.closed': 'Fermée',

  'admin.nav.support': 'Support',
  'admin.support.title': 'Messagerie du support',
  'admin.support.subtitle': 'Conversations avec les utilisateurs sur les champs verrouillés et l’aide au compte.',
  'admin.support.empty': 'Aucune conversation',
  'admin.support.emptyDesc': 'Lorsqu’un utilisateur écrit au support, la conversation apparaît ici.',
  'admin.support.openUser': 'Ouvrir le profil utilisateur',
  'admin.support.close': 'Fermer la conversation',
  'admin.support.reopen': 'Rouvrir la conversation',
  'admin.support.unread': '{count} non lu(s)',
  'admin.support.select': 'Sélectionnez une conversation',
  'admin.support.composer.placeholder': 'Répondre en tant qu’admin…',
  'admin.users.openSupport': 'Ouvrir le chat du support',

  'publicDrone.errorTitle': 'Impossible de charger ce drone',
  'publicDrone.errorBody': 'Un problème est survenu lors de la récupération du profil du drone. Vérifiez votre connexion et réessayez.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M4 — Temporary operator switching (English source; pending FR polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'activeOp.section.title': 'Opérateur actif',
  'activeOp.section.subtitle': 'Réaffectez temporairement ce drone à un autre opérateur. Le remplacement expire automatiquement après 24 heures.',
  'activeOp.label.effective': 'Actif en ce moment',
  'activeOp.label.default': 'Opérateur par défaut',
  'activeOp.label.activeOverride': 'Remplacement temporaire',
  'activeOp.label.expiresAt': 'Fin du remplacement',
  'activeOp.label.setAt': 'Activé le',
  'activeOp.label.reason': 'Motif',
  'activeOp.countdown.hours': 'Il reste {hours} h {minutes} min',
  'activeOp.countdown.minutes': 'Il reste {minutes} min',
  'activeOp.countdown.expired': 'Expiré — retour à l’opérateur par défaut',
  'activeOp.cta.switch': 'Changer d’opérateur actif',
  'activeOp.cta.clearNow': 'Retirer l’opérateur temporaire',
  'activeOp.cta.confirmAndApply': 'Confirmer et activer',
  'activeOp.modal.title': 'Activer un opérateur temporaire',
  'activeOp.modal.subtitle': 'Choisissez l’opérateur qui sera responsable de ce drone pendant les 24 prochaines heures.',
  'activeOp.modal.field.operator': 'Opérateur',
  'activeOp.modal.field.reason': 'Motif (facultatif)',
  'activeOp.modal.field.reasonHint': 'Vous permet, ainsi qu’aux administrateurs, de comprendre pourquoi le remplacement a été activé.',
  'activeOp.modal.responsibility': 'Je confirme avoir vérifié toutes les données de l’opérateur, la couverture d’assurance, l’association du drone et la responsabilité légale avant d’activer cet opérateur.',
  'activeOp.modal.responsibilityRequired': 'Vous devez confirmer votre responsabilité avant d’activer l’opérateur temporaire.',
  'activeOp.modal.duration': 'Le remplacement reste actif 24 heures, puis l’opérateur par défaut est automatiquement rétabli.',
  'activeOp.modal.sameAsDefault': 'L’opérateur sélectionné est déjà celui par défaut. Choisissez-en un autre pour activer un remplacement temporaire.',
  'activeOp.empty.noAlternativeTitle': 'Aucun autre opérateur disponible',
  'activeOp.empty.noAlternativeDesc': 'Ajoutez un deuxième opérateur sur la page Opérateurs pour activer le changement temporaire.',
  'activeOp.clear.title': 'Retirer l’opérateur temporaire ?',
  'activeOp.clear.message': 'Le drone reviendra immédiatement à son opérateur par défaut et l’historique d’audit du remplacement sera supprimé.',
  'activeOp.banner.activeNow': 'Un remplacement temporaire d’opérateur est actuellement actif.',
  'activeOp.errorBody': 'Impossible de mettre à jour l’opérateur actif. Veuillez réessayer.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M5 — Admin / plans / PWA / disclaimers (English source; pending FR polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'legal.platformDisclaimer': 'DroneTag is a private digital identification and document management platform. It does not replace official drone operator registration, pilot certification, insurance obligations, or authority-issued documentation.',
  'legal.notOfficial': 'Ceci n’est pas un registre officiel de l’État ou d’une autorité aéronautique.',

  'admin.title': 'Admin',
  'admin.subtitle': 'Gérez la plateforme : utilisateurs, drones, signalements, offres et file de vérification.',
  'admin.overview.subtitle': 'File de travail du jour : vérification, signalements, support et remplacements d’opérateur en cours.',
  'admin.overview.attentionTitle': 'Des éléments requièrent votre attention',
  'admin.overview.attentionBody': '{count} élément(s) à traiter : vérification, signalements et support.',
  'admin.overview.allClearTitle': 'Rien d’urgent',
  'admin.overview.allClearBody': 'Aucune vérification en attente, aucun signalement non lu, aucune demande de support sans réponse.',
  'admin.overview.stat.queue': 'File de vérification',
  'admin.overview.stat.unreadReports': 'Signalements non lus',
  'admin.overview.stat.support': 'Réponses support en attente',
  'admin.overview.stat.overrides': 'Remplacements actifs',
  'admin.overview.verify.title': 'Détail des vérifications',
  'admin.overview.verify.subtitle': 'Éléments en attente de votre décision.',
  'admin.overview.openQueue': 'Ouvrir la file',
  'admin.overview.reports.title': 'Signalements de drones trouvés non lus',
  'admin.overview.reports.subtitle': 'Messages de personnes ayant scanné un profil public.',
  'admin.overview.openReports': 'Ouvrir les signalements',
  'admin.overview.reports.empty': 'Aucun signalement non lu',
  'admin.overview.reports.emptyDesc': 'Les nouveaux signalements apparaîtront ici.',
  'admin.overview.reports.anonymous': 'Expéditeur anonyme',
  'admin.overview.support.title': 'Support en attente de réponse',
  'admin.overview.support.subtitle': 'Conversations ouvertes avec des messages non lus par l’admin.',
  'admin.overview.openSupport': 'Ouvrir le support',
  'admin.overview.support.empty': 'Aucune réponse en attente',
  'admin.overview.support.emptyDesc': 'Les messages d’utilisateurs nécessitant une réponse de l’admin s’afficheront ici.',
  'admin.overview.overrides.title': 'Remplacements d’opérateur actifs',
  'admin.overview.overrides.subtitle': 'Changements temporaires d’opérateur (24 h) actuellement en vigueur.',
  'admin.overview.openDrones': 'Ouvrir les drones',
  'admin.overview.overrides.empty': 'Aucun remplacement actif',
  'admin.overview.overrides.emptyDesc': 'Les affectations temporaires d’opérateur s’afficheront ici tant qu’elles sont valides.',
  'admin.overview.overrides.until': 'Jusqu’au {when}',
  'admin.overview.foot.users': 'Comptes',
  'admin.overview.foot.public': 'Drones publics',
  'admin.nav.overview': 'Vue d’ensemble',
  'admin.nav.users': 'Utilisateurs',
  'admin.nav.drones': 'Drones',
  'admin.nav.reports': 'Drones trouvés',
  'admin.nav.verify': 'Vérification',
  'admin.nav.plans': 'Offres',
  'admin.nav.legacy': 'Anciens profils',
  'admin.stats.users': 'Utilisateurs',
  'admin.stats.drones': 'Drones',
  'admin.stats.publicDrones': 'Drones publics',
  'admin.stats.reports': 'Drones trouvés',
  'admin.stats.unreadReports': 'Drones trouvés non lus',
  'admin.stats.plans': 'Offres actives',
  'admin.stats.activeOverrides': 'Remplacements actifs',
  'admin.stats.legacyProfiles': 'Profils hérités',

  'admin.users.title': 'Utilisateurs',
  'admin.users.subtitle': 'Consultez, recherchez et modifiez n’importe quel compte de la plateforme.',
  'admin.users.searchPlaceholder': 'Nom, e-mail, entreprise, TVA…',
  'admin.users.empty': 'Aucun utilisateur pour l’instant',
  'admin.users.loadError': 'Impossible de charger les utilisateurs. Vérifiez votre connexion et réessayez ; si le problème persiste, déconnectez-vous puis reconnectez-vous.',
  'admin.users.create.title': 'Nouvel utilisateur',
  'admin.users.create.subtitle': 'Créez l’accès et le profil de l’utilisateur. Il pourra uniquement se connecter et gérer ses propres données et documents.',
  'admin.users.create.tempPassword': 'Mot de passe temporaire',
  'admin.users.create.submit': 'Créer l’utilisateur',
  'admin.users.create.errorEmailInUse': 'Un compte existe déjà avec cet e-mail.',
  'admin.users.create.errorGeneric': 'Impossible de créer l’utilisateur. Veuillez réessayer.',
  'admin.users.create.errorAdminSdk':
    'Firebase Admin is not configured locally. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env.local to your service-account JSON file path, then restart npm run dev.',
  'admin.users.create.errorNameRequired': 'Le prénom et le nom sont obligatoires.',
  'admin.users.create.errorInvalidEmail': 'Saisissez une adresse e-mail valide.',
  'admin.users.create.errorAuth': 'Session admin expirée. Déconnectez-vous, reconnectez-vous et réessayez.',
  'admin.users.create.errorNetwork': 'Erreur réseau lors de la création de l’utilisateur. Vérifiez votre connexion et réessayez.',
  'admin.users.create.errors.summary': '{count} champs à corriger avant de pouvoir créer le compte.',
  'admin.users.create.errors.email_required': 'L’e-mail est obligatoire pour que l’utilisateur puisse se connecter.',
  'admin.users.create.errors.email_invalid': 'Saisissez une adresse e-mail valide (ex. nom@entreprise.fr).',
  'admin.users.create.errors.password_required': 'Le mot de passe temporaire est obligatoire (communiquez-le à l’utilisateur de manière sécurisée).',
  'admin.users.create.errors.password_too_short': 'Le mot de passe doit contenir au moins 6 caractères.',
  'admin.users.create.errors.firstName_required': 'Le prénom est obligatoire.',
  'admin.users.create.errors.lastName_required': 'Le nom est obligatoire.',
  'admin.users.create.errors.companyName_required': 'La raison sociale est obligatoire pour les comptes entreprise.',
  'admin.users.create.errors.companyContactPerson_required': 'La personne de contact est obligatoire pour les comptes entreprise.',
  'admin.users.col.name': 'Nom',
  'admin.users.col.type': 'Type',
  'admin.users.col.email': 'E-mail',
  'admin.users.col.created': 'Créé le',
  'admin.users.openProfile': 'Gérer le compte',
  'admin.users.editData': 'Modifier les données',
  'common.showPassword': 'Afficher le mot de passe',
  'common.hidePassword': 'Masquer le mot de passe',
  'admin.users.loginHint.title': 'Connexion de l’utilisateur',
  'admin.users.loginHint.body': 'L’utilisateur se connecte sur /login avec cet e-mail. Si vous avez créé le compte, il utilise le mot de passe temporaire que vous avez défini ; après la première connexion, il complète ses informations dans Mon compte.',
  'admin.users.publicHint.title': 'Page publique (QR / NFC)',
  'admin.users.publicHint.body': 'Chaque drone publié a sa propre page publique, celle qu’ouvre le QR code ou le badge NFC. L’utilisateur l’active dans Mon compte → Drones ; vous pouvez aussi la gérer depuis la section Drones ci-dessous.',
  'admin.users.publicHint.none':
    'No public drone yet: create a drone and set visibility to Public.',
  'admin.users.publicProfileUnavailable':
    'No public page yet: add a public drone with a slug.',
  'admin.users.detail.account': 'Données du compte',
  'admin.users.detail.pilot': 'Identité du télépilote',
  'admin.users.detail.slots': 'Emplacements',
  'admin.users.detail.operators': 'Opérateurs',
  'admin.users.detail.drones': 'Drones',
  'admin.users.detail.insurances': 'Assurances',
  'admin.users.detail.certificates': 'Certificats',
  'admin.users.detail.authorizations': 'Autorisations',
  'admin.users.detail.documents': 'Documents',
  'admin.users.backToList': 'Retour aux utilisateurs',

  'admin.slots.title': 'Emplacements et quotas',
  'admin.slots.subtitle': 'Définissez le nombre d’emplacements de chaque type auquel cet utilisateur a droit.',
  'admin.slots.kind.certificate': 'Certificats',
  'admin.slots.kind.drone': 'Drones',
  'admin.slots.kind.operator': 'Opérateurs',
  'admin.slots.kind.pdf': 'Documents PDF',
  'admin.slots.kind.permit': 'Autorisations / permis',
  'admin.slots.kind.archive': 'Packs d’archivage (+30 Mo)',
  'admin.slots.kind.nfc_badge': 'Badges NFC physiques',
  'admin.slots.kind.personalization': 'Personnalisation (logo / bannière)',
  'admin.slots.usage': 'Utilisés : {used}',
  'admin.slots.save': 'Enregistrer les emplacements',

  'admin.verify.title': 'File de vérification',
  'admin.verify.subtitle': 'File : à contrôler (informations corrigées par l’utilisateur ou sans vérification automatique). Archive : déjà vérifiés, automatiquement ou non, ou refusés ; vous pouvez les suspendre ou les remettre en file.',
  'admin.verify.view.queue': 'File d’attente',
  'admin.verify.view.archive': 'Archives',
  'admin.verify.archive.subtitle': 'Vérifiés (y compris automatiquement, lorsque l’utilisateur a confirmé les informations lues dans le document) ou refusés. Vous pouvez toujours les suspendre, les refuser ou les remettre en file.',
  'admin.verify.archive.empty': 'Les archives sont vides',
  'admin.verify.archive.emptyDesc': 'Les éléments vérifiés ou refusés apparaissent ici.',
  'admin.verify.tab.documents': 'Documents',
  'admin.verify.tab.certificates': 'Certificats',
  'admin.verify.tab.insurances': 'Assurances',
  'admin.verify.tab.authorizations': 'Autorisations',
  'admin.verify.tab.drones': 'Drones',
  'admin.verify.markVerified': 'Marquer vérifié',
  'admin.verify.markRejected': 'Marquer refusé',
  'admin.verify.markPending': 'Marquer en attente',
  'admin.verify.empty': 'Rien à vérifier',
  'admin.verify.emptyDesc': 'Seuls les éléments à contrôler manuellement apparaissent ici. Ceux vérifiés automatiquement vont directement dans l’archive.',

  'admin.drones.title': 'Tous les drones',
  'admin.drones.subtitle': 'Recherchez parmi tous les drones, qu’ils soient publics, privés ou archivés.',
  'admin.drones.searchPlaceholder': 'Slug, fabricant, modèle, n° de série, e-mail du propriétaire…',
  'admin.drones.col.drone': 'Drone',
  'admin.drones.col.owner': 'Propriétaire',
  'admin.drones.col.status': 'Statut',
  'admin.drones.col.override': 'Remplacement actif',
  'admin.drones.openInAdmin': 'Ouvrir',
  'admin.drones.adminEdit.title': 'Modifier le drone',
  'admin.drones.adminEdit.subtitle': 'Modification admin : les changements sont enregistrés immédiatement et passent outre les verrous de l’utilisateur.',
  'admin.drones.clearOverride': 'Annuler le remplacement',

  'admin.reports.title': 'Drones trouvés (tous les utilisateurs)',
  'admin.reports.subtitle': 'Messages envoyés par les personnes ayant scanné le profil public d’un drone.',
  'admin.reports.searchPlaceholder': 'Slug, nom de l’expéditeur, e-mail, message…',
  'admin.reports.col.received': 'Reçu le',
  'admin.reports.col.drone': 'Drone',
  'admin.reports.col.finder': 'Expéditeur',
  'admin.reports.col.message': 'Message',
  'admin.reports.col.location': 'Position',
  'admin.reports.col.read': 'Lu',

  'admin.plans.title': 'Offres et tarifs',
  'admin.plans.subtitle': 'Configurez les prix de chaque type d’emplacement. Les tarifs sont repris par la page marketing et le tableau de bord utilisateur.',
  'admin.plans.col.label': 'Libellé',
  'admin.plans.col.kind': 'Type d’emplacement',
  'admin.plans.col.price': 'Prix',
  'admin.plans.col.currency': 'Devise',
  'admin.plans.col.active': 'Active',
  'admin.plans.new': 'Nouvelle offre',
  'admin.plans.create.title': 'Créer une offre',
  'admin.plans.edit.title': 'Modifier l’offre',
  'admin.plans.delete.title': 'Supprimer l’offre ?',
  'admin.plans.field.label': 'Libellé affiché',
  'admin.plans.field.description': 'Description',
  'admin.plans.field.kind': 'Type d’emplacement',
  'admin.plans.field.priceCents': 'Prix (en unités mineures, ex. centimes)',
  'admin.plans.field.currency': 'Devise',
  'admin.plans.field.active': 'Active',
  'admin.plans.empty': 'Aucune offre configurée pour l’instant',
  'admin.plans.emptyDesc': 'Créez une offre pour chaque type d’emplacement que vos utilisateurs peuvent acheter.',

  'account.plan.title': 'Votre offre',
  'account.plan.subtitle': 'Quotas inclus dans votre compte. Contactez l’administrateur pour augmenter les limites.',
  'account.plan.empty': 'Votre compte utilise l’offre de base.',
  'account.plan.contactAdmin': 'Contacter l’admin',

  'pwa.appName': 'DroneTag',
  'pwa.appShortName': 'DroneTag',
  'pwa.appDescription': 'Identification numérique et gestion documentaire pour les opérateurs de drones.',
  'pwa.install.cta': 'Installer l’app',
  'pwa.install.dismiss': 'Plus tard',
  'pwa.install.installed': 'DroneTag est installé',

  'billing.title': 'Facturation et abonnement',
  'billing.subtitle': 'Votre offre DroneTag et le récapitulatif de vos enregistrements.',
  'billing.comingSoon': 'Bientôt disponible',
  'billing.comingSoonBody': 'Le paiement en ligne arrive bientôt. En attendant, vous pouvez utiliser DroneTag sans limite ; pour toute question sur les offres et la facturation, contactez le support.',
  'billing.subscribe': 'S’abonner',
  'billing.manageProfile': 'Retour au profil',
  'account.tab.billing': 'Facturation',

  'empty.hints.operator.1': 'Choisissez un titulaire particulier ou entreprise.',
  'empty.hints.operator.2': 'Ajoutez les coordonnées pour les signalements et les communications.',
  'empty.hints.operator.3': 'Définissez un opérateur par défaut pour les nouveaux drones.',
  'empty.hints.drone.1': 'Indiquez le fabricant, le modèle et la classe.',
  'empty.hints.drone.2': 'Choisissez un opérateur par défaut et associez un pilote.',
  'empty.hints.drone.3': 'Statut actif + visibilité publique pour partager le QR.',
  'empty.hints.insurance.1': 'Téléversez le PDF de la police — nom, numéro, dates et drones couverts sont lus automatiquement.',
  'empty.hints.insurance.2': 'Sélectionnez tous les drones couverts — une seule police peut assurer toute la flotte.',
  'empty.hints.certificate.1': 'Téléversez le PDF du certificat — type, organisme émetteur et dates sont lus automatiquement.',
  'empty.hints.certificate.2': 'Vérifiez les données et enregistrez pour voir le badge valide/expiré.',
  'empty.hints.document.1': 'Téléversez tout PDF utile (manuels, déclarations, …).',
  'empty.hints.document.2': 'Les documents restent privés tant que vous ne les publiez pas.',
  'empty.hints.inbox.1': 'Les signalements apparaissent ici lorsqu’une personne scanne votre QR.',
  'empty.hints.inbox.2': 'Répondez directement par e-mail à la personne qui a trouvé votre drone.',

  'pwa.install.success': 'DroneTag installé. Retrouvez son icône sur l’écran d’accueil.',
  'pwa.offline.banner': 'Vous êtes hors ligne — les modifications seront synchronisées à la reconnexion.',
  'pwa.online.toast': 'De retour en ligne.',
  'pwa.iosHint.title': 'Ajoutez DroneTag à l’écran d’accueil de votre iPhone',
  'pwa.iosHint.body': 'Touchez l’icône Partager dans Safari, puis choisissez « Sur l’écran d’accueil » pour lancer l’app en un geste.',

  'error.boundary.title': 'Un problème est survenu sur cet écran.',
  'error.boundary.body': 'La plateforme DroneTag fonctionne normalement — seule cette page n’a pas pu se charger. Réessayez ou revenez à votre tableau de bord.',
  'error.boundary.publicBody': 'Essayez d’actualiser la page. Si le QR ne fonctionne toujours pas, le drone a peut-être été temporairement dépublié par son propriétaire.',
  'error.boundary.adminBody': 'Journal côté serveur ci-dessous. Copiez le digest avant de réessayer pour pouvoir le rapprocher des journaux Firebase.',
  'error.boundary.retry': 'Réessayer',
  'error.boundary.goHome': 'Aller au tableau de bord',
  'error.boundary.goPublic': 'Aller à l’accueil',
  'error.boundary.diagnostics': 'Diagnostic',
  'error.boundary.digest': 'Digest de l’erreur',

  'admin.nav.nfc': 'Outils NFC',
  'admin.nfc.title': 'Outils NFC / QR',
  'admin.nfc.subtitle': 'Générez les URL à encoder sur chaque badge et exportez tout le lot en CSV pour un encodeur NFC externe.',
  'admin.nfc.col.slug': 'Slug',
  'admin.nfc.col.url': 'URL publique',
  'admin.nfc.col.owner': 'Propriétaire',
  'admin.nfc.exportCsv': 'Exporter en CSV',
  'admin.nfc.copyUrl': 'Copier l’URL',
  'admin.nfc.empty': 'Aucun drone public et actif à encoder.',

  // ── Commercial pricing ──
  'nav.pricing': 'Tarifs',
  'pricing.hero.eyebrow': 'Offres et kit NFC',
  'pricing.hero.title': 'Une identité numérique pour chaque vol de drone',
  'pricing.hero.subtitle': 'Choisissez une offre pour particuliers ou pour entreprises. Le kit NFC relie certificats et assurance à un profil public scannable.',
  'pricing.hero.kitNotice': 'Important : le kit NFC est obligatoire pour activer les badges physiques (sauf s’il est inclus dans l’offre).',
  'pricing.toggle.label': 'Clientèle',
  'pricing.toggle.individual': 'Particuliers',
  'pricing.toggle.business': 'Entreprises',
  'pricing.section.individualTitle': 'Offres particuliers',
  'pricing.section.individualSubtitle': 'Abonnement annuel plus le kit NFC requis pour les badges physiques.',
  'pricing.section.businessTitle': 'Offres entreprises',
  'pricing.section.businessSubtitle': 'Abonnement mensuel pour les équipes et les flottes. Kit NFC facturé par opérateur.',
  'pricing.badge.recommended': 'Recommandé',
  'pricing.price.perYear': 'par an',
  'pricing.price.perMonth': 'par mois',
  'pricing.price.onRequest': 'Sur devis',
  'pricing.price.custom': 'Sur mesure pour votre flotte',
  'pricing.kit.mandatoryLabel': 'Kit NFC',
  'pricing.kit.mandatoryPrice': '{amount} — obligatoire',
  'pricing.kit.perOperator': '{amount} par opérateur — obligatoire',
  'pricing.kit.included': 'Inclus dans l’offre',
  'pricing.kit.onRequest': 'Sur demande',
  'pricing.kit.sectionTitle': 'Kit NFC obligatoire',
  'pricing.kit.sectionSubtitle': 'Les badges physiques sont nécessaires pour vérifier certificats et assurance sur le terrain via NFC ou QR.',
  'pricing.kit.mandatoryBanner': 'Le kit NFC est obligatoire',
  'pricing.kit.mandatoryBody': 'Sans le kit, vous pouvez gérer vos documents en numérique, mais vous ne pouvez pas apposer de badges physiques sur l’aéronef ou l’équipement. Chaque kit comprend deux badges.',
  'pricing.kit.item.badge': '1 badge NFC relié à votre profil public DroneTag', // TODO: translate
  'pricing.kit.note': 'Avec Pilot Pro, le kit est inclus dans le prix annuel. Avec les offres entreprises, le kit est facturé une fois par opérateur.',
  'pricing.kit.visual.cert': 'CERT',
  'pricing.kit.visual.ins': 'ASS',
  'pricing.plan.free.name': 'Free',
  'pricing.plan.free.audience': 'Pour commencer',
  'pricing.plan.free.cta': 'Activer gratuitement',
  'pricing.plan.free.f1': 'Profil numérique et téléversement de documents',
  'pricing.plan.free.f2': 'Page publique QR / NFC une fois le kit activé',
  'pricing.plan.free.f3': 'Processus de vérification admin',
  'pricing.plan.pilot.name': 'Pilot',
  'pricing.plan.pilot.audience': 'Pour les pilotes particuliers',
  'pricing.plan.pilot.cta': 'Choisir Pilot',
  'pricing.plan.pilot.f1': 'Espace complet pour vos titres',
  'pricing.plan.pilot.f2': 'Gestion des certificats et assurances',
  'pricing.plan.pilot.f3': 'Profil public vérifié',
  'pricing.plan.pilot.f4': 'Kit NFC à prix préférentiel',
  'pricing.plan.pilotPro.name': 'Pilot Pro',
  'pricing.plan.pilotPro.audience': 'Le plus avantageux pour les pilotes actifs',
  'pricing.plan.pilotPro.cta': 'Choisir Pilot Pro',
  'pricing.plan.pilotPro.f1': 'Tout ce qu’inclut Pilot',
  'pricing.plan.pilotPro.f2': 'Kit NFC inclus',
  'pricing.plan.pilotPro.f3': 'Support prioritaire',
  'pricing.plan.pilotPro.f4': 'Un seul paiement annuel, kit expédié à l’activation',
  'pricing.plan.team.name': 'Team',
  'pricing.plan.team.audience': 'Pour les petites équipes',
  'pricing.plan.team.cta': 'Choisir Team',
  'pricing.plan.team.f1': 'Espace multi-opérateur',
  'pricing.plan.team.f2': 'Documents de flotte partagés',
  'pricing.plan.team.f3': 'Kit NFC par opérateur',
  'pricing.plan.team.f4': 'Facturation mensuelle',
  'pricing.plan.business.name': 'Business',
  'pricing.plan.business.audience': 'Pour les entreprises et les flottes',
  'pricing.plan.business.cta': 'Choisir Business',
  'pricing.plan.business.f1': 'Opérateurs à l’échelle d’une flotte',
  'pricing.plan.business.f2': 'Opérations de vérification avancées',
  'pricing.plan.business.f3': 'Prix préférentiel du kit NFC par opérateur',
  'pricing.plan.business.f4': 'Facturation mensuelle',
  'pricing.plan.enterprise.name': 'Enterprise',
  'pricing.plan.enterprise.audience': 'Déploiements sur mesure',
  'pricing.plan.enterprise.cta': 'Nous contacter',
  'pricing.plan.enterprise.f1': 'Limites et accompagnement sur mesure',
  'pricing.plan.enterprise.f2': 'Support dédié',
  'pricing.plan.enterprise.f3': 'Kit NFC sur devis',
  'pricing.card.seeCheckout': 'Passer à la commande',
  'pricing.summary.title': 'Ce que vous payez',
  'pricing.summary.subtitle': 'Distinction claire entre l’abonnement et le kit NFC, payé une seule fois.',
  'pricing.summary.sub.title': 'Abonnement',
  'pricing.summary.sub.body': 'Annuel pour les particuliers, mensuel pour les offres entreprises. Couvre la plateforme numérique.',
  'pricing.summary.kit.title': 'Kit NFC',
  'pricing.summary.kit.body': 'Badges physiques obligatoires (certificats + assurance). Inclus uniquement avec Pilot Pro.',
  'pricing.summary.renew.title': 'Renouvellement',
  'pricing.summary.renew.body': 'Après la première période, vous ne renouvelez que l’abonnement — le kit est un achat unique, sauf si vous ajoutez des opérateurs.',
  'pricing.faq.title': 'FAQ',
  'pricing.faq.subtitle': 'Réponses rapides avant d’activer une offre.',
  'pricing.faq.kit.q': 'Le kit NFC est-il obligatoire ?',
  'pricing.faq.kit.a': 'Oui. Toutes les offres nécessitent le kit pour l’envoi des badges physiques, sauf Pilot Pro, où il est inclus dans le prix annuel. Les offres entreprises facturent le kit une fois par opérateur.',
  'pricing.faq.pilotPro.q': 'Pourquoi Pilot Pro est-il recommandé ?',
  'pricing.faq.pilotPro.a': 'Pilot Pro réunit l’abonnement annuel et le kit NFC en un seul paiement (139 €) : le total initial correspond donc à l’abonnement.',
  'pricing.faq.team.q': 'Combien d’opérateurs puis-je ajouter avec Team / Business ?',
  'pricing.faq.team.a': 'Team est conçu pour les petits groupes d’opérateurs, Business pour les entreprises et les flottes. Pour des besoins spécifiques, contactez-nous : nous préparerons une offre sur mesure.',
  'pricing.faq.payment.q': 'Comment payer ?',
  'pricing.faq.payment.a': 'Le paiement en ligne sera bientôt disponible. En attendant, envoyez votre demande depuis la page de commande : nous vous recontacterons pour finaliser l’activation.',
  'pricing.faq.change.q': 'Puis-je changer d’offre plus tard ?',
  'pricing.faq.change.a': 'Oui : écrivez-nous via le support et nous mettrons votre offre à jour.',
  'pricing.ctaFinal.title': 'Prêt à activer DroneTag ?',
  'pricing.ctaFinal.subtitle': 'Commencez avec Pilot Pro (kit inclus) ou contactez-nous pour Enterprise.',
  'pricing.ctaFinal.primary': 'Choisir Pilot Pro',
  'pricing.ctaFinal.secondary': 'Contacter un commercial',
  'pricing.ctaFinal.backHome': 'Retour à l’accueil',
  'pricing.checkout.eyebrow': 'Commande',
  'pricing.checkout.title': 'Confirmez votre offre',
  'pricing.checkout.subtitle': 'Les montants sont calculés sur le serveur à partir de la grille tarifaire officielle. Aucune donnée de carte n’est collectée pour l’instant.',
  'pricing.checkout.paymentInactive': 'Paiement pas encore actif',
  'pricing.checkout.plan': 'Offre sélectionnée',
  'pricing.checkout.changePlan': 'Changer d’offre',
  'pricing.checkout.customerType': 'Type de client',
  'pricing.checkout.private': 'Particulier',
  'pricing.checkout.company': 'Entreprise',
  'pricing.checkout.operators': 'Opérateurs',
  'pricing.checkout.kits': 'Badges NFC',  // TODO: translate
  'pricing.checkout.kitsHint': 'Un badge NFC par télépilote. Apposé sur un drone, le badge ouvre la page publique DroneTag de ce drone.',
  'pricing.checkout.billing': 'Informations de facturation',
  'pricing.checkout.fullName': 'Nom complet',
  'pricing.checkout.email': 'E-mail',
  'pricing.checkout.companyName': 'Raison sociale',
  'pricing.checkout.vat': 'N° TVA / identifiant fiscal',
  'pricing.checkout.address': 'Adresse',
  'pricing.checkout.city': 'Ville',
  'pricing.checkout.postalCode': 'Code postal',
  'pricing.checkout.country': 'Pays',
  'pricing.checkout.terms': 'J’accepte les conditions d’utilisation et la politique de confidentialité pour cette demande commerciale.',
  'pricing.checkout.summary': 'Récapitulatif des coûts',
  'pricing.checkout.line.subscription': 'Abonnement',
  'pricing.checkout.line.kit': 'Kit NFC',
  'pricing.checkout.line.operators': 'Opérateurs',
  'pricing.checkout.line.initial': 'Total initial',
  'pricing.checkout.line.recurring': 'Prochain renouvellement',
  'pricing.checkout.summaryNote': 'Total initial = première période d’abonnement + kit NFC (s’il n’est pas inclus). Le renouvellement ne concerne que l’abonnement.',
  'pricing.checkout.quoteOnly': 'Enterprise est sur devis. Envoyez le formulaire et notre équipe vous contactera.',
  'pricing.checkout.submit': 'Envoyer la demande',
  'pricing.checkout.submitQuote': 'Demander un devis',
  'pricing.checkout.backPricing': 'Retour aux tarifs',
  'pricing.checkout.requestId': 'ID de la demande',
  'pricing.checkout.success.title': 'Demande reçue',
  'pricing.checkout.success.body': 'Nous avons enregistré votre demande commerciale. Le paiement en ligne sera activé dans une prochaine version.',
  'pricing.checkout.error.generic': 'Une erreur est survenue. Veuillez réessayer.',
  'pricing.checkout.error.terms_required': 'Veuillez accepter les conditions.',
  'pricing.checkout.error.billing_incomplete': 'Veuillez compléter les informations de facturation.',
  'pricing.checkout.error.company_required': 'La raison sociale est obligatoire.',
  'pricing.checkout.error.unknown_plan': 'Offre inconnue.',
  'pricing.checkout.error.customer_type_mismatch': 'Le type de client ne correspond pas à cette offre.',
  'pricing.checkout.error.invalid_operatorCount': 'Nombre d’opérateurs non valide.',
  'pricing.checkout.error.invalid_kitQuantity': 'Quantité de kits non valide.',
  'login.forgotPassword': 'Mot de passe oublié ?', // TODO: translate
  'forgot.title': 'Réinitialisez votre mot de passe', // TODO: translate
  'forgot.subtitle': 'Saisissez l’adresse e-mail associée à votre compte DroneTag et nous vous enverrons un lien de réinitialisation.', // TODO: translate
  'forgot.email': 'Adresse e-mail', // TODO: translate
  'forgot.submit': 'Envoyer le lien', // TODO: translate
  'forgot.sending': 'Envoi en cours…', // TODO: translate
  'forgot.backToLogin': 'Retour à la connexion', // TODO: translate
  'forgot.sent.title': 'Consultez votre boîte de réception', // TODO: translate
  'forgot.sent.body': 'Si un compte existe pour cette adresse, un lien de réinitialisation du mot de passe est en route. Le lien expire rapidement.', // TODO: translate
  'forgot.sent.resend': 'Renvoyer', // TODO: translate
  'forgot.error.generic': 'Impossible de traiter votre demande pour le moment. Veuillez réessayer dans quelques instants.', // TODO: translate
  'forgot.error.invalidEmail': 'Saisissez une adresse e-mail valide.', // TODO: translate
  'links.nfcEncodeLabel': 'Écrivez cette URL sur le badge', // TODO: translate
  'links.nfcInstructions': 'Utilisez n’importe quelle app d’écriture NFC (par exemple NFC Tools sur Android ou iOS) et écrivez l’URL ci-dessus sous forme d’enregistrement NDEF de type URI. Il suffira ensuite d’approcher un smartphone du badge pour ouvrir ce profil public.', // TODO: translate
  'links.nfcNotReady': 'Publiez ce profil et attribuez-lui un slug pour générer l’URL à écrire sur le badge.', // TODO: translate
  'common.dismiss': 'Fermer', // TODO: translate
  'admin.verify.notifyWarning': 'La décision a été enregistrée, mais l’e-mail n’a pas pu être envoyé à l’utilisateur ({reason}). Il peut tout de même voir la mise à jour dans sa conversation de support.', // TODO: translate
  'support.newTicket': 'Nouvelle demande', // TODO: translate
  'support.subject': 'Objet', // TODO: translate
  'support.subjectPlaceholder': 'En quoi pouvons-nous vous aider ?', // TODO: translate
  'support.message': 'Message', // TODO: translate
  'support.messagePlaceholder': 'Décrivez votre demande…', // TODO: translate
  'support.reply': 'Répondre', // TODO: translate
  'support.emptyHint': 'Ouvrez une demande et l’équipe DroneTag vous répondra ici.', // TODO: translate
  'support.status.pending': 'Réponse reçue', // TODO: translate
  'support.close': 'Clôturer la demande', // TODO: translate
  'support.reopen': 'Rouvrir', // TODO: translate
  'support.team': 'Support DroneTag', // TODO: translate
  'support.error.send': 'Impossible d’envoyer votre message. Veuillez réessayer.', // TODO: translate
  'support.error.load': 'Impossible de charger votre conversation avec le support.', // TODO: translate
  'onboarding.title': 'Complétez votre profil DroneTag', // TODO: translate
  'onboarding.subtitle': 'Quelques étapes pour rendre votre drone identifiable et préparer votre badge.', // TODO: translate
  'onboarding.progress': '{done} of {total}', // TODO: translate
  'onboarding.step.profile': 'Votre profil', // TODO: translate
  'onboarding.step.profile.hint': 'Ajoutez votre nom pour être identifié sur votre profil public.', // TODO: translate
  'onboarding.step.operator': 'Opérateur UAS', // TODO: translate
  'onboarding.step.operator.hint': 'Enregistrez la personne ou l’organisation responsable des opérations.', // TODO: translate
  'onboarding.step.drone': 'Votre drone', // TODO: translate
  'onboarding.step.drone.hint': 'Ajoutez l’aéronef que vous souhaitez identifier.', // TODO: translate
  'onboarding.step.certificate': 'Certificat de pilote', // TODO: translate
  'onboarding.step.certificate.hint': 'Téléversez votre certificat de télépilote pour vérification.', // TODO: translate
  'onboarding.step.insurance': 'Assurance', // TODO: translate
  'onboarding.step.insurance.hint': 'Téléversez votre police pour afficher publiquement sa validité.', // TODO: translate
  'onboarding.step.public': 'Profil public', // TODO: translate
  'onboarding.step.public.hint': 'Publiez un drone pour obtenir sa page publique DroneTag.', // TODO: translate
  'onboarding.step.badge': 'Lien pour votre badge NFC', // TODO: translate
  'onboarding.step.badge.hint': 'Obtenez le lien public à écrire sur votre badge.', // TODO: translate
  'legal.draft.badge': 'Brouillon', // TODO: translate
  'legal.draft.bannerTitle': 'Texte provisoire — non relu par un avocat', // TODO: translate
  'legal.draft.bannerBody': 'Cette page est un brouillon de travail rédigé par l’équipe DroneTag pour permettre l’examen de la structure du document. Elle n’est pas en vigueur, ne constitue pas un conseil juridique et ne crée aucun droit ni aucune obligation pour vous ou pour nous. Un avocat qualifié devra relire et remplacer ce texte avant l’ouverture de DroneTag à de vrais utilisateurs.', // TODO: translate
  'legal.draft.lastUpdated': 'Brouillon modifié pour la dernière fois le {date}. Aucune version de ce document n’est encore en vigueur.', // TODO: translate
  'legal.contact.title': 'Qui contacter', // TODO: translate
  'legal.contact.body': 'Vos questions sur ce brouillon, ou sur les données que DroneTag détient à votre sujet, peuvent être envoyées à info@drone-tag.com. Le document définitif indiquera la société qui exploite le service, son siège social et un contact dédié aux demandes relatives aux données. Rien de tout cela n’est encore arrêté : ces éléments sont donc omis plutôt qu’inventés.', // TODO: translate
  'legal.related.title': 'Autres documents provisoires', // TODO: translate
  'home.footer.cookies': 'Cookies', // TODO: translate
  'legal.privacy.title': 'Politique de confidentialité', // TODO: translate
  'legal.privacy.subtitle': 'Ce que DroneTag conserve à votre sujet, ce qu’un inconnu voit en approchant votre badge NFC, et ce qui reste privé.', // TODO: translate
  'legal.privacy.who.title': 'Qui exploite ce service', // TODO: translate
  'legal.privacy.who.body': 'Cette section indiquera l’entité juridique qui exploite DroneTag et décide de l’usage de vos données, son siège social et la personne à contacter au sujet des données. Cette entité n’a pas encore été déterminée : rien n’est donc indiqué ici. Sur le plan technique, le service s’appuie sur Google Firebase pour l’authentification, la base de données et le stockage des fichiers, et il est déployé sur Netlify.', // TODO: translate
  'legal.privacy.collect.title': 'Données collectées par DroneTag', // TODO: translate
  'legal.privacy.collect.body': 'Le compte lui-même contient une adresse e-mail, un numéro de téléphone, un nom ou une raison sociale, une adresse postale et, pour les comptes de particuliers, une date de naissance. La fiche pilote ajoute la nationalité, un code opérateur, un numéro de licence et un contact d’urgence. Les fiches opérateur reprennent le nom ou la raison sociale, l’adresse, l’e-mail et, pour les entreprises, un numéro de TVA ou d’immatriculation. Les fiches drone contiennent le fabricant, le modèle, la classe UE, le numéro de série gravé sur l’aéronef et le numéro de série de la radiocommande. Les fichiers téléversés — polices d’assurance, certificats, autorisations et pièces d’identité — sont conservés tels que vous les fournissez : ils contiennent donc tout ce que contiennent ces documents.', // TODO: translate
  'legal.privacy.why.title': 'Pourquoi ces données sont collectées', // TODO: translate
  'legal.privacy.why.body': 'Les données de compte et de contact servent à vous connecter, à vous envoyer des notifications et à répondre aux demandes de support. Les données de pilote, d’opérateur, de drone et de documents existent pour que vous puissiez regrouper vos documents de conformité au même endroit et, si vous le souhaitez, en présenter un résumé vérifiable à un tiers. Les données de paiement et de commande servent à expédier les badges NFC et à traiter les achats d’offres. La version définitive de cette section devra indiquer une base légale pour chaque finalité ; c’est une question pour un avocat, et aucune base n’est avancée ici.', // TODO: translate
  'legal.privacy.public.title': 'Ce qui est visible sur votre page publique', // TODO: translate
  'legal.privacy.public.body': 'Un drone publié obtient une page à l’adresse /u/ suivie de son slug, et toute personne disposant du lien ou du badge peut l’ouvrir sans se connecter. Cette page lit un seul enregistrement épuré et n’affiche que le nom du titulaire (votre nom de pilote, votre nom en tant qu’opérateur particulier ou votre raison sociale), le fabricant, le modèle, la classe UE, le numéro de série gravé sur le drone, le statut de l’assurance et l’assureur, la date d’expiration de la police, un numéro de police masqué dont seuls les trois premiers et les trois derniers caractères restent visibles, le badge de vérification avec sa date, ainsi que la photo de profil, le logo ou la bannière que vous avez éventuellement téléversés pour la personnalisation.', // TODO: translate
  'legal.privacy.notPublic.title': 'Ce qui n’est volontairement pas publié', // TODO: translate
  'legal.privacy.notPublic.body': 'L’enregistrement public ne contient pas le PDF de l’assurance, votre adresse postale, votre adresse e-mail, votre numéro de téléphone, votre date de naissance, votre numéro de TVA ou d’immatriculation, le numéro de série de la radiocommande, votre contact d’urgence, les notes internes, ni l’identifiant de compte qui permettrait de relier la page à vous. Cela est imposé par le code et non par simple convention : la page publique ne lit que l’instantané épuré, et les champs ci-dessus n’y sont jamais écrits. Le seul identifiant interne présent est celui de la fiche drone, utilisé pour maintenir l’instantané aligné sur l’enregistrement privé.', // TODO: translate
  'legal.privacy.sharing.title': 'Qui d’autre peut y accéder', // TODO: translate
  'legal.privacy.sharing.body': 'DroneTag ne vend pas vos données. Elles sont traitées par les fournisseurs dont l’application dépend réellement : Google Firebase héberge l’authentification, la base de données et les fichiers téléversés ; Netlify héberge et diffuse l’application et conserve les journaux de requêtes ; Resend envoie les e-mails transactionnels, comme les codes d’inscription et les notifications. Le personnel DroneTag disposant d’un compte administrateur peut consulter vos enregistrements afin d’examiner les documents et de répondre aux demandes de support. La version définitive devra lister chaque fournisseur, le lieu où il traite les données et le contrat conclu avec lui.', // TODO: translate
  'legal.privacy.retention.title': 'Durée de conservation', // TODO: translate
  'legal.privacy.retention.body': 'Il n’existe aujourd’hui aucune suppression automatique. Les enregistrements et les fichiers téléversés sont conservés jusqu’à ce que vous les supprimiez ou demandiez à DroneTag de les supprimer, et les signalements envoyés par une personne ayant trouvé votre drone restent dans votre boîte de réception jusqu’à leur suppression. Fixer de véritables durées de conservation — notamment pour les documents d’assurance et les certificats, qui devront peut-être être conservés pendant un certain temps après leur expiration — reste une question ouverte pour un avocat et n’est pas tranché ici.', // TODO: translate
  'legal.privacy.requests.title': 'Demander à consulter, corriger ou supprimer vos données', // TODO: translate
  'legal.privacy.requests.body': 'Vous pouvez modifier la plupart de vos données depuis l’espace compte, bien que certains champs d’identité soient verrouillés une fois confirmés, afin qu’un profil publié ne puisse pas être réécrit discrètement. Pour tout ce que vous ne pouvez pas modifier vous-même, y compris la suppression de votre compte, écrivez à info@drone-tag.com : la demande est traitée manuellement. Il n’existe encore ni export en libre-service ni suppression automatisée. Cette politique ne se prononce pas sur les droits légaux qui vous sont applicables ; cela doit être établi par un avocat.', // TODO: translate
  'legal.privacy.security.title': 'Comment les données sont protégées', // TODO: translate
  'legal.privacy.security.body': 'Les enregistrements privés ne sont lisibles que par leur propriétaire et par les administrateurs DroneTag, ce qui est imposé par les règles de sécurité Firebase et pas seulement par l’application. Les documents téléversés se trouvent dans un espace de stockage privé, illisible sans authentification, séparé du petit espace public qui ne contient que les images de personnalisation. Les journaux du serveur passent par un filtre qui remplace des valeurs comme les adresses e-mail, les numéros de téléphone et les numéros de police avant toute écriture. Aucun système n’est à l’abri d’une compromission : il s’agit d’une description de la conception actuelle, et non d’une garantie.', // TODO: translate
  'legal.privacy.changes.title': 'Modifications de ce brouillon', // TODO: translate
  'legal.privacy.changes.body': 'Ce brouillon évoluera au fil du développement du produit et de sa revue juridique. Lorsqu’une version relue le remplacera, le bandeau « brouillon » en haut de cette page sera retiré et une véritable date d’entrée en vigueur apparaîtra à sa place.', // TODO: translate
  'pricing.kit.visual.badge': 'DRONETAG', // TODO: translate
  'legal.terms.title': 'Conditions d’utilisation', // TODO: translate
  'legal.terms.subtitle': 'Les règles qui encadreront l’utilisation de DroneTag, rédigées pour pouvoir être examinées. Rien de ce qui suit n’est encore contraignant.', // TODO: translate
  'legal.terms.what.title': 'Ce qu’est DroneTag, et ce qu’il n’est pas', // TODO: translate
  'legal.terms.what.body': 'DroneTag est une plateforme privée qui permet de conserver les documents de votre drone et, si vous le souhaitez, d’en publier un bref résumé à une adresse publique accessible depuis un badge NFC ou un code QR. Ce n’est ni une autorité aéronautique ni un registre public, et DroneTag ne délivre, ne valide ni ne renouvelle aucun document officiel. Un profil DroneTag ne remplace pas l’enregistrement auprès d’une autorité compétente, un certificat de pilote, une police d’assurance ni aucune autorisation nécessaire pour voler.', // TODO: translate
  'legal.terms.eligibility.title': 'Qui peut ouvrir un compte', // TODO: translate
  'legal.terms.eligibility.body': 'La version définitive indiquera un âge minimum et précisera si un compte peut être ouvert au nom d’une entreprise par une personne habilitée. Aujourd’hui, le formulaire d’inscription demande un prénom et un nom, une adresse e-mail, un numéro de téléphone et un mot de passe, mais vous pouvez aussi vous inscrire avec un compte Google ; l’adresse e-mail ou le numéro de téléphone est ensuite confirmé par un code à usage unique. Il n’y a aucune vérification de l’âge.', // TODO: translate
  'legal.terms.account.title': 'Votre compte et vos identifiants', // TODO: translate
  'legal.terms.account.body': 'Vous êtes responsable de la sécurité de l’accès à votre compte et de ce qui y est fait. Écrivez à info@drone-tag.com si vous pensez qu’une autre personne y a accès. Les administrateurs DroneTag peuvent consulter les enregistrements de votre compte afin d’examiner les documents que vous soumettez à vérification et de répondre aux demandes de support.', // TODO: translate
  'legal.terms.content.title': 'Les documents et données que vous téléversez', // TODO: translate
  'legal.terms.content.body': 'Vous restez propriétaire de tout ce que vous téléversez. Vous n’accordez à DroneTag que ce qui est nécessaire au fonctionnement du service : stocker vos fichiers, vous les afficher, permettre à un administrateur de les examiner et publier le bref résumé décrit dans la politique de confidentialité lorsque vous choisissez de publier un drone. Vous êtes responsable de l’exactitude de ce que vous saisissez et du droit de le téléverser, en particulier pour les documents qui mentionnent une autre personne que vous.', // TODO: translate
  'legal.terms.publication.title': 'Publier le profil d’un drone', // TODO: translate
  'legal.terms.publication.body': 'La publication relève de votre décision et se fait drone par drone. Une fois publiée, la page peut être consultée par toute personne qui en connaît l’adresse ; elle n’est pas protégée par une connexion et aucun journal des visites n’est tenu. La dépublication supprime l’enregistrement public, si bien que l’adresse cesse de fonctionner, mais DroneTag ne peut pas récupérer les pages déjà enregistrées, mises en cache ou partagées par d’autres. La version définitive devra préciser le délai dans lequel la dépublication prend effet.', // TODO: translate
  'legal.terms.verification.title': 'Ce que signifie le badge de vérification', // TODO: translate
  'legal.terms.verification.body': 'Un badge « vérifié » signifie qu’un administrateur DroneTag a examiné les documents du compte et les a jugés cohérents. Ce n’est pas une approbation d’une autorité, cela n’indique pas que le vol que vous vous apprêtez à effectuer est légal, et cela ne garantit pas que la police d’assurance couvrira un sinistre. Toute personne qui se fie à une page DroneTag doit la considérer comme un point de départ et demander les documents originaux lorsque c’est important.', // TODO: translate
  'legal.terms.plans.title': 'Offres, badges et paiement', // TODO: translate
  'legal.terms.plans.body': 'Chaque compte comprend un petit quota de drones, d’opérateurs, de certificats et de documents, et des quotas plus importants peuvent être achetés. Les badges NFC sont des biens physiques fabriqués et expédiés. Les prix, périodes de facturation, renouvellements, remboursements et conditions de livraison ne sont pas arrêtés et ne sont volontairement pas indiqués ici : la page des tarifs présente les prix actuellement envisagés, et non une offre contractuelle.', // TODO: translate
  'legal.terms.availability.title': 'Disponibilité pendant la pré-bêta', // TODO: translate
  'legal.terms.availability.body': 'DroneTag n’est pas terminé. Les fonctionnalités peuvent changer ou être supprimées, les données peuvent être migrées et le service peut être indisponible sans préavis. N’utilisez pas DroneTag comme seule copie d’un document dont vous avez besoin — conservez vos originaux. Aucun engagement de disponibilité n’est proposé à ce stade.', // TODO: translate
  'legal.terms.suspension.title': 'Suspension et clôture d’un compte', // TODO: translate
  'legal.terms.suspension.body': 'La version définitive décrira dans quels cas DroneTag peut suspendre ou clôturer un compte, par exemple en cas de téléversement des documents d’une autre personne ou de présentation trompeuse d’un statut de vérification, ainsi que le préavis applicable. Aujourd’hui, vous pouvez demander la clôture de votre compte en écrivant à info@drone-tag.com ; la demande est traitée manuellement et il n’y a pas de suppression automatisée.', // TODO: translate
  'legal.terms.liability.title': 'Responsabilité', // TODO: translate
  'legal.terms.liability.body': 'C’est la section qui nécessite le plus l’intervention d’un avocat ; aucune formulation n’est donc proposée. Elle devra préciser ce dont DroneTag est responsable, ce dont il n’est pas responsable et ce qui se passe si une page publique affiche des informations obsolètes ou inexactes. Rien sur cette page ne limite aujourd’hui une quelconque responsabilité, car rien sur cette page n’est en vigueur.', // TODO: translate
  'legal.terms.law.title': 'Droit applicable et litiges', // TODO: translate
  'legal.terms.law.body': 'Le droit applicable et le tribunal compétent dépendent du lieu d’établissement de la société exploitante et de celui de ses utilisateurs, et aucun des deux n’est arrêté. Un avocat devra compléter cette section. Aucune juridiction n’est indiquée ici.', // TODO: translate
  'legal.terms.changes.title': 'Modifications de ces conditions provisoires', // TODO: translate
  'legal.terms.changes.body': 'Ce brouillon changera sans préavis pendant le développement du produit. Lorsqu’une version relue le remplacera, le bandeau « brouillon » sera retiré, une véritable date d’entrée en vigueur apparaîtra et la version définitive décrira comment les modifications futures seront annoncées.', // TODO: translate
  'legal.cookies.title': 'Cookies et stockage dans le navigateur', // TODO: translate
  'legal.cookies.subtitle': 'Ce que DroneTag enregistre aujourd’hui dans votre navigateur, pourquoi, et ce qui n’est pas enregistré.', // TODO: translate
  'legal.cookies.scope.title': 'Ce que couvre cette page', // TODO: translate
  'legal.cookies.scope.body': 'Les cookies ne sont qu’une partie du tableau. DroneTag utilise aussi le stockage local du navigateur, et la bibliothèque d’authentification Firebase conserve son propre état de connexion dans le navigateur. Cette page les décrit tous ensemble car, de votre point de vue, il s’agit de la même chose : des données que ce site laisse sur votre appareil.', // TODO: translate
  'legal.cookies.essential.title': 'Cookies déposés', // TODO: translate
  'legal.cookies.essential.body': 'Deux cookies sont utilisés, tous deux pour la connexion et tous deux limités à ce site. Le premier est déposé par le serveur une fois votre jeton de connexion vérifié, ne peut pas être lu par les scripts de la page et expire au bout d’une heure. Le second est déposé par la page elle-même afin que le même jeton soit disponible pour le code qui protège l’espace d’administration, et expire au bout de cinquante-cinq minutes. Tous deux sont effacés lorsque vous vous déconnectez. Aucun cookie publicitaire ou de suivi n’est déposé.', // TODO: translate
  'legal.cookies.storage.title': 'Ce qui est conservé dans le stockage du navigateur', // TODO: translate
  'legal.cookies.storage.body': 'Votre choix de thème et votre choix de langue sont enregistrés dans le stockage local sous les noms dronetag-theme et dronetag-language, afin que la visite suivante n’affiche pas brièvement les mauvaises couleurs ou la mauvaise langue. La bibliothèque d’authentification Firebase conserve aussi son propre état de connexion dans le navigateur, ce qui vous permet de rester connecté d’une visite à l’autre. Effacer les données du site supprime tout cela et vous déconnecte.', // TODO: translate
  'legal.cookies.analytics.title': 'Statistiques d’utilisation', // TODO: translate
  'legal.cookies.analytics.body': 'Aucun fournisseur de statistiques ou de publicité n’est connecté. L’application contient une couche interne d’événements, avec une liste courte et fermée d’événements, qui, en l’état actuel, écrit uniquement dans la console du navigateur pendant le développement. Si un fournisseur est ajouté ultérieurement, cette page et la politique de confidentialité devront être mises à jour avant son activation.', // TODO: translate
  'legal.cookies.thirdParty.title': 'Données déposées par d’autres services', // TODO: translate
  'legal.cookies.thirdParty.body': 'La connexion avec Google ouvre une procédure gérée par Google, qui peut déposer ses propres cookies sur ses propres domaines pendant cette étape ; ceux-ci relèvent des conditions de Google et non de cette page. L’application est diffusée via Netlify, qui enregistre des journaux de requêtes ordinaires. La version définitive de cette page devra lister tout autre composant tiers qui atteint le navigateur.', // TODO: translate
  'legal.cookies.consent.title': 'Consentement', // TODO: translate
  'legal.cookies.consent.body': 'Le produit ne comporte aujourd’hui ni bandeau cookies ni mécanisme de consentement. Savoir si l’un d’eux est requis, et pour lesquels des éléments ci-dessus, est une question pour un avocat. Cette page n’affirme pas que le fonctionnement actuel est suffisant ; elle le décrit pour que la décision puisse être prise sur des faits exacts.', // TODO: translate
  'legal.cookies.control.title': 'Comment les supprimer', // TODO: translate
  'legal.cookies.control.body': 'La déconnexion efface les deux cookies de connexion. Effacer les données du site pour ce domaine dans les paramètres de votre navigateur supprime tout ce qui est listé ci-dessus, y compris le thème et la langue enregistrés. Bloquer complètement les cookies empêchera la connexion, car le jeton de connexion n’aurait nulle part où être conservé.', // TODO: translate
  'legal.cookies.changes.title': 'Modifications de ce brouillon', // TODO: translate
  'legal.cookies.changes.body': 'Cette liste reflète le fonctionnement de l’application à la date indiquée ci-dessus et sera revérifiée par rapport au code à chaque changement. Lorsqu’une version relue remplacera ce brouillon, le bandeau en haut de page sera retiré.', // TODO: translate
  'nav.preview': 'Aperçu', // TODO: translate
  'account.nav.section.fleet': 'Flotte', // TODO: translate
  'account.nav.section.compliance': 'Conformité', // TODO: translate
  'consent.title': 'Rendre ce profil public ?', // TODO: translate
  'consent.description': 'Toute personne disposant du lien pourra le consulter, sans se connecter.', // TODO: translate
  'consent.warning': 'Un profil DroneTag public peut être consulté par toute personne qui scanne le badge ou ouvre le lien. Il n’est pas traité comme une page privée et ne nécessite aucune connexion.', // TODO: translate
  'consent.urlLabel': 'Adresse publique', // TODO: translate
  'consent.sharedTitle': 'Ce qui sera visible', // TODO: translate
  'consent.withheldTitle': 'Ce qui reste privé', // TODO: translate
  'consent.shared.name': 'Votre nom, ou le nom de votre opérateur ou de votre entreprise', // TODO: translate
  'consent.shared.drone': 'Fabricant, modèle et classe du drone', // TODO: translate
  'consent.shared.serial': 'Le numéro de série gravé sur le drone', // TODO: translate
  'consent.shared.certStatus': 'La validité de votre certificat de pilote', // TODO: translate
  'consent.shared.insuranceStatus': 'La validité de votre assurance et son statut', // TODO: translate
  'consent.shared.insuranceProvider': 'Le nom de votre assureur', // TODO: translate
  'consent.shared.insuranceExpiry': 'La date d’expiration de l’assurance', // TODO: translate
  'consent.shared.maskedPolicy': 'Un numéro de police masqué, dont seuls les premiers et derniers caractères sont visibles', // TODO: translate
  'consent.shared.verification': 'Le statut de vérification DroneTag du profil', // TODO: translate
  'consent.withheld.policyPdf': 'Le document de la police d’assurance lui-même', // TODO: translate
  'consent.withheld.address': 'Votre adresse personnelle ou votre siège social', // TODO: translate
  'consent.withheld.email': 'Votre adresse e-mail', // TODO: translate
  'consent.withheld.phone': 'Votre numéro de téléphone', // TODO: translate
  'consent.withheld.fullPolicy': 'Le numéro de police complet, non masqué', // TODO: translate
  'consent.withheld.ids': 'Les identifiants de compte et les ID internes des enregistrements', // TODO: translate
  'consent.checkbox': 'Je comprends que ce profil sera visible publiquement et je souhaite le publier.', // TODO: translate
  'consent.confirm': 'Publier le profil', // TODO: translate
  'consent.revocable': 'Vous pouvez rendre le profil à nouveau privé à tout moment. Une fois le profil dépublié, la page publique cesse de fonctionner, mais les personnes qui l’ont déjà ouverte peuvent en avoir conservé une copie.', // TODO: translate
  'form.created': 'Profil créé', // TODO: translate
  'links.copiedToast': 'Lien public copié dans le presse-papiers', // TODO: translate
  'links.copyFailed': 'Impossible de copier le lien. Sélectionnez-le et copiez-le manuellement.', // TODO: translate
  'support.sent': 'Message envoyé au support DroneTag', // TODO: translate
  'signup.terms.prefix': 'J’ai lu et j’accepte les', // TODO: translate
  'signup.terms.termsLink': 'Conditions d’utilisation', // TODO: translate
  'signup.terms.and': 'et la', // TODO: translate
  'signup.terms.privacyLink': 'Politique de confidentialité', // TODO: translate
  'signup.terms.required': 'Acceptez les Conditions et la Politique de confidentialité pour continuer.', // TODO: translate
  'signup.terms.googleHint': 'Acceptez les Conditions et la Politique de confidentialité ci-dessus avant de vous inscrire avec Google.', // TODO: translate
  'account.delete.title': 'Demander la suppression du compte', // TODO: translate
  'account.delete.body': 'La suppression n’est pas automatique. L’ouverture d’une demande de support enregistre votre souhait de clôturer le compte. Un administrateur DroneTag la traitera manuellement. Vos profils publics restent visibles jusque-là.', // TODO: translate
  'account.delete.cta': 'Ouvrir une demande de suppression', // TODO: translate
  'drone.publish': 'Publier le profil', // TODO: translate
  'drone.unpublish': 'Dépublier', // TODO: translate
  'drone.publish.success': 'Le profil public est maintenant en ligne.', // TODO: translate
  'drone.unpublish.success': 'Le profil public a été dépublié.', // TODO: translate
  'toast.certificate.created': 'Certificat ajouté.', // TODO: translate
  'toast.certificate.deleted': 'Certificat supprimé.', // TODO: translate
  'toast.certificate.deleteFailed': 'Impossible de supprimer le certificat. Veuillez réessayer.', // TODO: translate
  'toast.insurance.created': 'Police d’assurance ajoutée.', // TODO: translate
  'toast.insurance.deleted': 'Police d’assurance supprimée.', // TODO: translate
  'toast.insurance.deleteFailed': 'Impossible de supprimer la police. Veuillez réessayer.', // TODO: translate
  'toast.document.created': 'Document téléversé.', // TODO: translate
  'toast.document.updated': 'Document mis à jour.', // TODO: translate
  'toast.document.deleted': 'Document supprimé.', // TODO: translate
  'toast.document.deleteFailed': 'Impossible de supprimer le document. Veuillez réessayer.', // TODO: translate
  'toast.permit.created': 'Autorisation ajoutée.', // TODO: translate
  'toast.permit.updated': 'Autorisation mise à jour.', // TODO: translate
  'toast.permit.deleted': 'Autorisation supprimée.', // TODO: translate
  'toast.permit.deleteFailed': 'Impossible de supprimer l’autorisation. Veuillez réessayer.', // TODO: translate
  'toast.operator.created': 'Opérateur UAS ajouté.', // TODO: translate
  'toast.operator.updated': 'Opérateur UAS mis à jour.', // TODO: translate
  'toast.operator.deleted': 'Opérateur UAS supprimé.', // TODO: translate
  'toast.operator.deleteFailed': 'Impossible de supprimer l’opérateur UAS. Veuillez réessayer.', // TODO: translate
  'toast.operator.setCurrent': 'Opérateur UAS par défaut mis à jour.', // TODO: translate
  'toast.drone.created': 'Drone ajouté.', // TODO: translate
  'toast.drone.saved': 'Données du drone enregistrées.', // TODO: translate
  'toast.drone.deleted': 'Drone supprimé.', // TODO: translate
  'toast.drone.deleteFailed': 'Impossible de supprimer le drone. Veuillez réessayer.', // TODO: translate
  'toast.archive.deleted': 'Élément supprimé définitivement.', // TODO: translate
  'toast.archive.deleteFailed': 'Impossible de supprimer l’élément. Veuillez réessayer.', // TODO: translate
  'toast.verify.approved': 'Marqué comme vérifié.', // TODO: translate
  'toast.verify.rejected': 'Marqué comme refusé.', // TODO: translate
  'toast.verify.reset': 'Remis dans la file de vérification.', // TODO: translate
  'toast.verify.failed': 'Impossible d’enregistrer la décision. Veuillez réessayer.', // TODO: translate
  'admin.users.detail.pilotOperatorNote': 'Les deux champs ci-dessous concernent l’exploitant UAS, pas le télépilote.', // TODO: translate
  'auth.googlePopupBlocked': 'Votre navigateur a bloqué la fenêtre de connexion Google. Autorisez les fenêtres pop-up pour ce site et réessayez.',
  'signup.otp.skip': 'Passer pour l’instant',
  'signup.otp.errorCooldown': 'Vous venez de demander un code. Patientez une minute avant d’en demander un autre.',
  'signup.otp.errorDelivery': 'Impossible d’envoyer l’e-mail pour le moment. Vous pouvez continuer et vérifier plus tard.',
  'signup.otp.sentTo': 'Code envoyé à {email}. Pensez à vérifier vos spams.',
  'signup.errorInvalidEmail': 'Adresse e-mail non valide.',
  'signup.errorNetwork': 'Connexion absente ou instable. Vérifiez votre réseau et réessayez.',
  'admin.overview.loadFailed': 'Impossible de charger la vue d’ensemble. Vérifiez votre connexion et réessayez.',
  'admin.overview.partialFailure': 'Certaines sections n’ont pas pu être chargées',
  'admin.overview.health.ok': 'Tous les services sont opérationnels',
  'admin.overview.health.degraded': 'Certains services sont dégradés',
  'common.pdfShowAllPages': 'Afficher toutes les pages ({count})',
  'common.close': 'Fermer',
  'common.copied': 'Copié dans le presse-papiers',
  'loadError.title': 'Un problème est survenu',
  'loadError.body': 'Impossible de charger les données. Vérifiez votre connexion et réessayez.',
  'upload.hint': 'Formats : {formats} · max {mb} Mo',
  'upload.progress': 'Envoi en cours…',
  'upload.error.type': 'Type de fichier non pris en charge.',
  'upload.error.tooLarge': 'Le fichier dépasse {mb} Mo.',
  'upload.error.heic': 'Ce navigateur ne peut pas lire les photos HEIC. Exportez l’image en JPG ou PNG et réessayez.',
  'upload.error.canceled': 'Envoi annulé.',
  'slot.usedUnlimited': '{used} · illimité',
  'account.plan.unlimitedNote': 'Aucune limite active : vous pouvez ajouter librement drones, opérateurs, certificats et documents.',
  'operator.list.subtitleUnlimited': 'Ajoutez autant d’opérateurs que nécessaire.',
  'doc.list.subtitleUnlimited': 'Téléversez autant de documents que nécessaire.',
  'drone.publish.notLive': 'Modifications enregistrées, mais la page publique n’a pas été mise à jour. Réessayez dans un instant.',
  'drone.insuranceLink.hint': 'Choisissez l’une des polices que vous avez téléversées ; elle sera affichée sur la page publique du drone.',
  'error.locked': 'Ces données sont verrouillées après le premier enregistrement. Contactez le support pour les modifier.',
  'error.suspended': 'Cet élément a été suspendu par un administrateur. Contactez le support pour en savoir plus.',
  'error.quota': 'Vous avez atteint la limite de votre offre.',
  'error.invalidLink': 'Le lien sélectionné n’est pas valide. Actualisez la page et réessayez.',
  'error.emailInUse': 'Cette adresse e-mail est déjà utilisée par un autre compte.',
  'error.session': 'Votre session a expiré. Reconnectez-vous pour continuer.',
  'error.permission': 'Vous n’avez pas l’autorisation d’effectuer cette action.',
  'error.notFound': 'Élément introuvable : il a peut-être été supprimé.',
  'error.rateLimited': 'Trop de requêtes. Patientez un instant et réessayez.',
  'error.server': 'Le serveur n’a pas répondu correctement. Réessayez dans un instant.',
  'error.network': 'Connexion absente ou instable. Vérifiez votre réseau et réessayez.',
  'reportFound.errorRateLimited': 'Trop de signalements envoyés. Réessayez dans quelques minutes.',
  'reportFound.errorUnavailable': 'Il n’est pas possible d’envoyer un signalement pour ce drone pour le moment.',
  'account.verification.reasonLine': 'Motif : {reason}',
  'admin.verify.reason.label': 'Motif du refus (facultatif)',
  'admin.verify.reason.placeholder': 'Ex. document expiré ou illisible',
  'admin.verify.reason.confirm': 'Confirmer le refus',
  'admin.support.newConversation': 'Nouvelle conversation',
  'admin.users.detail.emailHint': 'Cela modifie aussi l’e-mail de connexion ; l’utilisateur devra le vérifier à nouveau.',
  'admin.users.detail.droneCount': 'Drones enregistrés : {count}',
  'admin.slots.notEnforced': 'Les limites d’emplacements sont désactivées : ces valeurs sont enregistrées mais ne bloquent pas l’utilisateur.',
  'admin.reports.ownerRead': 'Lu par le propriétaire',
  'admin.reports.ownerUnread': 'Pas encore lu par le propriétaire',
  'admin.nfc.baseUrl': 'URL de base des badges : {url}',
  'pricing.checkout.error.invalid_json': 'Requête non valide. Actualisez la page et réessayez.',
  'pricing.checkout.error.checkout_failed': 'Nous n’avons pas pu enregistrer votre demande. Réessayez dans un instant.',
  'account.dashboard.greetingAnon': 'Bonjour !',
  'account.identity.name': 'Nom complet',
  'account.identity.completeHint': 'Votre nom n’est pas encore enregistré. Saisissez-le une fois : il apparaîtra sur votre profil public. Pour toute modification ultérieure, contactez le support.',
  'account.plan.subtitleUnlimited': 'Récapitulatif de vos enregistrements. Aucune limite n’est appliquée pour le moment.',
  'drone.catalog.classUnknown': 'N/D',
  'drone.catalog.note.mini4pro': 'UE : C0 par défaut, C1 avec mise à niveau',
  'reportFound.geolocation.hint': 'Facultatif : aide le propriétaire à retrouver le drone plus vite. Votre navigateur vous demandera l’autorisation.',
  'admin.notify.reason.email_not_configured': 'l’envoi d’e-mails n’est pas configuré sur le serveur',
  'admin.notify.reason.no_recipient_email': 'le compte n’a pas d’adresse e-mail',
  'admin.notify.reason.no_recipient': 'le compte n’a pas d’adresse e-mail',
  'admin.notify.reason.email_provider_auth_failed': 'la clé du service d’e-mail est invalide',
  'admin.notify.reason.email_address_rejected': 'adresse refusée par le service d’e-mail',
  'admin.notify.reason.email_rate_limited': 'trop d’e-mails envoyés, réessayez plus tard',
  'admin.notify.reason.email_provider_unavailable': 'service d’e-mail temporairement indisponible',
  'admin.notify.reason.email_network_error': 'erreur réseau vers le service d’e-mail',
  'admin.notify.reason.network': 'erreur réseau',
  'admin.reports.emailSent': 'Propriétaire prévenu par e-mail',
  'admin.reports.emailNotSent': 'Propriétaire non prévenu par e-mail ({reason})',
  'admin.notify.reason.email_send_failed': 'échec de l’envoi',
  'admin.support.status.open': 'À traiter',
  'admin.support.status.pending': 'En attente de l’utilisateur',
  'admin.support.status.closed': 'Fermée',
  'drone.publicLink.title': 'Page publique',
  'drone.publicLink.hint': 'C’est l’adresse à écrire sur le badge NFC ou à transformer en QR code.',
  'drone.publicLink.copy': 'Copier le lien',
  'drone.publicLink.open': 'Ouvrir',
  'drone.publicLink.copyFailed': 'Copie impossible : sélectionnez le lien et copiez-le manuellement.',
  'activeOp.empty.addOperator': 'Ajouter un exploitant',
  'insurance.row.onPublicPage': 'Affichée sur la page publique du drone',
  'operator.row.publicDronesOne': 'Par défaut pour 1 drone public',
  'operator.row.publicDronesMany': 'Par défaut pour {count} drones publics',
  'operator.delete.warningPublicOne': 'Cet exploitant est celui par défaut d’un drone public. En le supprimant, ce drone n’aura plus d’exploitant par défaut.',
};
