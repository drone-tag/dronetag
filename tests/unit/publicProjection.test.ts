import { describe, expect, it } from 'vitest';

import { projectSnapshot } from '@/lib/firebase/dronesPublic';
import { maskPolicyNumber, toPublicDroneCard } from '@/lib/utils/publicProjection';
import type { Drone, Insurance, Operator, Pilot } from '@/lib/types/entities';

/**
 * These tests guard the single most privacy-sensitive boundary in the
 * product: what an anonymous visitor sees after scanning an NFC badge.
 *
 * The rule they encode is deliberately blunt — the public snapshot must
 * never carry a link to the original insurance PDF, and must never carry
 * any of the identity fields the projection is supposed to strip. A
 * regression here is a data breach, not a bug, so the assertions check the
 * serialised payload rather than individual properties: that way a newly
 * added field cannot slip through unnoticed.
 */

const PRIVATE_MARKERS = {
  phone: '+39 333 1112223',
  address: 'Via Privata 1, 20100 Milano',
  dateOfBirth: '1985-04-12',
  vat: 'IT01234567890',
  controllerSerial: 'CTRL-SECRET-9999',
  policyNumber: 'POL-987654321-ZZ',
  pdfUrl: 'https://firebasestorage.googleapis.com/v0/b/x/o/users%2Fu1%2Fpolicy.pdf?token=abc',
  internalNotes: 'internal underwriter note',
} as const;

function makeDrone(overrides: Partial<Drone> = {}): Drone {
  return {
    id: 'drone-1',
    userId: 'user-1',
    slug: 'abcd1234',
    manufacturer: 'DJI',
    model: 'Mavic 3',
    classMarking: 'C1',
    droneSerialNumber: 'SN-PUBLIC-123',
    controllerSerialNumber: PRIVATE_MARKERS.controllerSerial,
    linkedPilotId: 'pilot-1',
    defaultOperatorId: 'op-1',
    activeOperatorId: '',
    activeOperatorUntil: '',
    insuranceId: 'ins-1',
    status: 'active',
    visibility: 'public',
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-01-01T00:00:00.000Z',
    publishedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Drone;
}

function makeInsurance(overrides: Partial<Insurance> = {}): Insurance {
  return {
    id: 'ins-1',
    userId: 'user-1',
    provider: 'Coverdrone',
    policyNumber: PRIVATE_MARKERS.policyNumber,
    issueDate: '2026-01-01',
    expiryDate: '2099-01-01',
    pdfUrl: PRIVATE_MARKERS.pdfUrl,
    notes: PRIVATE_MARKERS.internalNotes,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Insurance;
}

function makePilot(overrides: Partial<Pilot> = {}): Pilot {
  return {
    id: 'pilot-1',
    userId: 'user-1',
    firstName: 'Marco',
    lastName: 'Rossi',
    email: 'marco@example.com',
    phone: PRIVATE_MARKERS.phone,
    address: PRIVATE_MARKERS.address,
    dateOfBirth: PRIVATE_MARKERS.dateOfBirth,
    nationality: 'IT',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Pilot;
}

function makeOperator(overrides: Partial<Operator> = {}): Operator {
  return {
    id: 'op-1',
    userId: 'user-1',
    kind: 'company',
    company: {
      companyName: 'Alpine Drones SRL',
      vat: PRIVATE_MARKERS.vat,
      address: PRIVATE_MARKERS.address,
      email: 'info@alpine.example',
      phone: PRIVATE_MARKERS.phone,
    },
    private: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Operator;
}

describe('maskPolicyNumber', () => {
  it('keeps only the first and last characters visible', () => {
    expect(maskPolicyNumber('ABC-12345-XY', 3)).toBe('ABC******-XY');
  });

  it('preserves length so the mask does not hint at the original', () => {
    const raw = 'POL-987654321-ZZ';
    expect(maskPolicyNumber(raw)).toHaveLength(raw.length);
  });

  it('degrades gracefully on short input rather than leaking a pattern', () => {
    expect(maskPolicyNumber('AB', 3)).toBe('AB');
  });

  it('returns an empty string for empty input', () => {
    expect(maskPolicyNumber('   ')).toBe('');
  });
});

describe('projectSnapshot — public snapshot written to dronesPublic/{slug}', () => {
  const snapshot = projectSnapshot(
    makeDrone(),
    makeOperator(),
    makePilot(),
    makeInsurance(),
    { profilePhotoUrl: 'https://cdn/p.jpg', logoUrl: '', bannerUrl: '' },
    [],
  );
  const serialised = JSON.stringify(snapshot);

  it('never carries the insurance PDF URL (PRV-001 / SEC-007)', () => {
    expect(serialised).not.toContain(PRIVATE_MARKERS.pdfUrl);
    expect(serialised).not.toContain('policy.pdf');
    expect(snapshot).not.toHaveProperty('insurancePdfUrl');
  });

  it('never carries the unmasked policy number', () => {
    expect(serialised).not.toContain(PRIVATE_MARKERS.policyNumber);
    expect(snapshot.insuranceMaskedPolicyNumber).toBe(
      maskPolicyNumber(PRIVATE_MARKERS.policyNumber),
    );
  });

  it.each(Object.entries(PRIVATE_MARKERS))(
    'never leaks the private marker %s',
    (_label, value) => {
      expect(serialised).not.toContain(value);
    },
  );

  it('still exposes the data a verifier legitimately needs', () => {
    expect(snapshot.holderDisplayName).toBe('Alpine Drones SRL');
    expect(snapshot.manufacturer).toBe('DJI');
    expect(snapshot.model).toBe('Mavic 3');
    expect(snapshot.droneSerialNumber).toBe('SN-PUBLIC-123');
    expect(snapshot.insuranceProvider).toBe('Coverdrone');
    expect(snapshot.insuranceValidUntil).toBe('2099-01-01');
    expect(snapshot.insuranceStatus).toBe('valid');
  });

  it('reports a missing insurance without inventing a status', () => {
    const noInsurance = projectSnapshot(makeDrone(), makeOperator(), makePilot(), null);
    expect(noInsurance.insuranceStatus).toBe('missing');
    expect(noInsurance.insuranceProvider).toBe('');
    expect(noInsurance.insuranceMaskedPolicyNumber).toBe('');
  });

  it('falls back to the pilot name when no operator is resolved', () => {
    const pilotHeld = projectSnapshot(makeDrone(), null, makePilot(), null);
    expect(pilotHeld.holderKind).toBe('pilot');
    expect(pilotHeld.holderDisplayName).toContain('Marco');
  });
});

describe('toPublicDroneCard — in-memory public card', () => {
  it('does not expose the PDF even when asked to', () => {
    const card = toPublicDroneCard(
      makeDrone(),
      makeOperator(),
      makePilot(),
      makeInsurance(),
      // The old option is deliberately gone; passing it must not resurrect
      // the field. Cast keeps the test honest about the intent.
      { exposePdfUrl: true } as never,
    );
    expect(JSON.stringify(card)).not.toContain(PRIVATE_MARKERS.pdfUrl);
    expect(card.insurance).not.toHaveProperty('pdfUrl');
  });

  it('masks the policy number by default', () => {
    const card = toPublicDroneCard(makeDrone(), makeOperator(), makePilot(), makeInsurance());
    expect(card.insurance.maskedPolicyNumber).not.toBe(PRIVATE_MARKERS.policyNumber);
    expect(card.insurance.maskedPolicyNumber).toContain('*');
  });
});
