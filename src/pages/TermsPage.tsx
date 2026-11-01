import { Link } from 'react-router-dom'
import { Sun, Moon, ArrowLeft, FileText } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'

const TERMS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using RootSpace, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you must not use or access the service.',
    ],
  },
  {
    title: '2. User Accounts & Security',
    content: [
      'You must register for an account to create, manage, or edit family trees. You agree to provide accurate and complete information during registration.',
      'You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.',
      'You must notify us immediately of any unauthorized use of your account or security breach.',
    ],
  },
  {
    title: '3. User Content & Family Tree Data Ownership',
    content: [
      'You retain all ownership rights in and to the family trees, biographies, images, documents, and other content ("User Content") you submit or upload.',
      'By uploading User Content, you grant RootSpace a worldwide, non-exclusive license solely to host, store, display, and process your content as necessary to operate the service for you and your designated collaborators.',
      'You represent and warrant that you own or have obtained all necessary rights, permissions, and consents from living persons before adding their personal details or photographs.',
    ],
  },
  {
    title: '4. Acceptable Use Policy',
    content: [
      'You agree not to use RootSpace to upload or distribute content that is defamatory, abusive, harassing, obscene, fraudulent, or infringing upon any third party’s intellectual property or privacy rights.',
      'You may not attempt to reverse engineer, probe, scan, or exploit vulnerabilities in our application or API infrastructure.',
      'Automated scraping, bulk harvesting of user data, or unauthorized extraction of family records without explicit authorization is strictly prohibited.',
    ],
  },
  {
    title: '5. Sharing & Collaboration Permissions',
    content: [
      'RootSpace provides features allowing you to share family trees via public or private links and to invite collaborators.',
      'You understand that anyone possessing an active shared link or invited with view/edit access will be able to view and/or modify family tree details according to the permission levels granted by you.',
      'You may revoke shared links or collaborator access at any time from your tree management settings.',
    ],
  },
  {
    title: '6. Intellectual Property of RootSpace',
    content: [
      'The RootSpace brand, platform interface, graphics, interactive tree builder software, and codebase are the proprietary property of RootSpace and its licensors, protected by copyright and intellectual property laws.',
    ],
  },
  {
    title: '7. Termination',
    content: [
      'We reserve the right to suspend or terminate your account and access to the service at our sole discretion, without prior notice, if you breach these Terms and Conditions or engage in unauthorized activity.',
      'You may terminate your account at any time by requesting deletion through your account settings.',
    ],
  },
  {
    title: '8. Disclaimers & Limitation of Liability',
    content: [
      'RootSpace is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.',
      'To the fullest extent permitted by law, RootSpace shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service.',
    ],
  },
  {
    title: '9. Changes to Terms',
    content: [
      'We may update these terms from time to time. When changes occur, we will update the "Last updated" date at the top of this page. Your continued use of the service constitutes acceptance of the revised terms.',
    ],
  },
  {
    title: '10. Contact Information',
    content: [
      'If you have any questions about these Terms & Conditions, please contact us at legal@rootspace.app.',
    ],
  },
]

export default function TermsPage() {
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
            <FileText className="h-3.5 w-3.5" />
            Legal Agreement
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective Date: May 1, 2026 &bull; Last updated: October 2026
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Please read these Terms &amp; Conditions carefully before using the RootSpace service. These terms govern your access to and use of our family tree building platform.
          </p>
        </div>

        <div className="space-y-8">
          {TERMS_SECTIONS.map((section, idx) => (
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
            <Link to="/privacy" className="hover:text-foreground transition-colors hover:underline">
              Privacy Policy
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
