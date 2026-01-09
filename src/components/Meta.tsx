import { Helmet } from "react-helmet";

interface MetaProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    canonical?: string;
    type?: "website" | "article" | "profile";
    jsonLd?: object;
    noindex?: boolean;
}

const Meta = ({
    title,
    description,
    keywords,
    image = "/og-image.png",
    canonical,
    type = "website",
    jsonLd,
    noindex
}: MetaProps) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : "https://app.risksignal.name.ng/";
    const fullCanonical = canonical || currentUrl;
    const fullTitle = title ? `${title} | RiskSignal` : "RiskSignal — Cyber-Asset Attack Surface Management & Reconnaissance Hub";

    const defaultDescription = "RiskSignal is a high-performance Cyber-Asset Attack Surface Management (CAASM) platform. We provide deep reconnaissance, automated asset discovery, real-time vulnerability mapping, and distributed threat intelligence. Identify shadow IT, monitor digital footprints, and secure your external attack surface instantly.";
    const fullDescription = description || defaultDescription;

    const defaultKeywords = "ASM, EASM, CAASM, Attack Surface Management, Cyber Asset Discovery, Threat Intelligence, Digital Footprint Mapping, Vulnerability Reconnaissance, Shadow IT Monitoring, External Asset Management, Security Intelligence Platform, Infrastructure Visibility, API Recon, Network Asset Tracker.";
    const fullKeywords = keywords || defaultKeywords;

    const defaultJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "RiskSignal",
        "operatingSystem": "Web",
        "applicationCategory": "SecurityApplication",
        "description": defaultDescription,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    const finalJsonLd = jsonLd || defaultJsonLd;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={fullDescription} />
            <meta name="keywords" content={fullKeywords} />
            <meta name="author" content="RiskSignal Labs" />
            <meta name="theme-color" content="#030712" />
            <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="RiskSignal" />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullCanonical} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={fullDescription} />
            <meta property="twitter:image" content={image} />
            <meta property="twitter:site" content="@RiskSignal" />

            {/* Standard JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(finalJsonLd)}
            </script>
        </Helmet>
    );
};

export default Meta;
