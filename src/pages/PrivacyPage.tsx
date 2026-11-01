import { Link } from 'react-router-dom'
import { Sun, Moon, ArrowLeft, Shield } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'

const PRIVACY_SECTIONS = [
  {
    title: '1. Information We Collect',
    content: [
      'Account Information: When you create an account, we collect your name, email address, profile credentials, and authentication details.',
      'Family Tree Data: Information you voluntarily provide to construct your family trees, including names, dates, relationship connections, ancestral records, and biographical notes.',
      'Photos & Media: Digital photographs, documents, audio clips, or certificates uploaded to enrich family profiles.',
      'Authentication Data: When using third-party single sign-on (such as Google OAuth), we receive your basic profile identifiers with your authorization. We never receive or store your third-party account password.',
      'Technical & Device Information: Standard telemetry including browser type, operating system, and IP address used strictly for session security and service operation.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'To provide, maintain, and personalize your family tree visualization and collaboration features.',
      'To safeguard your account and verify access permissions across shared trees.',
      'To facilitate secure media storage and document preservation.',
      'To provide user support and respond to inquiries or security reports.',
      'We do not sell, rent, or trade your personal information or family data to third parties or advertisers.',
    ],
  },
  {
    title: '3. Data Ownership & Sharing',
    content: [
      'You retain full ownership of all family history data, names, and media files you upload to RootSpace.',
      'Collaboration and tree sharing are controlled entirely by you. Trees and family records are private by default unless you explicitly share a link or grant collaboration rights to another user.',
      'You are responsible for ensuring you have appropriate consent from living relatives before uploading their sensitive personal information or media.',
    ],
  },
  {
    title: '4. Data Security & Storage',
    content: [
      'All communication with our servers is encrypted in transit using industry-standard Transport Layer Security (TLS/HTTPS).',
      'Media and relational data are stored using enterprise-grade hosting infrastructure with strict access controls.',
      'Passwords are encrypted using secure, one-way cryptographic hashing algorithms.',
    ],
  },
  {
    title: '5. Data Retention & Account Deletion',
    content: [
      'We retain your personal information as long as your account remains active or as required for security, fraud prevention, and regulatory compliance.',
      'You may request the export or complete deletion of your account and associated personal data at any time from your account settings or by contacting our support team.',
    ],
  },
  {
    title: '6. Children’s Privacy',
    content: [
      'RootSpace is designed for family historians and genealogists. It is not directed to children under 13 without direct parental supervision and consent.',
    ],
  },
  {
    title: '7. Contact Us',
    content: [
      'If you have questions or concerns regarding this Privacy Policy or your data rights, please contact our privacy team at support@rootspace.app.',
    ],
  },
]

export default function PrivacyPage() {
  const { toggleTheme, theme } = useAppStore()
  const { isAuthenticated } = useAuthStore()

  const backLink = isAuthenticated ? '/dashboard' : '/login'
  const backLabel = isAuthenticated ? 'Go to Dashboard' : 'Back to Sign In'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to={backLink} className="flex items-center gap-2.5">
            <img src={logoImg} alt="RootSpace" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-display text-xl font-bold">
              Root<span className="text-amber-500">Space</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to={backLink}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                {backLabel}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4 border border-amber-500/20">
            <Shield className="h-3.5 w-3.5" />
            Privacy & Trust
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: May 1, 2026 &bull; Last updated: October 2026
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            At RootSpace, we respect your personal privacy and recognize the deeply personal nature of family history. This policy explains what information we collect, how it is safeguarded, and how you retain control over your data.
          </p>
        </div>

        <div className="space-y-8">
          {PRIVACY_SECTIONS.map((section, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-border/80 transition-colors"
            >
              <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
              <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                {section.content.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold leading-none mt-1">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6 mt-12 bg-muted/20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RootSpace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/tnc" className="hover:text-foreground transition-colors hover:underline">
              Terms &amp; Conditions
            </Link>
            <span>&bull;</span>
            <Link to={backLink} className="hover:text-foreground transition-colors hover:underline">
              {backLabel}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
