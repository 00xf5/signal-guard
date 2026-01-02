import { Helmet } from "react-helmet";

interface MetaProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    canonical?: string;
    type?: "website" | "article" | "profile";
    jsonLd?: object;
}

const Meta = ({
    title,
    description,
    keywords,
    image = "/og-image.png",
    canonical = "https://risksignal-tau.vercel.app/",
    type = "website",
    jsonLd
}: MetaProps) => {
    const fullTitle = title ? `${title} | RiskSignal` : "RiskSignal — IP Intelligence & Reputation Audit";
    const fullDescription = description || "Comprehensive IP risk scoring, real-time port scanning, and vulnerability intelligence. Detect VPN, Proxy, and Tor infrastructure instantly.";
    const fullKeywords = keywords || "IP WHOIS, Port Scanner Online, DMARC Validator, IP Reputation, VPN Detection, Threat Intelligence, CVE Lookup, Blacklist Checker";

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={fullDescription} />
            <meta name="keywords" content={fullKeywords} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={fullDescription} />
            <meta property="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default Meta;
