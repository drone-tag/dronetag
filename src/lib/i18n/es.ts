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
  'nav.inboxBell': 'Avisos de hallazgo',
  'nav.inboxBell.unread': 'Avisos de hallazgo ({count} sin leer)',
  'nav.inboxBell.admin': 'Drones y avisos de hallazgo',

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
  'login.adminProvisioned': 'Las cuentas las crea un administrador. Si necesitas credenciales, contáctanos.',

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
  'signup.otp.subtitle': 'Te hemos enviado un código de confirmación. Puedes verificar ahora o más tarde.',
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
  'account.nav.home': 'Inicio',
  'account.nav.more': 'Más',
  'account.nav.mobile': 'Navegación de la cuenta',
  'account.nav.sidebar': 'Menú de la cuenta',
  'account.nav.section.workspace': 'Área de trabajo',
  'account.nav.section.library': 'Biblioteca',
  'account.nav.section.account': 'Cuenta',
  'account.tab.settings': 'Ajustes',
  'settings.title': 'Ajustes',
  'settings.subtitle': 'Gestiona la apariencia, el idioma y las preferencias de la cuenta.',
  'settings.appearance': 'Apariencia',
  'settings.theme': 'Tema',
  'settings.theme.hint': 'Elige claro, oscuro o el tema de tu dispositivo.',
  'settings.theme.light': 'Claro',
  'settings.theme.dark': 'Oscuro',
  'settings.theme.system': 'Sistema',
  'settings.language': 'Idioma',
  'settings.language.hint': 'El idioma de la interfaz se guarda en este dispositivo.',
  'settings.account': 'Cuenta',
  'settings.profile': 'Perfil e imagen de marca',
  'settings.profile.hint': 'Foto, logotipo y banner públicos',
  'settings.billing': 'Facturación',
  'settings.billing.hint': 'Plan y datos de pago',
  'settings.demo.persona': 'Perfiles demo',
  'settings.demo.persona.hint': 'Cambia de identidad para explorar escenarios de administrador y de usuario.',
  'demo.banner': 'Modo demo — datos de ejemplo, Firebase no conectado',
  'demo.resetData': 'Restablecer datos demo iniciales',
  'demo.scenarios.title': 'Escenarios demo para el cliente',
  'demo.scenarios.subtitle': 'Abre la página pública QR y luego cambia los datos como Admin — recarga la pestaña pública para ver las insignias actualizadas.',
  'demo.scenarios.openPublic': 'Abrir perfil público',
  'demo.scenarios.verifyPath': 'Aprueba aquí:',
  'demo.scenario.green.title': 'Todo en verde — Michele',
  'demo.scenario.green.badges': 'Usuario verificado · Certificados OK · Seguro activo',
  'demo.scenario.green.steps': 'Perfil «OK · Michele». Muestra /u/sj58afq8 como ficha pública real (foto, logotipo, banner).',
  'demo.scenario.review.title': 'En revisión — Anna (SkyMap)',
  'demo.scenario.review.badges': 'Certificados pendientes · Seguro por vencer',
  'demo.scenario.review.steps': 'Abre /u/citymapper-anna (usuario y certificados en naranja; seguro por vencer). Admin → Verificación → Cola: Certificados + Seguros (abre el PDF demo) → Marcar como verificado (en la demo, el seguro se renueva +1 año). Documentos y Drones pueden quedarse en cola si quieres mostrar también esas pestañas. Recarga /u/citymapper-anna → usuario/certificados en verde + póliza activa.',
  'demo.scenario.critical.title': 'Crítico — Carlos',
  'demo.scenario.critical.badges': 'Certificados OK · Seguro vencido',
  'demo.scenario.critical.steps': 'Muestra /u/vistaone-carlos (seguro en rojo). La bandeja de entrada tiene avisos de hallazgo sin leer.',
  'demo.scenario.fleet.title': 'Flota / cambio temporal — Alpine',
  'demo.scenario.fleet.badges': 'Operador de empresa · póliza multidron',
  'demo.scenario.fleet.steps': 'Perfil Alpine. Página pública /u/alpine-mavic. En Admin → Drones se ven los cambios temporales de operador.',
  'admin.verify.demoHint':
    'Certificates badge on the public page = certificate verification here. Insurance colour = expiry date (marking verified in demo also renews the policy +1 year so the badge goes green). Demo changes are saved in the browser — refresh the public page after verifying.',

  'account.dashboard.greeting': 'Hola, {name}',
  'account.dashboard.subtitle': 'Tus credenciales UAS de un vistazo.',
  'account.dashboard.credentialsStatus': 'Estado de las credenciales',
  'account.dashboard.completeness': 'Perfil completado al {pct}%',
  'account.dashboard.quickActions': 'Acciones rápidas',
  'account.dashboard.actionPublic': 'Perfil público',
  'account.dashboard.actionPublicDesc': 'Consulta o comparte tu página QR',
  'account.dashboard.actionDocument': 'Añadir documento',
  'account.dashboard.actionDocumentDesc': 'Sube un PDF o un archivo',
  'account.dashboard.actionBadge': 'Pedir insignia',
  'account.dashboard.actionBadgeDesc': 'Insignia NFC o kit físico',
  'account.dashboard.actionDrone': 'Registrar dron',
  'account.dashboard.actionDroneDesc': 'Añade una nueva aeronave',
  'account.dashboard.seeAll': 'Ver todo',
  'account.dashboard.expiryAlerts': 'Vencen en los próximos 30 días',
  'account.dashboard.expiryInDays': 'Quedan {days} d',
  'account.dashboard.expiryExpired': 'Vencido',
  'account.dashboard.verifyAlerts': 'Pendiente de revisión del admin',
  'account.dashboard.verifyWaiting': 'En revisión',
  'account.dashboard.verifyRejected': 'Rechazado — contacta con soporte',
  'account.dashboard.verifyHint': 'Estos elementos están pendientes de revisión por un administrador. Te avisaremos en Soporte cuando cambie su estado.',
  'account.verification.uploadHint': 'Si confirmas los datos leídos del documento sin modificarlos, la verificación es inmediata. Si los corriges, un administrador los compara con el documento y te avisa del resultado.',
  'account.verification.documentUploadHint': 'Tras la subida, un administrador revisa el documento y te avisa del resultado.',
  'account.verification.notifyVerified': 'Hemos verificado {kind}: {label}. Tu perfil público está actualizado.',
  'account.verification.notifyRejected': 'No hemos podido verificar {kind}: {label}. Abre Soporte o sube un documento corregido.',
  'account.verification.kind.certificate': 'el certificado',
  'account.verification.kind.insurance': 'el seguro',
  'account.verification.kind.document': 'el documento',
  'account.verification.kind.drone': 'el dron',
  'account.verification.kind.authorization': 'la autorización',
  'account.verification.threadSubject': 'Novedades sobre la verificación de documentos',
  'nav.menuOpen': 'Abrir menú',
  'nav.menuClose': 'Cerrar menú',
  'account.tabProfile': 'Perfil',
  'account.tabOrders': 'Pedidos',
  'account.personalInfo': 'Información personal',
  'account.shippingAddress': 'Dirección de envío',
  'account.readOnly': 'Solo lectura',
  'account.noAddress': 'Aún no hay dirección guardada.',
  'account.editNotice': 'La edición del perfil estará disponible próximamente. Para cambios, contacta con soporte.',
  'account.memberSince': 'Miembro desde {date}',
  'account.notProvisioned.title': 'No hemos podido preparar tu cuenta',
  'account.notProvisioned.body': 'Se ha producido un problema al activar tu perfil. Comprueba tu conexión y vuelve a intentarlo; si continúa, contacta con el soporte de DroneTag.',

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
  'field.operatorCode': 'Número de registro de operador UAS',
  'field.email': 'Correo electr\u00f3nico',
  'field.phone': 'Tel\u00e9fono',
  'field.emergencyContact': 'Contacto de emergencia',
  'field.photo': 'Foto de perfil',
  'field.visibility': 'Visibilidad',
  'field.birthDate': 'Fecha de nacimiento',
  'field.nationality': 'Nacionalidad',
  'field.operatorLicense': 'Licencia de operador UAS',
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
  'links.nfcDesc': 'La insignia NFC contiene el enlace público de DroneTag de este perfil. Al acercar un móvil, se abre la página de abajo, sin necesidad de ninguna app.',  // TODO: translate

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
  'home.preview.operatorRole': 'Piloto a distancia · AeroFly Srl',
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
  'public.poweredBy': 'Con la tecnología de DroneTag',

  // ═══════════════════════════════════════════════════════════════════════════
  // M2 — User dashboard (English-source strings; pending ES polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'account.tab.operators': 'Operadores',
  'account.tab.drones': 'Drones',
  'account.tab.insurances': 'Seguros',
  'account.tab.certificates': 'Certificados',
  'account.tab.documents': 'Documentos',
  'account.tab.permits': 'Permisos',
  'account.tab.archive': 'Archivo',

  'account.section.accountType': 'Tipo de cuenta',
  'account.accountType.private': 'Particular',
  'account.accountType.company': 'Empresa',
  'account.section.privateInfo': 'Información personal',
  'account.section.companyInfo': 'Información de la empresa',
  'account.section.address': 'Dirección',
  'account.section.media': 'Imágenes del perfil público',
  'account.mediaHint': 'La foto, el logotipo y el banner aparecen en la página pública de tu dron (/u/…). Los datos de contacto y la dirección se mantienen privados.',
  'account.lockedIdentityHint': 'Puedes cambiar libremente la foto, el logotipo y el banner. Para modificar datos personales, teléfono, email o dirección, contacta con un administrador.',
  'account.saved': 'Cambios guardados',
  'account.saveError': 'No se han podido guardar los cambios. Vuelve a intentarlo.',
  'account.storageBillingRequired': 'Cloud Storage requiere el plan Firebase Blaze. Abre la consola de Firebase → Configuración del proyecto → Uso y facturación, vincula una cuenta de facturación, cambia a Blaze y vuelve a intentarlo.',
  'entity.noPdfAttached': 'No hay ningún PDF adjunto — abre Editar y sube el archivo.',
  'account.editHint': 'Edit your account details and pilot identity. None of these fields are shown publicly.',

  'field.addressLine1': 'Dirección, línea 1',
  'field.addressLine2': 'Dirección, línea 2 (opcional)',
  'field.city': 'Ciudad',
  'field.postalCode': 'Código postal',
  'field.country': 'País',
  'field.companyContactPerson': 'Persona de contacto',
  'field.companyVat': 'NIF / número de IVA',
  'field.companyUniqueNumber': 'Número de registro mercantil (opcional)',

  'operator.list.title': 'Operadores',
  'operator.list.subtitle': 'Hasta {max} operadores por cuenta.',
  'operator.list.empty': 'Aún no hay operadores',
  'operator.list.emptyDesc': 'Añade un operador para asociarlo a tus drones.',
  'operator.list.new': 'Nuevo operador',
  'operator.list.atCap': 'Has alcanzado el límite de operadores.',
  'operator.kind.private': 'Persona física',
  'operator.kind.company': 'Empresa',
  'operator.field.kind': 'Tipo de operador',
  'operator.field.label': 'Etiqueta',
  'operator.field.isDefault': 'Operador predeterminado',
  'operator.field.isDefaultHint': 'Se usa cuando no hay ningún cambio temporal activo.',
  'operator.current.badge': 'Operador actual',
  'operator.current.hint': 'Selecciona aquí tu operador actual. Se rellena automáticamente al crear un dron nuevo y se usa cuando no hay ningún cambio temporal activo en un vuelo.',
  'operator.current.set': 'Establecer {name} como operador actual',
  'operator.current.setShort': 'Marcar como actual',
  'operator.create.title': 'Nuevo operador',
  'operator.edit.title': 'Editar operador',
  'operator.delete.title': '¿Eliminar operador?',
  'operator.delete.warningPublic': 'Este operador es el predeterminado de {count} drones públicos. Si lo eliminas, esos drones quedarán sin operador predeterminado.',

  'drone.list.title': 'Drones',
  'drone.list.empty': 'Aún no hay drones',
  'drone.list.emptyDesc': 'Añade tu primer dron para publicar un perfil público.',
  'drone.list.new': 'Nuevo dron',
  'drone.list.atCap': 'Has agotado tus espacios para drones.',
  'drone.field.manufacturer': 'Fabricante',
  'drone.field.model': 'Modelo / nombre',
  'drone.field.classMarking': 'Marcado de clase',
  'drone.field.serialNumber': 'Número de serie del dron',
  'drone.field.controllerSerial': 'Número de serie del mando',
  'drone.field.defaultOperator': 'Operador predeterminado',
  'drone.field.linkedPilot': 'Piloto vinculado',
  'drone.field.insurance': 'Póliza de seguro',
  'drone.field.insuranceNone': 'Sin seguro vinculado',
  'drone.field.status': 'Estado',
  'drone.field.visibility': 'Visibilidad',
  'drone.field.slug': 'Slug de la URL pública',
  'drone.publicUrl': 'URL pública',
  'drone.copySlug': 'Copiar URL pública',
  'drone.slugCopied': 'URL pública copiada',
  'drone.create.title': 'Nuevo dron',
  'drone.edit.title': 'Detalles del dron',
  'drone.delete.title': '¿Eliminar dron?',
  'drone.delete.warning': 'Este dron está publicado en {url}. La tarjeta QR/NFC dejará de funcionar de inmediato.',
  'drone.class.c0': 'C0 (menos de 250 g)',
  'drone.class.c1': 'C1 (menos de 900 g)',
  'drone.class.c2': 'C2 (menos de 4 kg)',
  'drone.class.c3': 'C3 (menos de 25 kg)',
  'drone.class.c4': 'C4 (menos de 25 kg, sin automatización)',
  'drone.class.unknown': 'Desconocida / sin clasificar',
  'drone.catalog.title': 'Catálogo de modelos',
  'drone.catalog.search': 'Busca tu dron',
  'drone.catalog.searchPlaceholder': 'Busca DJI Mini, Air 3S, Autel…',
  'drone.catalog.hint': 'Elige un modelo común para rellenar automáticamente marca, nombre y clase UE. Tú solo añades el número de serie y el operador.',
  'drone.catalog.empty': 'Ningún modelo coincide. Prueba otra búsqueda o elige uno personalizado.',
  'drone.catalog.custom': 'Otro modelo — introduce los datos a mano',
  'drone.catalog.selectedClass': 'Clase UE',
  'drone.catalog.required': 'Selecciona un modelo del catálogo o elige uno personalizado.',
  'drone.catalog.serialHint': 'Número de serie que figura en la aeronave',
  'drone.detail.basics': 'Información básica',
  'drone.detail.identity': 'Identidad y números de serie',
  'drone.detail.publish': 'Publicación',
  'drone.detail.linked': 'Elementos vinculados',
  'drone.backToList': 'Volver a drones',
  'drone.confirmCreate.title': 'Confirmar datos del dron',
  'drone.confirmCreate.message': 'Comprueba los datos: una vez guardados, el fabricante, el modelo, la clase y el número de serie ya no podrán modificarse. Para corregirlos tendrás que eliminar el dron y registrarlo de nuevo.',
  'drone.confirmLock.title': 'Bloquear datos del dron',
  'drone.confirmLock.message': 'Comprueba los datos: una vez guardados, estos campos ya no podrán modificarse. Para corregirlos tendrás que eliminar el dron y registrarlo de nuevo.',
  'drone.locked.hint': 'Los datos del dron están bloqueados. Para corregirlos, elimina el dron y regístralo de nuevo, o contacta con soporte.',

  'insurance.list.title': 'Pólizas de seguro',
  'insurance.list.subtitle': 'Una póliza puede cubrir varios drones. Vincula al tomador y luego selecciona todas las aeronaves cubiertas.',
  'insurance.list.empty': 'No hay pólizas de seguro',
  'insurance.list.emptyDesc': 'Sube el PDF de una póliza — un único documento puede cubrir toda tu flota.',
  'insurance.list.new': 'Nueva póliza',
  'insurance.field.link': 'Vinculada a',
  'insurance.link.drone': 'Dron',
  'insurance.link.operator': 'Operador',
  'insurance.field.drone': 'Dron vinculado',
  'insurance.field.coveredDrones': 'Drones cubiertos',
  'insurance.field.coveredDronesHint': 'Selecciona todos los drones que cubre esta póliza. Un solo seguro puede proteger varias aeronaves.',
  'insurance.field.noDrones': 'Aún no hay drones en tu flota — añade primero un dron, o guarda la póliza y vincúlala más tarde.',
  'insurance.coveredCount': '{count} drones',
  'insurance.field.operator': 'Operador vinculado',
  'insurance.create.title': 'Nueva póliza de seguro',
  'insurance.edit.title': 'Editar póliza de seguro',
  'insurance.delete.title': '¿Eliminar póliza?',
  'insurance.confirmCreate.title': 'Confirmar datos de la póliza',
  'insurance.confirmCreate.message': '¿Confirmas los datos? Si coinciden con los leídos del documento, la póliza queda verificada al instante; si los has modificado, la revisará un administrador. Una vez guardados, los campos ya no se pueden modificar: para corregirlos, elimina la póliza y súbela de nuevo.',
  'insurance.locked.hint': 'Los datos de la póliza están bloqueados. Para corregirlos, elimina la póliza y súbela de nuevo, o contacta con soporte.',
  'insurance.view.title': 'Detalles de la póliza',
  'insurance.delete.warningPublic': 'Esta póliza está vinculada a un dron público. Si la eliminas, el estado del seguro desaparecerá de ese perfil público.',
  'insurance.field.validity': 'Válida desde – hasta',
  'insurance.parse.hint': 'Del PDF leemos el titular, el número de póliza, las fechas y los drones cubiertos: solo tienes que revisar y confirmar.',
  'insurance.parse.parsing': 'Leyendo los datos de la póliza del PDF…',
  'insurance.parse.success': 'Datos leídos del documento: revísalos y confirma. Si no los modificas, la verificación es inmediata.',
  'insurance.parse.partial': 'Se han extraído algunos campos — completa el resto manualmente.',
  'insurance.parse.failed': 'No se ha podido leer este PDF automáticamente. Introduce los datos manualmente.',
  'insurance.parse.droneDetected': 'Dron del PDF',
  'insurance.parse.dronesDetected': '{count} aeronaves encontradas en la póliza',
  'insurance.parse.dronesMatched': '{count} coinciden con tu flota',
  'insurance.parse.droneMatched': 'vinculado a tu flota',
  'insurance.parse.droneNotMatched': 'selecciona el dron manualmente',
  'insurance.coverdrone.cta': 'Pedir presupuesto a Coverdrone',
  'insurance.coverdrone.hint': '¿Póliza a punto de vencer o vencida? Renueva o contrata la cobertura de RC para drones en la UE con Coverdrone.',

  'cert.list.title': 'Certificados',
  'cert.list.subtitle': 'A1/A3, A2, STS teórico, STS-01, STS-02 o personalizado.',
  'cert.list.empty': 'No hay certificados',
  'cert.list.emptyDesc': 'Añade tus certificados A1/A3, A2 o STS.',
  'cert.list.new': 'Nuevo certificado',
  'cert.list.atCap': 'Has agotado tus espacios para certificados.',
  'cert.field.kind': 'Tipo de certificado',
  'cert.field.label': 'Etiqueta',
  'cert.field.registrationNumber': 'Número de registro',
  'cert.field.registrationNumberHint': 'Se lee automáticamente del PDF, o introdúcelo a mano',
  'cert.field.issuedBy': 'Expedido por',
  'cert.field.fileUrl': 'URL del certificado',
  'cert.field.filePdf': 'Documento del certificado (PDF)',
  'cert.field.number': 'Número de certificado',
  'cert.field.notes': 'Notas',
  'cert.kind.a1a3': 'A1 / A3',
  'cert.kind.a2': 'A2',
  'cert.kind.stsTheoretical': 'STS teórico',
  'cert.kind.sts01': 'STS-01',
  'cert.kind.sts02': 'STS-02',
  'cert.kind.custom': 'Certificado personalizado',
  'cert.create.title': 'Nuevo certificado',
  'cert.edit.title': 'Editar certificado',
  'cert.delete.title': '¿Eliminar certificado?',
  'cert.confirmCreate.title': 'Confirmar datos del certificado',
  'cert.confirmCreate.message': '¿Confirmas los datos? Si coinciden con los leídos del documento, el certificado queda verificado al instante; si los has modificado, lo revisará un administrador. Una vez guardados, los campos ya no se pueden modificar: para corregirlos, elimina el certificado y súbelo de nuevo.',
  'cert.locked.hint': 'Los datos del certificado están bloqueados. Para corregirlos, elimina el certificado y súbelo de nuevo, o contacta con soporte.',
  'cert.view.title': 'Detalles del certificado',
  'cert.parse.hint': 'En los certificados italianos leemos automáticamente el código ITA-…, las fechas y el tipo: solo tienes que revisar y confirmar.',
  'cert.parse.parsing': 'Leyendo los datos del certificado del PDF…',
  'cert.parse.success': 'Datos leídos del documento: revísalos y confirma. Si no los modificas, la verificación es inmediata.',
  'cert.parse.partial': 'Se han extraído algunos campos — completa el resto manualmente.',
  'cert.parse.failed': 'No se ha podido leer este PDF automáticamente. Introduce los datos manualmente.',

  'doc.list.title': 'Documentos subidos',
  'doc.list.subtitle': '{used} de {max} espacios de documentos usados.',
  'doc.list.empty': 'No hay documentos',
  'doc.list.emptyDesc': 'Sube PDF (póliza de seguro, registro, certificado de formación, etc.).',
  'doc.list.new': 'Nuevo documento',
  'doc.list.atCap': 'Has agotado tus espacios para documentos.',
  'doc.field.kind': 'Tipo de documento',
  'doc.field.label': 'Nombre',
  'doc.field.labelHint': 'Opcional — si lo dejas vacío, se usa el nombre del archivo',
  'doc.field.file': 'Archivo',
  'doc.field.fileUrl': 'URL del archivo',
  'doc.field.fileName': 'Nombre del archivo',
  'doc.field.notes': 'Notas',
  'doc.kind.insurance_policy': 'Póliza de seguro',
  'doc.kind.operator_license': 'Licencia de operador',
  'doc.kind.drone_registration': 'Registro del dron',
  'doc.kind.training_certificate': 'Certificado de formación',
  'doc.kind.identity': 'Documento de identidad',
  'doc.kind.other': 'Otro',
  'doc.create.title': 'Nuevo documento',
  'doc.edit.title': 'Editar documento',
  'doc.delete.title': '¿Eliminar documento?',
  'doc.urlHint': 'Pega una URL pública del archivo (URL de Firebase Storage, enlace firmado, etc.).',

  'permits.list.title': 'Permisos y autorizaciones',
  'permits.list.subtitle': 'Autorizaciones diarias, nullaosta y permisos operativos. Los elementos vencidos pasan a Archivo.',
  'permits.list.new': 'Nuevo permiso',
  'permits.list.empty': 'No hay permisos activos',
  'permits.list.emptyDesc': 'Sube autorizaciones diarias, nullaosta, nullaosta por horas y documentos operativos similares.',
  'permits.list.atCap': 'Has agotado los espacios para permisos activos.',
  'permits.hint.parser': 'Indica la zona, las condiciones, las fechas y el dron afectado.',
  'permits.hint.storage': 'Adjunta el PDF o una foto de la autorización.',
  'permits.hint.admin': 'Un administrador de DroneTag lo revisará.',
  'permits.archiveNotice': '{count} elemento(s) vencido(s) movido(s) a Archivo.',
  'permits.create.title': 'Nueva autorización',
  'permits.edit.title': 'Editar autorización',
  'permits.delete.title': '¿Eliminar autorización?',
  'permits.delete.message': 'Esta autorización se eliminará definitivamente.',
  'permits.kind.daily': 'Autorización diaria',
  'permits.kind.nullaosta': 'Nullaosta',
  'permits.kind.hourly_nullaosta': 'Nullaosta por horas',
  'permits.kind.temporary': 'Permiso temporal',
  'permits.kind.other': 'Otro',
  'permits.field.kind': 'Tipo',
  'permits.field.label': 'Título',
  'permits.field.issuedBy': 'Expedido por',
  'permits.field.area': 'Área / zona',
  'permits.field.validFrom': 'Válido desde',
  'permits.field.validTo': 'Válido hasta',
  'permits.field.notes': 'Notas',
  'permits.field.file': 'Documento (PDF o imagen)',

  'archive.list.title': 'Archivo',
  'archive.list.subtitle': 'Certificados, pólizas y autorizaciones vencidos. Amplía el espacio desde Facturación.',
  'archive.list.new': 'Subir al archivo',
  'archive.list.empty': 'El archivo está vacío',
  'archive.list.emptyDesc': 'Cuando venzan certificados, pólizas de seguro o permisos, aparecerán aquí automáticamente.',
  'archive.hint.storage': 'Espacio de archivo incluido: 30 MB',
  'archive.hint.autoMove': 'Las versiones vencidas se mueven aquí automáticamente',
  'archive.hint.upgrade': 'Compra más espacio de archivo',
  'archive.cta.buySpace': 'Comprar espacio',
  'archive.storage.title': 'Almacenamiento del archivo',
  'archive.storage.used': '{used} MB de {max} MB usados',
  'archive.expiredOn': 'Venció el',
  'archive.openSource': 'Abrir sección',
  'archive.delete.title': '¿Eliminar del archivo?',
  'archive.delete.message': 'El documento vencido se eliminará definitivamente y se liberará espacio.',

  'slot.usage': '{used} de {max} usados',
  'slot.atCap': 'Límite alcanzado',
  'slot.contactToUpgrade': 'Contacta con el administrador para añadir más espacios.',

  'confirm.continue': 'Continuar',
  'confirm.dangerWarning': 'Esta acción no se puede deshacer.',

  'form.errors.title': 'Corrige los campos resaltados.',
  'form.errors.invalidEmail': 'Introduce una dirección de correo válida.',
  'form.errors.invalidUrl': 'Introduce una URL válida.',
  'form.errors.urlNotAllowed': 'La URL debe estar alojada en Firebase Storage o en un host de confianza configurado por el administrador.',
  'form.errors.expiryBeforeIssue': 'La fecha de vencimiento debe ser posterior a la de emisión.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M3 — Public drone page + Report found drone (English source; pending ES).
  // ═══════════════════════════════════════════════════════════════════════════

  'publicDrone.eyebrow': 'Identificación del dron',
  'publicDrone.holderPilot': 'Piloto a distancia',
  'publicDrone.holderOperatorPrivate': 'Operador UAS',
  'publicDrone.holderOperatorCompany': 'Operador UAS (empresa)',
  'publicDrone.holderName': 'Nombre',
  'publicDrone.classification': 'Clase del dron',
  'publicDrone.identifier': 'Número de serie',
  'publicDrone.policyNumberMasked': 'Referencia de la póliza',
  'publicDrone.validUntil': 'Válida hasta',
  'publicDrone.userVerified': 'Usuario verificado',
  'publicDrone.userPending': 'Usuario en revisión',
  'publicDrone.userUnverified': 'Usuario no verificado',
  'publicDrone.userRejected': 'Usuario no aprobado',
  'publicDrone.insuranceUnknown': 'No hay información del seguro registrada',
  'publicDrone.insuranceActive': 'Seguro activo',
  'publicDrone.insuranceExpiring': 'Seguro a punto de vencer',
  'publicDrone.insuranceExpired': 'Seguro vencido',
  'publicDrone.certificatesVerified': 'Certificados verificados',
  'publicDrone.certificatesPending': 'Certificados en revisión',
  'publicDrone.certificatesUnverified': 'Certificados no verificados',
  'publicDrone.certificatesRejected': 'Certificados rechazados',
  'publicDrone.viewPolicyPdf': 'Ver documento de la póliza',
  'publicDrone.openApp': 'Abrir la app / iniciar sesión',
  'publicDrone.reportFound': 'He encontrado este dron',
  'publicDrone.reportFoundShort': 'Avisar de dron encontrado',
  'publicDrone.lastVerified': 'Última verificación',
  'publicDrone.publishedOn': 'Publicado el',
  'publicDrone.disclaimer': 'DroneTag es una plataforma privada de identificación digital. No sustituye el registro oficial del operador, la certificación del piloto, las obligaciones de seguro ni la documentación expedida por las autoridades.',

  'reportFound.title': 'Avisar de un dron encontrado',
  'reportFound.subtitle': 'Ayuda a devolver este dron a su propietario. Compartir tus datos de contacto es opcional.',
  'reportFound.field.finderName': 'Tu nombre (opcional)',
  'reportFound.field.finderEmail': 'Tu email (opcional)',
  'reportFound.field.message': 'Mensaje para el propietario (opcional)',
  'reportFound.field.locationText': 'Ubicación aproximada (opcional)',
  'reportFound.field.locationTextHint': 'Texto libre: dirección, punto de referencia, barrio, etc.',
  'reportFound.geolocation.add': 'Compartir mi ubicación GPS',
  'reportFound.geolocation.added': 'Ubicación GPS obtenida',
  'reportFound.geolocation.remove': 'Quitar la ubicación GPS',
  'reportFound.geolocation.error': 'No se ha podido acceder a la ubicación. Puedes describirla igualmente en el campo de arriba.',
  'reportFound.privacy': 'Tu mensaje solo llega al propietario del dron y al equipo de DroneTag: nunca se muestra en la página pública.',
  'reportFound.submit': 'Enviar aviso',
  'reportFound.submitting': 'Enviando…',
  'reportFound.successTitle': 'Gracias por el aviso',
  'reportFound.successBody': 'Hemos avisado al propietario del dron. Si has facilitado tus datos de contacto, puede que se ponga en contacto contigo.',
  'reportFound.errorBody': 'No hemos podido enviar tu aviso. Vuelve a intentarlo en un momento.',
  'reportFound.cooldown': 'Espera unos segundos antes de enviar otro aviso.',

  'inbox.title': 'Avisos de hallazgo',
  'inbox.subtitle': 'Mensajes de personas que han encontrado uno de tus drones.',
  'inbox.tab': 'Avisos de hallazgo',
  'inbox.empty': 'Aún no hay avisos de hallazgo',
  'inbox.emptyDesc': 'Cuando alguien escanee una de las fichas públicas de tus drones y use el botón «Avisar de dron encontrado», verás aquí su mensaje.',
  'inbox.unread': 'Sin leer',
  'inbox.read': 'Leído',
  'inbox.markRead': 'Marcar como leído',
  'inbox.viewLocation': 'Abrir en el mapa',
  'inbox.locationCoords': '{lat}, {lng} (±{accuracy} m)',
  'inbox.fromAnonymous': 'Remitente anónimo',
  'inbox.contact': 'Contacto',
  'inbox.location': 'Ubicación indicada',
  'inbox.message': 'Mensaje',
  'inbox.about': 'Dron en cuestión',
  'inbox.openDrone': 'Abrir dron',
  'inbox.receivedAt': 'Recibido el {date}',


  'support.title': 'Soporte',
  'support.subtitle': 'Escribe al equipo de DroneTag para cambios de identidad y todo lo que solo puede modificar un administrador.',
  'support.nav': 'Soporte',
  'support.empty': 'Aún no hay mensajes',
  'support.emptyDesc': 'Escribe abajo para abrir una conversación. Úsalo para corregir el nombre, cambiar el teléfono/email y otros campos bloqueados.',
  'support.composer.placeholder': 'Escribe tu mensaje…',
  'support.composer.subjectPlaceholder': 'Asunto (opcional)',
  'support.send': 'Enviar',
  'support.sending': 'Enviando…',
  'support.closed': 'Esta conversación está cerrada. Envía un mensaje para reabrirla.',
  'support.you': 'Tú',
  'support.admin': 'Soporte',
  'support.hint.nameChange': '¿Necesitas cambiar tu nombre u otros datos bloqueados? Escríbenos aquí — un administrador actualizará tu cuenta.',
  'support.status.open': 'Abierta',
  'support.status.closed': 'Cerrada',

  'admin.nav.support': 'Soporte',
  'admin.support.title': 'Bandeja de soporte',
  'admin.support.subtitle': 'Conversaciones con usuarios sobre campos bloqueados y ayuda con la cuenta.',
  'admin.support.empty': 'No hay conversaciones',
  'admin.support.emptyDesc': 'Cuando un usuario escriba a soporte, la conversación aparecerá aquí.',
  'admin.support.openUser': 'Abrir ficha del usuario',
  'admin.support.close': 'Cerrar conversación',
  'admin.support.reopen': 'Reabrir conversación',
  'admin.support.unread': '{count} sin leer',
  'admin.support.select': 'Selecciona una conversación',
  'admin.support.composer.placeholder': 'Responder como admin…',
  'admin.users.openSupport': 'Abrir chat de soporte',

  'publicDrone.errorTitle': 'No se ha podido cargar este dron',
  'publicDrone.errorBody': 'Se ha producido un problema al obtener el perfil del dron. Comprueba tu conexión y vuelve a intentarlo.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M4 — Temporary operator switching (English source; pending ES polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'activeOp.section.title': 'Operador activo',
  'activeOp.section.subtitle': 'Reasigna temporalmente este dron a otro operador. El cambio caduca automáticamente a las 24 horas.',
  'activeOp.label.effective': 'Vigente ahora',
  'activeOp.label.default': 'Operador predeterminado',
  'activeOp.label.activeOverride': 'Cambio temporal',
  'activeOp.label.expiresAt': 'Vuelve al predeterminado el',
  'activeOp.label.setAt': 'Activado el',
  'activeOp.label.reason': 'Motivo',
  'activeOp.countdown.hours': 'Quedan {hours}h {minutes}m',
  'activeOp.countdown.minutes': 'Quedan {minutes}m',
  'activeOp.countdown.expired': 'Caducado — se vuelve al operador predeterminado',
  'activeOp.cta.switch': 'Cambiar operador activo',
  'activeOp.cta.clearNow': 'Anular ahora el operador temporal',
  'activeOp.cta.confirmAndApply': 'Confirmar y activar',
  'activeOp.modal.title': 'Activar operador temporal',
  'activeOp.modal.subtitle': 'Elige el operador que se hará cargo de este dron durante las próximas 24 horas.',
  'activeOp.modal.field.operator': 'Operador',
  'activeOp.modal.field.reason': 'Motivo (opcional)',
  'activeOp.modal.field.reasonHint': 'Te ayuda a ti y a cualquier administrador a entender por qué se activó el cambio temporal.',
  'activeOp.modal.responsibility': 'Confirmo que he verificado todos los datos del operador, la cobertura del seguro, la asociación del dron y la responsabilidad legal antes de activar este operador.',
  'activeOp.modal.responsibilityRequired': 'Debes confirmar la responsabilidad antes de activar el operador temporal.',
  'activeOp.modal.duration': 'El cambio temporal permanece activo 24 horas y después vuelve automáticamente al operador predeterminado.',
  'activeOp.modal.sameAsDefault': 'El operador seleccionado ya es el predeterminado. Elige otro operador para activar un cambio temporal.',
  'activeOp.empty.noAlternativeTitle': 'No hay ningún operador alternativo disponible',
  'activeOp.empty.noAlternativeDesc': 'Añade un segundo operador en la página Operadores para habilitar el cambio temporal.',
  'activeOp.clear.title': '¿Anular el operador temporal?',
  'activeOp.clear.message': 'El dron volverá de inmediato a su operador predeterminado y se eliminará el registro de auditoría del cambio temporal.',
  'activeOp.banner.activeNow': 'Hay un cambio temporal de operador activo.',
  'activeOp.errorBody': 'No se ha podido actualizar el operador activo. Vuelve a intentarlo.',

  // ═══════════════════════════════════════════════════════════════════════════
  // M5 — Admin / plans / PWA / disclaimers (English source; pending ES polish).
  // ═══════════════════════════════════════════════════════════════════════════

  'legal.platformDisclaimer': 'DroneTag is a private digital identification and document management platform. It does not replace official drone operator registration, pilot certification, insurance obligations, or authority-issued documentation.',
  'legal.notOfficial': 'No es un registro oficial del gobierno ni de una autoridad aeronáutica.',

  'admin.title': 'Administración',
  'admin.subtitle': 'Gestiona la plataforma: usuarios, drones, avisos, planes y cola de verificación.',
  'admin.overview.subtitle': 'Cola de trabajo de hoy: verificación, avisos de hallazgo, soporte y cambios de operador activos.',
  'admin.overview.attentionTitle': 'Elementos que requieren tu atención',
  'admin.overview.attentionBody': '{count} elementos abiertos entre verificación, avisos y soporte.',
  'admin.overview.allClearTitle': 'Nada urgente',
  'admin.overview.allClearBody': 'No hay verificaciones pendientes, avisos de hallazgo sin leer ni respuestas de soporte en espera.',
  'admin.overview.stat.queue': 'Cola de verificación',
  'admin.overview.stat.unreadReports': 'Avisos sin leer',
  'admin.overview.stat.support': 'Soporte por responder',
  'admin.overview.stat.overrides': 'Cambios temporales activos',
  'admin.overview.verify.title': 'Desglose de verificación',
  'admin.overview.verify.subtitle': 'Elementos pendientes de tu decisión.',
  'admin.overview.openQueue': 'Abrir cola',
  'admin.overview.reports.title': 'Avisos de hallazgo sin leer',
  'admin.overview.reports.subtitle': 'Mensajes de personas que han escaneado un perfil público.',
  'admin.overview.openReports': 'Abrir bandeja',
  'admin.overview.reports.empty': 'No hay avisos sin leer',
  'admin.overview.reports.emptyDesc': 'Aquí aparecerán los nuevos avisos de hallazgo.',
  'admin.overview.reports.anonymous': 'Remitente anónimo',
  'admin.overview.support.title': 'Soporte pendiente de respuesta',
  'admin.overview.support.subtitle': 'Conversaciones abiertas con mensajes sin leer para el administrador.',
  'admin.overview.openSupport': 'Abrir soporte',
  'admin.overview.support.empty': 'No hay respuestas pendientes',
  'admin.overview.support.emptyDesc': 'Aquí aparecerán los mensajes de usuarios que necesiten respuesta de un administrador.',
  'admin.overview.overrides.title': 'Cambios temporales de operador activos',
  'admin.overview.overrides.subtitle': 'Cambios temporales de operador (24h) actualmente en vigor.',
  'admin.overview.openDrones': 'Abrir drones',
  'admin.overview.overrides.empty': 'No hay cambios temporales activos',
  'admin.overview.overrides.emptyDesc': 'Las asignaciones temporales de operador aparecerán aquí mientras sigan vigentes.',
  'admin.overview.overrides.until': 'Hasta {when}',
  'admin.overview.foot.users': 'Cuentas',
  'admin.overview.foot.public': 'Drones públicos',
  'admin.nav.overview': 'Resumen',
  'admin.nav.users': 'Usuarios',
  'admin.nav.drones': 'Drones',
  'admin.nav.reports': 'Drones encontrados',
  'admin.nav.verify': 'Verificación',
  'admin.nav.plans': 'Planes',
  'admin.nav.legacy': 'Perfiles heredados',
  'admin.stats.users': 'Usuarios',
  'admin.stats.drones': 'Drones',
  'admin.stats.publicDrones': 'Drones públicos',
  'admin.stats.reports': 'Drones encontrados',
  'admin.stats.unreadReports': 'Avisos sin leer',
  'admin.stats.plans': 'Planes activos',
  'admin.stats.activeOverrides': 'Cambios temporales activos',
  'admin.stats.legacyProfiles': 'Perfiles heredados',

  'admin.users.title': 'Usuarios',
  'admin.users.subtitle': 'Consulta, busca y edita cualquier cuenta de la plataforma.',
  'admin.users.searchPlaceholder': 'Nombre, correo, empresa, NIF…',
  'admin.users.empty': 'Aún no hay usuarios',
  'admin.users.loadError': 'No se pudieron cargar los usuarios. Comprueba la conexión y vuelve a intentarlo; si sigue ocurriendo, cierra sesión y vuelve a entrar.',
  'admin.users.create.title': 'Nuevo usuario',
  'admin.users.create.subtitle': 'Crea el acceso y el perfil del usuario. Solo podrá iniciar sesión y gestionar sus propios datos y documentos.',
  'admin.users.create.tempPassword': 'Contraseña temporal',
  'admin.users.create.submit': 'Crear usuario',
  'admin.users.create.errorEmailInUse': 'Ya existe una cuenta con este correo.',
  'admin.users.create.errorGeneric': 'No se ha podido crear el usuario. Vuelve a intentarlo.',
  'admin.users.create.errorAdminSdk':
    'Firebase Admin is not configured locally. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env.local to your service-account JSON file path, then restart npm run dev.',
  'admin.users.create.errorNameRequired': 'El nombre y los apellidos son obligatorios.',
  'admin.users.create.errorInvalidEmail': 'Introduce una dirección de correo válida.',
  'admin.users.create.errorAuth': 'La sesión de administrador ha caducado. Cierra sesión, vuelve a iniciarla e inténtalo de nuevo.',
  'admin.users.create.errorNetwork': 'Error de red al crear el usuario. Comprueba tu conexión y vuelve a intentarlo.',
  'admin.users.create.errors.summary': '{count} campos requieren tu atención antes de poder crear la cuenta.',
  'admin.users.create.errors.email_required': 'El correo es obligatorio para que el usuario pueda iniciar sesión.',
  'admin.users.create.errors.email_invalid': 'Introduce una dirección de correo válida (p. ej., nombre@empresa.es).',
  'admin.users.create.errors.password_required': 'La contraseña temporal es obligatoria (compártela con el usuario de forma segura).',
  'admin.users.create.errors.password_too_short': 'La contraseña debe tener al menos 6 caracteres.',
  'admin.users.create.errors.firstName_required': 'El nombre es obligatorio.',
  'admin.users.create.errors.lastName_required': 'Los apellidos son obligatorios.',
  'admin.users.create.errors.companyName_required': 'La razón social es obligatoria para las cuentas de empresa.',
  'admin.users.create.errors.companyContactPerson_required': 'La persona de contacto es obligatoria para las cuentas de empresa.',
  'admin.users.col.name': 'Nombre',
  'admin.users.col.type': 'Tipo',
  'admin.users.col.email': 'Correo',
  'admin.users.col.created': 'Creado',
  'admin.users.openProfile': 'Gestionar cuenta',
  'admin.users.editData': 'Editar datos',
  'common.showPassword': 'Mostrar contraseña',
  'common.hidePassword': 'Ocultar contraseña',
  'admin.users.loginHint.title': 'Acceso del usuario',
  'admin.users.loginHint.body': 'El usuario inicia sesión en /login con este correo. Si creaste tú la cuenta, usa la contraseña temporal que definiste; tras el primer acceso completa sus datos en Mi cuenta.',
  'admin.users.publicHint.title': 'Página pública (QR / NFC)',
  'admin.users.publicHint.body': 'Cada dron publicado tiene su propia página pública, la que abre el QR o la insignia NFC. El usuario la activa en Mi cuenta → Drones; también puedes gestionarla desde la sección Drones de abajo.',
  'admin.users.publicHint.none':
    'No public drone yet: create a drone and set visibility to Public.',
  'admin.users.publicProfileUnavailable':
    'No public page yet: add a public drone with a slug.',
  'admin.users.detail.account': 'Datos de la cuenta',
  'admin.users.detail.pilot': 'Identidad del piloto a distancia',
  'admin.users.detail.slots': 'Espacios',
  'admin.users.detail.operators': 'Operadores',
  'admin.users.detail.drones': 'Drones',
  'admin.users.detail.insurances': 'Seguros',
  'admin.users.detail.certificates': 'Certificados',
  'admin.users.detail.authorizations': 'Autorizaciones',
  'admin.users.detail.documents': 'Documentos',
  'admin.users.backToList': 'Volver a usuarios',

  'admin.slots.title': 'Espacios y límites',
  'admin.slots.subtitle': 'Define cuántos espacios de cada tipo puede usar este usuario.',
  'admin.slots.kind.certificate': 'Certificados',
  'admin.slots.kind.drone': 'Drones',
  'admin.slots.kind.operator': 'Operadores',
  'admin.slots.kind.pdf': 'Documentos PDF',
  'admin.slots.kind.permit': 'Autorizaciones / permisos',
  'admin.slots.kind.archive': 'Paquetes de archivo (+30 MB)',
  'admin.slots.kind.nfc_badge': 'Insignias NFC físicas',
  'admin.slots.kind.personalization': 'Personalización (logotipo / banner)',
  'admin.slots.usage': 'Usados: {used}',
  'admin.slots.save': 'Guardar espacios',

  'admin.verify.title': 'Cola de verificación',
  'admin.verify.subtitle': 'Cola: por revisar (datos corregidos por el usuario o sin verificación automática). Archivo: ya verificados, también automáticamente, o rechazados; puedes suspenderlos o devolverlos a la cola.',
  'admin.verify.view.queue': 'Cola',
  'admin.verify.view.archive': 'Archivo',
  'admin.verify.archive.subtitle': 'Verificados (también automáticamente, cuando el usuario confirmó los datos leídos del documento) o rechazados. Siempre puedes suspenderlos, rechazarlos o devolverlos a la cola.',
  'admin.verify.archive.empty': 'El archivo está vacío',
  'admin.verify.archive.emptyDesc': 'Aquí aparecen los elementos verificados o rechazados.',
  'admin.verify.tab.documents': 'Documentos',
  'admin.verify.tab.certificates': 'Certificados',
  'admin.verify.tab.insurances': 'Seguros',
  'admin.verify.tab.authorizations': 'Autorizaciones',
  'admin.verify.tab.drones': 'Drones',
  'admin.verify.markVerified': 'Marcar verificado',
  'admin.verify.markRejected': 'Marcar rechazado',
  'admin.verify.markPending': 'Marcar pendiente',
  'admin.verify.empty': 'Nada que revisar',
  'admin.verify.emptyDesc': 'Aquí solo aparecen los elementos que requieren revisión manual. Los verificados automáticamente van directamente al archivo.',

  'admin.drones.title': 'Todos los drones',
  'admin.drones.subtitle': 'Busca entre todos los drones, incluidos los públicos, los privados y los archivados.',
  'admin.drones.searchPlaceholder': 'Slug, fabricante, modelo, n.º de serie, correo del propietario…',
  'admin.drones.col.drone': 'Dron',
  'admin.drones.col.owner': 'Propietario',
  'admin.drones.col.status': 'Estado',
  'admin.drones.col.override': 'Asignación temporal',
  'admin.drones.openInAdmin': 'Abrir',
  'admin.drones.adminEdit.title': 'Editar dron',
  'admin.drones.adminEdit.subtitle': 'Edición de admin: los cambios se guardan al instante y anulan los bloqueos del usuario.',
  'admin.drones.clearOverride': 'Anular asignación',

  'admin.reports.title': 'Drones encontrados (todos los usuarios)',
  'admin.reports.subtitle': 'Mensajes enviados por personas que escanearon el perfil público de un dron.',
  'admin.reports.searchPlaceholder': 'Slug, nombre del remitente, correo, mensaje…',
  'admin.reports.col.received': 'Recibido',
  'admin.reports.col.drone': 'Dron',
  'admin.reports.col.finder': 'Remitente',
  'admin.reports.col.message': 'Mensaje',
  'admin.reports.col.location': 'Ubicación',
  'admin.reports.col.read': 'Leído',

  'admin.plans.title': 'Planes y precios',
  'admin.plans.subtitle': 'Configura el precio de cada tipo de espacio. La página de marketing y el panel del usuario leen estos precios.',
  'admin.plans.col.label': 'Etiqueta',
  'admin.plans.col.kind': 'Tipo de espacio',
  'admin.plans.col.price': 'Precio',
  'admin.plans.col.currency': 'Moneda',
  'admin.plans.col.active': 'Activo',
  'admin.plans.new': 'Nuevo plan',
  'admin.plans.create.title': 'Crear plan',
  'admin.plans.edit.title': 'Editar plan',
  'admin.plans.delete.title': '¿Eliminar el plan?',
  'admin.plans.field.label': 'Etiqueta visible',
  'admin.plans.field.description': 'Descripción',
  'admin.plans.field.kind': 'Tipo de espacio',
  'admin.plans.field.priceCents': 'Precio (en unidades menores, p. ej., céntimos)',
  'admin.plans.field.currency': 'Moneda',
  'admin.plans.field.active': 'Activo',
  'admin.plans.empty': 'Aún no hay planes configurados',
  'admin.plans.emptyDesc': 'Crea un plan para cada tipo de espacio que tus usuarios puedan comprar.',

  'account.plan.title': 'Tu plan',
  'account.plan.subtitle': 'Límites incluidos en tu cuenta. Contacta con el administrador para ampliarlos.',
  'account.plan.empty': 'Tu cuenta usa el plan básico.',
  'account.plan.contactAdmin': 'Contactar con el admin',

  'pwa.appName': 'DroneTag',
  'pwa.appShortName': 'DroneTag',
  'pwa.appDescription': 'Identificación digital y gestión documental para operadores de drones.',
  'pwa.install.cta': 'Instalar app',
  'pwa.install.dismiss': 'Ahora no',
  'pwa.install.installed': 'DroneTag está instalada',

  'billing.title': 'Facturación y suscripción',
  'billing.subtitle': 'Tu plan de DroneTag y el resumen de lo que has registrado.',
  'billing.comingSoon': 'Próximamente',
  'billing.comingSoonBody': 'El pago en línea llegará pronto. Mientras tanto puedes usar DroneTag sin límites; para dudas sobre planes y facturación, contacta con soporte.',
  'billing.subscribe': 'Suscribirse',
  'billing.manageProfile': 'Volver al perfil',
  'account.tab.billing': 'Facturación',

  'empty.hints.operator.1': 'Elige si el titular es un particular o una empresa.',
  'empty.hints.operator.2': 'Añade los datos de contacto para avisos y comunicaciones.',
  'empty.hints.operator.3': 'Marca un operador como predeterminado para los nuevos drones.',
  'empty.hints.drone.1': 'Indica fabricante, modelo y clase.',
  'empty.hints.drone.2': 'Elige un operador predeterminado y vincula un piloto.',
  'empty.hints.drone.3': 'Estado activo + visibilidad pública para compartir el QR.',
  'empty.hints.insurance.1': 'Sube el PDF de la póliza: el nombre, el número, las fechas y los drones cubiertos se leen automáticamente.',
  'empty.hints.insurance.2': 'Selecciona todos los drones que cubre la póliza: un solo seguro puede proteger toda la flota.',
  'empty.hints.certificate.1': 'Sube el PDF del certificado: el tipo, el emisor y las fechas se leen automáticamente.',
  'empty.hints.certificate.2': 'Revisa los datos y guarda para ver la insignia de válido/caducado.',
  'empty.hints.document.1': 'Sube cualquier PDF de apoyo (manuales, declaraciones, …).',
  'empty.hints.document.2': 'Los documentos son privados hasta que los publiques.',
  'empty.hints.inbox.1': 'Los avisos aparecen aquí cuando alguien escanea tu QR.',
  'empty.hints.inbox.2': 'Cuando recibas uno, responde por correo directamente a quien encontró el dron.',

  'pwa.install.success': 'DroneTag instalada. Busca el icono en la pantalla de inicio.',
  'pwa.offline.banner': 'Estás sin conexión: los cambios se sincronizarán cuando vuelvas a conectarte.',
  'pwa.online.toast': 'Conexión restablecida.',
  'pwa.iosHint.title': 'Añade DroneTag a la pantalla de inicio de tu iPhone',
  'pwa.iosHint.body': 'Toca el icono Compartir en Safari y elige «Añadir a pantalla de inicio» para abrirla con un solo toque.',

  'error.boundary.title': 'Algo ha fallado en esta pantalla.',
  'error.boundary.body': 'La plataforma DroneTag sigue funcionando: solo ha fallado la carga de esta página. Vuelve a intentarlo o regresa a tu panel.',
  'error.boundary.publicBody': 'Prueba a recargar la página. Si el QR sigue fallando, puede que el propietario haya retirado temporalmente la publicación del dron.',
  'error.boundary.adminBody': 'Abajo se incluye el registro del servidor. Copia el digest antes de reintentar para poder cotejarlo con los registros de Firebase.',
  'error.boundary.retry': 'Reintentar',
  'error.boundary.goHome': 'Ir al panel',
  'error.boundary.goPublic': 'Ir a la página de inicio',
  'error.boundary.diagnostics': 'Diagnóstico',
  'error.boundary.digest': 'Digest del error',

  'admin.nav.nfc': 'Herramientas NFC',
  'admin.nfc.title': 'Herramientas NFC / QR',
  'admin.nfc.subtitle': 'Genera las URL que se codifican en cada insignia y exporta el lote completo en CSV para un grabador NFC externo.',
  'admin.nfc.col.slug': 'Slug',
  'admin.nfc.col.url': 'URL pública',
  'admin.nfc.col.owner': 'Propietario',
  'admin.nfc.exportCsv': 'Exportar CSV',
  'admin.nfc.copyUrl': 'Copiar URL',
  'admin.nfc.empty': 'No hay drones públicos activos que codificar.',

  // ── Commercial pricing ──
  'nav.pricing': 'Precios',
  'pricing.hero.eyebrow': 'Planes y kit NFC',
  'pricing.hero.title': 'Identidad digital para cada vuelo de dron',
  'pricing.hero.subtitle': 'Elige un plan para particulares o para empresas. El kit NFC vincula certificados y seguro a un perfil público escaneable.',
  'pricing.hero.kitNotice': 'Importante: el kit NFC es obligatorio para activar las insignias físicas (salvo si está incluido en el plan).',
  'pricing.toggle.label': 'Tipo de cliente',
  'pricing.toggle.individual': 'Particulares',
  'pricing.toggle.business': 'Empresas',
  'pricing.section.individualTitle': 'Planes individuales',
  'pricing.section.individualSubtitle': 'Suscripción anual más el kit NFC necesario para las insignias físicas.',
  'pricing.section.businessTitle': 'Planes para empresas',
  'pricing.section.businessSubtitle': 'Suscripción mensual para equipos y flotas. Kit NFC con precio por operador.',
  'pricing.badge.recommended': 'Recomendado',
  'pricing.price.perYear': 'al año',
  'pricing.price.perMonth': 'al mes',
  'pricing.price.onRequest': 'Presupuesto a medida',
  'pricing.price.custom': 'A medida para tu flota',
  'pricing.kit.mandatoryLabel': 'Kit NFC',
  'pricing.kit.mandatoryPrice': '{amount} — obligatorio',
  'pricing.kit.perOperator': '{amount} por operador — obligatorio',
  'pricing.kit.included': 'Incluido en el plan',
  'pricing.kit.onRequest': 'Bajo presupuesto',
  'pricing.kit.sectionTitle': 'Kit NFC obligatorio',
  'pricing.kit.sectionSubtitle': 'Las insignias físicas son necesarias para verificar certificados y seguro sobre el terreno mediante NFC o QR.',
  'pricing.kit.mandatoryBanner': 'El kit NFC es obligatorio',
  'pricing.kit.mandatoryBody': 'Sin el kit puedes gestionar los documentos en digital, pero no puedes colocar insignias físicas en aeronaves ni equipos. Cada kit incluye dos insignias.',
  'pricing.kit.item.badge': '1 insignia NFC vinculada a tu perfil público de DroneTag', // TODO: translate
  'pricing.kit.note': 'En Pilot Pro el kit está incluido en el precio anual. En los planes para empresas, el kit se cobra una vez por operador.',
  'pricing.kit.visual.cert': 'CERT',
  'pricing.kit.visual.ins': 'SEG',
  'pricing.plan.free.name': 'Free',
  'pricing.plan.free.audience': 'Para empezar',
  'pricing.plan.free.cta': 'Activar gratis',
  'pricing.plan.free.f1': 'Perfil digital y subida de documentos',
  'pricing.plan.free.f2': 'Página pública QR / NFC con el kit activado',
  'pricing.plan.free.f3': 'Flujo de verificación por un administrador',
  'pricing.plan.pilot.name': 'Pilot',
  'pricing.plan.pilot.audience': 'Para pilotos individuales',
  'pricing.plan.pilot.cta': 'Elegir Pilot',
  'pricing.plan.pilot.f1': 'Gestión completa de credenciales',
  'pricing.plan.pilot.f2': 'Gestión de certificados y seguros',
  'pricing.plan.pilot.f3': 'Perfil público verificado',
  'pricing.plan.pilot.f4': 'Kit NFC a precio preferente',
  'pricing.plan.pilotPro.name': 'Pilot Pro',
  'pricing.plan.pilotPro.audience': 'La mejor opción para pilotos activos',
  'pricing.plan.pilotPro.cta': 'Elegir Pilot Pro',
  'pricing.plan.pilotPro.f1': 'Todo lo de Pilot',
  'pricing.plan.pilotPro.f2': 'Kit NFC incluido',
  'pricing.plan.pilotPro.f3': 'Soporte prioritario',
  'pricing.plan.pilotPro.f4': 'Un único pago anual; kit enviado con la activación',
  'pricing.plan.team.name': 'Team',
  'pricing.plan.team.audience': 'Para equipos pequeños',
  'pricing.plan.team.cta': 'Elegir Team',
  'pricing.plan.team.f1': 'Entorno multioperador',
  'pricing.plan.team.f2': 'Documentos de flota compartidos',
  'pricing.plan.team.f3': 'Kit NFC por operador',
  'pricing.plan.team.f4': 'Facturación mensual',
  'pricing.plan.business.name': 'Business',
  'pricing.plan.business.audience': 'Para empresas y flotas',
  'pricing.plan.business.cta': 'Elegir Business',
  'pricing.plan.business.f1': 'Operadores a escala de flota',
  'pricing.plan.business.f2': 'Operaciones de verificación avanzadas',
  'pricing.plan.business.f3': 'Kit NFC a precio preferente por operador',
  'pricing.plan.business.f4': 'Facturación mensual',
  'pricing.plan.enterprise.name': 'Enterprise',
  'pricing.plan.enterprise.audience': 'Implantaciones a medida',
  'pricing.plan.enterprise.cta': 'Contáctanos',
  'pricing.plan.enterprise.f1': 'Límites y puesta en marcha a medida',
  'pricing.plan.enterprise.f2': 'Soporte dedicado',
  'pricing.plan.enterprise.f3': 'Kit NFC bajo presupuesto',
  'pricing.card.seeCheckout': 'Continuar al pago',
  'pricing.summary.title': 'Lo que pagas',
  'pricing.summary.subtitle': 'Separación clara entre la suscripción y el kit NFC de pago único.',
  'pricing.summary.sub.title': 'Suscripción',
  'pricing.summary.sub.body': 'Anual para particulares, mensual para planes de empresa. Cubre la plataforma digital.',
  'pricing.summary.kit.title': 'Kit NFC',
  'pricing.summary.kit.body': 'Insignias físicas obligatorias (certificados + seguro). Incluido solo en Pilot Pro.',
  'pricing.summary.renew.title': 'Renovación',
  'pricing.summary.renew.body': 'Tras el primer periodo solo renuevas la suscripción: el kit es una compra única, salvo que añadas operadores.',
  'pricing.faq.title': 'Preguntas frecuentes',
  'pricing.faq.subtitle': 'Respuestas breves antes de activar un plan.',
  'pricing.faq.kit.q': '¿Es obligatorio el kit NFC?',
  'pricing.faq.kit.a': 'Sí. Todos los planes requieren el kit para enviar insignias físicas, salvo Pilot Pro, donde el kit está incluido en el precio anual. Los planes para empresas cobran el kit una vez por operador.',
  'pricing.faq.pilotPro.q': '¿Por qué se recomienda Pilot Pro?',
  'pricing.faq.pilotPro.a': 'Pilot Pro reúne la suscripción anual y el kit NFC en un único pago (139 €), de modo que el total inicial coincide con la suscripción.',
  'pricing.faq.team.q': '¿Cuántos operadores puedo añadir en Team / Business?',
  'pricing.faq.team.a': 'Team está pensado para pequeños grupos de operadores y Business para empresas y flotas. Para necesidades específicas, contáctanos y prepararemos una oferta a medida.',
  'pricing.faq.payment.q': '¿Cómo se paga?',
  'pricing.faq.payment.a': 'El pago en línea estará disponible muy pronto. Mientras tanto, envía tu solicitud desde el checkout y te contactaremos para completar la activación.',
  'pricing.faq.change.q': '¿Puedo cambiar de plan más adelante?',
  'pricing.faq.change.a': 'Sí: escríbenos desde soporte y actualizaremos tu plan.',
  'pricing.ctaFinal.title': '¿Listo para activar DroneTag?',
  'pricing.ctaFinal.subtitle': 'Empieza con Pilot Pro (kit incluido) o contáctanos para Enterprise.',
  'pricing.ctaFinal.primary': 'Elegir Pilot Pro',
  'pricing.ctaFinal.secondary': 'Contactar con ventas',
  'pricing.ctaFinal.backHome': 'Volver al inicio',
  'pricing.checkout.eyebrow': 'Pago',
  'pricing.checkout.title': 'Confirma tu plan',
  'pricing.checkout.subtitle': 'Los importes se calculan en el servidor a partir de la lista de precios oficial. Por ahora no se recogen datos de tarjeta.',
  'pricing.checkout.paymentInactive': 'Pago aún no activo',
  'pricing.checkout.plan': 'Plan seleccionado',
  'pricing.checkout.changePlan': 'Cambiar plan',
  'pricing.checkout.customerType': 'Tipo de cliente',
  'pricing.checkout.private': 'Particular',
  'pricing.checkout.company': 'Empresa',
  'pricing.checkout.operators': 'Operadores',
  'pricing.checkout.kits': 'Insignias NFC',  // TODO: translate
  'pricing.checkout.kitsHint': 'Una insignia NFC por piloto a distancia. Colocada en un dron, la insignia abre la página pública de DroneTag de ese dron.',
  'pricing.checkout.billing': 'Datos de facturación',
  'pricing.checkout.fullName': 'Nombre completo',
  'pricing.checkout.email': 'Correo electrónico',
  'pricing.checkout.companyName': 'Razón social',
  'pricing.checkout.vat': 'NIF / IVA',
  'pricing.checkout.address': 'Dirección',
  'pricing.checkout.city': 'Ciudad',
  'pricing.checkout.postalCode': 'Código postal',
  'pricing.checkout.country': 'País',
  'pricing.checkout.terms': 'Acepto los términos del servicio y la política de privacidad para esta solicitud comercial.',
  'pricing.checkout.summary': 'Resumen de costes',
  'pricing.checkout.line.subscription': 'Suscripción',
  'pricing.checkout.line.kit': 'Kit NFC',
  'pricing.checkout.line.operators': 'Operadores',
  'pricing.checkout.line.initial': 'Total inicial',
  'pricing.checkout.line.recurring': 'Próxima renovación',
  'pricing.checkout.summaryNote': 'Total inicial = primer periodo de suscripción + kit NFC (si no está incluido). La renovación incluye solo la suscripción.',
  'pricing.checkout.quoteOnly': 'Enterprise funciona bajo presupuesto. Envía el formulario y nuestro equipo se pondrá en contacto contigo.',
  'pricing.checkout.submit': 'Enviar solicitud',
  'pricing.checkout.submitQuote': 'Solicitar presupuesto',
  'pricing.checkout.backPricing': 'Volver a precios',
  'pricing.checkout.requestId': 'ID de solicitud',
  'pricing.checkout.success.title': 'Solicitud recibida',
  'pricing.checkout.success.body': 'Hemos guardado tu solicitud comercial. El pago en línea se habilitará en una versión posterior.',
  'pricing.checkout.error.generic': 'Algo ha salido mal. Vuelve a intentarlo.',
  'pricing.checkout.error.terms_required': 'Debes aceptar los términos.',
  'pricing.checkout.error.billing_incomplete': 'Completa los datos de facturación.',
  'pricing.checkout.error.company_required': 'La razón social es obligatoria.',
  'pricing.checkout.error.unknown_plan': 'Plan desconocido.',
  'pricing.checkout.error.customer_type_mismatch': 'El tipo de cliente no corresponde a este plan.',
  'pricing.checkout.error.invalid_operatorCount': 'Número de operadores no válido.',
  'pricing.checkout.error.invalid_kitQuantity': 'Cantidad de kits no válida.',
  'login.forgotPassword': '¿Has olvidado tu contraseña?', // TODO: translate
  'forgot.title': 'Restablece tu contraseña', // TODO: translate
  'forgot.subtitle': 'Introduce la dirección de correo electrónico vinculada a tu cuenta de DroneTag y te enviaremos un enlace para restablecerla.', // TODO: translate
  'forgot.email': 'Correo electrónico', // TODO: translate
  'forgot.submit': 'Enviar enlace', // TODO: translate
  'forgot.sending': 'Enviando…', // TODO: translate
  'forgot.backToLogin': 'Volver al inicio de sesión', // TODO: translate
  'forgot.sent.title': 'Revisa tu correo', // TODO: translate
  'forgot.sent.body': 'Si existe una cuenta con esa dirección, te llegará un enlace para restablecer la contraseña. El enlace caduca al poco tiempo.', // TODO: translate
  'forgot.sent.resend': 'Enviar de nuevo', // TODO: translate
  'forgot.error.generic': 'No hemos podido procesar la solicitud en este momento. Vuelve a intentarlo dentro de un rato.', // TODO: translate
  'forgot.error.invalidEmail': 'Introduce una dirección de correo válida.', // TODO: translate
  'links.nfcEncodeLabel': 'Graba esta URL en la insignia', // TODO: translate
  'links.nfcInstructions': 'Usa cualquier app de grabación NFC (por ejemplo, NFC Tools en Android o iOS) y graba la URL de arriba como registro NDEF de tipo URI. Después, al acercar un móvil a la insignia, se abrirá este perfil público.', // TODO: translate
  'links.nfcNotReady': 'Publica este perfil y asígnale un slug para generar la URL que debe contener la insignia.', // TODO: translate
  'common.dismiss': 'Cerrar', // TODO: translate
  'admin.verify.notifyWarning': 'La decisión se ha guardado, pero no se ha podido enviar el correo al usuario ({reason}). Aun así, podrá ver la actualización en su conversación de soporte.', // TODO: translate
  'support.newTicket': 'Nueva solicitud', // TODO: translate
  'support.subject': 'Asunto', // TODO: translate
  'support.subjectPlaceholder': '¿En qué necesitas ayuda?', // TODO: translate
  'support.message': 'Mensaje', // TODO: translate
  'support.messagePlaceholder': 'Describe tu solicitud…', // TODO: translate
  'support.reply': 'Responder', // TODO: translate
  'support.emptyHint': 'Abre una solicitud y el equipo de DroneTag te responderá aquí.', // TODO: translate
  'support.status.pending': 'Respuesta recibida', // TODO: translate
  'support.close': 'Cerrar solicitud', // TODO: translate
  'support.reopen': 'Reabrir', // TODO: translate
  'support.team': 'Soporte de DroneTag', // TODO: translate
  'support.error.send': 'No se ha podido enviar tu mensaje. Vuelve a intentarlo.', // TODO: translate
  'support.error.load': 'No se ha podido cargar tu conversación de soporte.', // TODO: translate
  'onboarding.title': 'Completa tu perfil de DroneTag', // TODO: translate
  'onboarding.subtitle': 'Unos pocos pasos para que tu dron sea identificable y tu insignia esté lista.', // TODO: translate
  'onboarding.progress': '{done} of {total}', // TODO: translate
  'onboarding.step.profile': 'Tu perfil', // TODO: translate
  'onboarding.step.profile.hint': 'Añade tu nombre para que tu perfil público te identifique.', // TODO: translate
  'onboarding.step.operator': 'Operador UAS', // TODO: translate
  'onboarding.step.operator.hint': 'Registra a la persona u organización responsable de la operación.', // TODO: translate
  'onboarding.step.drone': 'Tu dron', // TODO: translate
  'onboarding.step.drone.hint': 'Añade la aeronave que quieres identificar.', // TODO: translate
  'onboarding.step.certificate': 'Certificado de piloto', // TODO: translate
  'onboarding.step.certificate.hint': 'Sube tu certificado de piloto a distancia para que lo verifiquemos.', // TODO: translate
  'onboarding.step.insurance': 'Seguro', // TODO: translate
  'onboarding.step.insurance.hint': 'Sube tu póliza para que su validez pueda mostrarse públicamente.', // TODO: translate
  'onboarding.step.public': 'Perfil público', // TODO: translate
  'onboarding.step.public.hint': 'Publica un dron para obtener su página pública de DroneTag.', // TODO: translate
  'onboarding.step.badge': 'Enlace para tu insignia NFC', // TODO: translate
  'onboarding.step.badge.hint': 'Obtén el enlace público para grabarlo en tu insignia.', // TODO: translate
  'legal.draft.badge': 'Borrador', // TODO: translate
  'legal.draft.bannerTitle': 'Texto en borrador — no revisado por un abogado', // TODO: translate
  'legal.draft.bannerBody': 'Esta página es un borrador de trabajo redactado por el equipo de DroneTag para que pueda revisarse la estructura del documento. No está en vigor, no constituye asesoramiento jurídico y no crea derechos ni obligaciones para ti ni para nosotros. Un abogado cualificado deberá revisar y sustituir este texto antes de que DroneTag se abra a usuarios reales.', // TODO: translate
  'legal.draft.lastUpdated': 'Borrador editado por última vez el {date}. Todavía no hay ninguna versión de este documento en vigor.', // TODO: translate
  'legal.contact.title': 'A quién contactar', // TODO: translate
  'legal.contact.body': 'Puedes enviar tus preguntas sobre este borrador, o sobre los datos que DroneTag conserva sobre ti, a info@drone-tag.com. El documento definitivo indicará la empresa que gestiona el servicio, su domicilio social y un contacto específico para las solicitudes relativas a datos. Nada de eso está decidido todavía, así que se ha omitido en lugar de inventarlo.', // TODO: translate
  'legal.related.title': 'Otros documentos en borrador', // TODO: translate
  'home.footer.cookies': 'Cookies', // TODO: translate
  'legal.privacy.title': 'Política de privacidad', // TODO: translate
  'legal.privacy.subtitle': 'Qué datos conserva DroneTag sobre ti, qué ve un desconocido al acercar el móvil a tu insignia NFC y qué permanece privado.', // TODO: translate
  'legal.privacy.who.title': 'Quién gestiona este servicio', // TODO: translate
  'legal.privacy.who.body': 'Esta sección identificará a la entidad jurídica que gestiona DroneTag y decide cómo se usan tus datos, su domicilio social y la persona de contacto en materia de datos. Esa entidad todavía no está definida, así que aquí no se indica nada. Desde el punto de vista técnico, el servicio funciona sobre Google Firebase para la autenticación, la base de datos y el almacenamiento de archivos, y está desplegado en Netlify.', // TODO: translate
  'legal.privacy.collect.title': 'Qué datos recoge DroneTag', // TODO: translate
  'legal.privacy.collect.body': 'La propia cuenta contiene una dirección de correo electrónico, un número de teléfono, un nombre o una razón social, una dirección postal y, en las cuentas de particulares, una fecha de nacimiento. La ficha de piloto añade la nacionalidad, un código de operador, un número de licencia y un contacto de emergencia. Las fichas de operador repiten el nombre o la razón social, la dirección, el correo electrónico y, en el caso de las empresas, el NIF o el número de registro. Las fichas de dron contienen el fabricante, el modelo, la clase UE, el número de serie grabado en la aeronave y el número de serie del mando. Los archivos subidos —pólizas de seguro, certificados, permisos y documentos de identidad— se almacenan tal como los proporcionas, por lo que contienen todo lo que contengan esos documentos.', // TODO: translate
  'legal.privacy.why.title': 'Por qué se recogen', // TODO: translate
  'legal.privacy.why.body': 'Los datos de cuenta y de contacto se usan para que puedas iniciar sesión, para enviarte notificaciones y para responder a las solicitudes de soporte. Los datos de piloto, operador, dron y documentos existen para que puedas guardar tu documentación de cumplimiento normativo en un solo lugar y, si así lo decides, mostrar un resumen verificable a un tercero. Los datos de pago y de pedidos existen para enviar las insignias NFC y gestionar la compra de planes. La versión definitiva de esta sección deberá indicar una base jurídica para cada finalidad; es una cuestión que corresponde a un abogado y aquí no se afirma ninguna base.', // TODO: translate
  'legal.privacy.public.title': 'Qué es visible en tu página pública', // TODO: translate
  'legal.privacy.public.body': 'Un dron publicado obtiene una página en la ruta /u/ seguida de su slug, y cualquiera que tenga el enlace o la insignia puede abrirla sin iniciar sesión. Esa página lee un único registro depurado y muestra solo el nombre del titular (tu nombre como piloto, tu nombre como operador particular o tu razón social), el fabricante, el modelo, la clase UE, el número de serie grabado en el dron, el estado del seguro y la aseguradora, la fecha de vencimiento de la póliza, un número de póliza enmascarado que solo conserva los tres primeros y los tres últimos caracteres, la insignia de verificación con su fecha y cualquier foto de perfil, logotipo o banner que hayas subido como personalización.', // TODO: translate
  'legal.privacy.notPublic.title': 'Qué no se publica deliberadamente', // TODO: translate
  'legal.privacy.notPublic.body': 'El registro público no contiene el PDF del seguro, tu dirección postal, tu dirección de correo electrónico, tu número de teléfono, tu fecha de nacimiento, tu NIF o número de registro, el número de serie del mando, tu contacto de emergencia, las notas internas ni el identificador de cuenta que permitiría relacionar la página contigo. Esto se impone en el código y no por convención: la página pública solo lee la instantánea depurada, y los campos anteriores nunca se escriben en ella. El único identificador interno presente es el id de la ficha del dron, que se usa para mantener la instantánea alineada con el registro privado.', // TODO: translate
  'legal.privacy.sharing.title': 'Quién más puede verlos', // TODO: translate
  'legal.privacy.sharing.body': 'DroneTag no vende tus datos. Los tratan los proveedores de los que realmente depende la aplicación: Google Firebase aloja la autenticación, la base de datos y los archivos subidos; Netlify aloja y sirve la aplicación y conserva los registros de solicitudes; Resend entrega el correo transaccional, como los códigos de registro y las notificaciones. El personal de DroneTag con cuenta de administrador puede leer tus registros para revisar documentos y responder a las solicitudes de soporte. La versión definitiva deberá enumerar cada proveedor, dónde trata los datos y el contrato vigente con él.', // TODO: translate
  'legal.privacy.retention.title': 'Cuánto tiempo se conservan', // TODO: translate
  'legal.privacy.retention.body': 'Hoy no existe ninguna eliminación automática. Los registros y los archivos subidos se conservan hasta que los elimines o pidas a DroneTag que los elimine, y los avisos enviados por quien encontró tu dron permanecen en tu bandeja de entrada hasta que se borran. Fijar plazos de conservación reales —en particular para pólizas y certificados, que quizá deban conservarse durante un tiempo después de su vencimiento— es una cuestión abierta que corresponde a un abogado y aquí no se resuelve.', // TODO: translate
  'legal.privacy.requests.title': 'Consultar, corregir o eliminar tus datos', // TODO: translate
  'legal.privacy.requests.body': 'Puedes editar la mayoría de tus datos desde el área de cuenta, aunque algunos campos de identidad se bloquean una vez confirmados para que un perfil publicado no pueda reescribirse sin que nadie lo note. Para todo lo que no puedas cambiar tú mismo, incluida la eliminación de tu cuenta, escribe a info@drone-tag.com y la solicitud se gestionará manualmente. Todavía no hay exportación autogestionada ni eliminación automática. Esta política no afirma qué derechos legales te corresponden; eso deberá determinarlo un abogado.', // TODO: translate
  'legal.privacy.security.title': 'Cómo se protegen los datos', // TODO: translate
  'legal.privacy.security.body': 'Los registros privados solo pueden leerlos su propietario y los administradores de DroneTag, algo que imponen las reglas de seguridad de Firebase y no solo la aplicación. Los documentos subidos se guardan en una zona de almacenamiento privada que no puede leerse sin autenticación, separada de la pequeña zona pública que solo contiene las imágenes de personalización. Los registros de actividad del servidor pasan por un filtro que sustituye valores como direcciones de correo electrónico, números de teléfono y números de póliza antes de escribir nada. Ningún sistema es inmune a los ataques, así que esto es una descripción del diseño actual y no una garantía.', // TODO: translate
  'legal.privacy.changes.title': 'Cambios en este borrador', // TODO: translate
  'legal.privacy.changes.body': 'Este borrador cambiará a medida que avancen el producto y su revisión jurídica. Cuando lo sustituya una versión revisada, se retirará el banner de borrador de la parte superior de esta página y en su lugar aparecerá una fecha real de entrada en vigor.', // TODO: translate
  'pricing.kit.visual.badge': 'DRONETAG', // TODO: translate
  'legal.terms.title': 'Términos del servicio', // TODO: translate
  'legal.terms.subtitle': 'Las normas que regirán el uso de DroneTag, redactadas para poder revisarlas. Nada de lo que sigue es vinculante todavía.', // TODO: translate
  'legal.terms.what.title': 'Qué es DroneTag y qué no es', // TODO: translate
  'legal.terms.what.body': 'DroneTag es una plataforma privada para guardar la documentación de tu dron y, si así lo decides, publicar un breve resumen en una dirección pública accesible desde una insignia NFC o un código QR. No es una autoridad aeronáutica ni un registro público, y no emite, valida ni renueva ningún documento oficial. Un perfil en DroneTag no sustituye al registro ante la autoridad competente, a un certificado de piloto, a una póliza de seguro ni a ninguna autorización que necesites para volar.', // TODO: translate
  'legal.terms.eligibility.title': 'Quién puede abrir una cuenta', // TODO: translate
  'legal.terms.eligibility.body': 'La versión definitiva indicará una edad mínima y si una persona autorizada puede abrir una cuenta en nombre de una empresa. Hoy el formulario de registro pide nombre y apellidos, una dirección de correo electrónico, un número de teléfono y una contraseña, aunque también puedes registrarte con una cuenta de Google; después, la dirección de correo o el número de teléfono se confirma con un código de un solo uso. No hay ninguna verificación de edad.', // TODO: translate
  'legal.terms.account.title': 'Tu cuenta y tus credenciales', // TODO: translate
  'legal.terms.account.body': 'Eres responsable de mantener seguro el acceso a tu cuenta y de lo que se haga a través de ella. Escribe a info@drone-tag.com si crees que otra persona tiene acceso. Los administradores de DroneTag pueden leer los registros de tu cuenta para revisar los documentos que envías a verificación y para responder a las solicitudes de soporte.', // TODO: translate
  'legal.terms.content.title': 'Los documentos y datos que subes', // TODO: translate
  'legal.terms.content.body': 'Conservas la titularidad de todo lo que subes. Concedes a DroneTag solo lo necesario para prestar el servicio: almacenar tus archivos, mostrártelos, permitir que un administrador los revise y publicar el breve resumen descrito en la política de privacidad cuando decidas publicar un dron. Eres responsable de la exactitud de lo que introduces y de tener derecho a subirlo, en particular en el caso de documentos que nombran a otra persona.', // TODO: translate
  'legal.terms.publication.title': 'Publicar el perfil de un dron', // TODO: translate
  'legal.terms.publication.body': 'La publicación es decisión tuya y se hace dron por dron. Una vez publicada, la página puede leerla cualquiera que tenga la dirección; no está protegida por un inicio de sesión y no hay registro de visitas. Al retirar la publicación se elimina el registro público y la dirección deja de funcionar, pero DroneTag no puede recuperar páginas que otras personas ya hayan guardado, almacenado en caché o compartido. La versión definitiva deberá indicar en cuánto tiempo surte efecto la retirada.', // TODO: translate
  'legal.terms.verification.title': 'Qué significa la insignia de verificación', // TODO: translate
  'legal.terms.verification.body': 'Una insignia de verificado significa que un administrador de DroneTag examinó los documentos de la cuenta y los consideró coherentes. No es un aval de ninguna autoridad, no indica que el vuelo que vas a realizar sea legal y no garantiza que la póliza de seguro vaya a cubrir un siniestro. Quien se base en una página de DroneTag debería tomarla como punto de partida y pedir los documentos originales cuando sea importante.', // TODO: translate
  'legal.terms.plans.title': 'Planes, insignias y pagos', // TODO: translate
  'legal.terms.plans.body': 'Cada cuenta incluye una pequeña cantidad de drones, operadores, certificados y documentos, y se pueden comprar cantidades mayores. Las insignias NFC son productos físicos que se fabrican y se envían. Los precios, los periodos de facturación, la renovación, los reembolsos y las condiciones de envío no están definidos y deliberadamente no se indican aquí: la página de precios muestra los precios previstos actualmente, no una oferta contractual.', // TODO: translate
  'legal.terms.availability.title': 'Disponibilidad durante la pre-beta', // TODO: translate
  'legal.terms.availability.body': 'DroneTag no está terminado. Las funciones pueden cambiar o desaparecer, los datos pueden migrarse y el servicio puede dejar de estar disponible sin previo aviso. No uses DroneTag como única copia de un documento que necesites: conserva los originales. En esta fase no se ofrece ningún compromiso de disponibilidad.', // TODO: translate
  'legal.terms.suspension.title': 'Suspensión y cierre de la cuenta', // TODO: translate
  'legal.terms.suspension.body': 'La versión definitiva describirá cuándo puede DroneTag suspender o cerrar una cuenta, por ejemplo por subir documentos de otra persona o falsear un estado de verificación, y con qué preaviso. Hoy puedes solicitar el cierre de tu cuenta escribiendo a info@drone-tag.com; la solicitud se gestiona manualmente y no hay eliminación automática.', // TODO: translate
  'legal.terms.liability.title': 'Responsabilidad', // TODO: translate
  'legal.terms.liability.body': 'Esta es la sección que más necesita la intervención de un abogado, así que no se propone ningún texto. Deberá establecer de qué es responsable DroneTag, de qué no lo es y qué ocurre si una página pública muestra información desactualizada o incorrecta. Hoy nada de esta página limita ninguna responsabilidad, porque nada de esta página está en vigor.', // TODO: translate
  'legal.terms.law.title': 'Legislación aplicable y litigios', // TODO: translate
  'legal.terms.law.body': 'La legislación aplicable y el tribunal competente dependen de dónde esté establecida la empresa que gestiona el servicio y de dónde se encuentren sus usuarios, y ninguna de las dos cosas está definida. Un abogado deberá completar esta sección. Aquí no se indica ninguna jurisdicción.', // TODO: translate
  'legal.terms.changes.title': 'Cambios en estos términos en borrador', // TODO: translate
  'legal.terms.changes.body': 'Este borrador cambiará sin previo aviso mientras se desarrolla el producto. Cuando lo sustituya una versión revisada, se retirará el banner de borrador, aparecerá una fecha real de entrada en vigor y la versión definitiva describirá cómo se anunciarán los cambios futuros.', // TODO: translate
  'legal.cookies.title': 'Política de cookies y almacenamiento del navegador', // TODO: translate
  'legal.cookies.subtitle': 'Qué guarda hoy DroneTag en tu navegador, por qué lo guarda y qué no guarda.', // TODO: translate
  'legal.cookies.scope.title': 'Qué abarca esta página', // TODO: translate
  'legal.cookies.scope.body': 'Las cookies son solo una parte del panorama. DroneTag también usa el almacenamiento local del navegador, y la biblioteca de autenticación de Firebase guarda su propio estado de sesión en el navegador. Esta página los describe todos juntos porque, desde tu punto de vista, son lo mismo: datos que este sitio deja en tu dispositivo.', // TODO: translate
  'legal.cookies.essential.title': 'Cookies que se utilizan', // TODO: translate
  'legal.cookies.essential.body': 'Se usan dos cookies, ambas para iniciar sesión y ambas limitadas a este sitio. La primera la establece el servidor una vez verificado tu token de inicio de sesión, no pueden leerla los scripts de la página y caduca al cabo de una hora. La segunda la establece la propia página para que el mismo token esté disponible para el código que protege el área de administración, y caduca a los cincuenta y cinco minutos. Ambas se borran al cerrar sesión. No se instala ninguna cookie publicitaria ni de seguimiento.', // TODO: translate
  'legal.cookies.storage.title': 'Qué se guarda en el almacenamiento del navegador', // TODO: translate
  'legal.cookies.storage.body': 'El tema y el idioma que eliges se guardan en el almacenamiento local con los nombres dronetag-theme y dronetag-language, para que en la siguiente visita no aparezcan por un instante colores o un idioma incorrectos. La biblioteca de autenticación de Firebase también guarda su propio estado de sesión en el navegador, que es lo que te permite mantener la sesión iniciada entre visitas. Al borrar los datos del sitio se elimina todo ello y se cierra tu sesión.', // TODO: translate
  'legal.cookies.analytics.title': 'Analítica de uso', // TODO: translate
  'legal.cookies.analytics.body': 'No hay conectado ningún proveedor de analítica ni de publicidad. La aplicación incluye una capa interna de eventos con una lista breve y cerrada de eventos y, en su estado actual, esa capa solo escribe en la consola del navegador durante el desarrollo. Si más adelante se añade un proveedor, habrá que actualizar esta página y la política de privacidad antes de activarlo.', // TODO: translate
  'legal.cookies.thirdParty.title': 'Almacenamiento de otros servicios', // TODO: translate
  'legal.cookies.thirdParty.body': 'Iniciar sesión con Google abre un proceso gestionado por Google, que puede instalar sus propias cookies en sus propios dominios durante ese paso; esas cookies se rigen por las condiciones de Google y no por esta página. La aplicación se sirve a través de Netlify, que guarda los registros habituales de solicitudes. La versión definitiva de esta página deberá enumerar cualquier otro componente de terceros que llegue al navegador.', // TODO: translate
  'legal.cookies.consent.title': 'Consentimiento', // TODO: translate
  'legal.cookies.consent.body': 'Hoy el producto no tiene ni banner de cookies ni mecanismo de consentimiento. Si hace falta alguno, y para cuáles de los elementos anteriores, es una cuestión que corresponde a un abogado. Esta página no afirma que el comportamiento actual sea suficiente; lo describe para que la decisión pueda tomarse sobre hechos exactos.', // TODO: translate
  'legal.cookies.control.title': 'Cómo eliminarlos', // TODO: translate
  'legal.cookies.control.body': 'Al cerrar sesión se borran las dos cookies de inicio de sesión. Si borras los datos del sitio para este dominio desde la configuración del navegador, se elimina todo lo indicado arriba, incluidos el tema y el idioma guardados. Bloquear por completo las cookies impedirá iniciar sesión, porque el token de inicio de sesión no tendría dónde guardarse.', // TODO: translate
  'legal.cookies.changes.title': 'Cambios en este borrador', // TODO: translate
  'legal.cookies.changes.body': 'Esta lista refleja lo que hace la aplicación en la fecha indicada arriba y se volverá a contrastar con el código cada vez que eso cambie. Cuando una versión revisada sustituya a este borrador, se retirará el banner de la parte superior.', // TODO: translate
  'nav.preview': 'Vista previa', // TODO: translate
  'account.nav.section.fleet': 'Flota', // TODO: translate
  'account.nav.section.compliance': 'Cumplimiento', // TODO: translate
  'consent.title': '¿Hacer público este perfil?', // TODO: translate
  'consent.description': 'Cualquiera que tenga el enlace podrá verlo, sin iniciar sesión.', // TODO: translate
  'consent.warning': 'Un perfil público de DroneTag puede leerlo cualquiera que escanee la insignia o abra el enlace. No se trata como una página privada y no requiere iniciar sesión.', // TODO: translate
  'consent.urlLabel': 'Dirección pública', // TODO: translate
  'consent.sharedTitle': 'Qué será visible', // TODO: translate
  'consent.withheldTitle': 'Qué seguirá siendo privado', // TODO: translate
  'consent.shared.name': 'Tu nombre, o el nombre de tu operador o de tu empresa', // TODO: translate
  'consent.shared.drone': 'Fabricante, modelo y clase del dron', // TODO: translate
  'consent.shared.serial': 'El número de serie del dron grabado en la aeronave', // TODO: translate
  'consent.shared.certStatus': 'Si tu certificado de piloto es válido', // TODO: translate
  'consent.shared.insuranceStatus': 'Si tu seguro es válido y cuál es su estado', // TODO: translate
  'consent.shared.insuranceProvider': 'El nombre de tu aseguradora', // TODO: translate
  'consent.shared.insuranceExpiry': 'La fecha de vencimiento del seguro', // TODO: translate
  'consent.shared.maskedPolicy': 'Un número de póliza enmascarado, que solo muestra los primeros y los últimos caracteres', // TODO: translate
  'consent.shared.verification': 'El estado de verificación del perfil en DroneTag', // TODO: translate
  'consent.withheld.policyPdf': 'El documento de la póliza de seguro en sí', // TODO: translate
  'consent.withheld.address': 'Tu domicilio o tu domicilio social', // TODO: translate
  'consent.withheld.email': 'Tu correo electrónico', // TODO: translate
  'consent.withheld.phone': 'Tu número de teléfono', // TODO: translate
  'consent.withheld.fullPolicy': 'El número de póliza completo, sin enmascarar', // TODO: translate
  'consent.withheld.ids': 'Identificadores de cuenta e ID internos de los registros', // TODO: translate
  'consent.checkbox': 'Entiendo que este perfil será visible públicamente y quiero publicarlo.', // TODO: translate
  'consent.confirm': 'Publicar perfil', // TODO: translate
  'consent.revocable': 'Puedes volver a hacer privado el perfil en cualquier momento. Una vez retirada la publicación, la página pública deja de funcionar, aunque quien ya la haya abierto podría conservar una copia.', // TODO: translate
  'form.created': 'Perfil creado', // TODO: translate
  'links.copiedToast': 'Enlace público copiado al portapapeles', // TODO: translate
  'links.copyFailed': 'No se ha podido copiar el enlace. Selecciónalo y cópialo manualmente.', // TODO: translate
  'support.sent': 'Mensaje enviado al soporte de DroneTag', // TODO: translate
  'signup.terms.prefix': 'He leído y acepto los', // TODO: translate
  'signup.terms.termsLink': 'Términos del servicio', // TODO: translate
  'signup.terms.and': 'y la', // TODO: translate
  'signup.terms.privacyLink': 'Política de privacidad', // TODO: translate
  'signup.terms.required': 'Acepta los Términos y la Política de privacidad para continuar.', // TODO: translate
  'signup.terms.googleHint': 'Acepta arriba los Términos y la Política de privacidad antes de registrarte con Google.', // TODO: translate
  'account.delete.title': 'Solicitar la eliminación de la cuenta', // TODO: translate
  'account.delete.body': 'La eliminación no es automática. Al abrir una solicitud de soporte queda registrada tu voluntad de cerrar la cuenta. Un administrador de DroneTag la tramitará manualmente. Tus perfiles públicos seguirán visibles hasta entonces.', // TODO: translate
  'account.delete.cta': 'Abrir una solicitud de eliminación', // TODO: translate
  'drone.publish': 'Publicar perfil', // TODO: translate
  'drone.unpublish': 'Despublicar', // TODO: translate
  'drone.publish.success': 'El perfil público ya está publicado.', // TODO: translate
  'drone.unpublish.success': 'Se ha retirado la publicación del perfil público.', // TODO: translate
  'toast.certificate.created': 'Certificado añadido.', // TODO: translate
  'toast.certificate.deleted': 'Certificado eliminado.', // TODO: translate
  'toast.certificate.deleteFailed': 'No se ha podido eliminar el certificado. Vuelve a intentarlo.', // TODO: translate
  'toast.insurance.created': 'Póliza de seguro añadida.', // TODO: translate
  'toast.insurance.deleted': 'Póliza de seguro eliminada.', // TODO: translate
  'toast.insurance.deleteFailed': 'No se ha podido eliminar la póliza. Vuelve a intentarlo.', // TODO: translate
  'toast.document.created': 'Documento subido.', // TODO: translate
  'toast.document.updated': 'Documento actualizado.', // TODO: translate
  'toast.document.deleted': 'Documento eliminado.', // TODO: translate
  'toast.document.deleteFailed': 'No se ha podido eliminar el documento. Vuelve a intentarlo.', // TODO: translate
  'toast.permit.created': 'Autorización añadida.', // TODO: translate
  'toast.permit.updated': 'Autorización actualizada.', // TODO: translate
  'toast.permit.deleted': 'Autorización eliminada.', // TODO: translate
  'toast.permit.deleteFailed': 'No se ha podido eliminar la autorización. Vuelve a intentarlo.', // TODO: translate
  'toast.operator.created': 'Operador UAS añadido.', // TODO: translate
  'toast.operator.updated': 'Operador UAS actualizado.', // TODO: translate
  'toast.operator.deleted': 'Operador UAS eliminado.', // TODO: translate
  'toast.operator.deleteFailed': 'No se ha podido eliminar el operador UAS. Vuelve a intentarlo.', // TODO: translate
  'toast.operator.setCurrent': 'Operador UAS predeterminado actualizado.', // TODO: translate
  'toast.drone.created': 'Dron añadido.', // TODO: translate
  'toast.drone.saved': 'Datos del dron guardados.', // TODO: translate
  'toast.drone.deleted': 'Dron eliminado.', // TODO: translate
  'toast.drone.deleteFailed': 'No se ha podido eliminar el dron. Vuelve a intentarlo.', // TODO: translate
  'toast.archive.deleted': 'Elemento eliminado definitivamente.', // TODO: translate
  'toast.archive.deleteFailed': 'No se ha podido eliminar el elemento. Vuelve a intentarlo.', // TODO: translate
  'toast.verify.approved': 'Marcado como verificado.', // TODO: translate
  'toast.verify.rejected': 'Marcado como rechazado.', // TODO: translate
  'toast.verify.reset': 'Devuelto a la cola de revisión.', // TODO: translate
  'toast.verify.failed': 'No se ha podido guardar la decisión. Vuelve a intentarlo.', // TODO: translate
  'admin.users.detail.pilotOperatorNote': 'Los dos campos de abajo se refieren al operador UAS, no al piloto a distancia.', // TODO: translate
  'auth.googlePopupBlocked': 'Tu navegador ha bloqueado la ventana de acceso de Google. Permite las ventanas emergentes para este sitio y vuelve a intentarlo.',
  'signup.otp.skip': 'Omitir por ahora',
  'signup.otp.errorCooldown': 'Acabas de solicitar un código. Espera un minuto antes de pedir otro.',
  'signup.otp.errorDelivery': 'No podemos enviar el correo en este momento. Puedes continuar y verificar más tarde.',
  'signup.otp.sentTo': 'Código enviado a {email}. Revisa también la carpeta de spam.',
  'signup.errorInvalidEmail': 'Dirección de correo no válida.',
  'signup.errorNetwork': 'Conexión ausente o inestable. Comprueba tu red y vuelve a intentarlo.',
  'admin.overview.loadFailed': 'No se ha podido cargar el resumen. Comprueba tu conexión y vuelve a intentarlo.',
  'admin.overview.partialFailure': 'Algunas secciones no se han podido cargar',
  'admin.overview.health.ok': 'Todos los servicios operativos',
  'admin.overview.health.degraded': 'Algunos servicios no responden correctamente',
  'common.pdfShowAllPages': 'Mostrar todas las páginas ({count})',
  'common.close': 'Cerrar',
  'common.copied': 'Copiado al portapapeles',
  'loadError.title': 'Algo ha salido mal',
  'loadError.body': 'No se han podido cargar los datos. Comprueba tu conexión y vuelve a intentarlo.',
  'upload.hint': 'Formatos: {formats} · máx. {mb} MB',
  'upload.progress': 'Subiendo…',
  'upload.error.type': 'Tipo de archivo no compatible.',
  'upload.error.tooLarge': 'El archivo supera los {mb} MB.',
  'upload.error.heic': 'Este navegador no puede leer fotos HEIC. Exporta la imagen en JPG o PNG y vuelve a intentarlo.',
  'upload.error.canceled': 'Subida cancelada.',
  'slot.usedUnlimited': '{used} · ilimitado',
  'account.plan.unlimitedNote': 'No hay límites activos: puedes añadir drones, operadores, certificados y documentos libremente.',
  'operator.list.subtitleUnlimited': 'Añade todos los operadores que necesites.',
  'doc.list.subtitleUnlimited': 'Sube todos los documentos que necesites.',
  'drone.publish.notLive': 'Cambios guardados, pero la página pública no se ha actualizado. Vuelve a intentarlo en un momento.',
  'drone.insuranceLink.hint': 'Elige una de las pólizas que has subido; se mostrará en la página pública del dron.',
  'error.locked': 'Estos datos se bloquean tras el primer guardado. Contacta con soporte para modificarlos.',
  'error.suspended': 'Este elemento ha sido suspendido por un administrador. Contacta con soporte para más información.',
  'error.quota': 'Has alcanzado el límite de tu plan.',
  'error.invalidLink': 'El vínculo seleccionado no es válido. Actualiza la página y vuelve a intentarlo.',
  'error.emailInUse': 'Esta dirección de correo ya la usa otra cuenta.',
  'error.session': 'Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.',
  'error.permission': 'No tienes permiso para realizar esta acción.',
  'error.notFound': 'No encontrado: puede que se haya eliminado.',
  'error.rateLimited': 'Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.',
  'error.server': 'El servidor no ha respondido correctamente. Vuelve a intentarlo en un momento.',
  'error.network': 'Conexión ausente o inestable. Comprueba tu red y vuelve a intentarlo.',
  'reportFound.errorRateLimited': 'Has enviado demasiados avisos. Vuelve a intentarlo en unos minutos.',
  'reportFound.errorUnavailable': 'Ahora mismo no se pueden enviar avisos para este dron.',
  'account.verification.reasonLine': 'Motivo: {reason}',
  'admin.verify.reason.label': 'Motivo del rechazo (opcional)',
  'admin.verify.reason.placeholder': 'P. ej., documento caducado o ilegible',
  'admin.verify.reason.confirm': 'Confirmar rechazo',
  'admin.support.newConversation': 'Nueva conversación',
  'admin.users.detail.emailHint': 'También cambia el correo de acceso; el usuario tendrá que verificarlo de nuevo.',
  'admin.users.detail.droneCount': 'Drones registrados: {count}',
  'admin.slots.notEnforced': 'Los límites de espacios están desactivados: estos valores se guardan pero no bloquean al usuario.',
  'admin.reports.ownerRead': 'Leído por el propietario',
  'admin.reports.ownerUnread': 'Aún no leído por el propietario',
  'admin.nfc.baseUrl': 'URL base de las insignias: {url}',
  'pricing.checkout.error.invalid_json': 'Solicitud no válida. Actualiza la página y vuelve a intentarlo.',
  'pricing.checkout.error.checkout_failed': 'No hemos podido registrar tu solicitud. Vuelve a intentarlo en un momento.',
  'account.dashboard.greetingAnon': '¡Hola!',
  'account.identity.name': 'Nombre y apellidos',
  'account.identity.completeHint': 'Tu nombre aún no está registrado. Introdúcelo una vez y aparecerá en tu perfil público. Para cambios posteriores, contacta con soporte.',
  'account.plan.subtitleUnlimited': 'Resumen de lo que has registrado. Ahora mismo no hay límites.',
  'drone.catalog.classUnknown': 'N/D',
  'drone.catalog.note.mini4pro': 'UE: C0 de serie, C1 con actualización',
  'reportFound.geolocation.hint': 'Opcional: ayuda al propietario a encontrar el dron más rápido. Tu navegador te pedirá permiso.',
  'admin.notify.reason.email_not_configured': 'el envío de correos no está configurado en el servidor',
  'admin.notify.reason.no_recipient_email': 'la cuenta no tiene dirección de correo',
  'admin.notify.reason.no_recipient': 'la cuenta no tiene dirección de correo',
  'admin.notify.reason.email_provider_auth_failed': 'la clave del servicio de correo no es válida',
  'admin.notify.reason.email_address_rejected': 'el servicio de correo rechazó la dirección',
  'admin.notify.reason.email_rate_limited': 'demasiados correos enviados, inténtalo más tarde',
  'admin.notify.reason.email_provider_unavailable': 'servicio de correo no disponible temporalmente',
  'admin.notify.reason.email_network_error': 'error de red con el servicio de correo',
  'admin.notify.reason.network': 'error de red',
  'admin.reports.emailSent': 'Propietario avisado por correo',
  'admin.reports.emailNotSent': 'Propietario no avisado por correo ({reason})',
  'admin.notify.reason.email_send_failed': 'el envío falló',
  'admin.support.status.open': 'Pendiente de respuesta',
  'admin.support.status.pending': 'Esperando al usuario',
  'admin.support.status.closed': 'Cerrada',
  'drone.publicLink.title': 'Página pública',
  'drone.publicLink.hint': 'Es la dirección que debes grabar en la insignia NFC o convertir en código QR.',
  'drone.publicLink.copy': 'Copiar enlace',
  'drone.publicLink.open': 'Abrir',
  'drone.publicLink.copyFailed': 'No se pudo copiar: selecciona el enlace y cópialo a mano.',
  'activeOp.empty.addOperator': 'Añadir operador',
  'insurance.row.onPublicPage': 'Se muestra en la página pública del dron',
  'operator.row.publicDronesOne': 'Predeterminado para 1 dron público',
  'operator.row.publicDronesMany': 'Predeterminado para {count} drones públicos',
  'operator.delete.warningPublicOne': 'Este operador es el predeterminado de un dron público. Si lo eliminas, ese dron quedará sin operador predeterminado.',
};
