import { NextResponse } from 'next/server';
import { createAdminClient, generatePassword } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Development only: Create test users with objects and units
export async function POST() {
  // SECURITY: Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed-Route ist in Produktion deaktiviert' },
      { status: 403 }
    );
  }

  // SECURITY: Require admin authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const results: string[] = [];

  try {
    // Check if test customer already exists
    const { data: existingUsers } = await adminClient
      .from('profiles')
      .select('email')
      .eq('email', 'kunde@test.de');

    let mandantId: string;

    if (existingUsers && existingUsers.length > 0) {
      results.push('Test-Kunde existiert bereits');

      // Get the mandant_id for existing user
      const { data: profile } = await adminClient
        .from('profiles')
        .select('mandant_id')
        .eq('email', 'kunde@test.de')
        .single();

      mandantId = profile?.mandant_id;
    } else {
      // Create a test mandant
      const { data: newMandant, error: mandantError } = await adminClient
        .from('mandanten')
        .insert({
          name: 'Demo Kunde GmbH',
          ansprechpartner: 'Max Mustermann',
          email: 'kunde@test.de',
          telefon: '+49 89 123456',
          strasse: 'Leopoldstraße 42',
          plz: '80802',
          ort: 'München',
        })
        .select()
        .single();

      if (mandantError) {
        results.push(`Mandant-Erstellung fehlgeschlagen: ${mandantError.message}`);
        return NextResponse.json({ results });
      }

      mandantId = newMandant.id;
      results.push(`Mandant erstellt: ${newMandant.name}`);

      // Create auth user with secure generated password
      const testPassword = generatePassword(16);
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: 'kunde@test.de',
        password: testPassword,
        email_confirm: true,
        user_metadata: { name: 'Max Mustermann' },
      });

      if (authError) {
        results.push(`Auth-User-Erstellung fehlgeschlagen: ${authError.message}`);
      } else {
        // Use upsert to ensure profile is created even if trigger didn't fire
        await adminClient
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: 'kunde@test.de',
            mandant_id: mandantId,
            name: 'Max Mustermann',
            role: 'mandant',
          });

        results.push(`Test-Kunde erstellt: kunde@test.de / ${testPassword}`);
      }
    }

    // Check if mandant already has the original seed objects
    const { data: existingObjects } = await adminClient
      .from('objekte')
      .select('id')
      .eq('mandant_id', mandantId);

    if (existingObjects && existingObjects.length > 0) {
      results.push(`Mandant hat bereits ${existingObjects.length} Objekt(e) – überspringe Objekte 1 & 2`);
    } else if (mandantId) {
      // Create test objects with units

      // Object 1: Small MFH in Munich
      const { data: objekt1, error: obj1Error } = await adminClient
        .from('objekte')
        .insert({
          mandant_id: mandantId,
          strasse: 'Schwabing Straße 15',
          plz: '80798',
          ort: 'München',
          gebaeudetyp: 'MFH',
          baujahr: 1965,
          wohneinheiten: 6,
          gewerbeeinheiten: 0,
          geschosse: 3,
          wohnflaeche: 420,
          heizungsart: 'Gas',
          kaufpreis: 2800000,
          kaufdatum: '2021-03-15',
          zinssatz: 2.1,
          tilgung: 2,
          eigenkapital_prozent: 25,
          darlehensstand: 2100000,
          betriebskosten_nicht_umlage: 8400,
          instandhaltung: 5000,
          verwaltung: 3600,
          ruecklagen: 2400,
          milieuschutz: true,
          weg_aufgeteilt: false,
        })
        .select()
        .single();

      if (obj1Error) {
        results.push(`Objekt 1 Fehler: ${obj1Error.message}`);
      } else {
        results.push(`Objekt erstellt: ${objekt1.strasse}`);

        // Create units for Object 1
        const units1 = [
          { position: 1, nutzung: 'Wohnen', flaeche: 65, kaltmiete: 780, vergleichsmiete: 14, mietvertragsart: 'Standard' },
          { position: 2, nutzung: 'Wohnen', flaeche: 72, kaltmiete: 850, vergleichsmiete: 14, mietvertragsart: 'Standard' },
          { position: 3, nutzung: 'Wohnen', flaeche: 68, kaltmiete: 720, vergleichsmiete: 14, mietvertragsart: 'Index' },
          { position: 4, nutzung: 'Wohnen', flaeche: 75, kaltmiete: 950, vergleichsmiete: 14, mietvertragsart: 'Standard' },
          { position: 5, nutzung: 'Wohnen', flaeche: 70, kaltmiete: 800, vergleichsmiete: 14, mietvertragsart: 'Standard' },
          { position: 6, nutzung: 'Wohnen', flaeche: 70, kaltmiete: 680, vergleichsmiete: 14, mietvertragsart: 'Staffel' },
        ];

        const { error: units1Error } = await adminClient
          .from('einheiten')
          .insert(units1.map(u => ({ ...u, objekt_id: objekt1.id })));

        if (units1Error) {
          results.push(`Einheiten Objekt 1 Fehler: ${units1Error.message}`);
        } else {
          results.push(`6 Einheiten für Objekt 1 erstellt`);
        }
      }

      // Object 2: Mixed-use building in Stuttgart
      const { data: objekt2, error: obj2Error } = await adminClient
        .from('objekte')
        .insert({
          mandant_id: mandantId,
          strasse: 'Königstraße 88',
          plz: '70173',
          ort: 'Stuttgart',
          gebaeudetyp: 'Wohn- & Geschäftshaus',
          baujahr: 1982,
          wohneinheiten: 8,
          gewerbeeinheiten: 2,
          geschosse: 4,
          wohnflaeche: 560,
          gewerbeflaeche: 180,
          heizungsart: 'Fernwärme',
          kaufpreis: 3500000,
          kaufdatum: '2019-08-01',
          zinssatz: 1.8,
          tilgung: 2.5,
          eigenkapital_prozent: 30,
          darlehensstand: 2100000,
          betriebskosten_nicht_umlage: 12000,
          instandhaltung: 7000,
          verwaltung: 4800,
          ruecklagen: 3600,
          milieuschutz: false,
          weg_aufgeteilt: false,
        })
        .select()
        .single();

      if (obj2Error) {
        results.push(`Objekt 2 Fehler: ${obj2Error.message}`);
      } else {
        results.push(`Objekt erstellt: ${objekt2.strasse}`);

        // Create units for Object 2
        const units2 = [
          { position: 1, nutzung: 'Gewerbe', flaeche: 95, kaltmiete: 1900, vergleichsmiete: 22, mietvertragsart: 'Standard' },
          { position: 2, nutzung: 'Gewerbe', flaeche: 85, kaltmiete: 1700, vergleichsmiete: 22, mietvertragsart: 'Index' },
          { position: 3, nutzung: 'Wohnen', flaeche: 72, kaltmiete: 920, vergleichsmiete: 15, mietvertragsart: 'Standard' },
          { position: 4, nutzung: 'Wohnen', flaeche: 68, kaltmiete: 850, vergleichsmiete: 15, mietvertragsart: 'Standard' },
          { position: 5, nutzung: 'Wohnen', flaeche: 75, kaltmiete: 980, vergleichsmiete: 15, mietvertragsart: 'Standard' },
          { position: 6, nutzung: 'Wohnen', flaeche: 65, kaltmiete: 780, vergleichsmiete: 15, mietvertragsart: 'Index' },
          { position: 7, nutzung: 'Wohnen', flaeche: 70, kaltmiete: 890, vergleichsmiete: 15, mietvertragsart: 'Standard' },
          { position: 8, nutzung: 'Wohnen', flaeche: 70, kaltmiete: 840, vergleichsmiete: 15, mietvertragsart: 'Standard' },
          { position: 9, nutzung: 'Wohnen', flaeche: 68, kaltmiete: 750, vergleichsmiete: 15, mietvertragsart: 'Staffel' },
          { position: 10, nutzung: 'Wohnen', flaeche: 72, kaltmiete: 920, vergleichsmiete: 15, mietvertragsart: 'Standard' },
        ];

        const { error: units2Error } = await adminClient
          .from('einheiten')
          .insert(units2.map(u => ({ ...u, objekt_id: objekt2.id })));

        if (units2Error) {
          results.push(`Einheiten Objekt 2 Fehler: ${units2Error.message}`);
        } else {
          results.push(`10 Einheiten für Objekt 2 erstellt`);
        }
      }
    }

    // Object 3: MFH in Berlin-Charlottenburg with 5 Wohneinheiten (always try to create)
    if (mandantId) {
      const { data: existingObj3 } = await adminClient
        .from('objekte')
        .select('id')
        .eq('mandant_id', mandantId)
        .eq('strasse', 'Kantstraße 34')
        .single();

      if (existingObj3) {
        results.push('Objekt 3 (Kantstraße 34) existiert bereits');
      } else {
        const { data: objekt3, error: obj3Error } = await adminClient
          .from('objekte')
          .insert({
            mandant_id: mandantId,
            strasse: 'Kantstraße 34',
            plz: '10625',
            ort: 'Berlin',
            gebaeudetyp: 'MFH',
            baujahr: 1958,
            wohneinheiten: 5,
            gewerbeeinheiten: 0,
            geschosse: 4,
            wohnflaeche: 345,
            heizungsart: 'Fernwärme',
            kaufpreis: 1950000,
            kaufdatum: '2023-06-01',
            zinssatz: 3.8,
            tilgung: 2,
            eigenkapital_prozent: 30,
            darlehensstand: 1365000,
            betriebskosten_nicht_umlage: 6200,
            instandhaltung: 4500,
            verwaltung: 3000,
            ruecklagen: 2000,
            milieuschutz: true,
            umwandlungsverbot: true,
            weg_aufgeteilt: false,
            denkmalschutz: false,
            aufzug: false,
            leerstandsquote: 0,
            haltedauer: '3-7 Jahre',
            primaeres_ziel: 'Cashflow',
            risikoprofil: 'Core+',
          })
          .select()
          .single();

        if (obj3Error) {
          results.push(`Objekt 3 Fehler: ${obj3Error.message}`);
        } else {
          results.push(`Objekt erstellt: ${objekt3.strasse}, Berlin (5 WE)`);

          const units3 = [
            { position: 1, nutzung: 'Wohnen', flaeche: 62, kaltmiete: 620, vergleichsmiete: 12.50, mietvertragsart: 'Standard', letzte_mieterhoehung: '2024-03-01' },
            { position: 2, nutzung: 'Wohnen', flaeche: 78, kaltmiete: 850, vergleichsmiete: 12.50, mietvertragsart: 'Standard', letzte_mieterhoehung: '2023-09-15' },
            { position: 3, nutzung: 'Wohnen', flaeche: 55, kaltmiete: 490, vergleichsmiete: 12.50, mietvertragsart: 'Standard', letzte_mieterhoehung: '2022-06-01' },
            { position: 4, nutzung: 'Wohnen', flaeche: 82, kaltmiete: 920, vergleichsmiete: 12.50, mietvertragsart: 'Index', letzte_mieterhoehung: '2025-01-01' },
            { position: 5, nutzung: 'Wohnen', flaeche: 68, kaltmiete: 710, vergleichsmiete: 12.50, mietvertragsart: 'Standard', letzte_mieterhoehung: '2024-08-01' },
          ];

          const { error: units3Error } = await adminClient
            .from('einheiten')
            .insert(units3.map(u => ({ ...u, objekt_id: objekt3.id })));

          if (units3Error) {
            results.push(`Einheiten Objekt 3 Fehler: ${units3Error.message}`);
          } else {
            results.push(`5 Wohneinheiten für Objekt 3 erstellt`);
          }
        }
      }
    }
  } catch (error) {
    results.push(`Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`);
  }

  return NextResponse.json({ results });
}
