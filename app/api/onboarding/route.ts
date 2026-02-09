import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface OnboardingData {
  // Mandanteninformationen
  name: string;
  ansprechpartner: string;
  position: string;
  email: string;
  telefon: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  kontaktart: string;
  // Ankaufsprofil - Allgemein
  kaufinteresse_aktiv: boolean;
  assetklassen: string[];
  // Standortprofil
  regionen: string;
  lagepraeferenz: string[];
  // Finanzielle Parameter
  min_volumen: string;
  max_volumen: string;
  kaufpreisfaktor: string;
  zielrendite_ist: string;
  zielrendite_soll: string;
  finanzierungsform: string;
  // Objektspezifische Kriterien
  zustand: string[];
  baujahr_von: string;
  baujahr_bis: string;
  min_wohnflaeche: string;
  min_gewerbeflaeche: string;
  min_wohneinheiten: string;
  min_gewerbeeinheiten: string;
  min_grundstueck: string;
  // Zusätzliche Angaben
  ausgeschlossene_partner: boolean;
  partner_liste: string;
  besondere_bedingungen: string;
  weitere_projektarten: string;
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
        strasse: data.strasse || null,
        plz: data.plz || null,
        ort: data.ort || null,
        land: data.land || 'Deutschland',
        kontaktart: data.kontaktart || 'E-Mail',
      })
      .select()
      .single();

    if (mandantError) {
      console.error('Mandant creation error:', mandantError);
      throw new Error('Fehler beim Erstellen des Mandanten');
    }

    // 2. Create Ankaufsprofil with extended data stored in sonstiges as JSON
    const extendedData = {
      kaufinteresse_aktiv: data.kaufinteresse_aktiv,
      lagepraeferenz: data.lagepraeferenz,
      kaufpreisfaktor: data.kaufpreisfaktor ? parseFloat(data.kaufpreisfaktor) : null,
      zielrendite_ist: data.zielrendite_ist ? parseFloat(data.zielrendite_ist) : null,
      zielrendite_soll: data.zielrendite_soll ? parseFloat(data.zielrendite_soll) : null,
      finanzierungsform: data.finanzierungsform,
      zustand: data.zustand,
      baujahr_von: data.baujahr_von ? parseInt(data.baujahr_von) : null,
      baujahr_bis: data.baujahr_bis ? parseInt(data.baujahr_bis) : null,
      min_wohnflaeche: data.min_wohnflaeche ? parseFloat(data.min_wohnflaeche) : null,
      min_gewerbeflaeche: data.min_gewerbeflaeche ? parseFloat(data.min_gewerbeflaeche) : null,
      min_wohneinheiten: data.min_wohneinheiten ? parseInt(data.min_wohneinheiten) : null,
      min_gewerbeeinheiten: data.min_gewerbeeinheiten ? parseInt(data.min_gewerbeeinheiten) : null,
      min_grundstueck: data.min_grundstueck ? parseFloat(data.min_grundstueck) : null,
      ausgeschlossene_partner: data.ausgeschlossene_partner,
      partner_liste: data.partner_liste,
      besondere_bedingungen: data.besondere_bedingungen,
      weitere_projektarten: data.weitere_projektarten,
    };

    const { error: profilError } = await supabase
      .from('ankaufsprofile')
      .insert({
        mandant_id: mandant.id,
        name: `Ankaufsprofil ${data.name}`,
        min_volumen: data.min_volumen ? parseFloat(data.min_volumen) : null,
        max_volumen: data.max_volumen ? parseFloat(data.max_volumen) : null,
        assetklassen: data.assetklassen,
        regionen: data.regionen || null,
        rendite_min: data.zielrendite_ist ? parseFloat(data.zielrendite_ist) : null,
        sonstiges: JSON.stringify(extendedData),
      });

    if (profilError) {
      console.error('Ankaufsprofil creation error:', profilError);
      // Don't fail completely, mandant was created
    }

    // 3. Optionally send notification via Make.com webhook
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 3, // New action for onboarding notification
            type: 'onboarding',
            mandant_name: data.name,
            mandant_email: data.email,
            ansprechpartner: data.ansprechpartner,
            telefon: data.telefon,
          }),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      mandant_id: mandant.id,
      message: 'Onboarding erfolgreich abgeschlossen',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Onboarding' },
      { status: 500 }
    );
  }
}
