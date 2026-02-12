import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { OnboardingFunnelPDF } from '@/components/pdf/onboarding-funnel-pdf';

export async function GET() {
  try {
    const pdfBuffer = await renderToBuffer(<OnboardingFunnelPDF />);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Onboarding-Funnel-Dokumentation.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Generieren des PDFs' },
      { status: 500 }
    );
  }
}
