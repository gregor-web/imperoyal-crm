import { z } from 'zod';

// Helper to coerce string 'true'/'false' from Select inputs to boolean
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val): boolean => {
    if (typeof val === 'boolean') return val;
    return val === 'true';
  })
  .pipe(z.boolean())
  .default(false);

// =====================================================
// MANDANT
// =====================================================

export const mandantSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  ansprechpartner: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  telefon: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  land: z.string().default('Deutschland'),
  kontaktart: z.string().optional(),
});

export type MandantInput = z.infer<typeof mandantSchema>;

// =====================================================
// OBJEKT
// =====================================================

export const objektSchema = z.object({
  mandant_id: z.string().uuid('Mandant ist erforderlich'),
  strasse: z.string().min(1, 'Straße ist erforderlich'),
  plz: z.string().min(1, 'PLZ ist erforderlich'),
  ort: z.string().min(1, 'Ort ist erforderlich'),
  gebaeudetyp: z.string().optional(),
  baujahr: z.coerce.number().int().min(1800).max(2030).optional().nullable(),
  denkmalschutz: booleanFromString,
  kernsanierung_jahr: z.coerce.number().int().optional().nullable(),
  wohneinheiten: z.coerce.number().int().min(0).default(0),
  gewerbeeinheiten: z.coerce.number().int().min(0).default(0),
  geschosse: z.coerce.number().int().optional().nullable(),
  aufzug: booleanFromString,
  wohnflaeche: z.coerce.number().min(0).optional().nullable(),
  gewerbeflaeche: z.coerce.number().min(0).optional().nullable(),
  grundstueck: z.coerce.number().min(0).optional().nullable(),
  heizungsart: z.string().optional(),
  weg_aufgeteilt: booleanFromString,
  weg_geplant: booleanFromString,
  milieuschutz: booleanFromString,
  umwandlungsverbot: booleanFromString,
  kaufpreis: z.coerce.number().min(1, 'Kaufpreis ist erforderlich'),
  kaufdatum: z.string().optional().nullable(),
  grundstueck_wert: z.coerce.number().optional().nullable(),
  gebaeude_wert: z.coerce.number().optional().nullable(),
  darlehensstand: z.coerce.number().optional().nullable(),
  zinssatz: z.coerce.number().min(0).max(20).default(3.8),
  tilgung: z.coerce.number().min(0).max(20).default(2),
  eigenkapital_prozent: z.coerce.number().min(0).max(100).default(30),
  leerstandsquote: z.coerce.number().min(0).max(100).optional().nullable(),
  betriebskosten_nicht_umlage: z.coerce.number().optional().nullable(),
  instandhaltung: z.coerce.number().optional().nullable(),
  verwaltung: z.coerce.number().optional().nullable(),
  ruecklagen: z.coerce.number().optional().nullable(),
  capex_vergangen: z.string().optional(),
  capex_geplant: z.string().optional(),
  capex_geplant_betrag: z.coerce.number().optional().nullable(),
  mietpreisbindung: booleanFromString,
  sozialbindung: booleanFromString,
  modernisierungsstopp: booleanFromString,
  gewerbe_sonderklauseln: booleanFromString,
  haltedauer: z.string().optional(),
  primaeres_ziel: z.string().optional(),
  investitionsbereitschaft: z.string().optional(),
  risikoprofil: z.string().optional(),
});

export type ObjektInput = z.infer<typeof objektSchema>;

// =====================================================
// EINHEIT
// =====================================================

export const einheitSchema = z.object({
  objekt_id: z.string().uuid().optional(),
  position: z.coerce.number().int().min(1),
  nutzung: z.enum(['Wohnen', 'Gewerbe', 'Stellplatz']),
  flaeche: z.coerce.number().min(0).optional().nullable(),
  kaltmiete: z.coerce.number().min(0).optional().nullable(),
  vergleichsmiete: z.coerce.number().min(0).default(12),
  mietvertragsart: z.enum(['Standard', 'Index', 'Staffel']).default('Standard'),
  letzte_mieterhoehung: z.string().optional().nullable(),
});

export type EinheitInput = z.infer<typeof einheitSchema>;

export const einheitenArraySchema = z.array(einheitSchema);

// =====================================================
// ANKAUFSPROFIL
// =====================================================

export const ankaufsprofilSchema = z.object({
  mandant_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name ist erforderlich'),
  min_volumen: z.coerce.number().min(0).optional().nullable(),
  max_volumen: z.coerce.number().min(0).optional().nullable(),
  assetklassen: z.array(z.string()).default([]),
  regionen: z.string().optional(),
  rendite_min: z.coerce.number().min(0).max(100).optional().nullable(),
  sonstiges: z.string().optional(),
});

export type AnkaufsprofilInput = z.infer<typeof ankaufsprofilSchema>;

// =====================================================
// AUTH
// =====================================================

export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// =====================================================
// ANFRAGE
// =====================================================

export const anfrageSchema = z.object({
  objekt_id: z.string().uuid(),
  mandant_id: z.string().uuid(),
});

export type AnfrageInput = z.infer<typeof anfrageSchema>;
