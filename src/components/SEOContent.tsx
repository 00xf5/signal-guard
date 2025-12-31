import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
    {
        question: "How does RiskSignal detect VPNs and Proxies?",
        answer: "RiskSignal uses a combination of real-time IP metadata analysis and browser-side signal detection. We check if the IP belongs to a known Data Center (Hosting) provider, analyze the connection headers, and detect inconsistencies like Timezone Mismatches between your device and the IP's location."
    },
    {
        question: "What is an Anonymity Score?",
        answer: "The Anonymity Score (0-100%) represents the likelihood that an actor is trying to hide their real identity. A high score is triggered by Tor exit nodes, public VPNs, or device/IP discrepancies that suggest spoofing."
    },
    {
        question: "Can RiskSignal identify residential proxies?",
        answer: "Yes. By correlating ISP data with connection behavior and ASN reputation, RiskSignal can distinguish between true residential connections and commercial proxy services masquerading as consumers."
    },
    {
        question: "Is my data stored during an IP lookup?",
        answer: "No. RiskSignal is a privacy-first tool. Lookups are processed in real-time, and we do not log or store individual IP searches, keeping your intelligence gather efforts completely private."
    }
];

const SEOContent = () => {
    return (
        <section className="py-24 border-t border-border bg-secondary/10">
            <div className="container max-w-4xl">
                <ScrollReveal>
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        Technical FAQ
                    </h2>

                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-12">
                        <p>
                            RiskSignal facilitates verification of connections by cross-referencing geolocation,
                            ASN reliability, and browser-level signals to deliver an accurate risk profile.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`}>
                                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollReveal>
            </div>
        </section>
    );
};

export default SEOContent;
