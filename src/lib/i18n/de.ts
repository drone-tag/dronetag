import type { TranslationMap } from './schema';

/**
 * German translations.
 * Structure mirrors en.ts — see that file for key documentation.
 */
export const translations: TranslationMap = {

  // ═══════════════════════════════════════════════════════════════════════════
  // LABELS — Field names, buttons, navigation, column headers, short UI text
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Common UI ──
  'common.save': '\u00c4nderungen speichern',
  'common.cancel': 'Abbrechen',
  'common.delete': 'L\u00f6schen',
  'common.edit': 'Bearbeiten',
  'common.view': 'Ansehen',
  'common.create': 'Erstellen',
  'common.search': 'Suchen',
  'common.back': 'Zur\u00fcck',
  'common.loading': 'Wird geladen\u2026',
  'common.error': 'Fehler',
  'common.success': 'Erfolg',
  'common.confirm': 'Best\u00e4tigen',
  'common.yes': 'Ja',
  'common.no': 'Nein',
  'common.upload': 'Hochladen',
  'common.download': 'Herunterladen',
  'common.preview': 'Vorschau',
  'common.publish': 'Ver\u00f6ffentlichen',
  'common.unpublish': 'Ver\u00f6ffentlichung aufheben',
  'common.published': '\u00d6ffentlich',
  'common.unpublished': 'Privat',
  'common.required': 'Pflichtfeld',
  'common.optional': 'Optional',
  'common.actions': 'Aktionen',
  'common.language': 'Sprache',
  'common.all': 'Alle',
  'common.filter': 'Filtern',
  'common.sortBy': 'Sortieren nach',
  'common.notAvailable': 'k.\u00a0A.',
  'common.select': 'Ausw\u00e4hlen\u2026',
  'common.clickOrDragToUpload': 'Zum Hochladen klicken oder Datei hierher ziehen',
  'common.remove': 'Entfernen',
  'common.viewDocument': 'Dokument anzeigen',
  'common.retry': 'Erneut versuchen',
  'common.tryAgain': 'Beim Laden dieser Seite ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
  'common.version': 'v1.0',

  // ── Navigation ──
  'nav.home': 'Start',
  'nav.dashboard': 'Dashboard',
  'nav.login': 'Anmelden',
  'nav.logout': 'Abmelden',
  'nav.newProfile': 'Neues Profil',
  'nav.adminBadge': 'ADMIN',
  'nav.shop': 'Shop',
  'nav.account': 'Mein Konto',
  'nav.signup': 'Registrieren',
  'nav.inboxBell': 'Fundmeldungen',
  'nav.inboxBell.unread': 'Fundmeldungen ({count} ungelesen)',
  'nav.inboxBell.admin': 'Drohnen & Fundmeldungen',

  // ── Consumer auth ──
  'auth.consumerEyebrow': 'DIGITALE IDENTIT\u00c4T F\u00dcR UAS-BETREIBER',
  'auth.google': 'Mit Google fortfahren',
  'auth.or': 'oder',
  'auth.googleError': 'Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.',

  // ── Login form ──
  'login.email': 'E-Mail-Adresse',
  'login.password': 'Passwort',
  'login.submit': 'Anmelden',
  'login.noAccount': 'Noch kein Konto?',
  'login.signupCta': 'Jetzt registrieren',
  'login.adminProvisioned': 'Konten werden von einem Administrator angelegt. Kontaktiere uns, wenn du Zugangsdaten benötigst.',

  // ── Sign-up form ──
  'signup.title': 'Bei DroneTag registrieren',
  'signup.subtitle': 'Erstellen Sie Ihre digitale Betreiberidentit\u00e4t \u2014 Profil, Zertifikate, Versicherungen und Drohnen an einem Ort.',
  'signup.submit': 'Registrieren',
  'signup.passwordConfirm': 'Passwort bestätigen',
  'signup.haveAccount': 'Bereits ein Konto?',
  'signup.errorPasswordShort': 'Passwort muss mindestens 6 Zeichen lang sein.',
  'signup.errorPasswordMismatch': 'Passwörter stimmen nicht überein.',
  'signup.errorEmailInUse': 'Es existiert bereits ein Konto mit dieser E-Mail.',
  'signup.errorGeneric': 'Konto konnte nicht erstellt werden. Bitte erneut versuchen.',

  'signup.otp.title': 'Kontakt verifizieren',
  'signup.otp.subtitle': 'Wir haben dir einen Bestätigungscode geschickt. Du kannst jetzt oder später bestätigen.',
  'signup.otp.gateSubtitle': 'Sie müssen mindestens E-Mail oder Telefon verifizieren, bevor Sie auf Ihr Konto zugreifen können.',
  'signup.otp.chooseChannels': 'Wie möchten Sie sich verifizieren?',
  'signup.otp.verifyEmailOption': 'E-Mail verifizieren (OTP-Code)',
  'signup.otp.verifyPhoneOption': 'Telefon verifizieren (SMS-OTP)',
  'signup.otp.channelHint': 'Wählen Sie mindestens eine Methode. Sie können beide auswählen.',
  'signup.otp.channelRequired': 'Wählen Sie mindestens E-Mail oder Telefon zur Verifizierung.',
  'signup.otp.phoneRequired': 'Geben Sie Ihre Telefonnummer für die SMS-Verifizierung ein.',
  'signup.otp.emailSection': 'E-Mail-Verifizierung',
  'signup.otp.phoneSection': 'Telefon-Verifizierung',
  'signup.otp.sendEmail': 'Code per E-Mail senden',
  'signup.otp.sendPhone': 'Code per SMS senden',
  'signup.otp.resend': 'Code erneut senden',
  'signup.otp.codeLabel': '6-stelliger Code',
  'signup.otp.verify': 'Verifizieren',
  'signup.otp.verified': 'Verifiziert',
  'signup.otp.continue': 'Weiter',
  'signup.otp.errorSend': 'Code konnte nicht gesendet werden. Bitte erneut versuchen.',
  'signup.otp.errorCode': 'Ungültiger oder abgelaufener Code.',
  'signup.otp.errorPhone': 'Ungültige Telefonnummer.',
  'signup.otp.errorIncomplete': 'Schließen Sie die Verifizierung für alle gewählten Kanäle ab.',
  'signup.otp.devCode': 'Dev: E-Mail-Code {code}',

  // ── Account area ──
  'account.eyebrow': 'Konto',
  'account.title': 'Willkommen, {name}',
  'account.subtitle': 'Profil einsehen und Bestellungen verfolgen.',
  'account.nav.home': 'Start',
  'account.nav.more': 'Mehr',
  'account.nav.mobile': 'Kontonavigation',
  'account.nav.sidebar': 'Kontomenü',
  'account.nav.section.workspace': 'Arbeitsbereich',
  'account.nav.section.library': 'Unterlagen',
  'account.nav.section.account': 'Konto',
  'account.tab.settings': 'Einstellungen',
  'settings.title': 'Einstellungen',
  'settings.subtitle': 'Verwalte Darstellung, Sprache und Kontoeinstellungen.',
  'settings.appearance': 'Darstellung',
  'settings.theme': 'Design',
  'settings.theme.hint': 'Wähle Hell, Dunkel oder die Einstellung deines Geräts.',
  'settings.theme.light': 'Hell',
  'settings.theme.dark': 'Dunkel',
  'settings.theme.system': 'System',
  'settings.language': 'Sprache',
  'settings.language.hint': 'Die Sprache der Oberfläche wird auf diesem Gerät gespeichert.',
  'settings.account': 'Konto',
  'settings.profile': 'Profil & Branding',
  'settings.profile.hint': 'Öffentliches Foto, Logo und Banner',
  'settings.billing': 'Abrechnung',
  'settings.billing.hint': 'Tarif und Zahlungsdaten',
  'settings.demo.persona': 'Demo-Personas',
  'settings.demo.persona.hint': 'Wechsle die Identität, um Admin- und Nutzerszenarien auszuprobieren.',
  'demo.banner': 'Demo-Modus — Beispieldaten, Firebase nicht verbunden',
  'demo.resetData': 'Demo-Daten zurücksetzen',
  'demo.scenarios.title': 'Demo-Szenarien für Kunden',
  'demo.scenarios.subtitle': 'Öffne die öffentliche QR-Seite und ändere dann Daten als Admin — lade den öffentlichen Tab neu, um die aktualisierten Badges zu sehen.',
  'demo.scenarios.openPublic': 'Öffentliches Profil öffnen',
  'demo.scenarios.verifyPath': 'Hier freigeben:',
  'demo.scenario.green.title': 'Alles grün — Michele',
  'demo.scenario.green.badges': 'Verifizierter Nutzer · Zertifikate OK · Versicherung aktiv',
  'demo.scenario.green.steps': 'Persona „OK · Michele“. Zeige /u/sj58afq8 als echte öffentliche Karte (Foto, Logo, Banner).',
  'demo.scenario.review.title': 'In Prüfung — Anna (SkyMap)',
  'demo.scenario.review.badges': 'Zertifikate ausstehend · Versicherung läuft ab',
  'demo.scenario.review.steps': 'Öffne /u/citymapper-anna (Nutzer + Zertifikate orange; Versicherung läuft ab). Admin → Verifizierung → Warteschlange: Zertifikate + Versicherungen (Demo-PDF öffnen) → als verifiziert markieren (die Demo verlängert die Versicherung um +1 Jahr). Dokumente und Drohnen können in der Warteschlange bleiben, wenn du auch diese Tabs zeigen willst. Lade /u/citymapper-anna neu → Nutzer/Zertifikate grün + aktive Police.',
  'demo.scenario.critical.title': 'Kritisch — Carlos',
  'demo.scenario.critical.badges': 'Zertifikate OK · Versicherung abgelaufen',
  'demo.scenario.critical.steps': 'Zeige /u/vistaone-carlos (Versicherung rot). Im Posteingang liegen ungelesene Fundmeldungen.',
  'demo.scenario.fleet.title': 'Flotte / Betreiberwechsel — Alpine',
  'demo.scenario.fleet.badges': 'Firmenbetreiber · Police für mehrere Drohnen',
  'demo.scenario.fleet.steps': 'Persona Alpine. Öffentlich: /u/alpine-mavic. Unter Admin → Drohnen siehst du die temporären Betreiberwechsel.',
  'admin.verify.demoHint':
    'Certificates badge on the public page = certificate verification here. Insurance colour = expiry date (marking verified in demo also renews the policy +1 year so the badge goes green). Demo changes are saved in the browser — refresh the public page after verifying.',

  'account.dashboard.greeting': 'Hallo, {name}',
  'account.dashboard.subtitle': 'Deine UAS-Nachweise auf einen Blick.',
  'account.dashboard.credentialsStatus': 'Status der Nachweise',
  'account.dashboard.completeness': 'Profil zu {pct} % vollständig',
  'account.dashboard.quickActions': 'Schnellaktionen',
  'account.dashboard.actionPublic': 'Öffentliches Profil',
  'account.dashboard.actionPublicDesc': 'Deine QR-Seite ansehen oder teilen',
  'account.dashboard.actionDocument': 'Dokument hinzufügen',
  'account.dashboard.actionDocumentDesc': 'PDF oder Datei hochladen',
  'account.dashboard.actionBadge': 'Badge bestellen',
  'account.dashboard.actionBadgeDesc': 'NFC-Badge oder physisches Kit',
  'account.dashboard.actionDrone': 'Drohne registrieren',
  'account.dashboard.actionDroneDesc': 'Neues Fluggerät hinzufügen',
  'account.dashboard.seeAll': 'Alle ansehen',
  'account.dashboard.expiryAlerts': 'Läuft innerhalb von 30 Tagen ab',
  'account.dashboard.expiryInDays': 'noch {days} T.',
  'account.dashboard.expiryExpired': 'Abgelaufen',
  'account.dashboard.verifyAlerts': 'Wartet auf Admin-Prüfung',
  'account.dashboard.verifyWaiting': 'In Prüfung',
  'account.dashboard.verifyRejected': 'Abgelehnt — kontaktiere den Support',
  'account.dashboard.verifyHint': 'Diese Einträge warten auf die Prüfung durch einen Administrator. Wir benachrichtigen dich im Support, sobald sich der Status ändert.',
  'account.verification.uploadHint': 'Bestätigst du die aus dem Dokument gelesenen Daten unverändert, ist die Prüfung sofort erledigt. Korrigierst du sie, gleicht ein Administrator sie mit dem Dokument ab und informiert dich über das Ergebnis.',
  'account.verification.documentUploadHint': 'Nach dem Hochladen prüft ein Administrator das Dokument und informiert dich über das Ergebnis.',
  'account.verification.notifyVerified': 'Wir haben {kind} verifiziert: {label}. Dein öffentliches Profil wurde aktualisiert.',
  'account.verification.notifyRejected': 'Wir konnten {kind} nicht verifizieren: {label}. Öffne den Support oder lade ein korrigiertes Dokument hoch.',
  'account.verification.kind.certificate': 'das Zertifikat',
  'account.verification.kind.insurance': 'die Versicherung',
  'account.verification.kind.document': 'das Dokument',
  'account.verification.kind.drone': 'die Drohne',
  'account.verification.kind.authorization': 'die Genehmigung',
  'account.verification.threadSubject': 'Updates zur Dokumentenverifizierung',
  'nav.menuOpen': 'Menü öffnen',
  'nav.menuClose': 'Menü schließen',
  'account.tabProfile': 'Profil',
  'account.tabOrders': 'Bestellungen',
  'account.personalInfo': 'Persönliche Angaben',
  'account.shippingAddress': 'Lieferadresse',
  'account.readOnly': 'Nur Lesen',
  'account.noAddress': 'Noch keine Adresse gespeichert.',
  'account.editNotice': 'Das Bearbeiten des Profils wird bald verfügbar sein. Für Änderungen bitte den Support kontaktieren.',
  'account.memberSince': 'Mitglied seit {date}',
  'account.notProvisioned.title': 'Wir konnten dein Konto nicht einrichten',
  'account.notProvisioned.body': 'Beim Aktivieren deines Profils ist ein Fehler aufgetreten. Prüfe deine Verbindung und versuche es erneut; wenn das Problem bleibt, kontaktiere den DroneTag-Support.',

  // ── Orders ──
  'orders.emptyTitle': 'Noch keine Bestellungen',
  'orders.emptyDesc': 'Sobald du bestellst, findest du hier alle Details mit vollständigem Tracking und Rückverfolgbarkeit.',
  'orders.emptyCta': 'Zum Shop',
  'orders.orderNumber': 'Bestellung Nr.',
  'orders.placedOn': 'Aufgegeben am {date}',
  'orders.viewDetails': 'Details ansehen',
  'orders.backToOrders': 'Zurück zu den Bestellungen',
  'orders.progress': 'Fortschritt',
  'orders.shippingTitle': 'Versand',
  'orders.carrier': 'Versender',
  'orders.openTracking': 'Tracking öffnen',
  'orders.shipTo': 'Versand an',
  'orders.eta': 'Voraussichtliche Lieferung · {date}',
  'orders.deliveredOn': 'Geliefert am {date}',
  'orders.items': 'Produkte in dieser Bestellung',
  'orders.professionalTrace': 'Professionelle Rückverfolgbarkeit',
  'orders.showTrace': 'Rückverfolgbarkeit anzeigen',
  'orders.hideTrace': 'Rückverfolgbarkeit ausblenden',
  'orders.subtotal': 'Zwischensumme',
  'orders.shippingFee': 'Versand',
  'orders.total': 'Gesamt',
  'orders.timeline': 'Vollständige Chronik',
  'orders.notFound': 'Bestellung nicht gefunden oder nicht zugänglich.',

  // ── Order status labels ──
  'orderStatus.pending': 'Ausstehend',
  'orderStatus.paid': 'Bezahlt',
  'orderStatus.in_production': 'In Produktion',
  'orderStatus.assembled': 'Montiert',
  'orderStatus.quality_check': 'Qualitätskontrolle',
  'orderStatus.packed': 'Verpackt',
  'orderStatus.shipped': 'Versendet',
  'orderStatus.in_transit': 'Unterwegs',
  'orderStatus.delivered': 'Zugestellt',
  'orderStatus.cancelled': 'Storniert',

  // ── Traceability detail fields ──
  'trace.batch': 'Charge',
  'trace.material': 'Material / Filament',
  'trace.printedAt': 'Gedruckt am',
  'trace.printer': 'Drucker',
  'trace.assembledAt': 'Montiert am',
  'trace.assembledBy': 'Montiert von',
  'trace.qcAt': 'QC bestanden am',
  'trace.qcBy': 'QC-Prüfer',
  'trace.notes': 'Notizen',

  // ── Field labels ──
  'field.language': 'Spracheinstellung',
  'field.firstName': 'Vorname',
  'field.lastName': 'Nachname',
  'field.operatorCode': 'Registrierungsnummer des UAS-Betreibers',
  'field.email': 'E-Mail',
  'field.phone': 'Telefon',
  'field.emergencyContact': 'Notfallkontakt',
  'field.photo': 'Profilfoto',
  'field.visibility': 'Sichtbarkeit',
  'field.birthDate': 'Geburtsdatum',
  'field.nationality': 'Staatsangeh\u00f6rigkeit',
  'field.operatorLicense': 'UAS-Betreiberlizenz',
  'field.companyName': 'Firmenname',
  'field.companyDetails': 'Unternehmensangaben',
  'field.companyAddress': 'Firmenadresse',
  'field.companyVatOrRegistration': 'USt-IdNr. / Registrierungsnummer',
  'field.droneName': 'Drohnenname',
  'field.droneModel': 'Modell',
  'field.serialNumber': 'Serien-Nr.',
  'field.droneRegNumber': 'Registrierung',
  'field.logo': 'Logo',
  'field.banner': 'Bannerbild',
  'field.insuranceProvider': 'Versicherer',
  'field.policyNumber': 'Policennummer',
  'field.holderName': 'Versicherungsnehmer',
  'field.issuedAt': 'Ausstellungsdatum',
  'field.expiresAt': 'Ablaufdatum',
  'field.policyPdf': 'Policendokument (PDF)',
  'field.insuranceNotes': 'Policenhinweise',
  'field.qrImage': 'QR-Code-Bild',
  'field.slug': '\u00d6ffentlicher URL-Slug',
  'field.lastEditedBy': 'Zuletzt bearbeitet von',
  'field.publishedAt': 'Ver\u00f6ffentlicht am',
  'field.lastVerifiedAt': 'Zuletzt verifiziert am',
  'field.adminNotes': 'Interne Admin-Notizen',

  // ── Dashboard table columns ──
  'dashboard.organization': 'Organisation',
  'dashboard.operatorCode': 'Betreibercode',
  'dashboard.verification': 'Verifizierung',
  'dashboard.insuranceStatus': 'Versicherung',
  'dashboard.expiryDate': 'Ablaufdatum',
  'dashboard.updatedAt': 'Aktualisiert',
  'dashboard.completeness': 'Vollst\u00e4ndigkeit',
  'dashboard.policyExpiry': 'Policenablauf',
  'dashboard.draft': 'Entwurf',
  'dashboard.status': 'Status',
  'dashboard.incomplete': 'Unvollst\u00e4ndig',

  // ── Dashboard filters ──
  'dashboard.filterByStatus': 'Nach Status filtern',
  'dashboard.filterByPolicy': 'Nach Police filtern',
  'dashboard.filterByVerification': 'Verifizierung',
  'dashboard.filterByVisibility': 'Sichtbarkeit',
  'dashboard.sortName': 'Name',
  'dashboard.sortExpiry': 'Policenablauf',
  'dashboard.sortPriority': 'Dokumentendringlichkeit',
  'dashboard.sortUpdated': 'Zuletzt aktualisiert',

  // ── Document type labels ──
  'docType.insurancePolicy': 'Versicherungspolice',
  'docType.operatorLicense': 'Betreiberlizenz',
  'docType.droneRegistration': 'Drohnenregistrierung',
  'docType.trainingCertificate': 'Schulungszertifikat',
  'docType.other': 'Sonstiges Dokument',

  // ── Public page data labels ──
  'profile.operatorId': 'Betreiber-ID',
  'profile.registrationCode': 'Registrierung',
  'profile.provider': 'Versicherer',
  'profile.policyNumber': 'Policen-Nr.',
  'profile.coverage': 'Deckung',
  'profile.validFrom': 'G\u00fcltig ab',
  'profile.validUntil': 'G\u00fcltig bis',
  'profile.notes': 'Hinweise',
  'profile.viewPolicy': 'Originaldokument der Police anzeigen',
  'profile.downloadPolicy': 'Policendokument herunterladen',
  'profile.droneId': 'Drohnen-ID',
  'profile.droneModel': 'Modell',
  'profile.serialNumber': 'Serien-Nr.',
  'profile.droneRegNumber': 'Registrierung',
  'profile.category': 'Kategorie',
  'profile.contact': 'Kontakt',
  'profile.emergencyContact': 'Notfall',
  'profile.documents': 'Dokumente',
  'profile.verifiedOn': 'Verifiziert am',
  'profile.lastUpdated': 'Zuletzt aktualisiert',

  // ── Toggle / action labels ──
  'toggle.makePublic': 'Ver\u00f6ffentlichen',
  'toggle.makePrivate': 'Ver\u00f6ffentlichung aufheben',
  'form.generateSlug': 'URL generieren',
  'form.publicUrlPreview': '\u00d6ffentliche URL:',
  'form.profileId': 'Profil-ID:',

  // ── Verification links labels ──
  'field.nfcReference': 'NFC-Tag-Referenz',
  'field.publicUrl': '\u00d6ffentliche Profil-URL',
  'links.copyUrl': 'Kopieren',
  'links.copied': 'Kopiert',
  'links.nfcNotAssigned': 'Nicht zugewiesen',

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — State indicators, badges, computed statuses
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Profile lifecycle ──
  'status.active': 'Aktiv',
  'status.draft': 'Entwurf',
  'status.archived': 'Archiviert',
  'status.suspended': 'Gesperrt',

  // ── Visibility ──
  'visibility.private': 'Privat',
  'visibility.public': '\u00d6ffentlich',

  // ── Verification ──
  'verification.unverified': 'Nicht verifiziert',
  'verification.pending': 'Pr\u00fcfung ausstehend',
  'verification.verified': 'Verifiziert',
  'verification.rejected': 'Abgelehnt',
  'verification.status': 'Verifizierungsstatus',
  'verification.lastVerified': 'Zuletzt verifiziert',
  'verification.verifiedBy': 'Verifiziert von',
  'verification.notes': 'Verifizierungshinweise',

  // ── Insurance policy ──
  'policy.valid': 'G\u00fcltig',
  'policy.expiring': 'L\u00e4uft bald ab',
  'policy.expired': 'Abgelaufen',
  'policy.missing': 'Fehlend',
  'policy.status': 'Policenstatus',

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGES — Errors, alerts, hints, descriptions, dynamic text
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Login & auth ──
  'login.error': 'Authentifizierung fehlgeschlagen. Bitte pr\u00fcfen Sie Ihre Anmeldedaten.',
  'login.restrictedNotice': 'Zugang nur f\u00fcr autorisierte Administratorinnen und Administratoren.',

  // ── Form validation & feedback ──
  'form.validation.required': 'Dieses Feld ist erforderlich',
  'form.validation.slugRequired': 'Vor der Ver\u00f6ffentlichung ist ein \u00f6ffentlicher URL-Slug erforderlich.',
  'form.validation.slugFormat': 'Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
  'form.saving': 'Wird gespeichert\u2026',
  'form.saved': 'Alle \u00c4nderungen wurden erfolgreich gespeichert.',
  'form.submitError': 'Speichern fehlgeschlagen. Bitte pr\u00fcfen Sie Ihre Verbindung.',

  // ── Form hints ──
  'form.photoHint': 'Quadratisches Bild empfohlen, mindestens 200\u00d7200 px.',
  'form.pdfHint': 'Laden Sie die Original-PDF der Versicherungspolice hoch.',
  'form.qrHint': 'QR-Code f\u00fcr dieses Profil hochladen oder generieren.',

  // ── Dashboard alerts ──
  'dashboard.alerts': 'Betriebshinweise',
  'dashboard.alertNoPdf': '{count} Profil(e) ohne Versicherungs-PDF',
  'dashboard.alertExpiring': '{count} Police(n) l\u00e4uft/laufen innerhalb von 30 Tagen ab',
  'dashboard.alertCompleteNotPublished': '{count} vollst\u00e4ndige(s) Profil(e) noch nicht ver\u00f6ffentlicht',
  'dashboard.alertPublishedNotVerified': '{count} ver\u00f6ffentlichte(s) Profil(e) nicht verifiziert',
  'dashboard.noAlerts': 'Keine Betriebshinweise. Alles in Ordnung.',

  // ── Dashboard messages ──
  'dashboard.confirmDelete': 'Dieses Betreiberprofil wird unwiderruflich und dauerhaft entfernt. Zugeh\u00f6rige Nachweise und Verkn\u00fcpfungen gehen verloren. M\u00f6chten Sie fortfahren?',
  'dashboard.deleteModalNote': '\u00d6ffentliche QR- und NFC-Links zu diesem Profil werden sofort ung\u00fcltig. Die Daten sind f\u00fcr Dritte nicht mehr abrufbar. Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.',
  'dashboard.adjustFilters': 'Passen Sie Suche oder Filter an, um passende Profile einzublenden oder die Ergebnisliste zu verfeinern.',
  'dashboard.searchPlaceholder': 'Name, Unternehmen oder Betreibercode\u2026',
  'common.noResults': 'Keine passenden Profile',
  'common.filtersActive': '{count} Filter aktiv',
  'common.clearFilters': 'Alle Filter zur\u00fccksetzen',
  'common.noDocument': 'Kein Dokument hochgeladen',
  'common.pdfPreviewLoading': 'PDF-Vorschau wird geladen…',
  'common.pdfPreviewFailed': 'Vorschau nicht verfügbar. Dokument in neuem Tab öffnen.',
  'common.noQr': 'Kein QR-Code hochgeladen',

  // ── Policy descriptions (dynamic) ──
  'policy.daysLeft': 'Noch {days} Tage',
  'policy.expiredDaysAgo': 'Vor {days} Tagen abgelaufen',
  'policy.desc.validUntil': 'G\u00fcltig bis {date}',
  'policy.desc.expiringOn': 'L\u00e4uft am {date} ab \u2014 noch {days} Tage',
  'policy.desc.expiredOn': 'Abgelaufen am {date} (vor {days} Tagen)',
  'policy.desc.noPolicyOnFile': 'Kein Policendokument vorhanden',

  // ── Public page messages ──
  'public.insuranceValid': 'Der Versicherungsschutz ist aktiv und g\u00fcltig.',
  'public.insuranceExpiring': 'Der Versicherungsschutz l\u00e4uft in {days} Tagen ab.',
  'public.insuranceExpired': 'Der Versicherungsschutz ist abgelaufen. Kontaktieren Sie den Betreiber oder die Organisation f\u00fcr aktuelle Unterlagen.',
  'public.insuranceMissing': 'Keine Versicherungsinformationen f\u00fcr diesen Betreiber hinterlegt.',
  'public.noInformation': 'Nicht angegeben',
  'public.policyNotAvailable': 'Originaldokument der Police nicht verf\u00fcgbar.',
  'public.policyNotAvailableHint': 'Die ausstellende Organisation hat das Policendokument f\u00fcr dieses Profil nicht hochgeladen.',
  'public.latestRecord': 'Diese Seite zeigt den letzten ver\u00f6ffentlichten Stand zum oben angegebenen Datum.',
  'public.scanToVerify': 'Scannen Sie diesen Code um das Betreiberprofil zu verifizieren',

  // ── Profile unavailable messages ──
  'profile.notFoundDesc': 'Das gesuchte Betreiberprofil existiert nicht oder wurde entfernt.',
  'profile.notPublishedDesc': 'Dieses Betreiberprofil ist derzeit nicht \u00f6ffentlich einsehbar. Es wird m\u00f6glicherweise \u00fcberpr\u00fcft oder wurde zur\u00fcckgezogen.',
  'profile.disclaimer': 'Diese Angaben dienen ausschlie\u00dflich der Verifizierung. Die Richtigkeit der Daten obliegt der ausstellenden Organisation.',
  'profile.expiringInDays': 'L\u00e4uft in {days} Tagen ab',

  // ── Verification links descriptions ──
  'links.publicUrlDesc': 'Dies ist die dauerhafte \u00f6ffentliche URL f\u00fcr dieses Betreiberprofil. Teilen Sie sie direkt oder kodieren Sie sie im QR-Code.',
  'links.publicUrlNotReady': 'Legen Sie einen Slug fest und ver\u00f6ffentlichen Sie das Profil, um eine \u00f6ffentliche URL zu erstellen.',
  'links.qrDesc': 'Laden Sie ein QR-Code-Bild hoch oder generieren Sie eines, das zur \u00f6ffentlichen Verifizierungsseite dieses Betreibers f\u00fchrt.',
  'links.nfcDesc': 'Auf dem NFC-Badge ist der öffentliche DroneTag-Link dieses Profils gespeichert. Beim Antippen mit einem Smartphone öffnet sich die Seite unten — ganz ohne App.',  // TODO: translate

  // ── Empty states ──
  'empty.noProfilesIcon': 'Keine Betreiber registriert',
  'empty.noResultsIcon': 'Keine passenden Ergebnisse',

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTIONS — Page titles, section headers, subtitles, content blocks
  // ═══════════════════════════════════════════════════════════════════════════

  // ── App identity ──
  'app.title': 'DroneTag',
  'app.description': 'Professionelle Verifizierung von Betreibernachweisen und zentrale Dokumentenf\u00fchrung f\u00fcr Drohnenbetrieb.',

  // ── Login page ──
  'login.title': 'Bei DroneTag anmelden',
  'login.subtitle': 'Greifen Sie auf Profil, Dokumente, Zertifikate und Drohnen zu.',

  // ── Home page ──
  'home.hero': 'Verifizierung von Drohnenbetreibernachweisen',
  'home.subtitle': 'Zentrale Plattform zur Ausstellung, Pr\u00fcfung und Nachverfolgung operativer Nachweise im Drohneneinsatz.',
  'home.feature1Title': 'Betreibernachweise',
  'home.feature1Desc': 'Digitale Identifikation und Nachweise f\u00fcr zertifizierte UAS-Betreiber aus einer Hand.',
  'home.feature2Title': 'Echtzeit-Verifizierung',
  'home.feature2Desc': 'Sofortige Pr\u00fcfung g\u00fcltiger Profile per QR-Scan \u2014 ohne Medienbruch.',
  'home.feature3Title': 'Compliance-\u00dcberwachung',
  'home.feature3Desc': 'Automatisierte \u00dcberwachung von Versicherungs- und Dokumentenfristen f\u00fcr dauerhafte Konformit\u00e4t.',
  'home.cta': 'Administratoranmeldung',
  'home.footer': 'DroneTag \u00a9 {year}. Operatorenverifikation und Dokumentenverwaltung.',
  'home.learnMore': 'So funktioniert es',
  'home.systemDesc': 'DroneTag unterst\u00fctzt Organisationen bei der sicheren Hinterlegung und dem Nachweis operativer Qualifikationen und Policen.',

  'home.nav.howItWorks': 'So funktioniert es',
  'home.nav.features': 'Funktionen',
  'home.nav.nfcBadge': 'NFC-Badges',
  'home.nav.signIn': 'Anmelden',
  'home.nav.signUp': 'Registrieren',
  'home.nav.adminArea': 'Admin-Bereich',
  'home.nav.openDashboard': 'Dashboard \u00f6ffnen',

  'home.hero.eyebrow': 'DIGITALE IDENTIT\u00c4T F\u00dcR UAS-BETREIBER',
  'home.hero.title': 'Alle Drohnen-Nachweise, immer griffbereit.',
  'home.hero.subtitle': 'DroneTag b\u00fcndelt Betreiberprofil, Zertifikate, Versicherungen und Drohnen in einer digitalen Identit\u00e4t \u2014 per NFC-Badge und die offizielle App.',
  'home.hero.ctaPrimary': 'Plattform betreten',
  'home.hero.ctaSecondary': 'So funktioniert es',
  'home.hero.ctaDashboard': 'Zum Dashboard',
  'home.hero.trustNfc': 'Schneller NFC-Zugang',
  'home.hero.trustDocs': 'Gesch\u00fctzte Dokumente',
  'home.hero.trustExpiry': 'Fristen im Blick',

  'home.preview.operatorName': 'Marco Bianchi',
  'home.preview.operatorRole': 'Fernpilot · AeroFly Srl',
  'home.preview.insurance': 'Haftpflichtversicherung',
  'home.preview.insuranceDetail': 'Police g\u00fcltig bis Dez. 2026',
  'home.preview.certificate': 'Zertifikat A2',
  'home.preview.certificateDetail': 'Offene Kategorie \u2014 Unterkategorie A2',
  'home.preview.drone': 'Registrierte Drohne',
  'home.preview.droneDetail': 'DJI Mavic 3 \u00b7 IT-DRN-4821',
  'home.preview.valid': 'G\u00fcltig',
  'home.preview.expiring': 'L\u00e4uft ab',
  'home.preview.showCredentials': 'Nachweise anzeigen',
  'home.preview.nfcDetected': 'Badge erkannt',
  'home.preview.nfcSuccess': 'Profil erfolgreich ge\u00f6ffnet',

  'home.audience.operator.title': 'Ich bin Betreiber',
  'home.audience.operator.desc': 'Zertifikate, Versicherungen und Drohnen einsehen und teilen.',
  'home.audience.operator.cta': 'Profil \u00f6ffnen',
  'home.audience.admin.title': 'Ich bin Administrator',
  'home.audience.admin.desc': 'Benutzer, Verifizierungen, Dokumente, Badges und Fristen verwalten.',
  'home.audience.admin.cta': 'Admin-Bereich \u00f6ffnen',
  'home.audience.verifier.title': 'Ich muss einen Betreiber pr\u00fcfen',
  'home.audience.verifier.desc': '\u00d6ffentliches Profil per NFC, QR oder Link ansehen.',
  'home.audience.verifier.cta': 'Verifizierung \u00f6ffnen',

  'home.how.title': 'So funktioniert es',
  'home.how.step1.title': 'Profil anlegen',
  'home.how.step1.desc': 'Betreiber, Organisation und Drohnen registrieren.',
  'home.how.step2.title': 'Nachweise hochladen',
  'home.how.step2.desc': 'Zertifikate, Versicherungen und Dokumente hinzuf\u00fcgen.',
  'home.how.step3.title': 'Bei Bedarf teilen',
  'home.how.step3.desc': 'Profil per NFC-Badge, QR oder Link teilen.',

  'home.features.title': 'Kernfunktionen',
  'home.features.subtitle': 'Alles f\u00fcr Betreiberidentit\u00e4t und Compliance an einem Ort.',
  'home.features.profile.title': 'Betreiberprofil',
  'home.features.profile.desc': 'Identit\u00e4t, Rollen und berufliche Daten.',
  'home.features.certificates.title': 'Zertifikate',
  'home.features.certificates.desc': 'A1/A3, A2, STS und weitere Qualifikationen.',
  'home.features.insurances.title': 'Versicherungen',
  'home.features.insurances.desc': 'Policen, G\u00fcltigkeit und zugeh\u00f6rige Dokumente.',
  'home.features.drones.title': 'Drohnen',
  'home.features.drones.desc': 'Identifikationsdaten, Status und Zuordnungen.',
  'home.features.nfc.title': 'NFC-Badge & offizielle App',
  'home.features.nfc.desc': 'Sofortiger Zugriff auf das digitale Profil.',
  'home.features.expiry.title': 'Fristen\u00fcberwachung',
  'home.features.expiry.desc': 'Hinweise bei ablaufenden oder fehlenden Dokumenten.',

  'home.nfc.title': 'Vom Badge zum digitalen Profil mit einem Tipp.',
  'home.nfc.subtitle': 'Smartphone an NFC-Badge halten oder QR scannen, um das verifizierbare Profil zu \u00f6ffnen.',
  'home.nfc.benefit1': 'Keine App erforderlich',
  'home.nfc.benefit2': 'Sofortiger Zugriff',
  'home.nfc.benefit3': '\u00d6ffentliche und gesch\u00fctzte Daten getrennt',
  'home.nfc.scanHint': '\u00d6ffentliche Verifizierungsseite',

  'home.verify.title': 'F\u00fcr schnelle Kontrollen gemacht.',
  'home.verify.subtitle': 'Beh\u00f6rden und Auftraggeber lesen das Wesentliche in Sekunden.',
  'home.verify.point1': 'Verifizierter Status auf einen Blick',
  'home.verify.point2': 'Aktive Versicherung und Zertifikate aufgelistet',
  'home.verify.point3': 'Gesch\u00fctzte Dokumente auf Anfrage',
  'home.verify.operatorId': 'ID DT-2024-0847',
  'home.verify.rowInsurance': 'Versicherung',
  'home.verify.rowCertificates': 'Aktive Zertifikate',
  'home.verify.certificatesValue': 'A1/A3, A2',
  'home.verify.rowUpdated': 'Zuletzt aktualisiert',
  'home.verify.updatedValue': '19. Jun. 2026',
  'home.verify.viewProtected': 'Gesch\u00fctzte Dokumente anzeigen',
  'home.verify.footerNote': 'Nur \u00f6ffentliche Daten \u2014 sensible Dokumente erfordern Freigabe.',

  'home.ctaFinal.title': 'Ihre Nachweise immer dabei.',
  'home.ctaFinal.subtitle': 'Melden Sie sich an und verwalten Sie Profil, Dokumente, Zertifikate und Drohnen zentral.',

  'home.footer.desc': 'Private digitale Identit\u00e4t und Dokumentenverwaltung f\u00fcr UAS-Betreiber.',
  'home.footer.legal': 'Rechtliches',
  'home.footer.privacy': 'Datenschutz',
  'home.footer.terms': 'AGB',
  'home.footer.contact': 'Kontakt',

  // ── Dashboard ──
  'dashboard.title': 'Betreiberprofile',
  'dashboard.subtitle': 'Nachweise, Policen und Verifizierung zentral verwalten.',
  'dashboard.createNew': 'Betreiber registrieren',
  'dashboard.viewPublicProfile': '\u00d6ffentliches Profil',
  'dashboard.noProfiles': 'Keine Betreiberprofile registriert',
  'dashboard.noProfilesHint': 'Legen Sie zun\u00e4chst ein Betreiberprofil an, um Nachweise zu erfassen, zu ver\u00f6ffentlichen und zu verifizieren.',
  'dashboard.deleteModalTitle': 'Betreiberprofil dauerhaft l\u00f6schen?',

  // ── Dashboard KPI labels ──
  'dashboard.stats.total': 'Profile gesamt',
  'dashboard.stats.published': '\u00d6ffentlich',
  'dashboard.stats.verified': 'Verifiziert',
  'dashboard.stats.expiring': 'L\u00e4uft bald ab',
  'dashboard.stats.expired': 'Abgelaufen',
  'dashboard.stats.incomplete': 'Unvollst\u00e4ndig',

  // ── Admin pages ──
  'admin.createProfileTitle': 'Neuen Betreiber registrieren',
  'admin.editProfileTitle': 'Betreiberprofil bearbeiten',
  'admin.environment': 'Verwaltung',

  // ── Form section headers ──
  'form.person': 'Identit\u00e4t des Betreibers',
  'form.person.desc': 'Pers\u00f6nliche Identifikationsdaten des zertifizierten Drohnenbetreibers.',
  'form.organization': 'Organisation',
  'form.organization.desc': 'Unternehmenszugeh\u00f6rigkeit und Angaben zur ausstellenden Organisation.',
  'form.insurance': 'Versicherungsdeckung',
  'form.insurance.desc': 'Angaben zur Haftpflicht- bzw. Betriebshaftpflichtversicherung und Policendokumente.',
  'form.drone': 'Registrierte Drohne',
  'form.drone.desc': 'Kennzeichnung und Stammdaten des registrierten unbemannten Luftfahrtsystems (UAS).',
  'form.documents': 'Weitere Dokumente',
  'form.verification': 'Verifizierung & Pr\u00fcfpfad',
  'form.verification.desc': 'Aktueller Verifizierungsstatus und nachvollziehbare Pr\u00fcf- bzw. Audit-Historie.',
  'form.assets': 'Medien & Dokumente',
  'form.assets.desc': 'Fotos, Logos sowie Verifizierungscodes (z.\u00a0B. QR) f\u00fcr die \u00f6ffentliche Profilseite.',
  'form.statusAndAccess': 'Ver\u00f6ffentlichung & Zugriffskontrolle',
  'form.statusAndAccess.desc': 'Lebenszyklus des Profils, Sichtbarkeit und Freigabe f\u00fcr die \u00f6ffentliche Verifizierung.',
  'form.adminSection': 'Interne Hinweise',
  'form.adminSection.desc': 'Administrative Anmerkungen, die nicht auf der \u00f6ffentlichen Seite erscheinen.',

  // ── Verification links section ──
  'form.verificationLinks': 'Verifizierung & Zugangslinks',
  'form.verificationLinks.desc': '\u00d6ffentliche URL, QR-Code und NFC-Referenz zur externen Verifizierung dieses Betreiberprofils.',
  'links.publicUrlTitle': '\u00d6ffentliche Seiten-URL',
  'links.qrTitle': 'QR-Code',
  'links.nfcTitle': 'NFC-Tag',

  // ── Form card headers ──
  'form.publicDataTitle': 'Betreiberdaten',
  'form.publicDataSubtitle': 'Diese Angaben werden auf der \u00f6ffentlichen Profilseite angezeigt.',
  'form.mediaTitle': 'Medien & Verifizierungscodes',
  'form.mediaSubtitle': 'Visuelle Assets und Codes zur externen Verifizierung des Profils.',
  'form.adminTitle': 'Verwaltung',
  'form.adminSubtitle': 'Interne Einstellungen und Notizen, nicht \u00f6ffentlich einsehbar.',

  // ── Public profile section headers ──
  'profile.organization': 'Organisation',
  'profile.orgDetails': 'Organisationsdetails',
  'profile.insurance': 'Versicherungsschutz',
  'profile.qrCode': 'QR-Verifizierung',
  'profile.droneInfo': 'Registrierte Drohne',
  'profile.notFound': 'Profil nicht gefunden',
  'profile.notPublished': 'Profil nicht verf\u00fcgbar',
  'public.operatorProfile': 'Betreiberprofil',
  'public.verifiedOperator': 'Verifizierter Betreiber',
  'public.identity': 'Betreiberidentit\u00e4t',
  'public.operatorCode': 'Betreibercode',
  'public.licenseNumber': 'Lizenznr.',
  'public.droneInformation': 'Drohneninformationen',
  'public.insuranceCoverage': 'Versicherungsschutz',
  'public.policyDetails': 'Policendetails',
  'public.policyDocument': 'Policendokument',
  'public.qrVerification': 'QR-Verifizierungscode',
  'public.verificationRecord': 'Verifizierungsprotokoll',
  'public.profileReference': 'Profilreferenz',
  'public.poweredBy': 'Powered by DroneTag',

  // ═══════════════════════════════════════════════════════════════════════════
  // M2 — User dashboard (English-source strings; pending DE polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'account.tab.operators': 'Betreiber',
  'account.tab.drones': 'Drohnen',
  'account.tab.insurances': 'Versicherungen',
  'account.tab.certificates': 'Zertifikate',
  'account.tab.documents': 'Dokumente',
  'account.tab.permits': 'Genehmigungen',
  'account.tab.archive': 'Archiv',

  'account.section.accountType': 'Kontotyp',
  'account.accountType.private': 'Privatperson',
  'account.accountType.company': 'Unternehmen',
  'account.section.privateInfo': 'Persönliche Angaben',
  'account.section.companyInfo': 'Unternehmensangaben',
  'account.section.address': 'Adresse',
  'account.section.media': 'Bilder des öffentlichen Profils',
  'account.mediaHint': 'Foto, Logo und Banner erscheinen auf der öffentlichen Seite deiner Drohne (/u/…). Kontakt- und Adressdaten bleiben privat.',
  'account.lockedIdentityHint': 'Foto, Logo und Banner kannst du jederzeit ändern. Um persönliche Daten, Telefon, E-Mail oder Adresse zu ändern, wende dich an einen Administrator.',
  'account.saved': 'Änderungen gespeichert',
  'account.saveError': 'Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.',
  'account.storageBillingRequired': 'Cloud Storage erfordert den Firebase-Blaze-Tarif. Öffne die Firebase-Konsole → Projekteinstellungen → Nutzung und Abrechnung, verknüpfe ein Rechnungskonto, wechsle zu Blaze und versuche es dann erneut.',
  'entity.noPdfAttached': 'Kein PDF angehängt — öffne „Bearbeiten“ und lade die Datei hoch.',
  'account.editHint': 'Edit your account details and pilot identity. None of these fields are shown publicly.',

  'field.addressLine1': 'Adresszeile 1',
  'field.addressLine2': 'Adresszeile 2 (optional)',
  'field.city': 'Ort',
  'field.postalCode': 'PLZ',
  'field.country': 'Land',
  'field.companyContactPerson': 'Ansprechperson',
  'field.companyVat': 'USt-IdNr. / Steuernummer',
  'field.companyUniqueNumber': 'Handelsregisternummer (optional)',

  'operator.list.title': 'Betreiber',
  'operator.list.subtitle': 'Bis zu {max} Betreiber pro Konto.',
  'operator.list.empty': 'Noch keine Betreiber',
  'operator.list.emptyDesc': 'Füge einen Betreiber hinzu, den du deinen Drohnen zuordnen kannst.',
  'operator.list.new': 'Neuer Betreiber',
  'operator.list.atCap': 'Du hast das Betreiberlimit erreicht.',
  'operator.kind.private': 'Privatperson',
  'operator.kind.company': 'Unternehmen',
  'operator.field.kind': 'Betreibertyp',
  'operator.field.label': 'Anzeigename',
  'operator.field.isDefault': 'Standardbetreiber',
  'operator.field.isDefaultHint': 'Wird verwendet, wenn kein temporärer Betreiber aktiv ist.',
  'operator.current.badge': 'Aktueller Betreiber',
  'operator.current.hint': 'Wähle hier deinen aktuellen Betreiber. Er wird beim Anlegen einer neuen Drohne vorausgefüllt und verwendet, wenn bei einem Flug kein temporärer Betreiber aktiv ist.',
  'operator.current.set': '{name} als aktuellen Betreiber festlegen',
  'operator.current.setShort': 'Als aktuell festlegen',
  'operator.create.title': 'Neuer Betreiber',
  'operator.edit.title': 'Betreiber bearbeiten',
  'operator.delete.title': 'Betreiber löschen?',
  'operator.delete.warningPublic': 'Dieser Betreiber ist der Standard für {count} öffentliche Drohnen. Wenn du ihn löschst, haben diese Drohnen keinen Standardbetreiber mehr.',

  'drone.list.title': 'Drohnen',
  'drone.list.empty': 'Noch keine Drohnen',
  'drone.list.emptyDesc': 'Füge deine erste Drohne hinzu, um ihr Profil zu veröffentlichen.',
  'drone.list.new': 'Neue Drohne',
  'drone.list.atCap': 'Du hast alle Drohnen-Slots belegt.',
  'drone.field.manufacturer': 'Hersteller',
  'drone.field.model': 'Modell / Name',
  'drone.field.classMarking': 'Klassenkennzeichen',
  'drone.field.serialNumber': 'Seriennummer der Drohne',
  'drone.field.controllerSerial': 'Seriennummer der Fernsteuerung',
  'drone.field.defaultOperator': 'Standardbetreiber',
  'drone.field.linkedPilot': 'Verknüpfter Pilot',
  'drone.field.insurance': 'Versicherungspolice',
  'drone.field.insuranceNone': 'Keine Versicherung verknüpft',
  'drone.field.status': 'Status',
  'drone.field.visibility': 'Sichtbarkeit',
  'drone.field.slug': 'Öffentlicher URL-Slug',
  'drone.publicUrl': 'Öffentliche URL',
  'drone.copySlug': 'Öffentliche URL kopieren',
  'drone.slugCopied': 'Öffentliche URL kopiert',
  'drone.create.title': 'Neue Drohne',
  'drone.edit.title': 'Drohnendetails',
  'drone.delete.title': 'Drohne löschen?',
  'drone.delete.warning': 'Diese Drohne ist derzeit unter {url} öffentlich. Die QR-/NFC-Karte funktioniert dann sofort nicht mehr.',
  'drone.class.c0': 'C0 (unter 250 g)',
  'drone.class.c1': 'C1 (unter 900 g)',
  'drone.class.c2': 'C2 (unter 4 kg)',
  'drone.class.c3': 'C3 (unter 25 kg)',
  'drone.class.c4': 'C4 (unter 25 kg, ohne Automatisierung)',
  'drone.class.unknown': 'Unbekannt / nicht klassifiziert',
  'drone.catalog.title': 'Modellkatalog',
  'drone.catalog.search': 'Finde deine Drohne',
  'drone.catalog.searchPlaceholder': 'Suche nach DJI Mini, Air 3S, Autel…',
  'drone.catalog.hint': 'Wähle ein gängiges Modell, dann werden Marke, Name und EU-Klasse automatisch ausgefüllt. Du ergänzt nur Seriennummer und Betreiber.',
  'drone.catalog.empty': 'Keine passenden Modelle. Versuche eine andere Suche oder wähle „Anderes Modell“.',
  'drone.catalog.custom': 'Anderes Modell — Daten manuell eingeben',
  'drone.catalog.selectedClass': 'EU-Klasse',
  'drone.catalog.required': 'Wähle ein Modell aus dem Katalog oder „Anderes Modell“.',
  'drone.catalog.serialHint': 'Seriennummer am Fluggerät',
  'drone.detail.basics': 'Grunddaten',
  'drone.detail.identity': 'Identität & Seriennummern',
  'drone.detail.publish': 'Veröffentlichung',
  'drone.detail.linked': 'Verknüpfte Einträge',
  'drone.backToList': 'Zurück zu den Drohnen',
  'drone.confirmCreate.title': 'Drohnendaten bestätigen',
  'drone.confirmCreate.message': 'Prüfe die Angaben: Nach dem Speichern können Hersteller, Modell, Klasse und Seriennummer nicht mehr geändert werden. Zum Korrigieren musst du die Drohne löschen und neu registrieren.',
  'drone.confirmLock.title': 'Drohnendaten sperren',
  'drone.confirmLock.message': 'Prüfe die Angaben: Nach dem Speichern können diese Felder nicht mehr geändert werden. Zum Korrigieren musst du die Drohne löschen und neu registrieren.',
  'drone.locked.hint': 'Die Drohnendaten sind gesperrt. Zum Korrigieren lösche die Drohne und registriere sie neu oder wende dich an den Support.',

  'insurance.list.title': 'Versicherungspolicen',
  'insurance.list.subtitle': 'Eine Police kann mehrere Drohnen abdecken. Verknüpfe den Versicherungsnehmer und wähle dann alle versicherten Fluggeräte aus.',
  'insurance.list.empty': 'Keine Versicherungspolicen',
  'insurance.list.emptyDesc': 'Lade das PDF einer Police hoch — ein einziger Versicherungsschein kann deine ganze Flotte abdecken.',
  'insurance.list.new': 'Neue Police',
  'insurance.field.link': 'Verknüpft mit',
  'insurance.link.drone': 'Drohne',
  'insurance.link.operator': 'Betreiber',
  'insurance.field.drone': 'Verknüpfte Drohne',
  'insurance.field.coveredDrones': 'Versicherte Drohnen',
  'insurance.field.coveredDronesHint': 'Wähle alle Drohnen aus, die diese Police abdeckt. Eine einzige Versicherung kann mehrere Fluggeräte schützen.',
  'insurance.field.noDrones': 'Noch keine Drohnen in deiner Flotte — füge zuerst eine Drohne hinzu oder speichere die Police und verknüpfe sie später.',
  'insurance.coveredCount': '{count} Drohnen',
  'insurance.field.operator': 'Verknüpfter Betreiber',
  'insurance.create.title': 'Neue Versicherungspolice',
  'insurance.edit.title': 'Versicherungspolice bearbeiten',
  'insurance.delete.title': 'Police löschen?',
  'insurance.confirmCreate.title': 'Versicherungsdaten bestätigen',
  'insurance.confirmCreate.message': 'Angaben bestätigen? Stimmen sie mit den aus dem Dokument gelesenen Daten überein, ist die Police sofort verifiziert; hast du sie geändert, prüft sie ein Administrator. Nach dem Speichern sind die Felder nicht mehr änderbar: Zum Korrigieren lösche die Police und lade sie erneut hoch.',
  'insurance.locked.hint': 'Die Policendaten sind gesperrt. Zum Korrigieren lösche die Police und lade sie erneut hoch oder wende dich an den Support.',
  'insurance.view.title': 'Versicherungsdetails',
  'insurance.delete.warningPublic': 'Diese Police ist derzeit mit einer öffentlichen Drohne verknüpft. Wenn du sie löschst, wird der Versicherungsstatus aus diesem öffentlichen Profil entfernt.',
  'insurance.field.validity': 'Gültig von – bis',
  'insurance.parse.hint': 'Aus dem PDF lesen wir Versicherungsnehmer, Policennummer, Daten und versicherte Drohnen aus – du musst nur prüfen und bestätigen.',
  'insurance.parse.parsing': 'Policendaten werden aus dem PDF gelesen…',
  'insurance.parse.success': 'Daten aus dem Dokument gelesen: prüfe und bestätige sie. Lässt du sie unverändert, ist die Prüfung sofort erledigt.',
  'insurance.parse.partial': 'Einige Felder wurden ausgelesen — bitte ergänze den Rest manuell.',
  'insurance.parse.failed': 'Dieses PDF konnte nicht automatisch gelesen werden. Gib die Daten manuell ein.',
  'insurance.parse.droneDetected': 'Drohne aus dem PDF',
  'insurance.parse.dronesDetected': 'Fluggeräte in der Police: {count}',
  'insurance.parse.dronesMatched': '{count} deiner Flotte zugeordnet',
  'insurance.parse.droneMatched': 'mit deiner Flotte verknüpft',
  'insurance.parse.droneNotMatched': 'Drohne manuell auswählen',
  'insurance.coverdrone.cta': 'Coverdrone-Angebot anfordern',
  'insurance.coverdrone.hint': 'Police läuft ab oder ist abgelaufen? Verlängere sie oder schließe bei Coverdrone eine EU-Drohnenhaftpflicht ab.',

  'cert.list.title': 'Zertifikate',
  'cert.list.subtitle': 'A1/A3, A2, STS-Theorie, STS-01, STS-02 oder andere.',
  'cert.list.empty': 'Keine Zertifikate',
  'cert.list.emptyDesc': 'Füge deine A1/A3-, A2- oder STS-Zertifikate hinzu.',
  'cert.list.new': 'Neues Zertifikat',
  'cert.list.atCap': 'Du hast alle Zertifikats-Slots belegt.',
  'cert.field.kind': 'Zertifikatstyp',
  'cert.field.label': 'Anzeigename',
  'cert.field.registrationNumber': 'Registrierungsnummer',
  'cert.field.registrationNumberHint': 'Automatisch aus dem PDF gelesen oder manuell eingeben',
  'cert.field.issuedBy': 'Ausgestellt von',
  'cert.field.fileUrl': 'Zertifikats-URL',
  'cert.field.filePdf': 'Zertifikatsdokument (PDF)',
  'cert.field.number': 'Zertifikatsnummer',
  'cert.field.notes': 'Notizen',
  'cert.kind.a1a3': 'A1 / A3',
  'cert.kind.a2': 'A2',
  'cert.kind.stsTheoretical': 'STS-Theorie',
  'cert.kind.sts01': 'STS-01',
  'cert.kind.sts02': 'STS-02',
  'cert.kind.custom': 'Anderes Zertifikat',
  'cert.create.title': 'Neues Zertifikat',
  'cert.edit.title': 'Zertifikat bearbeiten',
  'cert.delete.title': 'Zertifikat löschen?',
  'cert.confirmCreate.title': 'Zertifikatsdaten bestätigen',
  'cert.confirmCreate.message': 'Angaben bestätigen? Stimmen sie mit den aus dem Dokument gelesenen Daten überein, ist das Zertifikat sofort verifiziert; hast du sie geändert, prüft es ein Administrator. Nach dem Speichern sind die Felder nicht mehr änderbar: Zum Korrigieren lösche das Zertifikat und lade es erneut hoch.',
  'cert.locked.hint': 'Die Zertifikatsdaten sind gesperrt. Zum Korrigieren lösche das Zertifikat und lade es erneut hoch oder wende dich an den Support.',
  'cert.view.title': 'Zertifikatsdetails',
  'cert.parse.hint': 'Bei italienischen Zertifikaten lesen wir den ITA-…-Code, die Daten und den Typ automatisch aus – du musst nur prüfen und bestätigen.',
  'cert.parse.parsing': 'Zertifikatsdaten werden aus dem PDF gelesen…',
  'cert.parse.success': 'Daten aus dem Dokument gelesen: prüfe und bestätige sie. Lässt du sie unverändert, ist die Prüfung sofort erledigt.',
  'cert.parse.partial': 'Einige Felder wurden ausgelesen — bitte ergänze den Rest manuell.',
  'cert.parse.failed': 'Dieses PDF konnte nicht automatisch gelesen werden. Gib die Daten manuell ein.',

  'doc.list.title': 'Hochgeladene Dokumente',
  'doc.list.subtitle': '{used} von {max} Dokument-Slots belegt.',
  'doc.list.empty': 'Keine Dokumente',
  'doc.list.emptyDesc': 'Lade PDFs hoch (Versicherungspolice, Registrierung, Schulungsnachweis usw.).',
  'doc.list.new': 'Neues Dokument',
  'doc.list.atCap': 'Du hast alle Dokument-Slots belegt.',
  'doc.field.kind': 'Dokumenttyp',
  'doc.field.label': 'Name',
  'doc.field.labelHint': 'Optional — sonst wird der Dateiname verwendet',
  'doc.field.file': 'Datei',
  'doc.field.fileUrl': 'Datei-URL',
  'doc.field.fileName': 'Dateiname',
  'doc.field.notes': 'Notizen',
  'doc.kind.insurance_policy': 'Versicherungspolice',
  'doc.kind.operator_license': 'Betreiberlizenz',
  'doc.kind.drone_registration': 'Drohnenregistrierung',
  'doc.kind.training_certificate': 'Schulungsnachweis',
  'doc.kind.identity': 'Ausweisdokument',
  'doc.kind.other': 'Sonstiges',
  'doc.create.title': 'Neues Dokument',
  'doc.edit.title': 'Dokument bearbeiten',
  'doc.delete.title': 'Dokument löschen?',
  'doc.urlHint': 'Füge eine öffentliche URL zur Datei ein (Firebase-Storage-URL, signierter Link usw.).',

  'permits.list.title': 'Genehmigungen und Erlaubnisse',
  'permits.list.subtitle': 'Tagesgenehmigungen, Nullaosta und Betriebsgenehmigungen. Abgelaufene Einträge wandern ins Archiv.',
  'permits.list.new': 'Neue Genehmigung',
  'permits.list.empty': 'Keine aktiven Genehmigungen',
  'permits.list.emptyDesc': 'Lade Tagesgenehmigungen, Nullaosta, stundenweise Freigaben und ähnliche Betriebsdokumente hoch.',
  'permits.list.atCap': 'Du hast alle Slots für aktive Genehmigungen belegt.',
  'permits.hint.parser': 'Gib Gebiet, Auflagen, Zeitraum und die betroffene Drohne an.',
  'permits.hint.storage': 'Hänge das PDF oder ein Foto der Genehmigung an.',
  'permits.hint.admin': 'Ein DroneTag-Administrator prüft sie.',
  'permits.archiveNotice': 'Abgelaufene Einträge ins Archiv verschoben: {count}.',
  'permits.create.title': 'Neue Genehmigung',
  'permits.edit.title': 'Genehmigung bearbeiten',
  'permits.delete.title': 'Genehmigung löschen?',
  'permits.delete.message': 'Diese Genehmigung wird dauerhaft entfernt.',
  'permits.kind.daily': 'Tagesgenehmigung',
  'permits.kind.nullaosta': 'Nullaosta',
  'permits.kind.hourly_nullaosta': 'Nullaosta (stundenweise)',
  'permits.kind.temporary': 'Befristete Genehmigung',
  'permits.kind.other': 'Sonstige',
  'permits.field.kind': 'Typ',
  'permits.field.label': 'Titel',
  'permits.field.issuedBy': 'Ausgestellt von',
  'permits.field.area': 'Gebiet / Zone',
  'permits.field.validFrom': 'Gültig ab',
  'permits.field.validTo': 'Gültig bis',
  'permits.field.notes': 'Notizen',
  'permits.field.file': 'Dokument (PDF oder Bild)',

  'archive.list.title': 'Archiv',
  'archive.list.subtitle': 'Abgelaufene Zertifikate, Policen und Genehmigungen. Mehr Speicher bekommst du unter „Abrechnung“.',
  'archive.list.new': 'Ins Archiv hochladen',
  'archive.list.empty': 'Das Archiv ist leer',
  'archive.list.emptyDesc': 'Wenn Zertifikate, Versicherungspolicen oder Genehmigungen ablaufen, erscheinen sie automatisch hier.',
  'archive.hint.storage': 'Inklusive Archivspeicher: 30 MB',
  'archive.hint.autoMove': 'Abgelaufene Versionen landen automatisch hier',
  'archive.hint.upgrade': 'Mehr Archivspeicher kaufen',
  'archive.cta.buySpace': 'Speicher kaufen',
  'archive.storage.title': 'Archivspeicher',
  'archive.storage.used': '{used} MB von {max} MB belegt',
  'archive.expiredOn': 'Abgelaufen am',
  'archive.openSource': 'Bereich öffnen',
  'archive.delete.title': 'Aus dem Archiv löschen?',
  'archive.delete.message': 'Das abgelaufene Dokument wird dauerhaft entfernt und der Speicher freigegeben.',

  'slot.usage': '{used} von {max} belegt',
  'slot.atCap': 'Limit erreicht',
  'slot.contactToUpgrade': 'Kontaktiere einen Administrator, um weitere Slots hinzuzufügen.',

  'confirm.continue': 'Weiter',
  'confirm.dangerWarning': 'Diese Aktion kann nicht rückgängig gemacht werden.',

  'form.errors.title': 'Bitte korrigiere die markierten Felder.',
  'form.errors.invalidEmail': 'Gib eine gültige E-Mail-Adresse ein.',
  'form.errors.invalidUrl': 'Gib eine gültige URL ein.',
  'form.errors.urlNotAllowed': 'Die URL muss auf Firebase Storage oder einem vom Administrator konfigurierten vertrauenswürdigen Host liegen.',
  'form.errors.expiryBeforeIssue': 'Das Ablaufdatum muss nach dem Ausstellungsdatum liegen.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M3 — Public drone page + Report found drone (English source; pending DE).
  // ═══════════════════════════════════════════════════════════════════════════

  'publicDrone.eyebrow': 'Drohnenidentifikation',
  'publicDrone.holderPilot': 'Fernpilot',
  'publicDrone.holderOperatorPrivate': 'UAS-Betreiber',
  'publicDrone.holderOperatorCompany': 'UAS-Betreiber (Unternehmen)',
  'publicDrone.holderName': 'Name',
  'publicDrone.classification': 'Drohnenklasse',
  'publicDrone.identifier': 'Seriennummer',
  'publicDrone.policyNumberMasked': 'Policenreferenz',
  'publicDrone.validUntil': 'Gültig bis',
  'publicDrone.userVerified': 'Verifizierter Nutzer',
  'publicDrone.userPending': 'Nutzer in Prüfung',
  'publicDrone.userUnverified': 'Nutzer nicht verifiziert',
  'publicDrone.userRejected': 'Nutzer nicht freigegeben',
  'publicDrone.insuranceUnknown': 'Keine Versicherungsangaben hinterlegt',
  'publicDrone.insuranceActive': 'Versicherung aktiv',
  'publicDrone.insuranceExpiring': 'Versicherung läuft bald ab',
  'publicDrone.insuranceExpired': 'Versicherung abgelaufen',
  'publicDrone.certificatesVerified': 'Zertifikate verifiziert',
  'publicDrone.certificatesPending': 'Zertifikate in Prüfung',
  'publicDrone.certificatesUnverified': 'Zertifikate nicht verifiziert',
  'publicDrone.certificatesRejected': 'Zertifikate abgelehnt',
  'publicDrone.viewPolicyPdf': 'Policendokument ansehen',
  'publicDrone.openApp': 'App öffnen / anmelden',
  'publicDrone.reportFound': 'Ich habe diese Drohne gefunden',
  'publicDrone.reportFoundShort': 'Drohnenfund melden',
  'publicDrone.lastVerified': 'Zuletzt verifiziert',
  'publicDrone.publishedOn': 'Veröffentlicht am',
  'publicDrone.disclaimer': 'DroneTag ist eine private Plattform zur digitalen Identifikation. Sie ersetzt nicht die offizielle Betreiberregistrierung, die Pilotenzertifizierung, Versicherungspflichten oder behördlich ausgestellte Dokumente.',

  'reportFound.title': 'Gefundene Drohne melden',
  'reportFound.subtitle': 'Hilf mit, diese Drohne ihrem Eigentümer zurückzugeben. Die Angabe deiner Kontaktdaten ist freiwillig.',
  'reportFound.field.finderName': 'Dein Name (optional)',
  'reportFound.field.finderEmail': 'Deine E-Mail (optional)',
  'reportFound.field.message': 'Nachricht an den Eigentümer (optional)',
  'reportFound.field.locationText': 'Ungefährer Fundort (optional)',
  'reportFound.field.locationTextHint': 'Freitext: Adresse, Orientierungspunkt, Stadtteil usw.',
  'reportFound.geolocation.add': 'Meinen GPS-Standort teilen',
  'reportFound.geolocation.added': 'GPS-Standort erfasst',
  'reportFound.geolocation.remove': 'GPS-Standort entfernen',
  'reportFound.geolocation.error': 'Kein Zugriff auf den Standort möglich. Du kannst den Ort trotzdem im Feld oben beschreiben.',
  'reportFound.privacy': 'Deine Nachricht geht nur an den Besitzer der Drohne und das DroneTag-Team – sie wird nie auf der öffentlichen Seite angezeigt.',
  'reportFound.submit': 'Meldung senden',
  'reportFound.submitting': 'Wird gesendet…',
  'reportFound.successTitle': 'Danke für deine Meldung',
  'reportFound.successBody': 'Der Eigentümer der Drohne wurde benachrichtigt. Falls du Kontaktdaten angegeben hast, kann er sich darüber bei dir melden.',
  'reportFound.errorBody': 'Deine Meldung konnte nicht gesendet werden. Bitte versuche es gleich noch einmal.',
  'reportFound.cooldown': 'Bitte warte ein paar Sekunden, bevor du eine weitere Meldung sendest.',

  'inbox.title': 'Fundmeldungen',
  'inbox.subtitle': 'Nachrichten von Personen, die eine deiner Drohnen gefunden haben.',
  'inbox.tab': 'Fundmeldungen',
  'inbox.empty': 'Noch keine Fundmeldungen',
  'inbox.emptyDesc': 'Wenn jemand eine deiner öffentlichen Drohnenkarten scannt und auf „Drohnenfund melden“ tippt, siehst du die Nachricht hier.',
  'inbox.unread': 'Ungelesen',
  'inbox.read': 'Gelesen',
  'inbox.markRead': 'Als gelesen markieren',
  'inbox.viewLocation': 'Auf Karte anzeigen',
  'inbox.locationCoords': '{lat}, {lng} (±{accuracy} m)',
  'inbox.fromAnonymous': 'Anonymer Finder',
  'inbox.contact': 'Kontakt',
  'inbox.location': 'Gemeldeter Standort',
  'inbox.message': 'Nachricht',
  'inbox.about': 'Betroffene Drohne',
  'inbox.openDrone': 'Drohne öffnen',
  'inbox.receivedAt': 'Empfangen am {date}',


  'support.title': 'Support',
  'support.subtitle': 'Schreib dem DroneTag-Team bei Änderungen an deinen Identitätsdaten und allem, was nur ein Administrator ändern kann.',
  'support.nav': 'Support',
  'support.empty': 'Noch keine Nachrichten',
  'support.emptyDesc': 'Schreib unten, um eine Unterhaltung zu beginnen. Nutze sie für Namenskorrekturen, Änderungen von Telefon/E-Mail und andere gesperrte Felder.',
  'support.composer.placeholder': 'Schreib deine Nachricht…',
  'support.composer.subjectPlaceholder': 'Betreff (optional)',
  'support.send': 'Senden',
  'support.sending': 'Wird gesendet…',
  'support.closed': 'Diese Unterhaltung ist geschlossen. Sende eine Nachricht, um sie wieder zu öffnen.',
  'support.you': 'Du',
  'support.admin': 'Support',
  'support.hint.nameChange': 'Möchtest du deinen Namen oder andere gesperrte Daten ändern? Schreib hier — ein Administrator aktualisiert dein Konto.',
  'support.status.open': 'Offen',
  'support.status.closed': 'Geschlossen',

  'admin.nav.support': 'Support',
  'admin.support.title': 'Support-Posteingang',
  'admin.support.subtitle': 'Unterhaltungen mit Nutzern zu gesperrten Feldern und Kontohilfe.',
  'admin.support.empty': 'Keine Unterhaltungen',
  'admin.support.emptyDesc': 'Wenn ein Nutzer dem Support schreibt, erscheint die Unterhaltung hier.',
  'admin.support.openUser': 'Nutzerprofil öffnen',
  'admin.support.close': 'Unterhaltung schließen',
  'admin.support.reopen': 'Unterhaltung wieder öffnen',
  'admin.support.unread': '{count} ungelesen',
  'admin.support.select': 'Wähle eine Unterhaltung',
  'admin.support.composer.placeholder': 'Als Admin antworten…',
  'admin.users.openSupport': 'Support-Chat öffnen',

  'publicDrone.errorTitle': 'Diese Drohne konnte nicht geladen werden',
  'publicDrone.errorBody': 'Beim Abrufen des Drohnenprofils ist ein Problem aufgetreten. Prüfe deine Verbindung und versuche es erneut.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M4 — Temporary operator switching (English source; pending DE polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'activeOp.section.title': 'Aktiver Betreiber',
  'activeOp.section.subtitle': 'Weise diese Drohne vorübergehend einem anderen Betreiber zu. Der Wechsel endet automatisch nach 24 Stunden.',
  'activeOp.label.effective': 'Jetzt wirksam',
  'activeOp.label.default': 'Standardbetreiber',
  'activeOp.label.activeOverride': 'Temporärer Betreiber',
  'activeOp.label.expiresAt': 'Rückkehr zum Standard am',
  'activeOp.label.setAt': 'Aktiviert am',
  'activeOp.label.reason': 'Grund',
  'activeOp.countdown.hours': 'noch {hours} h {minutes} min',
  'activeOp.countdown.minutes': 'noch {minutes} min',
  'activeOp.countdown.expired': 'Abgelaufen — zurück zum Standardbetreiber',
  'activeOp.cta.switch': 'Aktiven Betreiber wechseln',
  'activeOp.cta.clearNow': 'Temporären Betreiber jetzt entfernen',
  'activeOp.cta.confirmAndApply': 'Bestätigen und aktivieren',
  'activeOp.modal.title': 'Temporären Betreiber aktivieren',
  'activeOp.modal.subtitle': 'Wähle den Betreiber, der in den nächsten 24 Stunden für diese Drohne verantwortlich sein soll.',
  'activeOp.modal.field.operator': 'Betreiber',
  'activeOp.modal.field.reason': 'Grund (optional)',
  'activeOp.modal.field.reasonHint': 'Hilft dir und den Administratoren nachzuvollziehen, warum der Wechsel aktiviert wurde.',
  'activeOp.modal.responsibility': 'Ich bestätige, dass ich vor der Aktivierung dieses Betreibers alle Betreiberdaten, den Versicherungsschutz, die Zuordnung der Drohne und die rechtliche Verantwortung geprüft habe.',
  'activeOp.modal.responsibilityRequired': 'Du musst die Verantwortung bestätigen, bevor du den temporären Betreiber aktivierst.',
  'activeOp.modal.duration': 'Der Wechsel gilt 24 Stunden, danach wird automatisch wieder der Standardbetreiber verwendet.',
  'activeOp.modal.sameAsDefault': 'Der ausgewählte Betreiber ist bereits der Standardbetreiber. Wähle einen anderen Betreiber, um einen temporären Wechsel zu aktivieren.',
  'activeOp.empty.noAlternativeTitle': 'Kein alternativer Betreiber verfügbar',
  'activeOp.empty.noAlternativeDesc': 'Füge auf der Seite „Betreiber“ einen zweiten Betreiber hinzu, um den temporären Wechsel zu ermöglichen.',
  'activeOp.clear.title': 'Temporären Betreiber entfernen?',
  'activeOp.clear.message': 'Die Drohne kehrt sofort zu ihrem Standardbetreiber zurück und das Prüfprotokoll des Wechsels wird entfernt.',
  'activeOp.banner.activeNow': 'Derzeit ist ein temporärer Betreiberwechsel aktiv.',
  'activeOp.errorBody': 'Der aktive Betreiber konnte nicht aktualisiert werden. Bitte versuche es erneut.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M5 — Admin / plans / PWA / disclaimers (English source; pending DE polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'legal.platformDisclaimer': 'DroneTag is a private digital identification and document management platform. It does not replace official drone operator registration, pilot certification, insurance obligations, or authority-issued documentation.',
  'legal.notOfficial': 'Kein offizielles Register einer Regierungs- oder Luftfahrtbehörde.',

  'admin.title': 'Admin',
  'admin.subtitle': 'Verwalte die Plattform: Nutzer, Drohnen, Fundmeldungen, Tarife und Verifizierungswarteschlange.',
  'admin.overview.subtitle': 'Heutige Arbeitsliste: Verifizierung, Fundmeldungen, Support und aktive Betreiberwechsel.',
  'admin.overview.attentionTitle': 'Einträge erfordern deine Aufmerksamkeit',
  'admin.overview.attentionBody': '{count} offene Einträge in Verifizierung, Fundmeldungen und Support.',
  'admin.overview.allClearTitle': 'Nichts Dringendes',
  'admin.overview.allClearBody': 'Keine ausstehenden Verifizierungen, ungelesenen Fundmeldungen oder offenen Support-Antworten.',
  'admin.overview.stat.queue': 'Zu verifizieren',
  'admin.overview.stat.unreadReports': 'Ungelesene Fundmeldungen',
  'admin.overview.stat.support': 'Fällige Support-Antworten',
  'admin.overview.stat.overrides': 'Aktive Betreiberwechsel',
  'admin.overview.verify.title': 'Verifizierung im Detail',
  'admin.overview.verify.subtitle': 'Einträge, die auf deine Entscheidung warten.',
  'admin.overview.openQueue': 'Warteschlange öffnen',
  'admin.overview.reports.title': 'Ungelesene Fundmeldungen',
  'admin.overview.reports.subtitle': 'Nachrichten von Personen, die ein öffentliches Profil gescannt haben.',
  'admin.overview.openReports': 'Posteingang öffnen',
  'admin.overview.reports.empty': 'Keine ungelesenen Meldungen',
  'admin.overview.reports.emptyDesc': 'Neue Nachrichten von Findern erscheinen hier.',
  'admin.overview.reports.anonymous': 'Anonymer Finder',
  'admin.overview.support.title': 'Unbeantwortete Support-Anfragen',
  'admin.overview.support.subtitle': 'Offene Unterhaltungen mit ungelesenen Nachrichten für Administratoren.',
  'admin.overview.openSupport': 'Support öffnen',
  'admin.overview.support.empty': 'Keine ausstehenden Antworten',
  'admin.overview.support.emptyDesc': 'Nutzernachrichten, die eine Antwort eines Administrators erfordern, erscheinen hier.',
  'admin.overview.overrides.title': 'Aktive Betreiberwechsel',
  'admin.overview.overrides.subtitle': 'Derzeit gültige temporäre Betreiberwechsel (24 h).',
  'admin.overview.openDrones': 'Drohnen öffnen',
  'admin.overview.overrides.empty': 'Keine aktiven Betreiberwechsel',
  'admin.overview.overrides.emptyDesc': 'Temporäre Betreiberzuweisungen erscheinen hier, solange sie gültig sind.',
  'admin.overview.overrides.until': 'Bis {when}',
  'admin.overview.foot.users': 'Konten',
  'admin.overview.foot.public': 'Öffentliche Drohnen',
  'admin.nav.overview': 'Übersicht',
  'admin.nav.users': 'Nutzer',
  'admin.nav.drones': 'Drohnen',
  'admin.nav.reports': 'Gefundene Drohnen',
  'admin.nav.verify': 'Verifizierung',
  'admin.nav.plans': 'Tarife',
  'admin.nav.legacy': 'Legacy-Profile',
  'admin.stats.users': 'Nutzer',
  'admin.stats.drones': 'Drohnen',
  'admin.stats.publicDrones': 'Öffentliche Drohnen',
  'admin.stats.reports': 'Gefundene Drohnen',
  'admin.stats.unreadReports': 'Ungelesene Fundmeldungen',
  'admin.stats.plans': 'Aktive Tarife',
  'admin.stats.activeOverrides': 'Aktive Betreiberwechsel',
  'admin.stats.legacyProfiles': 'Legacy-Profile',

  'admin.users.title': 'Benutzer',
  'admin.users.subtitle': 'Alle Konten der Plattform ansehen, durchsuchen und bearbeiten.',
  'admin.users.searchPlaceholder': 'Name, E-Mail, Firma, USt-ID…',
  'admin.users.empty': 'Noch keine Benutzer',
  'admin.users.loadError': 'Nutzer konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut; wenn es weiter passiert, melde dich ab und wieder an.',
  'admin.users.create.title': 'Neuer Benutzer',
  'admin.users.create.subtitle': 'Lege Zugang und Profil des Nutzers an. Er kann sich nur anmelden und seine eigenen Daten und Dokumente verwalten.',
  'admin.users.create.tempPassword': 'Temporäres Passwort',
  'admin.users.create.submit': 'Benutzer anlegen',
  'admin.users.create.errorEmailInUse': 'Es gibt bereits ein Konto mit dieser E-Mail-Adresse.',
  'admin.users.create.errorGeneric': 'Der Benutzer konnte nicht angelegt werden. Bitte versuche es erneut.',
  'admin.users.create.errorAdminSdk':
    'Firebase Admin is not configured locally. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env.local to your service-account JSON file path, then restart npm run dev.',
  'admin.users.create.errorNameRequired': 'Vor- und Nachname sind erforderlich.',
  'admin.users.create.errorInvalidEmail': 'Gib eine gültige E-Mail-Adresse ein.',
  'admin.users.create.errorAuth': 'Admin-Sitzung abgelaufen. Melde dich ab und wieder an und versuche es erneut.',
  'admin.users.create.errorNetwork': 'Netzwerkfehler beim Anlegen des Benutzers. Prüfe deine Verbindung und versuche es erneut.',
  'admin.users.create.errors.summary': '{count} Felder müssen noch korrigiert werden, bevor das Konto angelegt werden kann.',
  'admin.users.create.errors.email_required': 'Die E-Mail-Adresse ist erforderlich, damit sich der Benutzer anmelden kann.',
  'admin.users.create.errors.email_invalid': 'Gib eine gültige E-Mail-Adresse ein (z. B. name@firma.it).',
  'admin.users.create.errors.password_required': 'Ein temporäres Passwort ist erforderlich (teile es dem Benutzer auf sicherem Weg mit).',
  'admin.users.create.errors.password_too_short': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
  'admin.users.create.errors.firstName_required': 'Der Vorname ist erforderlich.',
  'admin.users.create.errors.lastName_required': 'Der Nachname ist erforderlich.',
  'admin.users.create.errors.companyName_required': 'Für Firmenkonten ist der Firmenname erforderlich.',
  'admin.users.create.errors.companyContactPerson_required': 'Für Firmenkonten ist eine Ansprechperson erforderlich.',
  'admin.users.col.name': 'Name',
  'admin.users.col.type': 'Typ',
  'admin.users.col.email': 'E-Mail',
  'admin.users.col.created': 'Erstellt',
  'admin.users.openProfile': 'Konto verwalten',
  'admin.users.editData': 'Daten bearbeiten',
  'common.showPassword': 'Passwort anzeigen',
  'common.hidePassword': 'Passwort verbergen',
  'admin.users.loginHint.title': 'Benutzeranmeldung',
  'admin.users.loginHint.body': 'Der Nutzer meldet sich unter /login mit dieser E-Mail an. Hast du das Konto angelegt, nutzt er das von dir gesetzte temporäre Passwort; nach der ersten Anmeldung ergänzt er seine Daten unter Mein Konto.',
  'admin.users.publicHint.title': 'Öffentliche Seite (QR / NFC)',
  'admin.users.publicHint.body': 'Jede veröffentlichte Drohne hat eine eigene öffentliche Seite – die, die der QR-Code oder das NFC-Badge öffnet. Der Nutzer aktiviert sie unter Mein Konto → Drohnen; du kannst sie auch im Bereich Drohnen unten verwalten.',
  'admin.users.publicHint.none':
    'No public drone yet: create a drone and set visibility to Public.',
  'admin.users.publicProfileUnavailable':
    'No public page yet: add a public drone with a slug.',
  'admin.users.detail.account': 'Kontodaten',
  'admin.users.detail.pilot': 'Identität des Fernpiloten',
  'admin.users.detail.slots': 'Slots',
  'admin.users.detail.operators': 'Betreiber',
  'admin.users.detail.drones': 'Drohnen',
  'admin.users.detail.insurances': 'Versicherungen',
  'admin.users.detail.certificates': 'Zertifikate',
  'admin.users.detail.authorizations': 'Genehmigungen',
  'admin.users.detail.documents': 'Dokumente',
  'admin.users.backToList': 'Zurück zu den Benutzern',

  'admin.slots.title': 'Slots & Kontingente',
  'admin.slots.subtitle': 'Lege fest, wie viele Slots jedes Typs diesem Benutzer zustehen.',
  'admin.slots.kind.certificate': 'Zertifikate',
  'admin.slots.kind.drone': 'Drohnen',
  'admin.slots.kind.operator': 'Betreiber',
  'admin.slots.kind.pdf': 'Dokument-PDFs',
  'admin.slots.kind.permit': 'Genehmigungen / Erlaubnisse',
  'admin.slots.kind.archive': 'Archivpakete (+30 MB)',
  'admin.slots.kind.nfc_badge': 'Physische NFC-Badges',
  'admin.slots.kind.personalization': 'Personalisierung (Logo / Banner)',
  'admin.slots.usage': 'Genutzt: {used}',
  'admin.slots.save': 'Slots speichern',

  'admin.verify.title': 'Prüfwarteschlange',
  'admin.verify.subtitle': 'Warteschlange: zu prüfen (vom Nutzer korrigierte Daten oder ohne automatische Prüfung). Archiv: bereits verifiziert, auch automatisch, oder abgelehnt; du kannst sie sperren oder zurück in die Warteschlange schicken.',
  'admin.verify.view.queue': 'Warteschlange',
  'admin.verify.view.archive': 'Archiv',
  'admin.verify.archive.subtitle': 'Verifiziert (auch automatisch, wenn der Nutzer die aus dem Dokument gelesenen Daten bestätigt hat) oder abgelehnt. Du kannst sie jederzeit sperren, ablehnen oder zurück in die Warteschlange schicken.',
  'admin.verify.archive.empty': 'Das Archiv ist leer',
  'admin.verify.archive.emptyDesc': 'Verifizierte oder abgelehnte Einträge erscheinen hier.',
  'admin.verify.tab.documents': 'Dokumente',
  'admin.verify.tab.certificates': 'Zertifikate',
  'admin.verify.tab.insurances': 'Versicherungen',
  'admin.verify.tab.authorizations': 'Genehmigungen',
  'admin.verify.tab.drones': 'Drohnen',
  'admin.verify.markVerified': 'Verifizieren',
  'admin.verify.markRejected': 'Ablehnen',
  'admin.verify.markPending': 'Auf ausstehend setzen',
  'admin.verify.empty': 'Nichts zu prüfen',
  'admin.verify.emptyDesc': 'Hier erscheinen nur Einträge, die manuell geprüft werden müssen. Automatisch verifizierte landen direkt im Archiv.',

  'admin.drones.title': 'Alle Drohnen',
  'admin.drones.subtitle': 'Durchsuche alle Drohnen, auch öffentliche, private und archivierte.',
  'admin.drones.searchPlaceholder': 'Slug, Hersteller, Modell, Seriennr., Eigentümer-E-Mail…',
  'admin.drones.col.drone': 'Drohne',
  'admin.drones.col.owner': 'Eigentümer',
  'admin.drones.col.status': 'Status',
  'admin.drones.col.override': 'Aktiver Override',
  'admin.drones.openInAdmin': 'Öffnen',
  'admin.drones.adminEdit.title': 'Drohne bearbeiten',
  'admin.drones.adminEdit.subtitle': 'Admin-Bearbeitung: Änderungen werden sofort gespeichert und umgehen die Sperren des Nutzers.',
  'admin.drones.clearOverride': 'Override aufheben',

  'admin.reports.title': 'Gefundene Drohnen (alle Benutzer)',
  'admin.reports.subtitle': 'Nachrichten von Personen, die ein öffentliches Drohnenprofil gescannt haben.',
  'admin.reports.searchPlaceholder': 'Slug, Name des Finders, E-Mail, Nachricht…',
  'admin.reports.col.received': 'Eingegangen',
  'admin.reports.col.drone': 'Drohne',
  'admin.reports.col.finder': 'Finder',
  'admin.reports.col.message': 'Nachricht',
  'admin.reports.col.location': 'Standort',
  'admin.reports.col.read': 'Gelesen',

  'admin.plans.title': 'Tarife & Preise',
  'admin.plans.subtitle': 'Lege die Preise für jeden Slot-Typ fest. Die Preise werden von der Marketingseite und vom Benutzer-Dashboard gelesen.',
  'admin.plans.col.label': 'Bezeichnung',
  'admin.plans.col.kind': 'Slot-Typ',
  'admin.plans.col.price': 'Preis',
  'admin.plans.col.currency': 'Währung',
  'admin.plans.col.active': 'Aktiv',
  'admin.plans.new': 'Neuer Tarif',
  'admin.plans.create.title': 'Tarif erstellen',
  'admin.plans.edit.title': 'Tarif bearbeiten',
  'admin.plans.delete.title': 'Tarif löschen?',
  'admin.plans.field.label': 'Anzeigename',
  'admin.plans.field.description': 'Beschreibung',
  'admin.plans.field.kind': 'Slot-Typ',
  'admin.plans.field.priceCents': 'Preis (in kleinster Einheit, z. B. Cent)',
  'admin.plans.field.currency': 'Währung',
  'admin.plans.field.active': 'Aktiv',
  'admin.plans.empty': 'Noch keine Tarife konfiguriert',
  'admin.plans.emptyDesc': 'Erstelle einen Tarif für jeden Slot-Typ, den deine Benutzer kaufen können.',

  'account.plan.title': 'Dein Tarif',
  'account.plan.subtitle': 'In deinem Konto enthaltene Kontingente. Wende dich an den Admin, um die Limits zu erhöhen.',
  'account.plan.empty': 'Dein Konto nutzt den Basistarif.',
  'account.plan.contactAdmin': 'Admin kontaktieren',

  'pwa.appName': 'DroneTag',
  'pwa.appShortName': 'DroneTag',
  'pwa.appDescription': 'Digitale Identifikation und Dokumentenverwaltung für Drohnenbetreiber.',
  'pwa.install.cta': 'App installieren',
  'pwa.install.dismiss': 'Nicht jetzt',
  'pwa.install.installed': 'DroneTag ist installiert',

  'billing.title': 'Abrechnung & Abo',
  'billing.subtitle': 'Dein DroneTag-Tarif und eine Übersicht deiner Einträge.',
  'billing.comingSoon': 'Demnächst verfügbar',
  'billing.comingSoonBody': 'Online-Zahlung ist bald verfügbar. Bis dahin kannst du DroneTag ohne Limits nutzen; bei Fragen zu Tarifen und Abrechnung wende dich an den Support.',
  'billing.subscribe': 'Abonnieren',
  'billing.manageProfile': 'Zurück zum Profil',
  'account.tab.billing': 'Abrechnung',

  'empty.hints.operator.1': 'Wähle als Inhabertyp Privatperson oder Unternehmen.',
  'empty.hints.operator.2': 'Hinterlege Kontaktdaten für Meldungen und Mitteilungen.',
  'empty.hints.operator.3': 'Lege einen Betreiber als Standard für neue Drohnen fest.',
  'empty.hints.drone.1': 'Gib Hersteller, Modell und Klassenkennzeichnung an.',
  'empty.hints.drone.2': 'Wähle einen Standardbetreiber und verknüpfe einen Piloten.',
  'empty.hints.drone.3': 'Setze Status auf aktiv + Sichtbarkeit auf öffentlich, um den QR-Code zu teilen.',
  'empty.hints.insurance.1': 'Lade das PDF der Police hoch — Name, Nummer, Datumsangaben und versicherte Drohnen werden automatisch ausgelesen.',
  'empty.hints.insurance.2': 'Wähle alle Drohnen, die die Police abdeckt — eine Versicherung kann die ganze Flotte schützen.',
  'empty.hints.certificate.1': 'Lade das PDF des Zertifikats hoch — Typ, Aussteller und Datumsangaben werden automatisch ausgelesen.',
  'empty.hints.certificate.2': 'Prüfe die Daten und speichere, um das Badge gültig/abgelaufen zu sehen.',
  'empty.hints.document.1': 'Lade ergänzende PDFs hoch (Handbücher, Erklärungen, …).',
  'empty.hints.document.2': 'Dokumente bleiben privat, bis du sie veröffentlichst.',
  'empty.hints.inbox.1': 'Meldungen erscheinen hier, wenn ein Finder deinen QR-Code scannt.',
  'empty.hints.inbox.2': 'Antworte dem Finder direkt per E-Mail, wenn du eine Meldung erhältst.',

  'pwa.install.success': 'DroneTag installiert. Du findest das Symbol auf dem Startbildschirm.',
  'pwa.offline.banner': 'Du bist offline — Änderungen werden synchronisiert, sobald du wieder online bist.',
  'pwa.online.toast': 'Wieder online.',
  'pwa.iosHint.title': 'DroneTag zum Home-Bildschirm deines iPhones hinzufügen',
  'pwa.iosHint.body': 'Tippe in Safari auf das Teilen-Symbol und wähle dann „Zum Home-Bildschirm“, um DroneTag mit einem Tipp zu starten.',

  'error.boundary.title': 'Auf dieser Seite ist etwas schiefgelaufen.',
  'error.boundary.body': 'Die DroneTag-Plattform läuft weiterhin — nur diese Seite konnte nicht geladen werden. Versuche es erneut oder kehre zu deinem Dashboard zurück.',
  'error.boundary.publicBody': 'Versuche, die Seite neu zu laden. Funktioniert der QR-Code weiterhin nicht, hat der Eigentümer die Veröffentlichung der Drohne möglicherweise vorübergehend aufgehoben.',
  'error.boundary.adminBody': 'Das serverseitige Log findest du unten. Kopiere den Digest, bevor du es erneut versuchst, damit du ihn mit den Firebase-Logs abgleichen kannst.',
  'error.boundary.retry': 'Erneut versuchen',
  'error.boundary.goHome': 'Zum Dashboard',
  'error.boundary.goPublic': 'Zur Startseite',
  'error.boundary.diagnostics': 'Diagnose',
  'error.boundary.digest': 'Fehler-Digest',

  'admin.nav.nfc': 'NFC-Tools',
  'admin.nfc.title': 'NFC- / QR-Tools',
  'admin.nfc.subtitle': 'Erzeuge die URL-Payloads, die auf jedes Badge geschrieben werden, und exportiere den gesamten Stapel als CSV für ein externes NFC-Schreibgerät.',
  'admin.nfc.col.slug': 'Slug',
  'admin.nfc.col.url': 'Öffentliche URL',
  'admin.nfc.col.owner': 'Eigentümer',
  'admin.nfc.exportCsv': 'CSV exportieren',
  'admin.nfc.copyUrl': 'URL kopieren',
  'admin.nfc.empty': 'Keine öffentlichen, aktiven Drohnen zum Codieren.',

  // ── Commercial pricing ──
  'nav.pricing': 'Preise',
  'pricing.hero.eyebrow': 'Tarife & NFC-Kit',
  'pricing.hero.title': 'Digitale Identität für jeden Drohnenflug',
  'pricing.hero.subtitle': 'Wähle einen Tarif für Privatpersonen oder Unternehmen. Das NFC-Kit verknüpft Zertifikate und Versicherung mit einem scannbaren öffentlichen Profil.',
  'pricing.hero.kitNotice': 'Wichtig: Für die Aktivierung physischer Badges ist das NFC-Kit Pflicht (außer es ist im Tarif enthalten).',
  'pricing.toggle.label': 'Zielgruppe',
  'pricing.toggle.individual': 'Privatpersonen',
  'pricing.toggle.business': 'Unternehmen',
  'pricing.section.individualTitle': 'Tarife für Privatpersonen',
  'pricing.section.individualSubtitle': 'Jahresabo plus das für physische Badges erforderliche NFC-Kit.',
  'pricing.section.businessTitle': 'Tarife für Unternehmen',
  'pricing.section.businessSubtitle': 'Monatsabo für Teams und Flotten. NFC-Kit wird pro Betreiber berechnet.',
  'pricing.badge.recommended': 'Empfohlen',
  'pricing.price.perYear': 'pro Jahr',
  'pricing.price.perMonth': 'pro Monat',
  'pricing.price.onRequest': 'Individuelles Angebot',
  'pricing.price.custom': 'Auf deine Flotte zugeschnitten',
  'pricing.kit.mandatoryLabel': 'NFC-Kit',
  'pricing.kit.mandatoryPrice': '{amount} — Pflicht',
  'pricing.kit.perOperator': '{amount} pro Betreiber — Pflicht',
  'pricing.kit.included': 'Im Tarif enthalten',
  'pricing.kit.onRequest': 'Auf Anfrage',
  'pricing.kit.sectionTitle': 'Obligatorisches NFC-Kit',
  'pricing.kit.sectionSubtitle': 'Physische Badges sind nötig, damit Zertifikate und Versicherung vor Ort per NFC oder QR verifiziert werden können.',
  'pricing.kit.mandatoryBanner': 'Das NFC-Kit ist Pflicht',
  'pricing.kit.mandatoryBody': 'Ohne Kit kannst du Dokumente digital verwalten, aber keine physischen Badges an Fluggeräten oder Ausrüstung anbringen. Jedes Kit enthält zwei Badges.',
  'pricing.kit.item.badge': '1 NFC-Badge, verknüpft mit deinem öffentlichen DroneTag-Profil', // TODO: translate
  'pricing.kit.note': 'Bei Pilot Pro ist das Kit im Jahrespreis enthalten. Bei Unternehmenstarifen wird das Kit einmalig pro Betreiber berechnet.',
  'pricing.kit.visual.cert': 'ZERT',
  'pricing.kit.visual.ins': 'VERS',
  'pricing.plan.free.name': 'Free',
  'pricing.plan.free.audience': 'Zum Einstieg',
  'pricing.plan.free.cta': 'Kostenlos aktivieren',
  'pricing.plan.free.f1': 'Digitales Profil und Dokumenten-Upload',
  'pricing.plan.free.f2': 'Öffentliche QR- / NFC-Seite bei aktiviertem Kit',
  'pricing.plan.free.f3': 'Verifizierung durch Admins',
  'pricing.plan.pilot.name': 'Pilot',
  'pricing.plan.pilot.audience': 'Für einzelne Piloten',
  'pricing.plan.pilot.cta': 'Pilot wählen',
  'pricing.plan.pilot.f1': 'Vollständiger Arbeitsbereich für Nachweise',
  'pricing.plan.pilot.f2': 'Verwaltung von Zertifikaten & Versicherungen',
  'pricing.plan.pilot.f3': 'Öffentliches verifiziertes Profil',
  'pricing.plan.pilot.f4': 'NFC-Kit zum Vorzugspreis',
  'pricing.plan.pilotPro.name': 'Pilot Pro',
  'pricing.plan.pilotPro.audience': 'Bestes Preis-Leistungs-Verhältnis für aktive Piloten',
  'pricing.plan.pilotPro.cta': 'Pilot Pro wählen',
  'pricing.plan.pilotPro.f1': 'Alles aus Pilot',
  'pricing.plan.pilotPro.f2': 'NFC-Kit inklusive',
  'pricing.plan.pilotPro.f3': 'Priorisierter Support',
  'pricing.plan.pilotPro.f4': 'Eine Jahreszahlung, Kit-Versand bei Aktivierung',
  'pricing.plan.team.name': 'Team',
  'pricing.plan.team.audience': 'Für kleine Teams',
  'pricing.plan.team.cta': 'Team wählen',
  'pricing.plan.team.f1': 'Arbeitsbereich für mehrere Betreiber',
  'pricing.plan.team.f2': 'Gemeinsame Flottendokumente',
  'pricing.plan.team.f3': 'NFC-Kit pro Betreiber',
  'pricing.plan.team.f4': 'Monatliche Abrechnung',
  'pricing.plan.business.name': 'Business',
  'pricing.plan.business.audience': 'Für Unternehmen und Flotten',
  'pricing.plan.business.cta': 'Business wählen',
  'pricing.plan.business.f1': 'Betreiber im Flottenmaßstab',
  'pricing.plan.business.f2': 'Erweiterte Verifizierungsprozesse',
  'pricing.plan.business.f3': 'Vorzugspreis für NFC-Kits pro Betreiber',
  'pricing.plan.business.f4': 'Monatliche Abrechnung',
  'pricing.plan.enterprise.name': 'Enterprise',
  'pricing.plan.enterprise.audience': 'Maßgeschneiderte Lösungen',
  'pricing.plan.enterprise.cta': 'Kontaktiere uns',
  'pricing.plan.enterprise.f1': 'Individuelle Limits und Onboarding',
  'pricing.plan.enterprise.f2': 'Dedizierter Support',
  'pricing.plan.enterprise.f3': 'NFC-Kit nach Angebot',
  'pricing.card.seeCheckout': 'Weiter zur Kasse',
  'pricing.summary.title': 'Was du bezahlst',
  'pricing.summary.subtitle': 'Klare Trennung zwischen Abo und einmaligem NFC-Kit.',
  'pricing.summary.sub.title': 'Abo',
  'pricing.summary.sub.body': 'Jährlich für Privatpersonen, monatlich für Unternehmenstarife. Deckt die digitale Plattform ab.',
  'pricing.summary.kit.title': 'NFC-Kit',
  'pricing.summary.kit.body': 'Obligatorische physische Badges (Zertifikate + Versicherung). Nur bei Pilot Pro inklusive.',
  'pricing.summary.renew.title': 'Verlängerung',
  'pricing.summary.renew.body': 'Nach dem ersten Zeitraum verlängerst du nur das Abo — das Kit ist ein einmaliger Kauf, außer du fügst Betreiber hinzu.',
  'pricing.faq.title': 'FAQ',
  'pricing.faq.subtitle': 'Kurze Antworten, bevor du einen Tarif aktivierst.',
  'pricing.faq.kit.q': 'Ist das NFC-Kit Pflicht?',
  'pricing.faq.kit.a': 'Ja. Jeder Tarif erfordert das Kit für den Versand physischer Badges, außer Pilot Pro, bei dem das Kit im Jahrespreis enthalten ist. Bei Unternehmenstarifen wird das Kit einmalig pro Betreiber berechnet.',
  'pricing.faq.pilotPro.q': 'Warum wird Pilot Pro empfohlen?',
  'pricing.faq.pilotPro.a': 'Pilot Pro bündelt Jahresabo und NFC-Kit in einer einzigen Zahlung (139 €), sodass der Anfangsbetrag dem Abo entspricht.',
  'pricing.faq.team.q': 'Wie viele Betreiber kann ich bei Team / Business hinzufügen?',
  'pricing.faq.team.a': 'Team ist für kleine Betreibergruppen gedacht, Business für Unternehmen und Flotten. Für besondere Anforderungen kontaktiere uns – wir erstellen ein individuelles Angebot.',
  'pricing.faq.payment.q': 'Wie bezahle ich?',
  'pricing.faq.payment.a': 'Online-Zahlung ist bald verfügbar. Sende bis dahin deine Anfrage über den Checkout – wir melden uns, um die Aktivierung abzuschließen.',
  'pricing.faq.change.q': 'Kann ich den Tarif später wechseln?',
  'pricing.faq.change.a': 'Ja: Schreib uns über den Support und wir passen deinen Tarif an.',
  'pricing.ctaFinal.title': 'Bereit, DroneTag zu aktivieren?',
  'pricing.ctaFinal.subtitle': 'Starte mit Pilot Pro (Kit inklusive) oder kontaktiere uns für Enterprise.',
  'pricing.ctaFinal.primary': 'Pilot Pro wählen',
  'pricing.ctaFinal.secondary': 'Vertrieb kontaktieren',
  'pricing.ctaFinal.backHome': 'Zurück zur Startseite',
  'pricing.checkout.eyebrow': 'Checkout',
  'pricing.checkout.title': 'Bestätige deinen Tarif',
  'pricing.checkout.subtitle': 'Die Beträge werden auf dem Server anhand der offiziellen Preisliste berechnet. Es werden noch keine Kartendaten erfasst.',
  'pricing.checkout.paymentInactive': 'Zahlung noch nicht aktiv',
  'pricing.checkout.plan': 'Gewählter Tarif',
  'pricing.checkout.changePlan': 'Tarif ändern',
  'pricing.checkout.customerType': 'Kundentyp',
  'pricing.checkout.private': 'Privatperson',
  'pricing.checkout.company': 'Unternehmen',
  'pricing.checkout.operators': 'Betreiber',
  'pricing.checkout.kits': 'NFC-Badges',  // TODO: translate
  'pricing.checkout.kitsHint': 'Ein NFC-Badge pro Fernpilot. An einer Drohne angebracht, öffnet das Badge die öffentliche DroneTag-Seite dieser Drohne.',
  'pricing.checkout.billing': 'Rechnungsdaten',
  'pricing.checkout.fullName': 'Vor- und Nachname',
  'pricing.checkout.email': 'E-Mail',
  'pricing.checkout.companyName': 'Firmenname',
  'pricing.checkout.vat': 'USt-IdNr. / Steuernummer',
  'pricing.checkout.address': 'Adresse',
  'pricing.checkout.city': 'Ort',
  'pricing.checkout.postalCode': 'Postleitzahl',
  'pricing.checkout.country': 'Land',
  'pricing.checkout.terms': 'Ich akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung für diese geschäftliche Anfrage.',
  'pricing.checkout.summary': 'Kostenübersicht',
  'pricing.checkout.line.subscription': 'Abo',
  'pricing.checkout.line.kit': 'NFC-Kit',
  'pricing.checkout.line.operators': 'Betreiber',
  'pricing.checkout.line.initial': 'Anfangsbetrag',
  'pricing.checkout.line.recurring': 'Nächste Verlängerung',
  'pricing.checkout.summaryNote': 'Anfangsbetrag = erster Abozeitraum + NFC-Kit (falls nicht enthalten). Die Verlängerung umfasst nur das Abo.',
  'pricing.checkout.quoteOnly': 'Enterprise wird individuell angeboten. Sende das Formular ab und unser Team meldet sich bei dir.',
  'pricing.checkout.submit': 'Anfrage senden',
  'pricing.checkout.submitQuote': 'Angebot anfordern',
  'pricing.checkout.backPricing': 'Zurück zu den Preisen',
  'pricing.checkout.requestId': 'Anfrage-ID',
  'pricing.checkout.success.title': 'Anfrage erhalten',
  'pricing.checkout.success.body': 'Wir haben deine geschäftliche Anfrage gespeichert. Die Online-Zahlung wird in einer späteren Version freigeschaltet.',
  'pricing.checkout.error.generic': 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
  'pricing.checkout.error.terms_required': 'Bitte akzeptiere die Bedingungen.',
  'pricing.checkout.error.billing_incomplete': 'Bitte vervollständige die Rechnungsdaten.',
  'pricing.checkout.error.company_required': 'Der Firmenname ist erforderlich.',
  'pricing.checkout.error.unknown_plan': 'Unbekannter Tarif.',
  'pricing.checkout.error.customer_type_mismatch': 'Der Kundentyp passt nicht zu diesem Tarif.',
  'pricing.checkout.error.invalid_operatorCount': 'Ungültige Anzahl an Betreibern.',
  'pricing.checkout.error.invalid_kitQuantity': 'Ungültige Kit-Anzahl.',
  'login.forgotPassword': 'Passwort vergessen?', // TODO: translate
  'forgot.title': 'Passwort zurücksetzen', // TODO: translate
  'forgot.subtitle': 'Gib die E-Mail-Adresse deines DroneTag-Kontos ein, dann senden wir dir einen Link zum Zurücksetzen.', // TODO: translate
  'forgot.email': 'E-Mail-Adresse', // TODO: translate
  'forgot.submit': 'Reset-Link senden', // TODO: translate
  'forgot.sending': 'Wird gesendet…', // TODO: translate
  'forgot.backToLogin': 'Zurück zur Anmeldung', // TODO: translate
  'forgot.sent.title': 'Prüfe deinen Posteingang', // TODO: translate
  'forgot.sent.body': 'Falls zu dieser Adresse ein Konto existiert, ist ein Link zum Zurücksetzen des Passworts unterwegs. Der Link läuft nach kurzer Zeit ab.', // TODO: translate
  'forgot.sent.resend': 'Erneut senden', // TODO: translate
  'forgot.error.generic': 'Die Anfrage konnte gerade nicht verarbeitet werden. Bitte versuche es gleich noch einmal.', // TODO: translate
  'forgot.error.invalidEmail': 'Gib eine gültige E-Mail-Adresse ein.', // TODO: translate
  'links.nfcEncodeLabel': 'Diese URL auf das Badge schreiben', // TODO: translate
  'links.nfcInstructions': 'Verwende eine beliebige NFC-App zum Beschreiben von Tags (zum Beispiel NFC Tools für Android oder iOS) und schreibe die obige URL als NDEF-URI-Datensatz. Hältst du danach ein Smartphone an das Badge, öffnet sich dieses öffentliche Profil.', // TODO: translate
  'links.nfcNotReady': 'Veröffentliche dieses Profil und weise ihm einen Slug zu, um die URL für das Badge zu erzeugen.', // TODO: translate
  'common.dismiss': 'Schließen', // TODO: translate
  'admin.verify.notifyWarning': 'Die Entscheidung wurde gespeichert, aber der Benutzer konnte nicht per E-Mail benachrichtigt werden ({reason}). Die Aktualisierung ist trotzdem in seinem Support-Thread sichtbar.', // TODO: translate
  'support.newTicket': 'Neue Anfrage', // TODO: translate
  'support.subject': 'Betreff', // TODO: translate
  'support.subjectPlaceholder': 'Wobei brauchst du Hilfe?', // TODO: translate
  'support.message': 'Nachricht', // TODO: translate
  'support.messagePlaceholder': 'Beschreibe dein Anliegen…', // TODO: translate
  'support.reply': 'Antworten', // TODO: translate
  'support.emptyHint': 'Stelle eine Anfrage und das DroneTag-Team antwortet dir hier.', // TODO: translate
  'support.status.pending': 'Antwort erhalten', // TODO: translate
  'support.close': 'Anfrage schließen', // TODO: translate
  'support.reopen': 'Wieder öffnen', // TODO: translate
  'support.team': 'DroneTag-Support', // TODO: translate
  'support.error.send': 'Deine Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.', // TODO: translate
  'support.error.load': 'Deine Support-Unterhaltung konnte nicht geladen werden.', // TODO: translate
  'onboarding.title': 'Vervollständige dein DroneTag-Profil', // TODO: translate
  'onboarding.subtitle': 'Nur wenige Schritte, damit deine Drohne identifizierbar und dein Badge einsatzbereit ist.', // TODO: translate
  'onboarding.progress': '{done} of {total}', // TODO: translate
  'onboarding.step.profile': 'Dein Profil', // TODO: translate
  'onboarding.step.profile.hint': 'Füge deinen Namen hinzu, damit du in deinem öffentlichen Profil erkennbar bist.', // TODO: translate
  'onboarding.step.operator': 'UAS-Betreiber', // TODO: translate
  'onboarding.step.operator.hint': 'Registriere die Person oder Organisation, die für den Betrieb verantwortlich ist.', // TODO: translate
  'onboarding.step.drone': 'Deine Drohne', // TODO: translate
  'onboarding.step.drone.hint': 'Füge das Fluggerät hinzu, das du identifizieren möchtest.', // TODO: translate
  'onboarding.step.certificate': 'Pilotenzertifikat', // TODO: translate
  'onboarding.step.certificate.hint': 'Lade dein Fernpilotenzertifikat zur Verifizierung hoch.', // TODO: translate
  'onboarding.step.insurance': 'Versicherung', // TODO: translate
  'onboarding.step.insurance.hint': 'Lade deine Police hoch, damit ihre Gültigkeit öffentlich angezeigt werden kann.', // TODO: translate
  'onboarding.step.public': 'Öffentliches Profil', // TODO: translate
  'onboarding.step.public.hint': 'Veröffentliche eine Drohne, um ihre öffentliche DroneTag-Seite zu erhalten.', // TODO: translate
  'onboarding.step.badge': 'Link für dein NFC-Badge', // TODO: translate
  'onboarding.step.badge.hint': 'Hol dir den öffentlichen Link, den du auf dein Badge schreibst.', // TODO: translate
  'legal.draft.badge': 'Entwurf', // TODO: translate
  'legal.draft.bannerTitle': 'Entwurfstext — nicht anwaltlich geprüft', // TODO: translate
  'legal.draft.bannerBody': 'Diese Seite ist ein Arbeitsentwurf, den das DroneTag-Team verfasst hat, damit die Struktur des Dokuments geprüft werden kann. Sie ist nicht in Kraft, stellt keine Rechtsberatung dar und begründet weder für dich noch für uns Rechte oder Pflichten. Ein qualifizierter Anwalt muss diesen Text prüfen und ersetzen, bevor DroneTag für echte Nutzer geöffnet wird.', // TODO: translate
  'legal.draft.lastUpdated': 'Entwurf zuletzt bearbeitet am {date}. Noch ist keine Version dieses Dokuments in Kraft.', // TODO: translate
  'legal.contact.title': 'An wen du dich wenden kannst', // TODO: translate
  'legal.contact.body': 'Fragen zu diesem Entwurf oder zu den Daten, die DroneTag über dich speichert, kannst du an info@drone-tag.com senden. Das endgültige Dokument wird das Unternehmen nennen, das den Dienst betreibt, seinen eingetragenen Sitz und einen konkreten Kontakt für Datenanfragen. Nichts davon steht bisher fest, deshalb wurde es weggelassen statt erfunden.', // TODO: translate
  'legal.related.title': 'Weitere Dokumente im Entwurf', // TODO: translate
  'home.footer.cookies': 'Cookies', // TODO: translate
  'legal.privacy.title': 'Datenschutzerklärung', // TODO: translate
  'legal.privacy.subtitle': 'Was DroneTag über dich speichert, was Fremde sehen, wenn sie dein NFC-Badge antippen, und was privat bleibt.', // TODO: translate
  'legal.privacy.who.title': 'Wer diesen Dienst betreibt', // TODO: translate
  'legal.privacy.who.body': 'Dieser Abschnitt wird den Rechtsträger nennen, der DroneTag betreibt und über die Verwendung deiner Daten entscheidet, sowie dessen eingetragenen Sitz und die Ansprechperson für Datenfragen. Dieser Rechtsträger steht noch nicht fest, daher wird hier nichts angegeben. Technisch nutzt der Dienst Google Firebase für Authentifizierung, Datenbank und Dateispeicherung und wird auf Netlify bereitgestellt.', // TODO: translate
  'legal.privacy.collect.title': 'Welche Daten DroneTag erhebt', // TODO: translate
  'legal.privacy.collect.body': 'Das Konto selbst enthält eine E-Mail-Adresse, eine Telefonnummer, einen Namen oder Firmennamen, eine Postanschrift und bei privaten Konten ein Geburtsdatum. Der Pilotendatensatz ergänzt Staatsangehörigkeit, einen Betreibercode, eine Lizenznummer und einen Notfallkontakt. Betreiberdatensätze wiederholen Name oder Firmenname, Adresse, E-Mail und bei Unternehmen eine USt-IdNr. oder Registernummer. Drohnendatensätze enthalten Hersteller, Modell, EU-Klassenkennzeichnung, die am Fluggerät eingravierte Seriennummer und die Seriennummer der Fernsteuerung. Hochgeladene Dateien — Versicherungspolicen, Zertifikate, Genehmigungen und Ausweisdokumente — werden so gespeichert, wie du sie bereitstellst, und enthalten daher alles, was diese Dokumente enthalten.', // TODO: translate
  'legal.privacy.why.title': 'Warum die Daten erhoben werden', // TODO: translate
  'legal.privacy.why.body': 'Konto- und Kontaktdaten werden verwendet, um dich anzumelden, dich zu benachrichtigen und Support-Anfragen zu beantworten. Piloten-, Betreiber-, Drohnen- und Dokumentdaten gibt es, damit du deine Compliance-Unterlagen an einem Ort aufbewahren und, wenn du möchtest, Dritten eine überprüfbare Zusammenfassung davon zeigen kannst. Zahlungs- und Bestelldaten dienen dazu, NFC-Badges zu versenden und Tarifkäufe abzuwickeln. Die endgültige Fassung dieses Abschnitts muss für jeden Zweck eine Rechtsgrundlage angeben; das ist eine Frage für einen Anwalt, und hier wird keine Rechtsgrundlage behauptet.', // TODO: translate
  'legal.privacy.public.title': 'Was auf deiner öffentlichen Seite sichtbar ist', // TODO: translate
  'legal.privacy.public.body': 'Eine veröffentlichte Drohne erhält eine Seite unter /u/, gefolgt von ihrem Slug, und jeder mit dem Link oder dem Badge kann sie ohne Anmeldung öffnen. Diese Seite liest einen einzigen bereinigten Datensatz und zeigt nur den Namen des Inhabers (deinen Pilotennamen, deinen Namen als privater Betreiber oder deinen Firmennamen), Hersteller, Modell, EU-Klassenkennzeichnung, die eingravierte Seriennummer der Drohne, Versicherungsstatus und Versicherer, das Ablaufdatum der Police, eine maskierte Policennummer, von der nur die ersten und letzten drei Zeichen erhalten bleiben, das Verifizierungs-Badge mit Datum sowie ein Profilfoto, Logo oder Banner, falls du eines als Branding hochgeladen hast.', // TODO: translate
  'legal.privacy.notPublic.title': 'Was bewusst nicht veröffentlicht wird', // TODO: translate
  'legal.privacy.notPublic.body': 'Der öffentliche Datensatz enthält weder das Versicherungs-PDF noch deine Postanschrift, deine E-Mail-Adresse, deine Telefonnummer, dein Geburtsdatum, deine USt-IdNr. oder Registernummer, die Seriennummer der Fernsteuerung, deinen Notfallkontakt, interne Notizen oder die Konto-ID, über die sich die Seite auf dich zurückführen ließe. Das wird im Code erzwungen und nicht bloß durch Konvention: Die öffentliche Seite liest nur den bereinigten Snapshot, und die oben genannten Felder werden nie hineingeschrieben. Die einzige enthaltene interne Kennung ist die ID des Drohnendatensatzes, mit der der Snapshot mit dem privaten Datensatz abgeglichen wird.', // TODO: translate
  'legal.privacy.sharing.title': 'Wer deine Daten sonst noch sehen kann', // TODO: translate
  'legal.privacy.sharing.body': 'DroneTag verkauft deine Daten nicht. Sie werden von den Anbietern verarbeitet, auf die die Anwendung tatsächlich angewiesen ist: Google Firebase hostet die Authentifizierung, die Datenbank und hochgeladene Dateien; Netlify hostet und liefert die Anwendung aus und speichert Anfrage-Logs; Resend stellt Transaktions-E-Mails wie Registrierungscodes und Benachrichtigungen zu. DroneTag-Mitarbeitende mit einem Administratorkonto können deine Datensätze lesen, um Dokumente zu prüfen und Support-Anfragen zu beantworten. Die endgültige Fassung muss jeden Anbieter nennen, den Ort der Datenverarbeitung und den mit ihm bestehenden Vertrag.', // TODO: translate
  'legal.privacy.retention.title': 'Wie lange die Daten gespeichert werden', // TODO: translate
  'legal.privacy.retention.body': 'Derzeit gibt es keine automatische Löschung. Datensätze und hochgeladene Dateien bleiben erhalten, bis du sie löschst oder DroneTag bittest, sie zu löschen, und Meldungen von Personen, die deine Drohne gefunden haben, bleiben in deinem Posteingang, bis sie entfernt werden. Die Festlegung echter Aufbewahrungsfristen — insbesondere für Versicherungs- und Zertifikatsdokumente, die nach ihrem Ablauf eventuell noch eine Zeit lang aufbewahrt werden müssen — ist eine offene Frage für einen Anwalt und wird hier nicht beantwortet.', // TODO: translate
  'legal.privacy.requests.title': 'Auskunft, Berichtigung oder Löschung deiner Daten', // TODO: translate
  'legal.privacy.requests.body': 'Die meisten deiner Daten kannst du im Kontobereich selbst bearbeiten, allerdings werden einige Identitätsfelder nach der Bestätigung gesperrt, damit ein veröffentlichtes Profil nicht unbemerkt umgeschrieben werden kann. Für alles, was du nicht selbst ändern kannst, einschließlich der Löschung deines Kontos, schreib an info@drone-tag.com; die Anfrage wird manuell bearbeitet. Einen Export per Self-Service oder eine automatische Löschung gibt es noch nicht. Diese Erklärung trifft keine Aussage darüber, welche gesetzlichen Rechte dir zustehen; das muss ein Anwalt klären.', // TODO: translate
  'legal.privacy.security.title': 'Wie die Daten geschützt werden', // TODO: translate
  'legal.privacy.security.body': 'Private Datensätze können nur von ihrem Eigentümer und von DroneTag-Administratoren gelesen werden; das wird durch Firebase-Sicherheitsregeln durchgesetzt und nicht allein durch die Anwendung. Hochgeladene Dokumente liegen in einem privaten Speicherbereich, der ohne Authentifizierung nicht lesbar ist, getrennt vom kleinen öffentlichen Bereich, der nur Branding-Bilder enthält. Server-Logs durchlaufen einen Filter, der Werte wie E-Mail-Adressen, Telefonnummern und Policennummern ersetzt, bevor etwas geschrieben wird. Kein System ist vor Angriffen gefeit, daher ist dies eine Beschreibung des aktuellen Aufbaus und keine Garantie.', // TODO: translate
  'legal.privacy.changes.title': 'Änderungen an diesem Entwurf', // TODO: translate
  'legal.privacy.changes.body': 'Dieser Entwurf wird sich mit dem Fortschritt des Produkts und seiner rechtlichen Prüfung ändern. Sobald eine geprüfte Fassung ihn ersetzt, wird das Entwurfsbanner oben auf dieser Seite entfernt und an seiner Stelle erscheint ein echtes Datum des Inkrafttretens.', // TODO: translate
  'pricing.kit.visual.badge': 'DRONETAG', // TODO: translate
  'legal.terms.title': 'Nutzungsbedingungen', // TODO: translate
  'legal.terms.subtitle': 'Die Regeln, die künftig für die Nutzung von DroneTag gelten sollen, als Entwurf zur Prüfung verfasst. Nichts davon ist bisher verbindlich.', // TODO: translate
  'legal.terms.what.title': 'Was DroneTag ist und was nicht', // TODO: translate
  'legal.terms.what.body': 'DroneTag ist eine private Plattform, auf der du die Unterlagen zu deiner Drohne aufbewahren und, wenn du möchtest, eine kurze Zusammenfassung davon unter einer öffentlichen Adresse veröffentlichen kannst, die über ein NFC-Badge oder einen QR-Code erreichbar ist. Sie ist keine Luftfahrtbehörde und kein öffentliches Register. Sie stellt keine amtlichen Dokumente aus und validiert oder verlängert auch keine. Ein Profil auf DroneTag ersetzt weder die Registrierung bei einer zuständigen Behörde noch ein Pilotenzertifikat, eine Versicherungspolice oder eine Genehmigung, die du zum Fliegen brauchst.', // TODO: translate
  'legal.terms.eligibility.title': 'Wer ein Konto eröffnen kann', // TODO: translate
  'legal.terms.eligibility.body': 'Die endgültige Fassung wird ein Mindestalter festlegen und regeln, ob eine bevollmächtigte Person ein Konto im Namen eines Unternehmens eröffnen darf. Derzeit fragt das Registrierungsformular nach Vor- und Nachname, E-Mail-Adresse, Telefonnummer und Passwort, alternativ kannst du dich mit einem Google-Konto registrieren; die E-Mail-Adresse oder Telefonnummer wird anschließend mit einem Einmalcode bestätigt. Eine Altersprüfung findet nicht statt.', // TODO: translate
  'legal.terms.account.title': 'Dein Konto und deine Zugangsdaten', // TODO: translate
  'legal.terms.account.body': 'Du bist dafür verantwortlich, den Zugang zu deinem Konto sicher zu halten, sowie für alles, was darüber geschieht. Schreib an info@drone-tag.com, wenn du glaubst, dass jemand anderes Zugriff hat. DroneTag-Administratoren können die Datensätze in deinem Konto lesen, um die Dokumente zu prüfen, die du zur Verifizierung einreichst, und um Support-Anfragen zu beantworten.', // TODO: translate
  'legal.terms.content.title': 'Die Dokumente und Daten, die du hochlädst', // TODO: translate
  'legal.terms.content.body': 'Alles, was du hochlädst, bleibt dein Eigentum. Du räumst DroneTag nur das ein, was für den Betrieb des Dienstes nötig ist: deine Dateien zu speichern, sie dir anzuzeigen, sie von einem Administrator prüfen zu lassen und die in der Datenschutzerklärung beschriebene kurze Zusammenfassung zu veröffentlichen, wenn du dich entscheidest, eine Drohne zu veröffentlichen. Du bist für die Richtigkeit deiner Angaben verantwortlich und dafür, dass du das Recht hast, sie hochzuladen, insbesondere bei Dokumenten, in denen eine andere Person als du genannt wird.', // TODO: translate
  'legal.terms.publication.title': 'Ein Drohnenprofil veröffentlichen', // TODO: translate
  'legal.terms.publication.body': 'Die Veröffentlichung ist deine Entscheidung und erfolgt für jede Drohne einzeln. Nach der Veröffentlichung kann jeder, der die Adresse kennt, die Seite lesen; sie liegt nicht hinter einem Login, und es gibt kein Besucherprotokoll. Wenn du die Veröffentlichung aufhebst, wird der öffentliche Datensatz entfernt und die Adresse funktioniert nicht mehr, aber DroneTag kann Seiten nicht zurückholen, die bereits von anderen gespeichert, zwischengespeichert oder geteilt wurden. Die endgültige Fassung muss angeben, wie schnell das Aufheben der Veröffentlichung wirksam wird.', // TODO: translate
  'legal.terms.verification.title': 'Was das Verifizierungs-Badge bedeutet', // TODO: translate
  'legal.terms.verification.body': 'Ein Verifiziert-Badge bedeutet, dass ein DroneTag-Administrator sich die Dokumente im Konto angesehen und als stimmig befunden hat. Es ist keine Bestätigung durch eine Behörde, sagt nicht aus, dass der Flug, den du gleich durchführen willst, rechtmäßig ist, und garantiert nicht, dass die Versicherung im Schadensfall zahlt. Wer sich auf eine DroneTag-Seite verlässt, sollte sie als Ausgangspunkt betrachten und die Originaldokumente verlangen, wenn es darauf ankommt.', // TODO: translate
  'legal.terms.plans.title': 'Tarife, Badges und Zahlung', // TODO: translate
  'legal.terms.plans.body': 'Jedes Konto enthält ein kleines Kontingent an Drohnen, Betreibern, Zertifikaten und Dokumenten; größere Kontingente können gekauft werden. NFC-Badges sind physische Waren, die hergestellt und versendet werden. Preise, Abrechnungszeiträume, Verlängerung, Erstattungen und Versandbedingungen stehen noch nicht fest und werden hier bewusst nicht angegeben: Die Preisseite zeigt die derzeit vorgesehenen Preise, kein vertragliches Angebot.', // TODO: translate
  'legal.terms.availability.title': 'Verfügbarkeit während der Pre-Beta', // TODO: translate
  'legal.terms.availability.body': 'DroneTag ist noch nicht fertig. Funktionen können sich ändern oder entfallen, Daten können migriert werden, und der Dienst kann ohne Vorankündigung nicht verfügbar sein. Nutze DroneTag nicht als einzige Kopie eines Dokuments, das du brauchst — bewahre deine Originale auf. In dieser Phase wird keine Verfügbarkeitszusage gegeben.', // TODO: translate
  'legal.terms.suspension.title': 'Sperrung und Schließung eines Kontos', // TODO: translate
  'legal.terms.suspension.body': 'Die endgültige Fassung wird beschreiben, wann DroneTag ein Konto sperren oder schließen darf, etwa wegen des Hochladens fremder Dokumente oder der falschen Darstellung eines Verifizierungsstatus, und mit welcher Vorankündigung. Derzeit kannst du die Schließung deines Kontos per E-Mail an info@drone-tag.com beantragen; die Anfrage wird manuell bearbeitet, und es gibt keine automatische Löschung.', // TODO: translate
  'legal.terms.liability.title': 'Haftung', // TODO: translate
  'legal.terms.liability.body': 'Dieser Abschnitt braucht am dringendsten einen Anwalt, daher wird hier kein Wortlaut vorgeschlagen. Er wird festlegen müssen, wofür DroneTag verantwortlich ist, wofür nicht und was passiert, wenn eine öffentliche Seite veraltete oder falsche Informationen zeigt. Nichts auf dieser Seite beschränkt derzeit irgendeine Haftung, denn nichts auf dieser Seite ist in Kraft.', // TODO: translate
  'legal.terms.law.title': 'Anwendbares Recht und Streitigkeiten', // TODO: translate
  'legal.terms.law.body': 'Das anwendbare Recht und das zuständige Gericht hängen davon ab, wo das betreibende Unternehmen ansässig ist und wo sich seine Nutzer befinden, und beides steht noch nicht fest. Ein Anwalt muss diesen Abschnitt vervollständigen. Hier wird kein Gerichtsstand angegeben.', // TODO: translate
  'legal.terms.changes.title': 'Änderungen an diesem Bedingungsentwurf', // TODO: translate
  'legal.terms.changes.body': 'Dieser Entwurf wird sich während der Entwicklung des Produkts ohne Vorankündigung ändern. Sobald eine geprüfte Fassung ihn ersetzt, wird das Entwurfsbanner entfernt, ein echtes Datum des Inkrafttretens erscheint, und die endgültige Fassung beschreibt, wie künftige Änderungen angekündigt werden.', // TODO: translate
  'legal.cookies.title': 'Hinweise zu Cookies und Browserspeicher', // TODO: translate
  'legal.cookies.subtitle': 'Was DroneTag derzeit in deinem Browser speichert, warum es gespeichert wird und was nicht gespeichert wird.', // TODO: translate
  'legal.cookies.scope.title': 'Was diese Seite abdeckt', // TODO: translate
  'legal.cookies.scope.body': 'Cookies sind nur ein Teil des Ganzen. DroneTag nutzt auch den lokalen Speicher des Browsers, und die Firebase-Authentifizierungsbibliothek speichert ihren eigenen Anmeldestatus im Browser. Diese Seite beschreibt alles zusammen, denn aus deiner Sicht ist es dasselbe: Daten, die diese Website auf deinem Gerät hinterlässt.', // TODO: translate
  'legal.cookies.essential.title': 'Welche Cookies gesetzt werden', // TODO: translate
  'legal.cookies.essential.body': 'Es werden zwei Cookies verwendet, beide für die Anmeldung und beide auf diese Website beschränkt. Das eine wird vom Server gesetzt, sobald dein Anmeldetoken überprüft wurde, kann von Skripten auf der Seite nicht gelesen werden und läuft nach einer Stunde ab. Das andere wird von der Seite selbst gesetzt, damit derselbe Token dem Code zur Verfügung steht, der den Administrationsbereich schützt, und läuft nach fünfundfünfzig Minuten ab. Beide werden gelöscht, wenn du dich abmeldest. Es werden keine Werbe- oder Tracking-Cookies gesetzt.', // TODO: translate
  'legal.cookies.storage.title': 'Was im Browserspeicher abgelegt wird', // TODO: translate
  'legal.cookies.storage.body': 'Dein gewähltes Design und deine gewählte Sprache werden im lokalen Speicher unter den Namen dronetag-theme und dronetag-language gespeichert, damit beim nächsten Besuch nicht kurz die falschen Farben oder die falsche Sprache erscheinen. Auch die Firebase-Authentifizierungsbibliothek speichert ihren eigenen Anmeldestatus im Browser; dadurch bleibst du zwischen deinen Besuchen angemeldet. Wenn du die Websitedaten löschst, wird all das entfernt und du wirst abgemeldet.', // TODO: translate
  'legal.cookies.analytics.title': 'Nutzungsanalyse', // TODO: translate
  'legal.cookies.analytics.body': 'Es ist kein Analyse- oder Werbeanbieter angebunden. Die Anwendung enthält eine interne Ereignisschicht mit einer kurzen, abgeschlossenen Liste von Ereignissen, die derzeit nur während der Entwicklung in die Browserkonsole schreibt. Wird später ein Anbieter hinzugefügt, müssen diese Seite und die Datenschutzerklärung aktualisiert werden, bevor er aktiviert wird.', // TODO: translate
  'legal.cookies.thirdParty.title': 'Von anderen Diensten gespeicherte Daten', // TODO: translate
  'legal.cookies.thirdParty.body': 'Die Anmeldung mit Google öffnet einen von Google betriebenen Ablauf, bei dem Google in diesem Schritt eigene Cookies auf seinen eigenen Domains setzen kann; dafür gelten die Bedingungen von Google und nicht diese Seite. Die Anwendung wird über Netlify ausgeliefert, das übliche Anfrage-Logs aufzeichnet. Die endgültige Fassung dieser Seite muss alle weiteren Drittanbieter-Komponenten auflisten, die den Browser erreichen.', // TODO: translate
  'legal.cookies.consent.title': 'Einwilligung', // TODO: translate
  'legal.cookies.consent.body': 'Derzeit gibt es im Produkt weder ein Cookie-Banner noch einen Einwilligungsmechanismus. Ob einer erforderlich ist und für welche der oben genannten Punkte, ist eine Frage für einen Anwalt. Diese Seite behauptet nicht, dass das aktuelle Verhalten ausreicht; sie beschreibt es, damit die Entscheidung auf Grundlage zutreffender Fakten getroffen werden kann.', // TODO: translate
  'legal.cookies.control.title': 'Wie du sie entfernen kannst', // TODO: translate
  'legal.cookies.control.body': 'Beim Abmelden werden die beiden Anmelde-Cookies gelöscht. Wenn du in deinen Browsereinstellungen die Websitedaten für diese Domain löschst, wird alles oben Aufgeführte entfernt, einschließlich deines gespeicherten Designs und deiner Sprache. Wenn du Cookies komplett blockierst, ist keine Anmeldung möglich, weil der Anmeldetoken keinen Speicherort hätte.', // TODO: translate
  'legal.cookies.changes.title': 'Änderungen an diesem Entwurf', // TODO: translate
  'legal.cookies.changes.body': 'Diese Liste gibt wieder, was die Anwendung zum oben angegebenen Datum tut, und wird bei jeder Änderung erneut mit dem Code abgeglichen. Sobald eine geprüfte Fassung diesen Entwurf ersetzt, wird das Banner oben entfernt.', // TODO: translate
  'nav.preview': 'Vorschau', // TODO: translate
  'account.nav.section.fleet': 'Flotte', // TODO: translate
  'account.nav.section.compliance': 'Compliance', // TODO: translate
  'consent.title': 'Dieses Profil veröffentlichen?', // TODO: translate
  'consent.description': 'Jeder mit dem Link kann es sehen, ohne sich anzumelden.', // TODO: translate
  'consent.warning': 'Ein öffentliches DroneTag-Profil kann jeder lesen, der das Badge scannt oder den Link öffnet. Es wird nicht als private Seite behandelt und erfordert keine Anmeldung.', // TODO: translate
  'consent.urlLabel': 'Öffentliche Adresse', // TODO: translate
  'consent.sharedTitle': 'Was sichtbar sein wird', // TODO: translate
  'consent.withheldTitle': 'Was privat bleibt', // TODO: translate
  'consent.shared.name': 'Dein Name oder der Name deines Betreibers bzw. Unternehmens', // TODO: translate
  'consent.shared.drone': 'Hersteller, Modell und Klassenkennzeichnung der Drohne', // TODO: translate
  'consent.shared.serial': 'Die am Fluggerät eingravierte Seriennummer der Drohne', // TODO: translate
  'consent.shared.certStatus': 'Ob dein Pilotenzertifikat gültig ist', // TODO: translate
  'consent.shared.insuranceStatus': 'Ob deine Versicherung gültig ist, und ihr Status', // TODO: translate
  'consent.shared.insuranceProvider': 'Der Name deines Versicherers', // TODO: translate
  'consent.shared.insuranceExpiry': 'Das Ablaufdatum der Versicherung', // TODO: translate
  'consent.shared.maskedPolicy': 'Eine maskierte Policennummer, bei der nur die ersten und letzten Zeichen sichtbar sind', // TODO: translate
  'consent.shared.verification': 'Der DroneTag-Verifizierungsstatus des Profils', // TODO: translate
  'consent.withheld.policyPdf': 'Das Policendokument selbst', // TODO: translate
  'consent.withheld.address': 'Deine Wohn- oder Geschäftsanschrift', // TODO: translate
  'consent.withheld.email': 'Deine E-Mail-Adresse', // TODO: translate
  'consent.withheld.phone': 'Deine Telefonnummer', // TODO: translate
  'consent.withheld.fullPolicy': 'Die vollständige, unmaskierte Policennummer', // TODO: translate
  'consent.withheld.ids': 'Konto-IDs und interne Datensatz-IDs', // TODO: translate
  'consent.checkbox': 'Ich verstehe, dass dieses Profil öffentlich sichtbar sein wird, und möchte es veröffentlichen.', // TODO: translate
  'consent.confirm': 'Profil veröffentlichen', // TODO: translate
  'consent.revocable': 'Du kannst das Profil jederzeit wieder privat machen. Nach dem Aufheben der Veröffentlichung funktioniert die öffentliche Seite nicht mehr; wer sie bereits geöffnet hat, besitzt aber möglicherweise noch eine Kopie.', // TODO: translate
  'form.created': 'Profil erstellt', // TODO: translate
  'links.copiedToast': 'Öffentlicher Link in die Zwischenablage kopiert', // TODO: translate
  'links.copyFailed': 'Der Link konnte nicht kopiert werden. Markiere und kopiere ihn manuell.', // TODO: translate
  'support.sent': 'Nachricht an den DroneTag-Support gesendet', // TODO: translate
  'signup.terms.prefix': 'Ich akzeptiere die', // TODO: translate
  'signup.terms.termsLink': 'Nutzungsbedingungen', // TODO: translate
  'signup.terms.and': 'und die', // TODO: translate
  'signup.terms.privacyLink': 'Datenschutzerklärung', // TODO: translate
  'signup.terms.required': 'Akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung, um fortzufahren.', // TODO: translate
  'signup.terms.googleHint': 'Akzeptiere oben die Nutzungsbedingungen und die Datenschutzerklärung, bevor du dich mit Google registrierst.', // TODO: translate
  'account.delete.title': 'Kontolöschung beantragen', // TODO: translate
  'account.delete.body': 'Die Löschung erfolgt nicht automatisch. Mit einer Support-Anfrage hältst du deinen Wunsch fest, das Konto zu schließen. Ein DroneTag-Administrator bearbeitet sie manuell. Bis dahin bleiben deine öffentlichen Profile sichtbar.', // TODO: translate
  'account.delete.cta': 'Löschanfrage stellen', // TODO: translate
  'drone.publish': 'Profil veröffentlichen', // TODO: translate
  'drone.unpublish': 'Veröffentlichung aufheben', // TODO: translate
  'drone.publish.success': 'Das öffentliche Profil ist jetzt online.', // TODO: translate
  'drone.unpublish.success': 'Das Profil ist nicht mehr öffentlich.', // TODO: translate
  'toast.certificate.created': 'Zertifikat hinzugefügt.', // TODO: translate
  'toast.certificate.deleted': 'Zertifikat gelöscht.', // TODO: translate
  'toast.certificate.deleteFailed': 'Das Zertifikat konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.insurance.created': 'Versicherungspolice hinzugefügt.', // TODO: translate
  'toast.insurance.deleted': 'Versicherungspolice gelöscht.', // TODO: translate
  'toast.insurance.deleteFailed': 'Die Police konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.document.created': 'Dokument hochgeladen.', // TODO: translate
  'toast.document.updated': 'Dokument aktualisiert.', // TODO: translate
  'toast.document.deleted': 'Dokument gelöscht.', // TODO: translate
  'toast.document.deleteFailed': 'Das Dokument konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.permit.created': 'Genehmigung hinzugefügt.', // TODO: translate
  'toast.permit.updated': 'Genehmigung aktualisiert.', // TODO: translate
  'toast.permit.deleted': 'Genehmigung gelöscht.', // TODO: translate
  'toast.permit.deleteFailed': 'Die Genehmigung konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.operator.created': 'UAS-Betreiber hinzugefügt.', // TODO: translate
  'toast.operator.updated': 'UAS-Betreiber aktualisiert.', // TODO: translate
  'toast.operator.deleted': 'UAS-Betreiber gelöscht.', // TODO: translate
  'toast.operator.deleteFailed': 'Der UAS-Betreiber konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.operator.setCurrent': 'Standard-UAS-Betreiber aktualisiert.', // TODO: translate
  'toast.drone.created': 'Drohne hinzugefügt.', // TODO: translate
  'toast.drone.saved': 'Drohnendaten gespeichert.', // TODO: translate
  'toast.drone.deleted': 'Drohne gelöscht.', // TODO: translate
  'toast.drone.deleteFailed': 'Die Drohne konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.archive.deleted': 'Eintrag endgültig gelöscht.', // TODO: translate
  'toast.archive.deleteFailed': 'Der Eintrag konnte nicht gelöscht werden. Bitte versuche es erneut.', // TODO: translate
  'toast.verify.approved': 'Als verifiziert markiert.', // TODO: translate
  'toast.verify.rejected': 'Als abgelehnt markiert.', // TODO: translate
  'toast.verify.reset': 'Zurück in die Prüfwarteschlange verschoben.', // TODO: translate
  'toast.verify.failed': 'Die Entscheidung konnte nicht gespeichert werden. Bitte versuche es erneut.', // TODO: translate
  'admin.users.detail.pilotOperatorNote': 'Die beiden Felder unten betreffen den UAS-Betreiber, nicht den Fernpiloten.', // TODO: translate
  'auth.googlePopupBlocked': 'Dein Browser hat das Google-Anmeldefenster blockiert. Erlaube Pop-ups für diese Seite und versuche es erneut.',
  'signup.otp.skip': 'Vorerst überspringen',
  'signup.otp.errorCooldown': 'Du hast gerade einen Code angefordert. Warte eine Minute, bevor du einen neuen anforderst.',
  'signup.otp.errorDelivery': 'Wir können die E-Mail gerade nicht senden. Du kannst fortfahren und später bestätigen.',
  'signup.otp.sentTo': 'Code an {email} gesendet. Sieh auch im Spam-Ordner nach.',
  'signup.errorInvalidEmail': 'Ungültige E-Mail-Adresse.',
  'signup.errorNetwork': 'Keine oder instabile Verbindung. Prüfe dein Netzwerk und versuche es erneut.',
  'admin.overview.loadFailed': 'Die Übersicht konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.',
  'admin.overview.partialFailure': 'Einige Bereiche konnten nicht geladen werden',
  'admin.overview.health.ok': 'Alle Dienste betriebsbereit',
  'admin.overview.health.degraded': 'Einige Dienste sind beeinträchtigt',
  'common.pdfShowAllPages': 'Alle Seiten anzeigen ({count})',
  'common.close': 'Schließen',
  'common.copied': 'In die Zwischenablage kopiert',
  'loadError.title': 'Etwas ist schiefgelaufen',
  'loadError.body': 'Die Daten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.',
  'upload.hint': 'Formate: {formats} · max. {mb} MB',
  'upload.progress': 'Wird hochgeladen…',
  'upload.error.type': 'Dateityp wird nicht unterstützt.',
  'upload.error.tooLarge': 'Die Datei ist größer als {mb} MB.',
  'upload.error.heic': 'Dieser Browser kann keine HEIC-Fotos lesen. Exportiere das Bild als JPG oder PNG und versuche es erneut.',
  'upload.error.canceled': 'Hochladen abgebrochen.',
  'slot.usedUnlimited': '{used} · unbegrenzt',
  'account.plan.unlimitedNote': 'Keine Limits aktiv: Du kannst Drohnen, Betreiber, Zertifikate und Dokumente frei hinzufügen.',
  'operator.list.subtitleUnlimited': 'Füge so viele Betreiber hinzu, wie du brauchst.',
  'doc.list.subtitleUnlimited': 'Lade so viele Dokumente hoch, wie du brauchst.',
  'drone.publish.notLive': 'Änderungen gespeichert, aber die öffentliche Seite wurde nicht aktualisiert. Versuche es gleich noch einmal.',
  'drone.insuranceLink.hint': 'Wähle eine deiner hochgeladenen Policen; sie wird auf der öffentlichen Seite der Drohne angezeigt.',
  'error.locked': 'Diese Daten sind nach dem ersten Speichern gesperrt. Wende dich an den Support, um sie zu ändern.',
  'error.suspended': 'Dieses Element wurde von einem Administrator gesperrt. Wende dich für Details an den Support.',
  'error.quota': 'Du hast das Limit deines Tarifs erreicht.',
  'error.invalidLink': 'Die ausgewählte Verknüpfung ist ungültig. Lade die Seite neu und versuche es erneut.',
  'error.emailInUse': 'Diese E-Mail-Adresse wird bereits von einem anderen Konto verwendet.',
  'error.session': 'Deine Sitzung ist abgelaufen. Melde dich erneut an, um fortzufahren.',
  'error.permission': 'Du hast keine Berechtigung für diese Aktion.',
  'error.notFound': 'Nicht gefunden: Das Element wurde möglicherweise gelöscht.',
  'error.rateLimited': 'Zu viele Anfragen. Warte einen Moment und versuche es erneut.',
  'error.server': 'Der Server hat nicht richtig geantwortet. Bitte versuche es gleich noch einmal.',
  'error.network': 'Keine oder instabile Verbindung. Prüfe dein Netzwerk und versuche es erneut.',
  'reportFound.errorRateLimited': 'Zu viele Meldungen gesendet. Versuche es in ein paar Minuten erneut.',
  'reportFound.errorUnavailable': 'Für diese Drohne können derzeit keine Meldungen gesendet werden.',
  'account.verification.reasonLine': 'Grund: {reason}',
  'admin.verify.reason.label': 'Grund der Ablehnung (optional)',
  'admin.verify.reason.placeholder': 'Z. B. abgelaufenes oder unleserliches Dokument',
  'admin.verify.reason.confirm': 'Ablehnung bestätigen',
  'admin.support.newConversation': 'Neue Unterhaltung',
  'admin.users.detail.emailHint': 'Damit ändert sich auch die Anmelde-E-Mail; der Nutzer muss sie erneut bestätigen.',
  'admin.users.detail.droneCount': 'Registrierte Drohnen: {count}',
  'admin.slots.notEnforced': 'Slot-Limits sind derzeit deaktiviert: Die Werte werden gespeichert, blockieren den Nutzer aber nicht.',
  'admin.reports.ownerRead': 'Vom Eigentümer gelesen',
  'admin.reports.ownerUnread': 'Vom Eigentümer noch nicht gelesen',
  'admin.nfc.baseUrl': 'Basis-URL der Badges: {url}',
  'pricing.checkout.error.invalid_json': 'Ungültige Anfrage. Lade die Seite neu und versuche es erneut.',
  'pricing.checkout.error.checkout_failed': 'Wir konnten deine Anfrage nicht speichern. Bitte versuche es gleich noch einmal.',
  'account.dashboard.greetingAnon': 'Hallo!',
  'account.identity.name': 'Vollständiger Name',
  'account.identity.completeHint': 'Dein Name ist noch nicht hinterlegt. Gib ihn einmal ein – er erscheint auf deinem öffentlichen Profil. Für spätere Änderungen wende dich an den Support.',
  'account.plan.subtitleUnlimited': 'Übersicht über deine Einträge. Derzeit gibt es keine Limits.',
  'drone.catalog.classUnknown': 'k. A.',
  'drone.catalog.note.mini4pro': 'EU: standardmäßig C0, C1 per Upgrade',
  'reportFound.geolocation.hint': 'Optional: hilft dem Besitzer, die Drohne schneller zu finden. Dein Browser fragt nach der Erlaubnis.',
  'admin.notify.reason.email_not_configured': 'E-Mail-Versand ist auf dem Server nicht eingerichtet',
  'admin.notify.reason.no_recipient_email': 'das Konto hat keine E-Mail-Adresse',
  'admin.notify.reason.no_recipient': 'das Konto hat keine E-Mail-Adresse',
  'admin.notify.reason.email_provider_auth_failed': 'der Schlüssel des E-Mail-Dienstes ist ungültig',
  'admin.notify.reason.email_address_rejected': 'Adresse wurde vom E-Mail-Dienst abgelehnt',
  'admin.notify.reason.email_rate_limited': 'zu viele E-Mails gesendet, später erneut versuchen',
  'admin.notify.reason.email_provider_unavailable': 'E-Mail-Dienst vorübergehend nicht verfügbar',
  'admin.notify.reason.email_network_error': 'Netzwerkfehler beim E-Mail-Dienst',
  'admin.notify.reason.network': 'Netzwerkfehler',
  'admin.reports.emailSent': 'Besitzer per E-Mail benachrichtigt',
  'admin.reports.emailNotSent': 'Besitzer nicht per E-Mail benachrichtigt ({reason})',
  'admin.notify.reason.email_send_failed': 'Versand fehlgeschlagen',
  'admin.support.status.open': 'Antwort ausstehend',
  'admin.support.status.pending': 'Wartet auf Nutzer',
  'admin.support.status.closed': 'Geschlossen',
  'drone.publicLink.title': 'Öffentliche Seite',
  'drone.publicLink.hint': 'Diese Adresse schreibst du auf das NFC-Badge oder machst daraus einen QR-Code.',
  'drone.publicLink.copy': 'Link kopieren',
  'drone.publicLink.open': 'Öffnen',
  'drone.publicLink.copyFailed': 'Kopieren fehlgeschlagen: Markiere den Link und kopiere ihn manuell.',
  'activeOp.empty.addOperator': 'Betreiber hinzufügen',
  'insurance.row.onPublicPage': 'Auf der öffentlichen Drohnenseite angezeigt',
  'operator.row.publicDronesOne': 'Standard für 1 öffentliche Drohne',
  'operator.row.publicDronesMany': 'Standard für {count} öffentliche Drohnen',
  'operator.delete.warningPublicOne': 'Dieser Betreiber ist der Standard für eine öffentliche Drohne. Wenn du ihn löschst, hat diese Drohne keinen Standardbetreiber mehr.',
};
