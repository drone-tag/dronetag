/**
 * Real Michele Caffagni branding URLs from production Firestore
 * (`dronesPublic/sj58afq8` → Storage under users/gI1rhpimZtNlPqwcUgUTkvgSrun2).
 * Used by the demo-michele seed so the client demo shows a truthful profile.
 * Private documents (insurance policy PDF) are never referenced here: the
 * demo uses the bundled sample PDF instead.
 */
export const MICHELE_CAFFAGNI_BRANDING = {
  profilePhotoUrl:
    'https://firebasestorage.googleapis.com/v0/b/dronetag-e905d.firebasestorage.app/o/users%2FgI1rhpimZtNlPqwcUgUTkvgSrun2%2Fprofiles%2Faccount%2Fphoto.png?alt=media&token=54f922e3-acc3-454d-803d-1a0473b21d3f',
  logoUrl:
    'https://firebasestorage.googleapis.com/v0/b/dronetag-e905d.firebasestorage.app/o/users%2FgI1rhpimZtNlPqwcUgUTkvgSrun2%2Fprofiles%2Faccount%2Flogo.webp?alt=media&token=6058d610-4967-4eb2-9054-0b418dc575b3',
  bannerUrl:
    'https://firebasestorage.googleapis.com/v0/b/dronetag-e905d.firebasestorage.app/o/users%2FgI1rhpimZtNlPqwcUgUTkvgSrun2%2Fprofiles%2Faccount%2Fbanner.png?alt=media&token=c045cfd8-e482-47fd-9a8c-57e1954cca8a',
  /** Production public slug (Firestore dronesPublic). */
  publicSlug: 'sj58afq8',
  operatorCode: 'ITA532aojeuto7j9',
  operatorLicense: 'ITA-RP-000000522aba',
  companyName: '360° Drone di Michele Caffagni',
  companyDetails:
    'Proprietario e operatore di sistemi aerei senza pilota (UAS). Uso commerciale con copertura mondiale.',
  insuranceProvider: 'Coverdrone',
  insurancePolicyNumber: 'CDA22360114EUR',
  insuranceIssueDate: '2025-09-09',
  insuranceExpiryDate: '2026-09-08',
  insuranceNotes:
    'Responsabilità verso terzi: €1.300.000 per evento. Copertura mondiale. Conforme a Regolamento UE (EC) N. 785/2004.',
} as const;
