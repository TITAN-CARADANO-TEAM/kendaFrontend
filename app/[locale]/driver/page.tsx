import { Metadata } from "next";
import { DriverPageContent } from "@/components/driver/DriverPageContent";

export const metadata: Metadata = {
    title: "Devenir Chauffeur KENDA à Goma | Gagnez jusqu'à 500.000 FC/mois",
    description: "Rejoignez KENDA et devenez chauffeur partenaire à Goma. Inscription gratuite, revenus attractifs jusqu'à 500.000 FC/mois, flexibilité totale. Inscrivez-vous maintenant !",
    keywords: [
        "devenir chauffeur Goma",
        "emploi chauffeur RDC",
        "travail taxi Goma",
        "chauffeur KENDA",
        "gagner argent Goma",
        "emploi transport Congo",
        "inscription chauffeur taxi",
        "moto taxi emploi",
        "revenus chauffeur",
        "travail flexible Goma"
    ],
    openGraph: {
        title: "Devenir Chauffeur KENDA - Gagnez jusqu'à 500.000 FC/mois 💰",
        description: "Inscription gratuite, revenus attractifs, vous êtes votre propre patron. Rejoignez la révolution du transport à Goma !",
        url: "https://kenda-appp.vercel.app/driver",
        type: "website",
        images: [
            {
                url: "/og-driver.png",
                width: 1200,
                height: 630,
                alt: "Devenir chauffeur KENDA",
            }
        ],
    },
    alternates: {
        canonical: "https://kenda-appp.vercel.app/driver",
    },
};

export default function DriverPage() {
    return (
        <>
            <DriverPageContent />
            {/* FAQ Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Combien peut-on gagner comme chauffeur KENDA ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Les chauffeurs KENDA peuvent gagner jusqu'à 500.000 FC par mois, en gardant 85% du montant de chaque course."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Quels documents faut-il pour devenir chauffeur ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Vous avez besoin d'un permis de conduire valide, d'une carte rose (preuve de propriété du véhicule), et d'un smartphone."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Combien de temps prend la vérification ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "La vérification des documents prend généralement 24 à 48 heures."
                                }
                            }
                        ]
                    })
                }}
            />
        </>
    );
}

