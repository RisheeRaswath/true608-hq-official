import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: 'I already use ServiceTitan/Jobber. Why do I need True608?',
    answer: 'ServiceTitan and Jobber handle your operations and invoicing—they don\'t handle Federal Compliance. True608 is the Missing Compliance Layer that integrates seamlessly with your existing ERP. We provide Federal Ready Logs with Audit Immunity, keeping your $100 Million business protected from EPA enforcement. Your financial data stays separate from your legal compliance—exactly as federal auditors require.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Bank-Level 256-bit AES encryption. Federal-Grade Vault storage with mandatory 3-year retention. SOC 2 Type II compliance. All data encrypted at rest and in transit. Your compliance records are protected with the same security standards used by Fortune 500 companies. Your $100 Million business deserves nothing less.',
  },
  {
    question: 'The mandates are active now. Am I too late?',
    answer: 'No. The AIM Act mandates are now in effect, and enforcement is active. Small systems under 15 lbs now require the same rigorous tracking as commercial units. Penalties have increased, and EPA audits are happening. True608 is your immediate path to compliance—protecting your business from fines that can reach $37,500 per violation. Start logging today.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Under 5 minutes. Create an account, add your technicians, and start logging. No hardware required. No IT department needed. Your first Federal Ready Log can be created today. Your $100 Million business can be fully compliant before your next service call.',
  },
  {
    question: 'What if I get audited?',
    answer: 'True608 provides Audit Immunity through Federal Ready Logs. Every timestamp is cryptographically verified, all data is immutable, and your complete 3-year history is instantly accessible. Generate audit-ready reports with a single click. Your auditor will have everything they need—and your business will be protected. This is why CEOs trust True608.',
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-wide text-foreground mb-3 font-sans">
              Common Questions
            </h2>
            <p className="text-muted-foreground">
              What HVAC contractors ask before securing their compliance
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-8">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 font-sans font-bold tracking-wide">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
