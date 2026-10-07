import { describe, expect, it } from 'vitest';
import { parsePolicyPdfText } from '@/lib/insurance/parsePolicyPdf';

describe('parsePolicyPdfText', () => {
  it('reads a label: value holder line without swallowing the following lines', () => {
    const parsed = parsePolicyPdfText(
      [
        'Polizza n. DT-2026-0001',
        'Contraente: Luca Rossi',
        'Compagnia: Test Assicurazioni SpA',
        'Valida dal 01/01/2026 al 31/12/2026',
      ].join('\n'),
    );
    expect(parsed.holderName).toBe('Luca Rossi');
    expect(parsed.policyNumber).toBe('DT-2026-0001');
    expect(parsed.issueDate).toBe('2026-01-01');
    expect(parsed.expiryDate).toBe('2026-12-31');
  });

  it('accepts a typographic apostrophe in "Nome dell’assicurato"', () => {
    const parsed = parsePolicyPdfText('Nome dell\u2019assicurato: Anna Bianchi\nUso: ricreativo');
    expect(parsed.holderName).toBe('Anna Bianchi');
  });

  it('still reads table layouts where the value follows the header on the next line', () => {
    const parsed = parsePolicyPdfText('Contraente\nMario Verdi Premio 120 EUR');
    expect(parsed.holderName).toBe('Mario Verdi');
  });
});
