import { Link } from 'react-router-dom'
import { TreePine, GitBranch, Share2, Search, ArrowRight, Star, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/appStore'
import { Sun, Moon } from 'lucide-react'

const features = [
  {
    icon: GitBranch,
    title: 'Interactive Tree Builder',
    description: 'Drag, drop, and connect family members on a beautiful visual canvas. Build your tree with an intuitive editor.',
  },
  {
    icon: Search,
    title: 'Ancestral Search',
    description: 'Search through millions of ancestral records. Discover relatives you never knew existed with our AI-powered matching.',
  },
  {
    icon: Share2,
    title: 'Shareable Links',
    description: 'Generate a unique link and share your family tree with relatives worldwide. Control who can view or collaborate.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your family data is encrypted and private by default. You decide exactly what to share and with whom.',
  },
]

const stats = [
  { label: 'Family Trees Built', value: '2.4M+' },
  { label: 'Ancestors Discovered', value: '180M+' },
  { label: 'Families Connected', value: '840K+' },
]

export default function LandingPage() {
  const { toggleTheme, theme } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/30">
              <TreePine className="h-4.5 w-4.5 text-amber-950" />
            </div>
            <span className="font-display text-xl font-bold">
              Root<span className="text-amber-500">Space</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Stories', 'About'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="gold" size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="gold" className="mb-6 px-4 py-1.5 text-xs">
            <Star className="mr-1.5 h-3 w-3" />
            Trusted by 840,000+ families worldwide
          </Badge>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Discover Your{' '}
            <span className="gold-shimmer">Family Legacy</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Build beautiful family trees, uncover ancestral stories, and connect with relatives across generations — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="gold" size="lg" className="gap-2 px-8 text-base shadow-xl shadow-amber-500/20">
                Start Your Tree Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 text-base">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Tree preview placeholder */}
          <div className="mt-16 relative mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                <div className="flex gap-1.5">
                  {['bg-red-400', 'bg-amber-400', 'bg-green-400'].map((c, i) => (
                    <div key={i} className={`h-3 w-3 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex-1 mx-4 h-5 rounded-md bg-border/50 text-xs flex items-center px-3 text-muted-foreground">
                  rootspace.app/tree/johnson-family
                </div>
              </div>
              <div className="h-64 bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 opacity-60">
                  {/* Simple tree visual */}
                  <div className="flex items-center gap-8">
                    {[['GM', 'text-pink-400'], ['GF', 'text-blue-400']].map(([l, c]) => (
                      <div key={l} className="flex flex-col items-center">
                        <div className={`h-12 w-12 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-bold ${c}`}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-16 border-t-2 border-border" />
                    <div className="h-12 w-12 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-500">You</div>
                    <div className="h-8 w-16 border-t-2 border-border" />
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex gap-8">
                    {['C1', 'C2', 'C3'].map((l) => (
                      <div key={l} className="h-10 w-10 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">{l}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <p className="font-display text-3xl md:text-4xl font-bold text-amber-500">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-amber-500">Tell Your Story</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools built for family historians, casual genealogists, and everyone in between.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex gap-5 p-6 rounded-2xl border border-border bg-card hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-background border border-amber-500/20 p-12">
            <Users className="h-12 w-12 text-amber-500 mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold mb-4">
              Start Building Your Family Tree Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Free forever for up to 3 family trees. No credit card required.
            </p>
            <Link to="/register">
              <Button variant="gold" size="lg" className="gap-2 px-10 shadow-xl shadow-amber-500/20">
                Create Your Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TreePine className="h-4 w-4 text-amber-500" />
            <span className="font-display font-bold">RootSpace</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RootSpace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
