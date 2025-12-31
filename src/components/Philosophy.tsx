const Philosophy = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground mb-2 text-sm">Traditional tools ask:</p>
              <p className="text-2xl md:text-3xl font-bold">
                "Is this IP flagged?"
              </p>
            </div>

            <div className="text-4xl text-muted-foreground">↓</div>

            <div>
              <p className="text-muted-foreground mb-2 text-sm">We ask:</p>
              <p className="text-2xl md:text-3xl font-bold">
                "Is this connection trustworthy?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
