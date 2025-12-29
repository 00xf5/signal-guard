const Philosophy = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-border" />
            PHILOSOPHY
            <span className="w-8 h-px bg-border" />
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground mb-2 text-sm">Most tools ask:</p>
              <p className="text-2xl md:text-3xl font-bold">
                "Is this IP bad?"
              </p>
            </div>

            <div className="text-4xl text-muted-foreground">↓</div>

            <div>
              <p className="text-muted-foreground mb-2 text-sm">RiskSignal asks:</p>
              <p className="text-2xl md:text-3xl font-bold">
                "Can you trust who's behind it?"
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 border border-border inline-block">
            <p className="text-muted-foreground text-sm">
              That difference matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
