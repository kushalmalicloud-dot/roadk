const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-warm-gradient bg-clip-text text-transparent">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Founded in 2018, The Road Kitchen has become a cornerstone of culinary excellence in the heart of the city. 
              Our passion for exceptional cuisine and warm hospitality creates memorable dining experiences for every guest.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Led by Executive Chef Maria Rodriguez, our kitchen team combines traditional techniques with modern innovation, 
              sourcing the finest local ingredients to create dishes that celebrate both flavor and artistry.
            </p>
            
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <div className="text-sm text-muted-foreground">Years of Excellence</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">12</div>
                <div className="text-sm text-muted-foreground">Award-Winning Dishes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Happy Guests Monthly</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 shadow-card">
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Chef's Philosophy
                </h3>
                <blockquote className="text-lg italic text-muted-foreground mb-4 leading-relaxed">
                  "Cooking is not just about feeding the body, it's about nourishing the soul. 
                  Every dish tells a story, every flavor carries an emotion."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-warm-gradient rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Maria Rodriguez</div>
                    <div className="text-sm text-muted-foreground">Executive Chef & Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;