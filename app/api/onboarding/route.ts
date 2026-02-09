import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Einheit {
  nutzung: 'Wohnen' | 'Gewerbe' | 'Stellplatz';
  flaeche: string;
  kaltmiete: string;
  vergleichsmiete: string;
  mietvertragsart: 'Standard' | 'Index' | 'Staffel';
}

interface OnboardingData {
  // Mandanteninformationen
  name: string;
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
  // Objektdaten
  objekt_strasse: string;
  objekt_plz: string;
  objekt_ort: string;
  gebaeudetyp: string;
  baujahr: string;
  kaufpreis: string;
  kaufdatum: string;
  // Finanzierung
  eigenkapital_prozent: string;
  zinssatz: string;
  tilgung: string;
  // Kosten
  instandhaltung: string;
  verwaltung: string;
  // Einheiten
  einheiten: Einheit[];
}

export async function POST(request: Request) {
  try {
    const data: OnboardingData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.ansprechpartner) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Ansprechpartner sind erforderlich' },
        { status: 400 }
      );
    }

    if (!data.objekt_strasse || !data.objekt_plz || !data.kaufpreis) {
      return NextResponse.json(
        { error: 'Objektadresse und Kaufpreis sind erforderlich' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Check if mandant with this email already exists
    const { data: existingMandant } = await supabase
      .from('mandanten')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingMandant) {
      return NextResponse.json(
        { error: 'Ein Mandant mit dieser E-Mail existiert bereits' },
        { status: 409 }
      );
    }

    // 1. Create Mandant
    const { data: mandant, error: mandantError } = await supabase
      .from('mandanten')
      .insert({
        name: data.name,
        ansprechpartner: data.ansprechpartner,
        position: data.position || null,
        email: data.email,
        telefon: data.telefon || null,
      })
      .select()
      .single();

    if (mandantError) {
      console.error('Mandant creation error:', mandantError);
      throw new Error('Fehler beim Erstellen des Mandanten');
    }

    // Calculate totals from einheiten
    const wohneinheiten = data.einheiten.filter(e => e.nutzung === 'Wohnen').length;
    const gewerbeeinheiten = data.einheiten.filter(e => e.nutzung === 'Gewerbe').length;
    const wohnflaeche = data.einheiten
      .filter(e => e.nutzung === 'Wohnen')
      .reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);
    const gewerbeflaeche = data.einheiten
      .filter(e => e.nutzung === 'Gewerbe')
      .reduce((sum, e) => sum + (parseFloat(e.flaeche) || 0), 0);

    // 2. Create Objekt
    const { data: objekt, error: objektError } = await supabase
      .from('objekte')
      .insert({
        mandant_id: mandant.id,
        strasse: data.objekt_strasse,
        plz: data.objekt_plz,
        ort: data.objekt_ort || null,
        gebaeudetyp: data.gebaeudetyp || null,
        baujahr: data.baujahr ? parseInt(data.baujahr) : null,
        kaufpreis: parseFloat(data.kaufpreis),
        kaufdatum: data.kaufdatum || null,
        eigenkapital_prozent: data.eigenkapital_prozent ? parseFloat(data.eigenkapital_prozent) : 30,
        zinssatz: data.zinssatz ? parseFloat(data.zinssatz) : 3.8,
        tilgung: data.tilgung ? parseFloat(data.tilgung) : 2,
        instandhaltung: data.instandhaltung ? parseFloat(data.instandhaltung) : null,
        verwaltung: data.verwaltung ? parseFloat(data.verwaltung) : null,
        wohneinheiten,
        gewerbeeinheiten,
        wohnflaeche: wohnflaeche || null,
        gewerbeflaeche: gewerbeflaeche || null,
      })
      .select()
      .single();

    if (objektError) {
      console.error('Objekt creation error:', objektError);
      throw new Error('Fehler beim Erstellen des Objekts');
    }

    // 3. Create Einheiten
    if (data.einheiten && data.einheiten.length > 0) {
      const einheitenToInsert = data.einheiten.map((e, index) => ({
        objekt_id: objekt.id,
        position: index + 1,
        nutzung: e.nutzung,
        flaeche: e.flaeche ? parseFloat(e.flaeche) : null,
        kaltmiete: e.kaltmiete ? parseFloat(e.kaltmiete) : null,
        vergleichsmiete: e.vergleichsmiete ? parseFloat(e.vergleichsmiete) : 12,
        mietvertragsart: e.mietvertragsart || 'Standard',
      }));

      const { error: einheitenError } = await supabase
        .from('einheiten')
        .insert(einheitenToInsert);

      if (einheitenError) {
        console.error('Einheiten creation error:', einheitenError);
        // Don't fail completely, mandant and objekt were created
      }
    }

    // 4. Create Anfrage so admin sees there's a new object to analyze
    const { error: anfrageError } = await supabase
      .from('anfragen')
      .insert({
        objekt_id: objekt.id,
        mandant_id: mandant.id,
        status: 'offen',
      });

    if (anfrageError) {
      console.error('Anfrage creation error:', anfrageError);
      // Don't fail completely
    }

    // 5. Optionally send notification via Make.com webhook
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 3,
            type: 'onboarding',
            mandant_name: data.name,
            mandant_email: data.email,
            ansprechpartner: data.ansprechpartner,
            telefon: data.telefon,
            objekt_adresse: `${data.objekt_strasse}, ${data.objekt_plz} ${data.objekt_ort}`,
            kaufpreis: data.kaufpreis,
            einheiten_anzahl: data.einheiten.length,
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      mandant_id: mandant.id,
      objekt_id: objekt.id,
      anfrage_erstellt: !anfrageError,
      message: 'Onboarding erfolgreich abgeschlossen. Anfrage zur Auswertung wurde erstellt.',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Onboarding' },
      { status: 500 }
    );
  }
}
