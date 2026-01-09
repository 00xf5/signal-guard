import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
    {
        question: "How does RiskSignal map the external attack surface?",
        answer: "RiskSignal uses a recursive discovery engine that ingests root domains and IP ranges. By correlating Certificate Transparency (CT) logs, Passive DNS, and service finger-printing, the platform builds a comprehensive map of managed and unmanaged (Shadow IT) assets."
    },
    {
        question: "What is infrastructure drift detection?",
        answer: "Infrastructure drift occurs when the state of your network changes—such as a new open port, a certificate renewal, or a DNS change. RiskSignal captures point-in-time snapshots and uses SHA-256 state hashing to alert you the moment your footprint deviates from its known secure state."
    },
    {
        question: "How does JS-ASM Elite identify leaks?",
        answer: "The kernel downloads and de-minifies public JavaScript bundles. It then performs AST analysis and pattern matching across 120+ secret types (AWS, Stripe, Firebase) and maps out all internal API endpoints to identify potential logic vulnerabilities."
    },
    {
        question: "Can I monitor multiple organizations?",
        answer: "Yes. RiskSignal is built for multi-entity visibility. You can manage multiple organizations within the inventory matrix, each with its own isolated asset tree, discovery schedule, and alert configuration."
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
                            RiskSignal checks connections by cross-referencing geolocation,
                            ASN reputation, and browser signals to deliver an accurate risk profile.
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
