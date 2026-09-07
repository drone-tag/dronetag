import type { TranslationMap } from './schema';

/**
 * Spanish translations.
 * Structure mirrors en.ts — see that file for key documentation.
 */
export const translations: TranslationMap = {

  // ═══════════════════════════════════════════════════════════════════════════
  // LABELS — Field names, buttons, navigation, column headers, short UI text
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Common UI ──
  'common.save': 'Guardar cambios',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.view': 'Ver',
  'common.create': 'Crear',
  'common.search': 'Buscar',
  'common.back': 'Volver',
  'common.loading': 'Cargando\u2026',
  'common.error': 'Error',
  'common.success': 'Correcto',
  'common.confirm': 'Confirmar',
  'common.yes': 'S\u00ed',
  'common.no': 'No',
  'common.upload': 'Subir',
  'common.download': 'Descargar',
  'common.preview': 'Vista previa',
  'common.publish': 'Publicar',
  'common.unpublish': 'Despublicar',
  'common.published': 'P\u00fablico',
  'common.unpublished': 'Privado',
  'common.required': 'Obligatorio',
  'common.optional': 'Opcional',
  'common.actions': 'Acciones',
  'common.language': 'Idioma',
  'common.all': 'Todos',
  'common.filter': 'Filtrar',
  'common.sortBy': 'Ordenar por',
  'common.notAvailable': 'N/D',
  'common.select': 'Seleccionar\u2026',
  'common.clickOrDragToUpload': 'Haga clic o arrastre el archivo para subirlo',
  'common.remove': 'Quitar',
  'common.viewDocument': 'Ver documento',
  'common.retry': 'Reintentar',
  'common.tryAgain': 'Se produjo un error al cargar esta página. Inténtelo de nuevo más tarde.',
  'common.version': 'v1.0',

  // ── Navigation ──
  'nav.home': 'Inicio',
  'nav.dashboard': 'Panel',
  'nav.login': 'Iniciar sesi\u00f3n',
  'nav.logout': 'Cerrar sesi\u00f3n',
  'nav.newProfile': 'Nuevo perfil',
  'nav.adminBadge': 'ADMIN',
  'nav.shop': 'Tienda',
  'nav.account': 'Mi cuenta',
  'nav.signup': 'Registrarse',
  'nav.inboxBell': 'Found reports',
  'nav.inboxBell.unread': 'Found reports ({count} unread)',
  'nav.inboxBell.admin': 'Drones & found reports',

  // ── Consumer auth ──
  'auth.consumerEyebrow': 'IDENTIDAD DIGITAL PARA OPERADORES UAS',
  'auth.google': 'Continuar con Google',
  'auth.or': 'o',
  'auth.googleError': 'Error al iniciar sesi\u00f3n con Google. Int\u00e9ntalo de nuevo.',

  // ── Login form ──
  'login.email': 'Direcci\u00f3n de correo electr\u00f3nico',
  'login.password': 'Contrase\u00f1a',
  'login.submit': 'Iniciar sesi\u00f3n',
  'login.noAccount': '¿No tienes cuenta?',
  'login.signupCta': 'Crear una',
  'login.adminProvisioned':
    'Accounts are created by an administrator. Contact us if you need credentials.',

  // ── Sign-up form ──
  'signup.title': 'Reg\u00edstrate en DroneTag',
  'signup.subtitle': 'Crea tu identidad digital de operador: perfil, certificados, seguros y drones en un solo lugar.',
  'signup.submit': 'Registrarse',
  'signup.passwordConfirm': 'Confirmar contraseña',
  'signup.haveAccount': '¿Ya tienes cuenta?',
  'signup.errorPasswordShort': 'La contraseña debe tener al menos 6 caracteres.',
  'signup.errorPasswordMismatch': 'Las contraseñas no coinciden.',
  'signup.errorEmailInUse': 'Ya existe una cuenta con este correo.',
  'signup.errorGeneric': 'No se pudo crear la cuenta. Inténtalo de nuevo.',

  'signup.otp.title': 'Verifica tu contacto',
  'signup.otp.subtitle': 'Introduce los códigos OTP para confirmar email y/o teléfono. Al menos un canal debe verificarse.',
  'signup.otp.gateSubtitle': 'Debes verificar al menos tu email o teléfono antes de acceder a tu cuenta.',
  'signup.otp.chooseChannels': '¿Cómo quieres verificarte?',
  'signup.otp.verifyEmailOption': 'Verificar email (código OTP)',
  'signup.otp.verifyPhoneOption': 'Verificar teléfono (SMS OTP)',
  'signup.otp.channelHint': 'Elige al menos un método. Puedes seleccionar ambos.',
  'signup.otp.channelRequired': 'Selecciona al menos email o teléfono para verificar.',
  'signup.otp.phoneRequired': 'Introduce tu número de teléfono para la verificación SMS.',
  'signup.otp.emailSection': 'Verificación de email',
  'signup.otp.phoneSection': 'Verificación de teléfono',
  'signup.otp.sendEmail': 'Enviar código por email',
  'signup.otp.sendPhone': 'Enviar código por SMS',
  'signup.otp.resend': 'Reenviar código',
  'signup.otp.codeLabel': 'Código de 6 dígitos',
  'signup.otp.verify': 'Verificar',
  'signup.otp.verified': 'Verificado',
  'signup.otp.continue': 'Continuar',
  'signup.otp.errorSend': 'No se pudo enviar el código. Inténtalo de nuevo.',
  'signup.otp.errorCode': 'Código no válido o caducado.',
  'signup.otp.errorPhone': 'Número de teléfono no válido.',
  'signup.otp.errorIncomplete': 'Completa la verificación de todos los canales seleccionados.',
  'signup.otp.devCode': 'Dev: código email {code}',

  // ── Account area ──
  'account.eyebrow': 'Cuenta',
  'account.title': 'Bienvenido, {name}',
  'account.subtitle': 'Consulta tu perfil y el estado de tus pedidos.',
  'account.nav.home': 'Home',
  'account.nav.more': 'More',
  'account.nav.mobile': 'Account navigation',
  'account.nav.sidebar': 'Account menu',
  'account.nav.section.workspace': 'Workspace',
  'account.nav.section.library': 'Library',
  'account.nav.section.account': 'Account',
  'account.tab.settings': 'Settings',
  'settings.title': 'Settings',
  'settings.subtitle': 'Manage appearance, language and account preferences.',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.theme.hint': 'Choose light, dark, or follow your device.',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.system': 'System',
  'settings.language': 'Language',
  'settings.language.hint': 'Interface language is saved on this device.',
  'settings.account': 'Account',
  'settings.profile': 'Profile & branding',
  'settings.profile.hint': 'Public photo, logo and banner',
  'settings.billing': 'Billing',
  'settings.billing.hint': 'Plan and payment details',
  'settings.demo.persona': 'Demo personas',
  'settings.demo.persona.hint': 'Switch identity to explore admin and user scenarios.',
  'demo.banner': 'Demo mode — sample data, Firebase not connected',
  'demo.resetData': 'Reset demo data to defaults',
  'demo.scenarios.title': 'Client demo scenarios',
  'demo.scenarios.subtitle':
    'Open the public QR page, then change data as Admin — refresh the public tab to see badges update.',
  'demo.scenarios.openPublic': 'Open public profile',
  'demo.scenarios.verifyPath': 'Approve here:',
  'demo.scenario.green.title': 'All green — Michele',
  'demo.scenario.green.badges': 'Verified user · Certificates OK · Insurance active',
  'demo.scenario.green.steps':
    'Persona “OK · Michele”. Show /u/sj58afq8 as the real public card (photo, logo, banner).',
  'demo.scenario.review.title': 'Under review — Anna (SkyMap)',
  'demo.scenario.review.badges': 'Certificates pending · Insurance expiring',
  'demo.scenario.review.steps':
    'Open /u/citymapper-anna (orange user + certificates; insurance expiring). Admin → Verify → Queue: Certificates + Insurances (open demo PDF) → mark verified (demo renews insurance +1 year). Documents and Drones can stay queued if you want to show those tabs too. Reload /u/citymapper-anna → green user/certificates + active policy.',
  'demo.scenario.critical.title': 'Critical — Carlos',
  'demo.scenario.critical.badges': 'Certificates OK · Insurance expired',
  'demo.scenario.critical.steps':
    'Show /u/vistaone-carlos (red insurance). Inbox has unread found-drone reports.',
  'demo.scenario.fleet.title': 'Fleet / override — Alpine',
  'demo.scenario.fleet.badges': 'Company operator · multi-drone policy',
  'demo.scenario.fleet.steps':
    'Persona Alpine. Public /u/alpine-mavic. Admin → Droni shows temporary operator overrides.',
  'admin.verify.demoHint':
    'Certificates badge on the public page = certificate verification here. Insurance colour = expiry date (marking verified in demo also renews the policy +1 year so the badge goes green). Demo changes are saved in the browser — refresh the public page after verifying.',

  'account.dashboard.greeting': 'Hello, {name}',
  'account.dashboard.subtitle': 'Your UAS credentials at a glance.',
  'account.dashboard.credentialsStatus': 'Credential status',
  'account.dashboard.completeness': 'Profile {pct}% complete',
  'account.dashboard.quickActions': 'Quick actions',
  'account.dashboard.actionPublic': 'Public profile',
  'account.dashboard.actionPublicDesc': 'View or share your QR page',
  'account.dashboard.actionDocument': 'Add document',
  'account.dashboard.actionDocumentDesc': 'Upload a PDF or file',
  'account.dashboard.actionBadge': 'Order badge',
  'account.dashboard.actionBadgeDesc': 'NFC badge or physical kit',
  'account.dashboard.actionDrone': 'Register drone',
  'account.dashboard.actionDroneDesc': 'Add a new aircraft',
  'account.dashboard.seeAll': 'See all',
  'account.dashboard.expiryAlerts': 'Expiring within 30 days',
  'account.dashboard.expiryInDays': '{days}d left',
  'account.dashboard.expiryExpired': 'Expired',
  'account.dashboard.verifyAlerts': 'Waiting for admin review',
  'account.dashboard.verifyWaiting': 'Under review',
  'account.dashboard.verifyRejected': 'Rejected — contact support',
  'account.dashboard.verifyHint':
    'These items need admin review (fields changed vs the parser, or no auto-verify). We’ll message you in Support when the status changes.',
  'account.verification.uploadHint':
    'If you accept the parser data unchanged, the document is already verified and goes to the admin archive. If you edit the fields, it goes to the queue for an admin to compare with the PDF.',
  'account.verification.documentUploadHint':
    'Documents have no auto-verify: after upload they stay in the queue until an admin approves or rejects them.',
  'account.verification.notifyVerified':
    'We verified {kind}: {label}. Your public profile is updated.',
  'account.verification.notifyRejected':
    'We could not verify {kind}: {label}. Open Support or upload a corrected document.',
  'account.verification.kind.certificate': 'certificate',
  'account.verification.kind.insurance': 'insurance',
  'account.verification.kind.document': 'document',
  'account.verification.kind.drone': 'drone',
  'account.verification.kind.authorization': 'authorization',
  'account.verification.threadSubject': 'Document verification updates',
  'nav.menuOpen': 'Open menu',
  'nav.menuClose': 'Close menu',
  'account.tabProfile': 'Perfil',
  'account.tabOrders': 'Pedidos',
  'account.personalInfo': 'Información personal',
  'account.shippingAddress': 'Dirección de envío',
  'account.readOnly': 'Solo lectura',
  'account.noAddress': 'Aún no hay dirección guardada.',
  'account.editNotice': 'La edición del perfil estará disponible próximamente. Para cambios, contacta con soporte.',
  'account.memberSince': 'Miembro desde {date}',
  'account.notProvisioned.title': 'Account not activated',
  'account.notProvisioned.body':
    'You can sign in, but your profile has not been created by an administrator yet. Contact DroneTag to get access.',

  // ── Orders ──
  'orders.emptyTitle': 'Sin pedidos',
  'orders.emptyDesc': 'Cuando hagas tu primer pedido lo verás aquí con seguimiento y trazabilidad completos.',
  'orders.emptyCta': 'Ir a la tienda',
  'orders.orderNumber': 'Pedido n.º',
  'orders.placedOn': 'Realizado el {date}',
  'orders.viewDetails': 'Ver detalles',
  'orders.backToOrders': 'Volver a pedidos',
  'orders.progress': 'Avance',
  'orders.shippingTitle': 'Envío',
  'orders.carrier': 'Transportista',
  'orders.openTracking': 'Abrir seguimiento',
  'orders.shipTo': 'Enviar a',
  'orders.eta': 'Entrega estimada · {date}',
  'orders.deliveredOn': 'Entregado el {date}',
  'orders.items': 'Artículos del pedido',
  'orders.professionalTrace': 'Trazabilidad profesional',
  'orders.showTrace': 'Mostrar trazabilidad',
  'orders.hideTrace': 'Ocultar trazabilidad',
  'orders.subtotal': 'Subtotal',
  'orders.shippingFee': 'Envío',
  'orders.total': 'Total',
  'orders.timeline': 'Historial completo',
  'orders.notFound': 'Pedido no encontrado o no accesible.',

  // ── Order status labels ──
  'orderStatus.pending': 'Pendiente',
  'orderStatus.paid': 'Pagado',
  'orderStatus.in_production': 'En producción',
  'orderStatus.assembled': 'Ensamblado',
  'orderStatus.quality_check': 'Control de calidad',
  'orderStatus.packed': 'Empaquetado',
  'orderStatus.shipped': 'Enviado',
  'orderStatus.in_transit': 'En tránsito',
  'orderStatus.delivered': 'Entregado',
  'orderStatus.cancelled': 'Cancelado',

  // ── Traceability detail fields ──
  'trace.batch': 'Lote',
  'trace.material': 'Material / filamento',
  'trace.printedAt': 'Impreso el',
  'trace.printer': 'Impresora',
  'trace.assembledAt': 'Ensamblado el',
  'trace.assembledBy': 'Ensamblado por',
  'trace.qcAt': 'QC aprobado el',
  'trace.qcBy': 'Inspector QC',
  'trace.notes': 'Notas',

  // ── Field labels ──
  'field.language': 'Preferencia de idioma',
  'field.firstName': 'Nombre',
  'field.lastName': 'Apellidos',
  'field.operatorCode': 'UAS operator registration number',
  'field.email': 'Correo electr\u00f3nico',
  'field.phone': 'Tel\u00e9fono',
  'field.emergencyContact': 'Contacto de emergencia',
  'field.photo': 'Foto de perfil',
  'field.visibility': 'Visibilidad',
  'field.birthDate': 'Fecha de nacimiento',
  'field.nationality': 'Nacionalidad',
  'field.operatorLicense': 'UAS operator licence',
  'field.companyName': 'Raz\u00f3n social',
  'field.companyDetails': 'Datos de la empresa',
  'field.companyAddress': 'Direcci\u00f3n de la empresa',
  'field.companyVatOrRegistration': 'NIF / IVA / N\u00famero de registro',
  'field.droneName': 'Nombre del dron',
  'field.droneModel': 'Modelo',
  'field.serialNumber': 'N.\u00ba de serie',
  'field.droneRegNumber': 'Registro',
  'field.logo': 'Logotipo',
  'field.banner': 'Imagen de banner',
  'field.insuranceProvider': 'Aseguradora',
  'field.policyNumber': 'N\u00famero de p\u00f3liza',
  'field.holderName': 'Tomador',
  'field.issuedAt': 'Fecha de emisi\u00f3n',
  'field.expiresAt': 'Fecha de vencimiento',
  'field.policyPdf': 'Documento de la p\u00f3liza (PDF)',
  'field.insuranceNotes': 'Notas de la p\u00f3liza',
  'field.qrImage': 'Imagen del c\u00f3digo QR',
  'field.slug': 'Slug de URL p\u00fablica',
  'field.lastEditedBy': '\u00daltima edici\u00f3n por',
  'field.publishedAt': 'Publicado el',
  'field.lastVerifiedAt': '\u00daltima verificaci\u00f3n el',
  'field.adminNotes': 'Notas internas de administraci\u00f3n',

  // ── Dashboard table columns ──
  'dashboard.organization': 'Organizaci\u00f3n',
  'dashboard.operatorCode': 'C\u00f3digo de operador',
  'dashboard.verification': 'Verificaci\u00f3n',
  'dashboard.insuranceStatus': 'Seguro',
  'dashboard.expiryDate': 'Vencimiento',
  'dashboard.updatedAt': 'Actualizado',
  'dashboard.completeness': 'Completitud',
  'dashboard.policyExpiry': 'Vencimiento de la p\u00f3liza',
  'dashboard.draft': 'Borrador',
  'dashboard.status': 'Estado',
  'dashboard.incomplete': 'Incompleto',

  // ── Dashboard filters ──
  'dashboard.filterByStatus': 'Filtrar por estado',
  'dashboard.filterByPolicy': 'Filtrar por p\u00f3liza',
  'dashboard.filterByVerification': 'Verificaci\u00f3n',
  'dashboard.filterByVisibility': 'Visibilidad',
  'dashboard.sortName': 'Nombre',
  'dashboard.sortExpiry': 'Vencimiento de la p\u00f3liza',
  'dashboard.sortPriority': 'Urgencia documental',
  'dashboard.sortUpdated': '\u00daltima actualizaci\u00f3n',

  // ── Document type labels ──
  'docType.insurancePolicy': 'P\u00f3liza de seguro',
  'docType.operatorLicense': 'Licencia de operador',
  'docType.droneRegistration': 'Registro de dron',
  'docType.trainingCertificate': 'Certificado de formaci\u00f3n',
  'docType.other': 'Otro documento',

  // ── Public page data labels ──
  'profile.operatorId': 'ID de operador',
  'profile.registrationCode': 'Registro',
  'profile.provider': 'Aseguradora',
  'profile.policyNumber': 'N.\u00ba de p\u00f3liza',
  'profile.coverage': 'Cobertura',
  'profile.validFrom': 'V\u00e1lido desde',
  'profile.validUntil': 'V\u00e1lido hasta',
  'profile.notes': 'Notas',
  'profile.viewPolicy': 'Ver documento de p\u00f3liza original',
  'profile.downloadPolicy': 'Descargar documento de la p\u00f3liza',
  'profile.droneId': 'ID del dron',
  'profile.droneModel': 'Modelo',
  'profile.serialNumber': 'N.\u00ba de serie',
  'profile.droneRegNumber': 'Registro',
  'profile.category': 'Categor\u00eda',
  'profile.contact': 'Contacto',
  'profile.emergencyContact': 'Emergencia',
  'profile.documents': 'Documentos',
  'profile.verifiedOn': 'Verificado el',
  'profile.lastUpdated': '\u00daltima actualizaci\u00f3n',

  // ── Toggle / action labels ──
  'toggle.makePublic': 'Publicar',
  'toggle.makePrivate': 'Despublicar',
  'form.generateSlug': 'Generar URL',
  'form.publicUrlPreview': 'URL p\u00fablica:',
  'form.profileId': 'ID del perfil:',

  // ── Verification links labels ──
  'field.nfcReference': 'Referencia de etiqueta NFC',
  'field.publicUrl': 'URL de p\u00e1gina p\u00fablica',
  'links.copyUrl': 'Copiar',
  'links.copied': 'Copiado',
  'links.nfcNotAssigned': 'No asignado',

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — State indicators, badges, computed statuses
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Profile lifecycle ──
  'status.active': 'Activo',
  'status.draft': 'Borrador',
  'status.archived': 'Archivado',
  'status.suspended': 'Suspendido',

  // ── Visibility ──
  'visibility.private': 'Privado',
  'visibility.public': 'P\u00fablico',

  // ── Verification ──
  'verification.unverified': 'No verificado',
  'verification.pending': 'Pendiente de revisi\u00f3n',
  'verification.verified': 'Verificado',
  'verification.rejected': 'Rechazado',
  'verification.status': 'Estado de verificaci\u00f3n',
  'verification.lastVerified': '\u00daltima verificaci\u00f3n',
  'verification.verifiedBy': 'Verificado por',
  'verification.notes': 'Notas de verificaci\u00f3n',

  // ── Insurance policy ──
  'policy.valid': 'Vigente',
  'policy.expiring': 'Pr\u00f3xima a vencer',
  'policy.expired': 'Vencida',
  'policy.missing': 'Ausente',
  'policy.status': 'Estado de la p\u00f3liza',

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGES — Errors, alerts, hints, descriptions, dynamic text
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Login & auth ──
  'login.error': 'Error de autenticaci\u00f3n. Compruebe sus credenciales.',
  'login.restrictedNotice': 'Acceso restringido a administradores autorizados.',

  // ── Form validation & feedback ──
  'form.validation.required': 'Este campo es obligatorio',
  'form.validation.slugRequired': 'Se requiere un slug de URL p\u00fablico antes de publicar.',
  'form.validation.slugFormat': 'El slug solo puede contener letras min\u00fasculas, n\u00fameros y guiones',
  'form.saving': 'Guardando\u2026',
  'form.saved': 'Todos los cambios se han guardado correctamente.',
  'form.submitError': 'No se pudo guardar. Compruebe la conexi\u00f3n.',

  // ── Form hints ──
  'form.photoHint': 'Se recomienda imagen cuadrada, m\u00ednimo 200\u00d7200 px.',
  'form.pdfHint': 'Suba el PDF original de la p\u00f3liza de seguro.',
  'form.qrHint': 'Cargue o genere el c\u00f3digo QR para este perfil.',

  // ── Dashboard alerts ──
  'dashboard.alerts': 'Alertas operativas',
  'dashboard.alertNoPdf': '{count} perfil(es) sin PDF de p\u00f3liza',
  'dashboard.alertExpiring': '{count} p\u00f3liza(s) vence(n) en los pr\u00f3ximos 30 d\u00edas',
  'dashboard.alertCompleteNotPublished': '{count} perfil(es) completo(s) a\u00fan no publicado(s)',
  'dashboard.alertPublishedNotVerified': '{count} perfil(es) publicado(s) no verificado(s)',
  'dashboard.noAlerts': 'Sin alertas operativas. Todo en orden.',

  // ── Dashboard messages ──
  'dashboard.confirmDelete': 'Este perfil de operador se eliminar\u00e1 de forma permanente e irreversible. Se perder\u00e1n las credenciales asociadas y los enlaces de verificaci\u00f3n. \u00bfDesea continuar?',
  'dashboard.deleteModalNote': 'Los enlaces p\u00fablicos QR y NFC dejar\u00e1n de ser v\u00e1lidos de inmediato y los datos dejar\u00e1n de estar disponibles para terceros. Esta acci\u00f3n no se puede deshacer.',
  'dashboard.adjustFilters': 'Modifique la b\u00fasqueda o los filtros para mostrar perfiles pertinentes o acotar los resultados.',
  'dashboard.searchPlaceholder': 'Nombre, empresa o c\u00f3digo de operador\u2026',
  'common.noResults': 'No hay perfiles coincidentes',
  'common.filtersActive': '{count} filtro(s) activo(s)',
  'common.clearFilters': 'Borrar todos los filtros',
  'common.noDocument': 'No hay ning\u00fan documento cargado',
  'common.pdfPreviewLoading': 'Cargando vista previa del PDF…',
  'common.pdfPreviewFailed': 'Vista previa no disponible. Abre el documento en una pesta\u00f1a nueva.',
  'common.noQr': 'No hay ning\u00fan c\u00f3digo QR cargado',

  // ── Policy descriptions (dynamic) ──
  'policy.daysLeft': 'Quedan {days} d\u00edas',
  'policy.expiredDaysAgo': 'Vencida hace {days} d\u00edas',
  'policy.desc.validUntil': 'Vigente hasta el {date}',
  'policy.desc.expiringOn': 'Vence el {date} \u2014 {days} d\u00edas restantes',
  'policy.desc.expiredOn': 'Vencida el {date} (hace {days} d\u00edas)',
  'policy.desc.noPolicyOnFile': 'No hay documento de p\u00f3liza registrado',

  // ── Public page messages ──
  'public.insuranceValid': 'La cobertura de seguro est\u00e1 activa y vigente.',
  'public.insuranceExpiring': 'La cobertura de seguro vence en {days} d\u00edas.',
  'public.insuranceExpired': 'La cobertura de seguro ha expirado. Contacte al operador o la organizaci\u00f3n para documentaci\u00f3n actualizada.',
  'public.insuranceMissing': 'No hay informaci\u00f3n de seguro registrada para este operador.',
  'public.noInformation': 'No proporcionado',
  'public.policyNotAvailable': 'Documento de p\u00f3liza original no disponible.',
  'public.policyNotAvailableHint': 'La organizaci\u00f3n emisora no ha cargado el documento de p\u00f3liza para este perfil.',
  'public.latestRecord': 'Esta p\u00e1gina refleja el \u00faltimo registro publicado a la fecha indicada arriba.',
  'public.scanToVerify': 'Escanee este c\u00f3digo para verificar el perfil del operador',

  // ── Profile unavailable messages ──
  'profile.notFoundDesc': 'El perfil de operador que busca no existe o ha sido eliminado.',
  'profile.notPublishedDesc': 'Este perfil de operador no est\u00e1 disponible para consulta p\u00fablica. Puede estar en revisi\u00f3n o haber sido retirado.',
  'profile.disclaimer': 'Esta informaci\u00f3n se facilita \u00fanicamente con fines de verificaci\u00f3n. La exactitud de los datos es responsabilidad de la organizaci\u00f3n emisora.',
  'profile.expiringInDays': 'Caduca en {days} d\u00edas',

  // ── Verification links descriptions ──
  'links.publicUrlDesc': 'Esta es la URL p\u00fablica permanente para este perfil de operador. Comp\u00e1rtala directamente o cod\u00edfiquela en el c\u00f3digo QR.',
  'links.publicUrlNotReady': 'Defina un slug y publique el perfil para generar una URL p\u00fablica.',
  'links.qrDesc': 'Cargue o genere una imagen de c\u00f3digo QR que enlace a la p\u00e1gina de verificaci\u00f3n p\u00fablica de este operador.',
  'links.nfcDesc': 'The NFC badge contains the public DroneTag link for this profile. Tapping it with a smartphone opens the page below — no app required.',  // TODO: translate

  // ── Empty states ──
  'empty.noProfilesIcon': 'No hay operadores registrados',
  'empty.noResultsIcon': 'No hay resultados coincidentes',

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTIONS — Page titles, section headers, subtitles, content blocks
  // ═══════════════════════════════════════════════════════════════════════════

  // ── App identity ──
  'app.title': 'DroneTag',
  'app.description': 'Verificaci\u00f3n profesional de credenciales de operadores y gesti\u00f3n centralizada de documentaci\u00f3n para operaciones con drones.',

  // ── Login page ──
  'login.title': 'Accede a DroneTag',
  'login.subtitle': 'Accede a tu perfil, documentos, certificados y drones.',

  // ── Home page ──
  'home.hero': 'Verificaci\u00f3n de credenciales de operadores de drones',
  'home.subtitle': 'Plataforma profesional para emitir, auditar y dar seguimiento a credenciales operativas en operaciones con UAS.',
  'home.feature1Title': 'Credenciales de operador',
  'home.feature1Desc': 'Emisi\u00f3n de identificaci\u00f3n digital y credenciales para operadores de sistemas a\u00e9reos no tripulados.',
  'home.feature2Title': 'Verificaci\u00f3n en tiempo real',
  'home.feature2Desc': 'Comprobaci\u00f3n inmediata de perfiles v\u00e1lidos mediante escaneo QR, sin fricci\u00f3n.',
  'home.feature3Title': 'Supervisi\u00f3n del cumplimiento',
  'home.feature3Desc': 'Seguimiento automatizado del vencimiento de seguros y documentaci\u00f3n para mantener la conformidad.',
  'home.cta': 'Inicio de sesi\u00f3n de administrador',
  'home.footer': 'DroneTag \u00a9 {year}. Verificaci\u00f3n de operadores y gesti\u00f3n documental.',
  'home.learnMore': 'C\u00f3mo funciona',
  'home.systemDesc': 'DroneTag ayuda a las organizaciones a custodiar y demostrar de forma segura las cualificaciones operativas y las p\u00f3lizas.',

  'home.nav.howItWorks': 'C\u00f3mo funciona',
  'home.nav.features': 'Funciones',
  'home.nav.nfcBadge': 'Badges NFC',
  'home.nav.signIn': 'Iniciar sesi\u00f3n',
  'home.nav.signUp': 'Registrarse',
  'home.nav.adminArea': '\u00c1rea de administraci\u00f3n',
  'home.nav.openDashboard': 'Abrir panel',

  'home.hero.eyebrow': 'IDENTIDAD DIGITAL PARA OPERADORES UAS',
  'home.hero.title': 'Todas tus credenciales de drone, siempre disponibles.',
  'home.hero.subtitle': 'DroneTag re\u00fane perfil, certificados, seguros y drones en una identidad digital accesible mediante badge NFC y la app oficial.',
  'home.hero.ctaPrimary': 'Acceder a la plataforma',
  'home.hero.ctaSecondary': 'Ver c\u00f3mo funciona',
  'home.hero.ctaDashboard': 'Ir al panel',
  'home.hero.trustNfc': 'Acceso r\u00e1pido por NFC',
  'home.hero.trustDocs': 'Documentos protegidos',
  'home.hero.trustExpiry': 'Control de vencimientos',

  'home.preview.operatorName': 'Marco Bianchi',
  'home.preview.operatorRole': 'Remote pilot \u00b7 AeroFly Srl',
  'home.preview.insurance': 'Seguro RC',
  'home.preview.insuranceDetail': 'P\u00f3liza v\u00e1lida hasta dic. 2026',
  'home.preview.certificate': 'Certificado A2',
  'home.preview.certificateDetail': 'Categor\u00eda abierta \u2014 subcategor\u00eda A2',
  'home.preview.drone': 'Drone registrado',
  'home.preview.droneDetail': 'DJI Mavic 3 \u00b7 IT-DRN-4821',
  'home.preview.valid': 'V\u00e1lido',
  'home.preview.expiring': 'Por vencer',
  'home.preview.showCredentials': 'Mostrar credenciales',
  'home.preview.nfcDetected': 'Badge detectado',
  'home.preview.nfcSuccess': 'Perfil abierto correctamente',

  'home.audience.operator.title': 'Soy operador',
  'home.audience.operator.desc': 'Consulta y comparte certificados, seguros y drones.',
  'home.audience.operator.cta': 'Acceder al perfil',
  'home.audience.admin.title': 'Soy administrador',
  'home.audience.admin.desc': 'Gestiona usuarios, verificaciones, documentos, badges y vencimientos.',
  'home.audience.admin.cta': 'Abrir \u00e1rea de administraci\u00f3n',
  'home.audience.verifier.title': 'Debo verificar un operador',
  'home.audience.verifier.desc': 'Consulta el perfil p\u00fablico por NFC, QR o enlace.',
  'home.audience.verifier.cta': 'Abrir verificaci\u00f3n',

  'home.how.title': 'C\u00f3mo funciona',
  'home.how.step1.title': 'Crea el perfil',
  'home.how.step1.desc': 'Registra operador, organizaci\u00f3n y drones.',
  'home.how.step2.title': 'Sube las credenciales',
  'home.how.step2.desc': 'A\u00f1ade certificados, seguros y documentos.',
  'home.how.step3.title': 'Mu\u00e9stralas cuando haga falta',
  'home.how.step3.desc': 'Comparte el perfil por badge NFC, QR o enlace.',

  'home.features.title': 'Funciones principales',
  'home.features.subtitle': 'Todo lo necesario para gestionar identidad y cumplimiento UAS en un solo lugar.',
  'home.features.profile.title': 'Perfil de operador',
  'home.features.profile.desc': 'Identidad, roles y datos profesionales.',
  'home.features.certificates.title': 'Certificados',
  'home.features.certificates.desc': 'A1/A3, A2, STS y otras cualificaciones.',
  'home.features.insurances.title': 'Seguros',
  'home.features.insurances.desc': 'P\u00f3lizas, validez y documentos asociados.',
  'home.features.drones.title': 'Drones',
  'home.features.drones.desc': 'Datos identificativos, estado y asociaciones.',
  'home.features.nfc.title': 'Badge NFC y app oficial',
  'home.features.nfc.desc': 'Acceso inmediato al perfil digital.',
  'home.features.expiry.title': 'Control de vencimientos',
  'home.features.expiry.desc': 'Alertas por documentos por vencer o faltantes.',

  'home.nfc.title': 'Del badge al perfil digital en un gesto.',
  'home.nfc.subtitle': 'Acerca el m\u00f3vil al badge NFC o escanea el QR para abrir el perfil verificable.',
  'home.nfc.benefit1': 'Sin app obligatoria',
  'home.nfc.benefit2': 'Acceso inmediato',
  'home.nfc.benefit3': 'Datos p\u00fablicos y protegidos separados',
  'home.nfc.scanHint': 'P\u00e1gina p\u00fablica de verificaci\u00f3n',

  'home.verify.title': 'Pensado para verificaciones r\u00e1pidas.',
  'home.verify.subtitle': 'Autoridades y clientes leen lo esencial en segundos.',
  'home.verify.point1': 'Estado verificado de un vistazo',
  'home.verify.point2': 'Seguro y certificados activos listados',
  'home.verify.point3': 'Documentos protegidos bajo solicitud',
  'home.verify.operatorId': 'ID DT-2024-0847',
  'home.verify.rowInsurance': 'Seguro',
  'home.verify.rowCertificates': 'Certificados activos',
  'home.verify.certificatesValue': 'A1/A3, A2',
  'home.verify.rowUpdated': '\u00daltima actualizaci\u00f3n',
  'home.verify.updatedValue': '19 jun 2026',
  'home.verify.viewProtected': 'Ver documentos protegidos',
  'home.verify.footerNote': 'Solo datos p\u00fablicos \u2014 documentos sensibles requieren autorizaci\u00f3n.',

  'home.ctaFinal.title': 'Lleva tus credenciales siempre contigo.',
  'home.ctaFinal.subtitle': 'Accede a DroneTag y gestiona perfil, documentos, certificados y drones desde una plataforma.',

  'home.footer.desc': 'Identidad digital privada y gesti\u00f3n documental para operadores UAS.',
  'home.footer.legal': 'Legal',
  'home.footer.privacy': 'Privacidad',
  'home.footer.terms': 'T\u00e9rminos',
  'home.footer.contact': 'Contacto',

  // ── Dashboard ──
  'dashboard.title': 'Perfiles de operador',
  'dashboard.subtitle': 'Gestione credenciales, p\u00f3lizas y verificaci\u00f3n desde un \u00fanico panel.',
  'dashboard.createNew': 'Registrar operador',
  'dashboard.viewPublicProfile': 'Ver perfil p\u00fablico',
  'dashboard.noProfiles': 'No hay perfiles de operador registrados',
  'dashboard.noProfilesHint': 'Registre primero un perfil de operador para capturar credenciales, publicarlas y gestionar su verificaci\u00f3n.',
  'dashboard.deleteModalTitle': '\u00bfEliminar permanentemente el perfil de operador?',

  // ── Dashboard KPI labels ──
  'dashboard.stats.total': 'Perfiles totales',
  'dashboard.stats.published': 'P\u00fablicos',
  'dashboard.stats.verified': 'Verificados',
  'dashboard.stats.expiring': 'Pr\u00f3ximos a vencer',
  'dashboard.stats.expired': 'Vencidas',
  'dashboard.stats.incomplete': 'Incompletos',

  // ── Admin pages ──
  'admin.createProfileTitle': 'Registrar nuevo operador',
  'admin.editProfileTitle': 'Editar perfil de operador',
  'admin.environment': 'Administraci\u00f3n',

  // ── Form section headers ──
  'form.person': 'Identidad del operador',
  'form.person.desc': 'Datos de identificaci\u00f3n personal del operador certificado de UAS.',
  'form.organization': 'Organizaci\u00f3n',
  'form.organization.desc': 'Afiliaci\u00f3n empresarial e informaci\u00f3n de la organizaci\u00f3n emisora.',
  'form.insurance': 'Cobertura del seguro',
  'form.insurance.desc': 'Detalles de la p\u00f3liza de responsabilidad civil y documentaci\u00f3n asociada.',
  'form.drone': 'Dron registrado',
  'form.drone.desc': 'Identificaci\u00f3n y datos del sistema a\u00e9reo no tripulado (UAS) registrado.',
  'form.documents': 'Documentos adicionales',
  'form.verification': 'Verificaci\u00f3n y auditor\u00eda',
  'form.verification.desc': 'Estado de verificaci\u00f3n e historial de revisi\u00f3n trazable.',
  'form.assets': 'Medios y documentos',
  'form.assets.desc': 'Fotograf\u00edas, logotipos y c\u00f3digos de verificaci\u00f3n (p. ej., QR) para el perfil p\u00fablico.',
  'form.statusAndAccess': 'Publicaci\u00f3n y control de acceso',
  'form.statusAndAccess.desc': 'Ciclo de vida del perfil, visibilidad y autorizaci\u00f3n para verificaci\u00f3n p\u00fablica.',
  'form.adminSection': 'Notas internas',
  'form.adminSection.desc': 'Anotaciones administrativas no visibles en la p\u00e1gina p\u00fablica.',

  // ── Verification links section ──
  'form.verificationLinks': 'Verificaci\u00f3n y enlaces de acceso',
  'form.verificationLinks.desc': 'URL p\u00fablica, c\u00f3digo QR y referencia NFC para la verificaci\u00f3n externa de este perfil de operador.',
  'links.publicUrlTitle': 'URL de p\u00e1gina p\u00fablica',
  'links.qrTitle': 'C\u00f3digo QR',
  'links.nfcTitle': 'Etiqueta NFC',

  // ── Form card headers ──
  'form.publicDataTitle': 'Datos del operador',
  'form.publicDataSubtitle': 'Estos campos se muestran en la p\u00e1gina de perfil p\u00fablica.',
  'form.mediaTitle': 'Medios y c\u00f3digos de verificaci\u00f3n',
  'form.mediaSubtitle': 'Recursos visuales y c\u00f3digos para la verificaci\u00f3n externa del perfil.',
  'form.adminTitle': 'Administraci\u00f3n',
  'form.adminSubtitle': 'Ajustes y notas internas no expuestos al p\u00fablico.',

  // ── Public profile section headers ──
  'profile.organization': 'Organizaci\u00f3n',
  'profile.orgDetails': 'Datos de la organizaci\u00f3n',
  'profile.insurance': 'Cobertura del seguro',
  'profile.qrCode': 'Verificaci\u00f3n QR',
  'profile.droneInfo': 'Dron registrado',
  'profile.notFound': 'Perfil no encontrado',
  'profile.notPublished': 'Perfil no disponible',
  'public.operatorProfile': 'Perfil de Operador',
  'public.verifiedOperator': 'Operador Verificado',
  'public.identity': 'Identidad del Operador',
  'public.operatorCode': 'C\u00f3digo de Operador',
  'public.licenseNumber': 'N.\u00ba Licencia',
  'public.droneInformation': 'Informaci\u00f3n del Dron',
  'public.insuranceCoverage': 'Cobertura de Seguro',
  'public.policyDetails': 'Detalles de P\u00f3liza',
  'public.policyDocument': 'Documento de P\u00f3liza',
  'public.qrVerification': 'C\u00f3digo QR de Verificaci\u00f3n',
  'public.verificationRecord': 'Registro de Verificaci\u00f3n',
  'public.profileReference': 'Referencia del Perfil',
  'public.poweredBy': 'Powered by DroneTag',

  // ═══════════════════════════════════════════════════════════════════════════
  // M2 — User dashboard (English-source strings; pending ES polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'account.tab.operators': 'Operators',
  'account.tab.drones': 'Drones',
  'account.tab.insurances': 'Insurances',
  'account.tab.certificates': 'Certificates',
  'account.tab.documents': 'Documents',
  'account.tab.permits': 'Permits',
  'account.tab.archive': 'Archive',

  'account.section.accountType': 'Account type',
  'account.accountType.private': 'Private individual',
  'account.accountType.company': 'Company',
  'account.section.privateInfo': 'Personal information',
  'account.section.companyInfo': 'Company information',
  'account.section.address': 'Address',
  'account.section.media': 'Public profile images',
  'account.mediaHint': 'Photo, logo and banner appear on your public drone page (/u/…). Contact and address details stay private.',
  'account.lockedIdentityHint': 'Photo, logo and banner are free to update. To change personal data, phone, email or address, contact an admin.',
  'account.saved': 'Changes saved',
  'account.saveError': 'Could not save changes. Please try again.',
  'account.storageBillingRequired':
    'Cloud Storage requires the Firebase Blaze plan. Open Firebase console → Project settings → Usage and billing, link a billing account, upgrade to Blaze, then retry.',
  'entity.noPdfAttached': 'No PDF attached — open Edit and upload the file.',
  'account.editHint': 'Edit your account details and pilot identity. None of these fields are shown publicly.',

  'field.addressLine1': 'Address line 1',
  'field.addressLine2': 'Address line 2 (optional)',
  'field.city': 'City',
  'field.postalCode': 'Postal code',
  'field.country': 'Country',
  'field.companyContactPerson': 'Contact person',
  'field.companyVat': 'VAT / tax number',
  'field.companyUniqueNumber': 'Company registry number (optional)',

  'operator.list.title': 'Operators',
  'operator.list.subtitle': 'Up to {max} operators per account.',
  'operator.list.empty': 'No operators yet',
  'operator.list.emptyDesc': 'Add an operator to associate with your drones.',
  'operator.list.new': 'New operator',
  'operator.list.atCap': 'You have reached the operator limit.',
  'operator.kind.private': 'Private individual',
  'operator.kind.company': 'Company',
  'operator.field.kind': 'Operator type',
  'operator.field.label': 'Display label',
  'operator.field.isDefault': 'Default operator',
  'operator.field.isDefaultHint': 'Used when no temporary override is active.',
  'operator.current.badge': 'Current operator',
  'operator.current.hint': 'Select your current operator here. It is pre-filled when you create a new drone and used when no temporary override is active on a flight.',
  'operator.current.set': 'Set {name} as current operator',
  'operator.current.setShort': 'Set as current',
  'operator.create.title': 'New operator',
  'operator.edit.title': 'Edit operator',
  'operator.delete.title': 'Delete operator?',
  'operator.delete.warningPublic': 'This operator is currently the default for {count} public drone(s). Deleting it will leave those drones without a default operator.',

  'drone.list.title': 'Drones',
  'drone.list.empty': 'No drones yet',
  'drone.list.emptyDesc': 'Add your first drone to publish a public profile.',
  'drone.list.new': 'New drone',
  'drone.list.atCap': 'You have used all your drone slots.',
  'drone.field.manufacturer': 'Manufacturer',
  'drone.field.model': 'Model / name',
  'drone.field.classMarking': 'Class marking',
  'drone.field.serialNumber': 'Drone serial number',
  'drone.field.controllerSerial': 'Controller serial number',
  'drone.field.defaultOperator': 'Default operator',
  'drone.field.linkedPilot': 'Linked pilot',
  'drone.field.insurance': 'Insurance policy',
  'drone.field.insuranceNone': 'No insurance linked',
  'drone.field.status': 'Status',
  'drone.field.visibility': 'Visibility',
  'drone.field.slug': 'Public URL slug',
  'drone.publicUrl': 'Public URL',
  'drone.copySlug': 'Copy public URL',
  'drone.slugCopied': 'Public URL copied',
  'drone.create.title': 'New drone',
  'drone.edit.title': 'Drone details',
  'drone.delete.title': 'Delete drone?',
  'drone.delete.warning': 'This drone is currently public at {url}. The QR/NFC card will stop working immediately.',
  'drone.class.c0': 'C0 (under 250 g)',
  'drone.class.c1': 'C1 (under 900 g)',
  'drone.class.c2': 'C2 (under 4 kg)',
  'drone.class.c3': 'C3 (under 25 kg)',
  'drone.class.c4': 'C4 (under 25 kg, no automation)',
  'drone.class.unknown': 'Unknown / not classified',
  'drone.catalog.title': 'Model catalog',
  'drone.catalog.search': 'Find your drone',
  'drone.catalog.searchPlaceholder': 'Search DJI Mini, Air 3S, Autel…',
  'drone.catalog.hint': 'Pick a common model to autofill brand, name and EU class. You only add the serial and operator.',
  'drone.catalog.empty': 'No models match. Try another search or choose custom.',
  'drone.catalog.custom': 'Other model — enter details manually',
  'drone.catalog.selectedClass': 'EU class',
  'drone.catalog.required': 'Select a model from the catalog or choose custom.',
  'drone.catalog.serialHint': 'Serial number on the aircraft',
  'drone.detail.basics': 'Basic information',
  'drone.detail.identity': 'Identity & serials',
  'drone.detail.publish': 'Publishing',
  'drone.detail.linked': 'Linked entities',
  'drone.backToList': 'Back to drones',
  'drone.confirmCreate.title': 'Confirm drone data',
  'drone.confirmCreate.message':
    'Are you sure the information is correct? Once saved, it cannot be changed. To register another drone you must delete this one and purchase a new slot.',
  'drone.confirmLock.title': 'Lock drone data',
  'drone.confirmLock.message':
    'Are you sure the information is correct? After saving, these fields cannot be modified. To use another drone you must delete this one and purchase a new slot.',
  'drone.locked.hint':
    'Drone data cannot be modified. Delete this drone to free the slot and add another one.',

  'insurance.list.title': 'Insurance policies',
  'insurance.list.subtitle': 'One policy can cover several drones. Link the holder, then select every covered aircraft.',
  'insurance.list.empty': 'No insurance policies',
  'insurance.list.emptyDesc': 'Upload a policy PDF — one schedule can cover your whole fleet.',
  'insurance.list.new': 'New policy',
  'insurance.field.link': 'Linked to',
  'insurance.link.drone': 'Drone',
  'insurance.link.operator': 'Operator',
  'insurance.field.drone': 'Linked drone',
  'insurance.field.coveredDrones': 'Covered drones',
  'insurance.field.coveredDronesHint': 'Select all drones this policy covers. A single insurance can protect multiple aircraft.',
  'insurance.field.noDrones': 'No drones in your fleet yet — add a drone first, or save the policy and attach later.',
  'insurance.coveredCount': '{count} drones',
  'insurance.field.operator': 'Linked operator',
  'insurance.create.title': 'New insurance policy',
  'insurance.edit.title': 'Edit insurance policy',
  'insurance.delete.title': 'Delete insurance?',
  'insurance.confirmCreate.title': 'Confirm insurance data',
  'insurance.confirmCreate.message':
    'Are you sure the information is correct? Once saved, it cannot be changed. To add another policy you must delete this one.',
  'insurance.locked.hint':
    'Insurance data cannot be modified. Delete this policy to add a different one.',
  'insurance.view.title': 'Insurance details',
  'insurance.delete.warningPublic': 'This policy is currently linked to a public drone. Deleting it will remove the insurance status from that public profile.',
  'insurance.field.validity': 'Valid from – to',
  'insurance.parse.hint': 'We read holder, policy number, dates and every UAS on the schedule. Multi-drone policies are supported.',
  'insurance.parse.parsing': 'Reading policy data from PDF…',
  'insurance.parse.success': 'Policy data extracted — check the fields below.',
  'insurance.parse.partial': 'Some fields were extracted — please complete the rest manually.',
  'insurance.parse.failed': 'Could not read this PDF automatically. Enter the details manually.',
  'insurance.parse.droneDetected': 'Drone from PDF',
  'insurance.parse.dronesDetected': '{count} aircraft found on the policy',
  'insurance.parse.dronesMatched': '{count} matched to your fleet',
  'insurance.parse.droneMatched': 'linked to your fleet',
  'insurance.parse.droneNotMatched': 'select the drone manually',
  'insurance.coverdrone.cta': 'Get a Coverdrone quote',
  'insurance.coverdrone.hint': 'Policy expiring or expired? Renew or buy EU drone liability cover with Coverdrone.',

  'cert.list.title': 'Certificates',
  'cert.list.subtitle': 'A1/A3, A2, STS-theoretical, STS-01, STS-02 or custom.',
  'cert.list.empty': 'No certificates',
  'cert.list.emptyDesc': 'Add your A1/A3, A2 or STS certificates.',
  'cert.list.new': 'New certificate',
  'cert.list.atCap': 'You have used all your certificate slots.',
  'cert.field.kind': 'Certificate type',
  'cert.field.label': 'Display label',
  'cert.field.registrationNumber': 'Registration number',
  'cert.field.registrationNumberHint': 'Read from the PDF automatically, or enter manually',
  'cert.field.issuedBy': 'Issued by',
  'cert.field.fileUrl': 'Certificate URL',
  'cert.field.filePdf': 'Certificate document (PDF)',
  'cert.field.number': 'Certificate number',
  'cert.field.notes': 'Notes',
  'cert.kind.a1a3': 'A1 / A3',
  'cert.kind.a2': 'A2',
  'cert.kind.stsTheoretical': 'STS theoretical',
  'cert.kind.sts01': 'STS-01',
  'cert.kind.sts02': 'STS-02',
  'cert.kind.custom': 'Custom certificate',
  'cert.create.title': 'New certificate',
  'cert.edit.title': 'Edit certificate',
  'cert.delete.title': 'Delete certificate?',
  'cert.confirmCreate.title': 'Confirm certificate data',
  'cert.confirmCreate.message':
    'Are you sure the information is correct? Once saved, it cannot be changed. To add another certificate you must delete this one and purchase a new slot.',
  'cert.locked.hint':
    'Certificate data cannot be modified. Delete this certificate to free the slot and add another one.',
  'cert.view.title': 'Certificate details',
  'cert.parse.hint': 'We read certificate type, issuer, dates and holder name from the PDF. You can edit the fields below.',
  'cert.parse.parsing': 'Reading certificate data from PDF…',
  'cert.parse.success': 'Certificate data extracted — check the fields below.',
  'cert.parse.partial': 'Some fields were extracted — please complete the rest manually.',
  'cert.parse.failed': 'Could not read this PDF automatically. Enter the details manually.',

  'doc.list.title': 'Uploaded documents',
  'doc.list.subtitle': '{used} of {max} document slots used.',
  'doc.list.empty': 'No documents',
  'doc.list.emptyDesc': 'Upload PDFs (insurance policy, registration, training certificate, etc).',
  'doc.list.new': 'New document',
  'doc.list.atCap': 'You have used all your document slots.',
  'doc.field.kind': 'Document type',
  'doc.field.label': 'Name',
  'doc.field.labelHint': 'Optional — defaults to the file name',
  'doc.field.file': 'File',
  'doc.field.fileUrl': 'File URL',
  'doc.field.fileName': 'File name',
  'doc.field.notes': 'Notes',
  'doc.kind.insurance_policy': 'Insurance policy',
  'doc.kind.operator_license': 'Operator license',
  'doc.kind.drone_registration': 'Drone registration',
  'doc.kind.training_certificate': 'Training certificate',
  'doc.kind.identity': 'Identity document',
  'doc.kind.other': 'Other',
  'doc.create.title': 'New document',
  'doc.edit.title': 'Edit document',
  'doc.delete.title': 'Delete document?',
  'doc.urlHint': 'Paste a public URL to the file (Firebase Storage URL, signed link, etc).',

  'permits.list.title': 'Permits and authorizations',
  'permits.list.subtitle': 'Daily authorizations, nullaosta and operational permits. Expired items move to Archive.',
  'permits.list.new': 'New permit',
  'permits.list.empty': 'No active permits',
  'permits.list.emptyDesc': 'Upload daily authorizations, nullaosta, hourly clearances and similar operational docs.',
  'permits.list.atCap': 'You have used all active permit slots.',
  'permits.hint.parser': 'Area, conditions, dates and linked drone (parser coming soon)',
  'permits.hint.storage': 'Included: 3 active permits (extra slots purchasable)',
  'permits.hint.admin': 'Admins can always verify manually',
  'permits.archiveNotice': '{count} expired item(s) moved to Archive.',
  'permits.create.title': 'New authorization',
  'permits.edit.title': 'Edit authorization',
  'permits.delete.title': 'Delete authorization?',
  'permits.delete.message': 'This authorization will be removed permanently.',
  'permits.kind.daily': 'Daily authorization',
  'permits.kind.nullaosta': 'Nullaosta',
  'permits.kind.hourly_nullaosta': 'Hourly nullaosta',
  'permits.kind.temporary': 'Temporary permit',
  'permits.kind.other': 'Other',
  'permits.field.kind': 'Type',
  'permits.field.label': 'Title',
  'permits.field.issuedBy': 'Issued by',
  'permits.field.area': 'Area / zone',
  'permits.field.validFrom': 'Valid from',
  'permits.field.validTo': 'Valid until',
  'permits.field.notes': 'Notes',
  'permits.field.file': 'Document (PDF or image)',

  'archive.list.title': 'Archive',
  'archive.list.subtitle': 'Expired certificates, policies and authorizations. Expand storage from billing.',
  'archive.list.new': 'Upload to archive',
  'archive.list.empty': 'Archive is empty',
  'archive.list.emptyDesc': 'When certificates, insurance policies or permits expire, they appear here automatically.',
  'archive.hint.storage': 'Included archive space: 30 MB',
  'archive.hint.autoMove': 'Expired versions move here automatically',
  'archive.hint.upgrade': 'Buy more archive space',
  'archive.cta.buySpace': 'Buy space',
  'archive.storage.title': 'Archive storage',
  'archive.storage.used': '{used} MB of {max} MB used',
  'archive.expiredOn': 'Expired on',
  'archive.openSource': 'Open section',
  'archive.delete.title': 'Delete from archive?',
  'archive.delete.message': 'This permanently removes the expired document and frees storage.',

  'slot.usage': '{used} of {max} used',
  'slot.atCap': 'Limit reached',
  'slot.contactToUpgrade': 'Contact admin to add more slots.',

  'confirm.continue': 'Continue',
  'confirm.dangerWarning': 'This action cannot be undone.',

  'form.errors.title': 'Please fix the highlighted fields.',
  'form.errors.invalidEmail': 'Enter a valid email address.',
  'form.errors.invalidUrl': 'Enter a valid URL.',
  'form.errors.urlNotAllowed': 'URL must be hosted on Firebase Storage or a trusted host configured by the admin.',
  'form.errors.expiryBeforeIssue': 'Expiry date must be after the issue date.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M3 — Public drone page + Report found drone (English source; pending ES).
  // ═══════════════════════════════════════════════════════════════════════════

  'publicDrone.eyebrow': 'Drone identification',
  'publicDrone.holderPilot': 'Remote pilot',
  'publicDrone.holderOperatorPrivate': 'UAS operator',
  'publicDrone.holderOperatorCompany': 'UAS operator (company)',
  'publicDrone.holderName': 'Nombre',
  'publicDrone.classification': 'Drone class',
  'publicDrone.identifier': 'Serial number',
  'publicDrone.policyNumberMasked': 'Policy reference',
  'publicDrone.validUntil': 'Valid until',
  'publicDrone.userVerified': 'Verified user',
  'publicDrone.userPending': 'User under review',
  'publicDrone.userUnverified': 'User not verified',
  'publicDrone.userRejected': 'User not approved',
  'publicDrone.insuranceUnknown': 'No insurance information on file',
  'publicDrone.insuranceActive': 'Insurance active',
  'publicDrone.insuranceExpiring': 'Insurance expiring soon',
  'publicDrone.insuranceExpired': 'Insurance expired',
  'publicDrone.certificatesVerified': 'Certificates verified',
  'publicDrone.certificatesPending': 'Certificates under review',
  'publicDrone.certificatesUnverified': 'Certificates not verified',
  'publicDrone.certificatesRejected': 'Certificates rejected',
  'publicDrone.viewPolicyPdf': 'View policy document',
  'publicDrone.openApp': 'Open app / sign in',
  'publicDrone.reportFound': 'I found this drone',
  'publicDrone.reportFoundShort': 'Report found drone',
  'publicDrone.lastVerified': 'Last verified',
  'publicDrone.publishedOn': 'Published on',
  'publicDrone.disclaimer': 'DroneTag is a private digital identification platform. It does not replace official operator registration, pilot certification, insurance obligations or authority-issued documentation.',

  'reportFound.title': 'Report a found drone',
  'reportFound.subtitle': 'Help return this drone to its owner. Sharing your contact details is optional.',
  'reportFound.field.finderName': 'Your name (optional)',
  'reportFound.field.finderEmail': 'Your email (optional)',
  'reportFound.field.message': 'Message to the owner (optional)',
  'reportFound.field.locationText': 'Approximate location (optional)',
  'reportFound.field.locationTextHint': 'Free-form: address, landmark, neighbourhood, etc.',
  'reportFound.geolocation.add': 'Share my GPS location',
  'reportFound.geolocation.added': 'GPS location captured',
  'reportFound.geolocation.remove': 'Remove GPS location',
  'reportFound.geolocation.error': 'Could not access location. You can still describe it in the field above.',
  'reportFound.privacy': 'Your details are sent only to the drone owner. The owner cannot see your phone number or address.',
  'reportFound.submit': 'Send report',
  'reportFound.submitting': 'Sending\u2026',
  'reportFound.successTitle': 'Thank you for the report',
  'reportFound.successBody': 'The drone owner has been notified. They may reach out using the contact details you provided, if any.',
  'reportFound.errorBody': 'We could not send your report. Please try again in a moment.',
  'reportFound.cooldown': 'Please wait a few seconds before sending another report.',

  'inbox.title': 'Found reports',
  'inbox.subtitle': 'Messages from people who found one of your drones.',
  'inbox.tab': 'Found reports',
  'inbox.empty': 'No found reports yet',
  'inbox.emptyDesc': 'When someone scans one of your public drone cards and uses the “Report found drone” button, you will see their message here.',
  'inbox.unread': 'Unread',
  'inbox.read': 'Read',
  'inbox.markRead': 'Mark as read',
  'inbox.viewLocation': 'Open in map',
  'inbox.locationCoords': '{lat}, {lng} (±{accuracy} m)',
  'inbox.fromAnonymous': 'Anonymous finder',
  'inbox.contact': 'Contact',
  'inbox.location': 'Reported location',
  'inbox.message': 'Message',
  'inbox.about': 'About this drone',
  'inbox.openDrone': 'Open drone',
  'inbox.receivedAt': 'Received {date}',


  'support.title': 'Support',
  'support.subtitle': 'Message the DroneTag team for identity changes and anything only an admin can update.',
  'support.nav': 'Support',
  'support.empty': 'No messages yet',
  'support.emptyDesc': 'Write below to open a conversation. Use this for name corrections, phone/email changes, and other locked fields.',
  'support.composer.placeholder': 'Write your message…',
  'support.composer.subjectPlaceholder': 'Subject (optional)',
  'support.send': 'Send',
  'support.sending': 'Sending…',
  'support.closed': 'This conversation is closed. Send a message to reopen it.',
  'support.you': 'You',
  'support.admin': 'Support',
  'support.hint.nameChange': 'Need to change your name or other locked data? Send a message here — an admin will update your account.',
  'support.status.open': 'Open',
  'support.status.closed': 'Closed',

  'admin.nav.support': 'Support',
  'admin.support.title': 'Support inbox',
  'admin.support.subtitle': 'Conversations with users about locked fields and account help.',
  'admin.support.empty': 'No conversations',
  'admin.support.emptyDesc': 'When a user messages support, the thread appears here.',
  'admin.support.openUser': 'Open user profile',
  'admin.support.close': 'Close thread',
  'admin.support.reopen': 'Reopen thread',
  'admin.support.unread': '{count} unread',
  'admin.support.select': 'Select a conversation',
  'admin.support.composer.placeholder': 'Reply as admin…',
  'admin.users.openSupport': 'Open support chat',

  'publicDrone.errorTitle': 'Could not load this drone',
  'publicDrone.errorBody': 'There was a problem retrieving the drone profile. Please check your connection and try again.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M4 — Temporary operator switching (English source; pending ES polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'activeOp.section.title': 'Active operator',
  'activeOp.section.subtitle': 'Temporarily reassign this drone to another operator. The override automatically expires after 24 hours.',
  'activeOp.label.effective': 'Effective right now',
  'activeOp.label.default': 'Default operator',
  'activeOp.label.activeOverride': 'Temporary override',
  'activeOp.label.expiresAt': 'Reverts to default at',
  'activeOp.label.setAt': 'Activated at',
  'activeOp.label.reason': 'Reason',
  'activeOp.countdown.hours': '{hours}h {minutes}m left',
  'activeOp.countdown.minutes': '{minutes}m left',
  'activeOp.countdown.expired': 'Expired — falling back to the default operator',
  'activeOp.cta.switch': 'Switch active operator',
  'activeOp.cta.clearNow': 'Clear temporary operator now',
  'activeOp.cta.confirmAndApply': 'Confirm and activate',
  'activeOp.modal.title': 'Activate temporary operator',
  'activeOp.modal.subtitle': 'Choose the operator that should be in charge of this drone for the next 24 hours.',
  'activeOp.modal.field.operator': 'Operator',
  'activeOp.modal.field.reason': 'Reason (optional)',
  'activeOp.modal.field.reasonHint': 'Helps you and any admin understand why the override was activated.',
  'activeOp.modal.responsibility': 'I confirm that I have verified all operator data, insurance coverage, drone association and legal responsibility before activating this operator.',
  'activeOp.modal.responsibilityRequired': 'You must confirm responsibility before activating the temporary operator.',
  'activeOp.modal.duration': 'The override stays active for 24 hours and then automatically reverts to the default operator.',
  'activeOp.modal.sameAsDefault': 'The selected operator is already the default. Choose a different operator to activate a temporary override.',
  'activeOp.empty.noAlternativeTitle': 'No alternative operator available',
  'activeOp.empty.noAlternativeDesc': 'Add a second operator on the Operators page to enable temporary switching.',
  'activeOp.clear.title': 'Clear temporary operator?',
  'activeOp.clear.message': 'The drone will immediately revert to its default operator and the override audit trail will be removed.',
  'activeOp.banner.activeNow': 'A temporary operator override is currently active.',
  'activeOp.errorBody': 'Could not update the active operator. Please try again.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M5 — Admin / plans / PWA / disclaimers (English source; pending ES polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'legal.platformDisclaimer': 'DroneTag is a private digital identification and document management platform. It does not replace official drone operator registration, pilot certification, insurance obligations, or authority-issued documentation.',
  'legal.notOfficial': 'Not an official government or aviation authority registry.',

  'admin.title': 'Admin',
  'admin.subtitle': 'Operate the platform: users, drones, reports, plans and verification queue.',
  'admin.overview.subtitle': 'Work queue for today: verification, found reports, support and live operator overrides.',
  'admin.overview.attentionTitle': 'Items need your attention',
  'admin.overview.attentionBody': '{count} open items across verification, reports and support.',
  'admin.overview.allClearTitle': 'Nothing urgent',
  'admin.overview.allClearBody': 'No pending verification, unread found reports or support replies waiting.',
  'admin.overview.stat.queue': 'Verification queue',
  'admin.overview.stat.unreadReports': 'Unread found reports',
  'admin.overview.stat.support': 'Support replies due',
  'admin.overview.stat.overrides': 'Active overrides',
  'admin.overview.verify.title': 'Verification breakdown',
  'admin.overview.verify.subtitle': 'Pending / unverified items waiting for an admin decision.',
  'admin.overview.openQueue': 'Open queue',
  'admin.overview.reports.title': 'Unread found-drone reports',
  'admin.overview.reports.subtitle': 'Messages from people who scanned a public profile.',
  'admin.overview.openReports': 'Open inbox',
  'admin.overview.reports.empty': 'No unread reports',
  'admin.overview.reports.emptyDesc': 'New finder messages will appear here.',
  'admin.overview.reports.anonymous': 'Anonymous finder',
  'admin.overview.support.title': 'Support waiting for reply',
  'admin.overview.support.subtitle': 'Open threads with unread messages for admin.',
  'admin.overview.openSupport': 'Open support',
  'admin.overview.support.empty': 'No pending replies',
  'admin.overview.support.emptyDesc': 'User messages that need an admin answer will show here.',
  'admin.overview.overrides.title': 'Active operator overrides',
  'admin.overview.overrides.subtitle': 'Temporary 24h operator switches currently in force.',
  'admin.overview.openDrones': 'Open drones',
  'admin.overview.overrides.empty': 'No active overrides',
  'admin.overview.overrides.emptyDesc': 'Temporary operator assignments will list here while valid.',
  'admin.overview.overrides.until': 'Until {when}',
  'admin.overview.foot.users': 'Accounts',
  'admin.overview.foot.public': 'Public drones',
  'admin.nav.overview': 'Overview',
  'admin.nav.users': 'Users',
  'admin.nav.drones': 'Drones',
  'admin.nav.reports': 'Found drones',
  'admin.nav.verify': 'Verification',
  'admin.nav.plans': 'Plans',
  'admin.nav.legacy': 'Legacy profiles',
  'admin.stats.users': 'Users',
  'admin.stats.drones': 'Drones',
  'admin.stats.publicDrones': 'Public drones',
  'admin.stats.reports': 'Found drones',
  'admin.stats.unreadReports': 'Unread found drones',
  'admin.stats.plans': 'Active plans',
  'admin.stats.activeOverrides': 'Active overrides',
  'admin.stats.legacyProfiles': 'Legacy profiles',

  'admin.users.title': 'Users',
  'admin.users.subtitle': 'View, search and edit any account on the platform.',
  'admin.users.searchPlaceholder': 'Name, email, company, VAT…',
  'admin.users.empty': 'No users yet',
  'admin.users.loadError':
    'Could not load users. Check you are online, have admin permissions (sign out and back in after grant-admin), and that Firestore rules are deployed.',
  'admin.users.create.title': 'New user',
  'admin.users.create.subtitle':
    'Create login credentials and Firestore profile. The user can sign in and manage their documents only.',
  'admin.users.create.tempPassword': 'Temporary password',
  'admin.users.create.submit': 'Create user',
  'admin.users.create.errorEmailInUse': 'An account with this email already exists.',
  'admin.users.create.errorGeneric': 'Could not create the user. Please try again.',
  'admin.users.create.errorAdminSdk':
    'Firebase Admin is not configured locally. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env.local to your service-account JSON file path, then restart npm run dev.',
  'admin.users.create.errorNameRequired': 'First name and last name are required.',
  'admin.users.create.errorInvalidEmail': 'Enter a valid email address.',
  'admin.users.create.errorAuth': 'Admin session expired. Sign out, sign in again, and retry.',
  'admin.users.create.errorNetwork':
    'Network error while creating the user. Check your connection and try again.',
  'admin.users.create.errors.summary':
    '{count} fields need attention before the account can be created.',
  'admin.users.create.errors.email_required': 'Email is required so the user can sign in.',
  'admin.users.create.errors.email_invalid': 'Enter a valid email address (e.g. name@company.it).',
  'admin.users.create.errors.password_required':
    'Temporary password is required (share it with the user securely).',
  'admin.users.create.errors.password_too_short': 'Password must be at least 6 characters.',
  'admin.users.create.errors.firstName_required': 'First name is required.',
  'admin.users.create.errors.lastName_required': 'Last name is required.',
  'admin.users.create.errors.companyName_required':
    'Company name is required for company accounts.',
  'admin.users.create.errors.companyContactPerson_required':
    'Contact person is required for company accounts.',
  'admin.users.col.name': 'Name',
  'admin.users.col.type': 'Type',
  'admin.users.col.email': 'Email',
  'admin.users.col.created': 'Created',
  'admin.users.openProfile': 'Manage account',
  'admin.users.editData': 'Edit details',
  'common.showPassword': 'Show password',
  'common.hidePassword': 'Hide password',
  'admin.users.loginHint.title': 'User sign-in',
  'admin.users.loginHint.body':
    'The user signs in at /login with this email and the temporary password set at creation.',
  'admin.users.publicHint.title': 'Public page (QR / NFC)',
  'admin.users.publicHint.body':
    'The public page is tied to a public drone with a slug. Manage it in the Drones section below.',
  'admin.users.publicHint.none':
    'No public drone yet: create a drone and set visibility to Public.',
  'admin.users.publicProfileUnavailable':
    'No public page yet: add a public drone with a slug.',
  'admin.users.detail.account': 'Account fields',
  'admin.users.detail.pilot': 'Remote pilot identity',
  'admin.users.detail.slots': 'Slots',
  'admin.users.detail.operators': 'Operators',
  'admin.users.detail.drones': 'Drones',
  'admin.users.detail.insurances': 'Insurances',
  'admin.users.detail.certificates': 'Certificates',
  'admin.users.detail.authorizations': 'Authorizations',
  'admin.users.detail.documents': 'Documents',
  'admin.users.backToList': 'Back to users',

  'admin.slots.title': 'Slots & quotas',
  'admin.slots.subtitle': 'Set how many of each slot kind this user is entitled to.',
  'admin.slots.kind.certificate': 'Certificates',
  'admin.slots.kind.drone': 'Drones',
  'admin.slots.kind.operator': 'Operators (max 3)',
  'admin.slots.kind.pdf': 'Document PDFs',
  'admin.slots.kind.permit': 'Authorizations / permits',
  'admin.slots.kind.archive': 'Archive packs (+30 MB)',
  'admin.slots.kind.nfc_badge': 'Physical NFC badges',
  'admin.slots.kind.personalization': 'Personalization (logo / banner)',
  'admin.slots.usage': 'Used: {used}',
  'admin.slots.save': 'Save slot counts',

  'admin.verify.title': 'Verification queue',
  'admin.verify.subtitle': 'Approve or reject pending documents, certificates and policies.',
  'admin.verify.view.queue': 'Queue',
  'admin.verify.view.archive': 'Archive',
  'admin.verify.archive.subtitle': 'Already approved or rejected items. You can send them back to the queue.',
  'admin.verify.archive.empty': 'Archive is empty',
  'admin.verify.archive.emptyDesc': 'Verified or rejected items appear here.',
  'admin.verify.tab.documents': 'Documents',
  'admin.verify.tab.certificates': 'Certificates',
  'admin.verify.tab.insurances': 'Insurances',
  'admin.verify.tab.authorizations': 'Authorizations',
  'admin.verify.tab.drones': 'Drones',
  'admin.verify.markVerified': 'Mark verified',
  'admin.verify.markRejected': 'Mark rejected',
  'admin.verify.markPending': 'Mark pending',
  'admin.verify.empty': 'Nothing to review',
  'admin.verify.emptyDesc': 'New submissions appear here automatically.',

  'admin.drones.title': 'All drones',
  'admin.drones.subtitle': 'Search across every drone, including public, private and archived states.',
  'admin.drones.searchPlaceholder': 'Slug, manufacturer, model, serial, owner email…',
  'admin.drones.col.drone': 'Drone',
  'admin.drones.col.owner': 'Owner',
  'admin.drones.col.status': 'Status',
  'admin.drones.col.override': 'Active override',
  'admin.drones.openInAdmin': 'Open',
  'admin.drones.adminEdit.title': 'Edit drone',
  'admin.drones.adminEdit.subtitle': 'Admin override: any field you change here is written directly to Firestore.',
  'admin.drones.clearOverride': 'Clear override',

  'admin.reports.title': 'Found drones (all users)',
  'admin.reports.subtitle': 'Messages sent by people who scanned a public drone profile.',
  'admin.reports.searchPlaceholder': 'Slug, finder name, email, message…',
  'admin.reports.col.received': 'Received',
  'admin.reports.col.drone': 'Drone',
  'admin.reports.col.finder': 'Finder',
  'admin.reports.col.message': 'Message',
  'admin.reports.col.location': 'Location',
  'admin.reports.col.read': 'Read',

  'admin.plans.title': 'Plans & pricing',
  'admin.plans.subtitle': 'Configure prices for each slot kind. Pricing is read by the marketing page and the user dashboard.',
  'admin.plans.col.label': 'Label',
  'admin.plans.col.kind': 'Slot kind',
  'admin.plans.col.price': 'Price',
  'admin.plans.col.currency': 'Currency',
  'admin.plans.col.active': 'Active',
  'admin.plans.new': 'New plan',
  'admin.plans.create.title': 'Create plan',
  'admin.plans.edit.title': 'Edit plan',
  'admin.plans.delete.title': 'Delete plan?',
  'admin.plans.field.label': 'Display label',
  'admin.plans.field.description': 'Description',
  'admin.plans.field.kind': 'Slot kind',
  'admin.plans.field.priceCents': 'Price (in minor units, e.g. cents)',
  'admin.plans.field.currency': 'Currency',
  'admin.plans.field.active': 'Active',
  'admin.plans.empty': 'No plans configured yet',
  'admin.plans.emptyDesc': 'Create a plan for each slot type your users can purchase.',

  'account.plan.title': 'Plan & slots',
  'account.plan.subtitle': 'Quota included in your account. Contact admin to increase limits.',
  'account.plan.empty': 'Your account uses the base plan.',
  'account.plan.contactAdmin': 'Contact admin',

  'pwa.appName': 'DroneTag',
  'pwa.appShortName': 'DroneTag',
  'pwa.appDescription': 'Digital identification and document management for drone operators.',
  'pwa.install.cta': 'Install app',
  'pwa.install.dismiss': 'Not now',
  'pwa.install.installed': 'DroneTag is installed',

  'billing.title': 'Billing & subscription',
  'billing.subtitle': 'Manage your DroneTag plan and slot entitlements.',
  'billing.comingSoon': 'Coming soon',
  'billing.comingSoonBody': 'Self-service checkout is being prepared. Until then, contact your admin to upgrade slots and plans. Your current quotas are shown below.',
  'billing.subscribe': 'Subscribe',
  'billing.manageProfile': 'Back to profile',
  'account.tab.billing': 'Billing',

  'empty.hints.operator.1': 'Pick personal or company holder type.',
  'empty.hints.operator.2': 'Add contact details for legal reporting.',
  'empty.hints.operator.3': 'Mark one operator as default for new drones.',
  'empty.hints.drone.1': 'Add manufacturer, model and class marking.',
  'empty.hints.drone.2': 'Pick a default operator and link a pilot.',
  'empty.hints.drone.3': 'Set status to active + visibility public to share the QR.',
  'empty.hints.insurance.1': 'Upload the policy PDF — name, number, dates and covered drones are read automatically.',
  'empty.hints.insurance.2': 'Select every drone the policy covers — one insurance can protect the whole fleet.',
  'empty.hints.certificate.1': 'Upload the certificate PDF — type, issuer and dates are read automatically.',
  'empty.hints.certificate.2': 'Review the data and save to see the valid/expired badge.',
  'empty.hints.document.1': 'Upload any supporting PDF (manuals, declarations, \u2026).',
  'empty.hints.document.2': 'Documents are private until you publish them.',
  'empty.hints.inbox.1': 'Reports appear here when a finder scans your QR.',
  'empty.hints.inbox.2': 'Reply directly to the finder by email when you receive one.',

  'pwa.install.success': 'DroneTag installed. Look for the home-screen icon.',
  'pwa.offline.banner': 'You\u2019re offline \u2014 changes will sync when you reconnect.',
  'pwa.online.toast': 'Back online.',
  'pwa.iosHint.title': 'Add DroneTag to your iPhone home screen',
  'pwa.iosHint.body': 'Tap the Share icon in Safari, then choose \u201CAdd to Home Screen\u201D for a one-tap launcher.',

  'error.boundary.title': 'Something went wrong on this screen.',
  'error.boundary.body': 'The DroneTag platform is still up \u2014 only this page failed to load. Try again or go back to your dashboard.',
  'error.boundary.publicBody': 'Try refreshing the page. If the QR keeps failing, the drone may have been temporarily unpublished by its owner.',
  'error.boundary.adminBody': 'Server-side log included below. Copy the digest before retrying so you can correlate against Firebase logs.',
  'error.boundary.retry': 'Try again',
  'error.boundary.goHome': 'Go to dashboard',
  'error.boundary.goPublic': 'Go to home page',
  'error.boundary.diagnostics': 'Diagnostics',
  'error.boundary.digest': 'Error digest',

  'admin.nav.nfc': 'NFC tools',
  'admin.nfc.title': 'NFC / QR tooling',
  'admin.nfc.subtitle': 'Generate the URL payloads encoded onto each badge and export the full batch as CSV for an external NFC writer.',
  'admin.nfc.col.slug': 'Slug',
  'admin.nfc.col.url': 'Public URL',
  'admin.nfc.col.owner': 'Owner',
  'admin.nfc.exportCsv': 'Export CSV',
  'admin.nfc.copyUrl': 'Copy URL',
  'admin.nfc.empty': 'No public-active drones to encode.',

  // ── Commercial pricing ──
  'nav.pricing': 'Pricing',
  'pricing.hero.eyebrow': 'Plans & NFC kit',
  'pricing.hero.title': 'Digital identity for every drone flight',
  'pricing.hero.subtitle': 'Choose an individual or business plan. The NFC kit links certificates and insurance to a scannable public profile.',
  'pricing.hero.kitNotice': 'Important: the NFC kit is mandatory to activate physical badges (except when included in the plan).',
  'pricing.toggle.label': 'Audience',
  'pricing.toggle.individual': 'Individuals',
  'pricing.toggle.business': 'Business',
  'pricing.section.individualTitle': 'Individual plans',
  'pricing.section.individualSubtitle': 'Annual subscription plus the NFC kit required for physical badges.',
  'pricing.section.businessTitle': 'Business plans',
  'pricing.section.businessSubtitle': 'Monthly subscription for teams and fleets. NFC kit priced per operator.',
  'pricing.badge.recommended': 'Recommended',
  'pricing.price.perYear': 'per year',
  'pricing.price.perMonth': 'per month',
  'pricing.price.onRequest': 'Custom quote',
  'pricing.price.custom': 'Tailored to your fleet',
  'pricing.kit.mandatoryLabel': 'NFC kit',
  'pricing.kit.mandatoryPrice': '{amount} — mandatory',
  'pricing.kit.perOperator': '{amount} per operator — mandatory',
  'pricing.kit.included': 'Included in the plan',
  'pricing.kit.onRequest': 'On request',
  'pricing.kit.sectionTitle': 'Mandatory NFC kit',
  'pricing.kit.sectionSubtitle': 'Physical badges are required so certificates and insurance can be verified on site via NFC or QR.',
  'pricing.kit.mandatoryBanner': 'The NFC kit is mandatory',
  'pricing.kit.mandatoryBody': 'Without the kit you can manage documents digitally, but you cannot attach physical badges to aircraft or equipment. Each kit includes two badges.',
  'pricing.kit.item.badge': '1 NFC badge linked to your public DroneTag profile', // TODO: translate
  'pricing.kit.note': 'On Pilot Pro the kit is included in the annual price. On business plans the kit is charged once per operator.',
  'pricing.kit.visual.cert': 'CERT',
  'pricing.kit.visual.ins': 'INS',
  'pricing.plan.free.name': 'Free',
  'pricing.plan.free.audience': 'Get started',
  'pricing.plan.free.cta': 'Activate for free',
  'pricing.plan.free.f1': 'Digital profile and document upload',
  'pricing.plan.free.f2': 'Public QR / NFC page when the kit is activated',
  'pricing.plan.free.f3': 'Admin verification workflow',
  'pricing.plan.pilot.name': 'Pilot',
  'pricing.plan.pilot.audience': 'For individual pilots',
  'pricing.plan.pilot.cta': 'Choose Pilot',
  'pricing.plan.pilot.f1': 'Full credential workspace',
  'pricing.plan.pilot.f2': 'Certificates & insurance management',
  'pricing.plan.pilot.f3': 'Public verified profile',
  'pricing.plan.pilot.f4': 'NFC kit at preferential price',
  'pricing.plan.pilotPro.name': 'Pilot Pro',
  'pricing.plan.pilotPro.audience': 'Best value for active pilots',
  'pricing.plan.pilotPro.cta': 'Choose Pilot Pro',
  'pricing.plan.pilotPro.f1': 'Everything in Pilot',
  'pricing.plan.pilotPro.f2': 'NFC kit included',
  'pricing.plan.pilotPro.f3': 'Priority support path',
  'pricing.plan.pilotPro.f4': 'One annual payment, kit shipped with activation',
  'pricing.plan.team.name': 'Team',
  'pricing.plan.team.audience': 'For small teams',
  'pricing.plan.team.cta': 'Choose Team',
  'pricing.plan.team.f1': 'Multi-operator workspace',
  'pricing.plan.team.f2': 'Shared fleet documents',
  'pricing.plan.team.f3': 'NFC kit per operator',
  'pricing.plan.team.f4': 'Monthly billing',
  'pricing.plan.business.name': 'Business',
  'pricing.plan.business.audience': 'For companies and fleets',
  'pricing.plan.business.cta': 'Choose Business',
  'pricing.plan.business.f1': 'Fleet-scale operators',
  'pricing.plan.business.f2': 'Advanced verification ops',
  'pricing.plan.business.f3': 'Preferential NFC kit price per operator',
  'pricing.plan.business.f4': 'Monthly billing',
  'pricing.plan.enterprise.name': 'Enterprise',
  'pricing.plan.enterprise.audience': 'Custom deployments',
  'pricing.plan.enterprise.cta': 'Contact us',
  'pricing.plan.enterprise.f1': 'Custom limits and onboarding',
  'pricing.plan.enterprise.f2': 'Dedicated support',
  'pricing.plan.enterprise.f3': 'NFC kit on quotation',
  'pricing.card.seeCheckout': 'Continue to checkout',
  'pricing.summary.title': 'What you pay',
  'pricing.summary.subtitle': 'Clear split between subscription and the one-time NFC kit.',
  'pricing.summary.sub.title': 'Subscription',
  'pricing.summary.sub.body': 'Annual for individuals, monthly for business plans. Covers the digital platform.',
  'pricing.summary.kit.title': 'NFC kit',
  'pricing.summary.kit.body': 'Mandatory physical badges (certificates + insurance). Included only on Pilot Pro.',
  'pricing.summary.renew.title': 'Renewal',
  'pricing.summary.renew.body': 'After the first period you renew the subscription only — the kit is a one-time purchase unless you add operators.',
  'pricing.faq.title': 'FAQ',
  'pricing.faq.subtitle': 'Short answers before you activate a plan.',
  'pricing.faq.kit.q': 'Is the NFC kit mandatory?',
  'pricing.faq.kit.a': 'Yes. Every plan requires the kit to ship physical badges, except Pilot Pro where the kit is included in the annual price. Business plans charge the kit once per operator.',
  'pricing.faq.pilotPro.q': 'Why is Pilot Pro recommended?',
  'pricing.faq.pilotPro.a': 'Pilot Pro bundles the annual subscription and the NFC kit in a single payment (139 €), so the initial total equals the subscription.',
  'pricing.faq.team.q': 'How many operators can I add on Team / Business?',
  'pricing.faq.team.a': 'Soft ceilings are configured centrally for checkout safety. Marketing copy keeps “small teams” / “companies and fleets” until commercial limits are finalized.',
  'pricing.faq.payment.q': 'Is online payment live?',
  'pricing.faq.payment.a': 'Card payment is not active yet. Checkout records a request with server-side price calculation and shows “Payment not yet active”.',
  'pricing.faq.change.q': 'Can I change plan later?',
  'pricing.faq.change.a': 'Yes — contact support after activation. Plan changes will be handled by the billing provider once Stripe (or equivalent) is connected.',
  'pricing.ctaFinal.title': 'Ready to activate DroneTag?',
  'pricing.ctaFinal.subtitle': 'Start with Pilot Pro (kit included) or contact us for Enterprise.',
  'pricing.ctaFinal.primary': 'Choose Pilot Pro',
  'pricing.ctaFinal.secondary': 'Contact sales',
  'pricing.ctaFinal.backHome': 'Back to home',
  'pricing.checkout.eyebrow': 'Checkout',
  'pricing.checkout.title': 'Confirm your plan',
  'pricing.checkout.subtitle': 'Amounts are calculated on the server from the official price list. No card data is collected yet.',
  'pricing.checkout.paymentInactive': 'Payment not yet active',
  'pricing.checkout.plan': 'Selected plan',
  'pricing.checkout.changePlan': 'Change plan',
  'pricing.checkout.customerType': 'Customer type',
  'pricing.checkout.private': 'Individual',
  'pricing.checkout.company': 'Company',
  'pricing.checkout.operators': 'Operators',
  'pricing.checkout.kits': 'NFC badges',  // TODO: translate
  'pricing.checkout.kitsHint': 'One NFC badge per remote pilot. Applied to a drone, the badge opens that drone’s public DroneTag page.',
  'pricing.checkout.billing': 'Billing details',
  'pricing.checkout.fullName': 'Full name',
  'pricing.checkout.email': 'Email',
  'pricing.checkout.companyName': 'Company name',
  'pricing.checkout.vat': 'VAT / tax ID',
  'pricing.checkout.address': 'Address',
  'pricing.checkout.city': 'City',
  'pricing.checkout.postalCode': 'Postal code',
  'pricing.checkout.country': 'Country',
  'pricing.checkout.terms': 'I accept the terms of service and privacy policy for this commercial request.',
  'pricing.checkout.summary': 'Cost summary',
  'pricing.checkout.line.subscription': 'Subscription',
  'pricing.checkout.line.kit': 'NFC kit',
  'pricing.checkout.line.operators': 'Operators',
  'pricing.checkout.line.initial': 'Initial total',
  'pricing.checkout.line.recurring': 'Next renewal',
  'pricing.checkout.summaryNote': 'Initial total = first subscription period + NFC kit (if not included). Renewal is subscription only.',
  'pricing.checkout.quoteOnly': 'Enterprise is quote-based. Submit the form and our team will contact you.',
  'pricing.checkout.submit': 'Submit request',
  'pricing.checkout.submitQuote': 'Request a quote',
  'pricing.checkout.backPricing': 'Back to pricing',
  'pricing.checkout.requestId': 'Request ID',
  'pricing.checkout.success.title': 'Request received',
  'pricing.checkout.success.body': 'We saved your commercial request. Online payment will be enabled in a later release.',
  'pricing.checkout.error.generic': 'Something went wrong. Please try again.',
  'pricing.checkout.error.terms_required': 'Please accept the terms.',
  'pricing.checkout.error.billing_incomplete': 'Please complete billing details.',
  'pricing.checkout.error.company_required': 'Company name is required.',
  'pricing.checkout.error.unknown_plan': 'Unknown plan.',
  'pricing.checkout.error.customer_type_mismatch': 'Customer type does not match this plan.',
  'pricing.checkout.error.invalid_operatorCount': 'Invalid operator count.',
  'pricing.checkout.error.invalid_kitQuantity': 'Invalid kit quantity.',
  'login.forgotPassword': 'Forgot your password?', // TODO: translate
  'forgot.title': 'Reset your password', // TODO: translate
  'forgot.subtitle': 'Enter the email address linked to your DroneTag account and we will send you a reset link.', // TODO: translate
  'forgot.email': 'Email address', // TODO: translate
  'forgot.submit': 'Send reset link', // TODO: translate
  'forgot.sending': 'Sending…', // TODO: translate
  'forgot.backToLogin': 'Back to sign in', // TODO: translate
  'forgot.sent.title': 'Check your inbox', // TODO: translate
  'forgot.sent.body': 'If an account exists for that address, a password reset link is on its way. The link expires after a short time.', // TODO: translate
  'forgot.sent.resend': 'Send again', // TODO: translate
  'forgot.error.generic': 'We could not process the request right now. Please try again shortly.', // TODO: translate
  'forgot.error.invalidEmail': 'Enter a valid email address.', // TODO: translate
  'links.nfcEncodeLabel': 'Write this URL to the badge', // TODO: translate
  'links.nfcInstructions': 'Use any NFC writer app (for example NFC Tools on Android or iOS) and write the URL above as an NDEF URI record. Tapping the badge with a smartphone will then open this public profile.', // TODO: translate
  'links.nfcNotReady': 'Publish this profile and assign it a slug to generate the URL the badge should contain.', // TODO: translate
  'common.dismiss': 'Dismiss', // TODO: translate
  'admin.verify.notifyWarning': 'The decision was saved, but the user could not be emailed ({reason}). They can still see the update in their support thread.', // TODO: translate
  'support.newTicket': 'New request', // TODO: translate
  'support.subject': 'Subject', // TODO: translate
  'support.subjectPlaceholder': 'What do you need help with?', // TODO: translate
  'support.message': 'Message', // TODO: translate
  'support.messagePlaceholder': 'Describe your request…', // TODO: translate
  'support.reply': 'Reply', // TODO: translate
  'support.emptyHint': 'Open a request and the DroneTag team will get back to you here.', // TODO: translate
  'support.status.pending': 'Reply received', // TODO: translate
  'support.close': 'Close request', // TODO: translate
  'support.reopen': 'Reopen', // TODO: translate
  'support.team': 'DroneTag Support', // TODO: translate
  'support.error.send': 'Could not send your message. Please try again.', // TODO: translate
  'support.error.load': 'Could not load your support conversation.', // TODO: translate
  'onboarding.title': 'Complete your DroneTag profile', // TODO: translate
  'onboarding.subtitle': 'A few steps to get your drone identifiable and your badge ready.', // TODO: translate
  'onboarding.progress': '{done} of {total}', // TODO: translate
  'onboarding.step.profile': 'Your profile', // TODO: translate
  'onboarding.step.profile.hint': 'Add your name so your public profile can identify you.', // TODO: translate
  'onboarding.step.operator': 'UAS operator', // TODO: translate
  'onboarding.step.operator.hint': 'Register the person or organisation responsible for the operation.', // TODO: translate
  'onboarding.step.drone': 'Your drone', // TODO: translate
  'onboarding.step.drone.hint': 'Add the aircraft you want to identify.', // TODO: translate
  'onboarding.step.certificate': 'Pilot certificate', // TODO: translate
  'onboarding.step.certificate.hint': 'Upload your remote pilot certificate for verification.', // TODO: translate
  'onboarding.step.insurance': 'Insurance', // TODO: translate
  'onboarding.step.insurance.hint': 'Upload your policy so its validity can be shown publicly.', // TODO: translate
  'onboarding.step.public': 'Public profile', // TODO: translate
  'onboarding.step.public.hint': 'Publish a drone to get its public DroneTag page.', // TODO: translate
  'onboarding.step.badge': 'NFC badge', // TODO: translate
  'onboarding.step.badge.hint': 'Get the public link to write onto your badge.', // TODO: translate
  'legal.draft.badge': 'Draft', // TODO: translate
  'legal.draft.bannerTitle': 'Draft text — not reviewed by a lawyer', // TODO: translate
  'legal.draft.bannerBody': 'This page is a working draft written by the DroneTag team so that the structure of the document can be reviewed. It is not in force, it is not legal advice, and it creates no rights or obligations for you or for us. A qualified lawyer must review and replace this text before DroneTag opens to real users.', // TODO: translate
  'legal.draft.lastUpdated': 'Draft last edited on {date}. No version of this document is in force yet.', // TODO: translate
  'legal.contact.title': 'Who to contact', // TODO: translate
  'legal.contact.body': 'Questions about this draft, or about the data DroneTag holds about you, can be sent to info@drone-tag.com. The final document will name the company that operates the service, its registered address, and a specific contact for data requests. None of that is settled yet, so it is left out rather than invented.', // TODO: translate
  'legal.related.title': 'Other draft documents', // TODO: translate
  'home.footer.cookies': 'Cookies', // TODO: translate
  'legal.privacy.title': 'Privacy notice', // TODO: translate
  'legal.privacy.subtitle': 'What DroneTag stores about you, what a stranger sees when they tap your NFC badge, and what stays private.', // TODO: translate
  'legal.privacy.who.title': 'Who runs this service', // TODO: translate
  'legal.privacy.who.body': 'This section will identify the legal entity that operates DroneTag and decides how your data is used, its registered address, and the person to contact about data. That entity has not been fixed yet, so nothing is stated here. Technically, the service runs on Google Firebase for authentication, database and file storage, and is deployed on Netlify.', // TODO: translate
  'legal.privacy.collect.title': 'What data DroneTag collects', // TODO: translate
  'legal.privacy.collect.body': 'The account itself holds an email address, a phone number, a name or company name, a postal address, and for private accounts a date of birth. The pilot record adds nationality, an operator code, a licence number and an emergency contact. Operator records repeat name or company name, address, email and, for companies, a VAT or registry number. Drone records hold manufacturer, model, EU class marking, the serial engraved on the aircraft and the controller serial. Uploaded files — insurance policies, certificates, permits and identity documents — are stored as you provide them, so they contain whatever those documents contain.', // TODO: translate
  'legal.privacy.why.title': 'Why it is collected', // TODO: translate
  'legal.privacy.why.body': 'Account and contact data is used to sign you in, to notify you, and to answer support requests. Pilot, operator, drone and document data exists so you can keep your own compliance paperwork in one place and, if you choose, show a verifiable summary of it to a third party. Payment and order data exists to ship NFC badges and process plan purchases. The final version of this section will have to state a lawful basis for each purpose; that is a question for a lawyer, and no basis is asserted here.', // TODO: translate
  'legal.privacy.public.title': 'What is visible on your public page', // TODO: translate
  'legal.privacy.public.body': 'A published drone gets a page at /u/ followed by its slug, and anyone with the link or the badge can open it without signing in. That page reads a single sanitised record and shows only the holder name (your pilot name, your name as a private operator, or your company name), manufacturer, model, EU class marking, the engraved drone serial, the insurance status and insurer, the policy expiry date, a masked policy number that keeps only the first and last three characters, the verification badge with its date, and any profile photo, logo or banner you uploaded as branding.', // TODO: translate
  'legal.privacy.notPublic.title': 'What is deliberately not published', // TODO: translate
  'legal.privacy.notPublic.body': 'The public record does not contain the insurance PDF, your postal address, your email address, your phone number, your date of birth, your VAT or registry number, the controller serial, your emergency contact, internal notes, or the account identifier that would link the page back to you. This is enforced in code rather than by convention: the public page reads only the sanitised snapshot, and the fields above are never written into it. The one internal identifier that is present is the drone record id, used to keep the snapshot aligned with the private record.', // TODO: translate
  'legal.privacy.sharing.title': 'Who else can see it', // TODO: translate
  'legal.privacy.sharing.body': 'DroneTag does not sell your data. It is processed by the suppliers the application actually depends on: Google Firebase hosts authentication, the database and uploaded files; Netlify hosts and serves the application and keeps request logs; Resend delivers transactional email such as sign-up codes and notifications. DroneTag staff with an administrator account can read your records in order to review documents and answer support requests. The final version will have to list each supplier, where it processes data, and the contract in place with it.', // TODO: translate
  'legal.privacy.retention.title': 'How long it is kept', // TODO: translate
  'legal.privacy.retention.body': 'There is no automatic deletion today. Records and uploaded files stay until you delete them or ask DroneTag to delete them, and reports filed by someone who found your drone stay in your inbox until removed. Setting real retention periods — in particular for insurance and certificate documents, which may need to be kept for a period after they expire — is an open question for a lawyer and is not answered here.', // TODO: translate
  'legal.privacy.requests.title': 'Asking to see, correct or delete your data', // TODO: translate
  'legal.privacy.requests.body': 'You can edit most of your own data from the account area, although some identity fields are locked once confirmed so that a published profile cannot be quietly rewritten. For anything you cannot change yourself, including deleting your account, write to info@drone-tag.com and the request is handled manually. There is no self-service export and no automated deletion yet. This notice makes no claim about which statutory rights apply to you; that has to be established by a lawyer.', // TODO: translate
  'legal.privacy.security.title': 'How the data is protected', // TODO: translate
  'legal.privacy.security.body': 'Private records are readable only by their owner and by DroneTag administrators, enforced by Firebase security rules rather than by the application alone. Uploaded documents live in a private storage namespace that is not readable without authentication, kept separate from the small public namespace that holds only branding images. Server logs pass through a filter that replaces values such as email addresses, phone numbers and policy numbers before anything is written out. No system is immune to compromise, so this is a description of the current design and not a guarantee.', // TODO: translate
  'legal.privacy.changes.title': 'Changes to this draft', // TODO: translate
  'legal.privacy.changes.body': 'This draft will change as the product and its legal review progress. When a reviewed version replaces it, the draft banner at the top of this page will be removed and a real effective date will appear in its place.', // TODO: translate
  'pricing.kit.visual.badge': 'DRONETAG', // TODO: translate
  'legal.terms.title': 'Terms of service', // TODO: translate
  'legal.terms.subtitle': 'The rules that will govern the use of DroneTag, drafted so that they can be reviewed. Nothing below is binding yet.', // TODO: translate
  'legal.terms.what.title': 'What DroneTag is, and what it is not', // TODO: translate
  'legal.terms.what.body': 'DroneTag is a private platform for storing your drone paperwork and, if you choose, publishing a short summary of it at a public address reachable from an NFC badge or a QR code. It is not an aviation authority, it is not a public register, and it does not issue, validate or renew any official document. A profile on DroneTag does not replace registration with a competent authority, a pilot certificate, an insurance policy, or any authorisation you need in order to fly.', // TODO: translate
  'legal.terms.eligibility.title': 'Who can open an account', // TODO: translate
  'legal.terms.eligibility.body': 'The final version will state a minimum age and whether an account may be opened on behalf of a company by an authorised person. Today the sign-up form asks for a first and last name, an email address, a phone number and a password, or you can sign up with a Google account; the email address or the phone number is then confirmed with a one-time code. There is no age check.', // TODO: translate
  'legal.terms.account.title': 'Your account and your credentials', // TODO: translate
  'legal.terms.account.body': 'You are responsible for keeping access to your account secure and for what is done through it. Write to info@drone-tag.com if you believe someone else has access. DroneTag administrators can read the records in your account in order to review the documents you submit for verification and to answer support requests.', // TODO: translate
  'legal.terms.content.title': 'The documents and data you upload', // TODO: translate
  'legal.terms.content.body': 'You keep ownership of everything you upload. You grant DroneTag only what is needed to run the service: storing your files, showing them back to you, letting an administrator review them, and publishing the short summary described in the privacy notice when you choose to publish a drone. You are responsible for the accuracy of what you enter and for having the right to upload it, in particular for documents that name someone other than you.', // TODO: translate
  'legal.terms.publication.title': 'Publishing a drone profile', // TODO: translate
  'legal.terms.publication.body': 'Publication is your decision and is made one drone at a time. Once published, the page can be read by anyone who has the address; it is not behind a login and there is no visitor log. Unpublishing removes the public record so the address stops resolving, but DroneTag cannot recall pages that have already been saved, cached or shared by someone else. The final version will need to say how quickly unpublishing takes effect.', // TODO: translate
  'legal.terms.verification.title': 'What the verification badge means', // TODO: translate
  'legal.terms.verification.body': 'A verified badge means a DroneTag administrator looked at the documents in the account and considered them consistent. It is not an endorsement by an authority, it does not say that the flight you are about to make is lawful, and it does not guarantee that the insurance policy will pay a claim. Anyone relying on a DroneTag page should treat it as a starting point and ask for the original documents when it matters.', // TODO: translate
  'legal.terms.plans.title': 'Plans, badges and payment', // TODO: translate
  'legal.terms.plans.body': 'Every account includes a small allowance of drones, operators, certificates and documents, and larger allowances can be bought. NFC badges are physical goods that are manufactured and shipped. Prices, billing periods, renewal, refunds and shipping terms are not settled and are deliberately not stated here: the pricing page shows the prices currently intended, not a contractual offer.', // TODO: translate
  'legal.terms.availability.title': 'Availability during pre-beta', // TODO: translate
  'legal.terms.availability.body': 'DroneTag is not finished. Features can change or be removed, data can be migrated, and the service can be unavailable without notice. Do not use DroneTag as the only copy of a document you need — keep your originals. No availability commitment is offered at this stage.', // TODO: translate
  'legal.terms.suspension.title': 'Suspension and closing an account', // TODO: translate
  'legal.terms.suspension.body': 'The final version will describe when DroneTag may suspend or close an account, for example for uploading someone else\'s documents or misrepresenting a verification status, and what notice is given. Today you can ask for your account to be closed by writing to info@drone-tag.com; the request is handled by hand and there is no automated deletion.', // TODO: translate
  'legal.terms.liability.title': 'Liability', // TODO: translate
  'legal.terms.liability.body': 'This is the section that most needs a lawyer, so no wording is proposed for it. It will have to set out what DroneTag is responsible for, what it is not responsible for, and what happens if a public page shows outdated or incorrect information. Nothing on this page limits any liability today, because nothing on this page is in force.', // TODO: translate
  'legal.terms.law.title': 'Governing law and disputes', // TODO: translate
  'legal.terms.law.body': 'The applicable law and the competent court depend on where the operating company is established and where its users are, and neither is fixed. A lawyer will have to complete this section. No jurisdiction is stated here.', // TODO: translate
  'legal.terms.changes.title': 'Changes to these draft terms', // TODO: translate
  'legal.terms.changes.body': 'This draft will change without notice while the product is being built. When a reviewed version replaces it, the draft banner will be removed, a real effective date will appear, and the final version will describe how future changes are announced.', // TODO: translate
  'legal.cookies.title': 'Cookie and browser storage notice', // TODO: translate
  'legal.cookies.subtitle': 'What DroneTag stores in your browser today, why it is stored, and what is not stored.', // TODO: translate
  'legal.cookies.scope.title': 'What this page covers', // TODO: translate
  'legal.cookies.scope.body': 'Cookies are only part of the picture. DroneTag also uses the browser\'s local storage, and the Firebase authentication library keeps its own sign-in state in the browser. This page describes all of them together, because from your point of view they are the same thing: data this site leaves on your device.', // TODO: translate
  'legal.cookies.essential.title': 'Cookies that are set', // TODO: translate
  'legal.cookies.essential.body': 'Two cookies are used, both for signing in and both limited to this site. One is set by the server once your sign-in token has been verified, cannot be read by scripts in the page, and expires after one hour. The other is set by the page itself so that the same token is available to the code that guards the administration area, and expires after fifty-five minutes. Both are cleared when you sign out. No advertising or tracking cookie is set.', // TODO: translate
  'legal.cookies.storage.title': 'What is kept in browser storage', // TODO: translate
  'legal.cookies.storage.body': 'Your theme choice and your language choice are saved in local storage under the names dronetag-theme and dronetag-language, so that the next visit does not briefly show the wrong colours or the wrong language. The Firebase authentication library also keeps its own sign-in state in the browser, which is what lets you stay signed in between visits. Clearing site data removes all of it and signs you out.', // TODO: translate
  'legal.cookies.analytics.title': 'Usage analytics', // TODO: translate
  'legal.cookies.analytics.body': 'No analytics or advertising provider is connected. The application contains an internal event layer with a short, closed list of events, and in its current state that layer only writes to the browser console during development. If a provider is added later, this page and the privacy notice will have to be updated before it is switched on.', // TODO: translate
  'legal.cookies.thirdParty.title': 'Storage set by other services', // TODO: translate
  'legal.cookies.thirdParty.body': 'Signing in with Google opens a flow operated by Google, which may set its own cookies on its own domains during that step; those are governed by Google\'s terms rather than by this page. The application is served through Netlify, which records ordinary request logs. The final version of this page will have to list any other third-party component that reaches the browser.', // TODO: translate
  'legal.cookies.consent.title': 'Consent', // TODO: translate
  'legal.cookies.consent.body': 'There is no cookie banner and no consent mechanism in the product today. Whether one is required, and for which of the items above, is a question for a lawyer. This page does not claim that the current behaviour is sufficient; it describes it so that the decision can be made on accurate facts.', // TODO: translate
  'legal.cookies.control.title': 'How to remove them', // TODO: translate
  'legal.cookies.control.body': 'Signing out clears the two sign-in cookies. Clearing site data for this domain in your browser settings removes everything listed above, including your saved theme and language. Blocking cookies entirely will prevent signing in, because the sign-in token would have nowhere to live.', // TODO: translate
  'legal.cookies.changes.title': 'Changes to this draft', // TODO: translate
  'legal.cookies.changes.body': 'This list reflects what the application does at the date shown above, and it will be re-checked against the code whenever that changes. When a reviewed version replaces this draft, the banner at the top will be removed.', // TODO: translate
  'nav.preview': 'Preview', // TODO: translate
  'account.nav.section.fleet': 'Fleet', // TODO: translate
  'account.nav.section.compliance': 'Compliance', // TODO: translate
  'consent.title': 'Make this profile public?', // TODO: translate
  'consent.description': 'Anyone with the link will be able to see it, without signing in.', // TODO: translate
  'consent.warning': 'A public DroneTag profile is readable by anyone who scans the badge or opens the link. It is not indexed as a private page and requires no login.', // TODO: translate
  'consent.urlLabel': 'Public address', // TODO: translate
  'consent.sharedTitle': 'What will be visible', // TODO: translate
  'consent.withheldTitle': 'What stays private', // TODO: translate
  'consent.shared.name': 'Your name, or your operator or company name', // TODO: translate
  'consent.shared.drone': 'Drone manufacturer, model and class marking', // TODO: translate
  'consent.shared.serial': 'The drone serial number engraved on the aircraft', // TODO: translate
  'consent.shared.certStatus': 'Whether your pilot certificate is valid', // TODO: translate
  'consent.shared.insuranceStatus': 'Whether your insurance is valid, and its status', // TODO: translate
  'consent.shared.insuranceProvider': 'The name of your insurance provider', // TODO: translate
  'consent.shared.insuranceExpiry': 'The insurance expiry date', // TODO: translate
  'consent.shared.maskedPolicy': 'A masked policy number, showing only the first and last characters', // TODO: translate
  'consent.shared.verification': 'The DroneTag verification status of the profile', // TODO: translate
  'consent.withheld.policyPdf': 'The insurance policy document itself', // TODO: translate
  'consent.withheld.address': 'Your home or registered address', // TODO: translate
  'consent.withheld.email': 'Your email address', // TODO: translate
  'consent.withheld.phone': 'Your phone number', // TODO: translate
  'consent.withheld.fullPolicy': 'The full, unmasked policy number', // TODO: translate
  'consent.withheld.ids': 'Account identifiers and internal record ids', // TODO: translate
  'consent.checkbox': 'I understand this profile will be publicly visible, and I want to publish it.', // TODO: translate
  'consent.confirm': 'Publish profile', // TODO: translate
  'consent.revocable': 'You can make the profile private again at any time. Once it is unpublished the public page stops working, though anyone who already opened it may still have a copy.', // TODO: translate
  'form.created': 'Profile created', // TODO: translate
  'links.copiedToast': 'Public link copied to clipboard', // TODO: translate
  'links.copyFailed': 'Could not copy the link. Select and copy it manually.', // TODO: translate
  'support.sent': 'Message sent to DroneTag support', // TODO: translate
  'signup.terms.prefix': 'I have read and accept the', // TODO: translate
  'signup.terms.termsLink': 'Terms of service', // TODO: translate
  'signup.terms.and': 'and the', // TODO: translate
  'signup.terms.privacyLink': 'Privacy notice', // TODO: translate
  'signup.terms.required': 'Accept the Terms and Privacy notice to continue.', // TODO: translate
  'signup.terms.googleHint': 'Accept the Terms and Privacy notice above before signing up with Google.', // TODO: translate
  'account.delete.title': 'Request account deletion', // TODO: translate
  'account.delete.body': 'Deletion is not automatic. Opening a support request records your wish to close the account. A DroneTag administrator will process it manually. Your public profiles stay visible until that happens.', // TODO: translate
  'account.delete.cta': 'Open a deletion request', // TODO: translate
  'drone.publish': 'Publish profile', // TODO: translate
  'drone.unpublish': 'Unpublish', // TODO: translate
  'drone.publish.success': 'Public profile is now live.', // TODO: translate
  'drone.unpublish.success': 'Public profile has been unpublished.', // TODO: translate
  'toast.certificate.created': 'Certificate added.', // TODO: translate
  'toast.certificate.deleted': 'Certificate deleted.', // TODO: translate
  'toast.certificate.deleteFailed': 'Could not delete the certificate. Please try again.', // TODO: translate
  'toast.insurance.created': 'Insurance policy added.', // TODO: translate
  'toast.insurance.deleted': 'Insurance policy deleted.', // TODO: translate
  'toast.insurance.deleteFailed': 'Could not delete the policy. Please try again.', // TODO: translate
  'toast.document.created': 'Document uploaded.', // TODO: translate
  'toast.document.updated': 'Document updated.', // TODO: translate
  'toast.document.deleted': 'Document deleted.', // TODO: translate
  'toast.document.deleteFailed': 'Could not delete the document. Please try again.', // TODO: translate
  'toast.permit.created': 'Authorisation added.', // TODO: translate
  'toast.permit.updated': 'Authorisation updated.', // TODO: translate
  'toast.permit.deleted': 'Authorisation deleted.', // TODO: translate
  'toast.permit.deleteFailed': 'Could not delete the authorisation. Please try again.', // TODO: translate
  'toast.operator.created': 'UAS operator added.', // TODO: translate
  'toast.operator.updated': 'UAS operator updated.', // TODO: translate
  'toast.operator.deleted': 'UAS operator deleted.', // TODO: translate
  'toast.operator.deleteFailed': 'Could not delete the UAS operator. Please try again.', // TODO: translate
  'toast.operator.setCurrent': 'Default UAS operator updated.', // TODO: translate
  'toast.drone.created': 'Drone added.', // TODO: translate
  'toast.drone.saved': 'Drone details saved.', // TODO: translate
  'toast.drone.deleted': 'Drone deleted.', // TODO: translate
  'toast.drone.deleteFailed': 'Could not delete the drone. Please try again.', // TODO: translate
  'toast.archive.deleted': 'Item permanently deleted.', // TODO: translate
  'toast.archive.deleteFailed': 'Could not delete the item. Please try again.', // TODO: translate
  'toast.verify.approved': 'Marked as verified.', // TODO: translate
  'toast.verify.rejected': 'Marked as rejected.', // TODO: translate
  'toast.verify.reset': 'Moved back to the review queue.', // TODO: translate
  'toast.verify.failed': 'Could not save the decision. Please try again.', // TODO: translate
  'admin.users.detail.pilotOperatorNote': 'The two operator fields below identify the UAS operator, not the remote pilot. They are still stored on the pilot record pending a schema change.', // TODO: translate
};
