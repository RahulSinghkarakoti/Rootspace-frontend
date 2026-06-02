import { useState } from "react";
import * as Separator from "@radix-ui/react-separator";

const PRIVACY_SECTIONS = [
  {
    heading: "Information We Collect",
    prose: "When you use our Family Tree platform, we may collect:",
    items: [
      "Account information (name, email address, profile photo)",
      "Authentication data from OAuth providers such as Google",
      "Family member information entered by users",
      "Photos, documents, and media uploaded to the platform",
      "Relationship and family tree data",
      "Education and personal profile details voluntarily provided by users",
      "Technical information such as browser type, device information, and IP address",
    ],
  },
  {
    heading: "How We Use Your Information",
    prose: "We use collected information to:",
    items: [
      "Create and manage your account",
      "Build and display family trees",
      "Store and organize uploaded media and documents",
      "Authenticate users securely",
      "Improve platform functionality and user experience",
      "Protect against unauthorized access and abuse",
    ],
  },
  {
    heading: "Data Ownership",
    prose:
      "Users retain ownership of the information, media, and family tree data they upload.",
  },
  {
    heading: "Sharing of Information",
    prose: "We do not sell personal information. Information may only be shared:",
    items: [
      "With family members or users you explicitly grant access to",
      "With trusted service providers necessary to operate the platform",
      "When required by applicable law",
    ],
  },
  {
    heading: "Media Storage",
    prose:
      "Photos, documents, and other uploaded files are stored securely through our hosting and storage providers. Users are responsible for ensuring they have permission to upload and share media containing other individuals.",
  },
  {
    heading: "OAuth Authentication",
    prose:
      "If you sign in using third-party authentication providers such as Google, we receive only the information authorized by you through that provider. We do not receive or store your third-party account passwords.",
  },
  {
    heading: "Data Retention",
    prose:
      "We retain data for as long as your account remains active or as required for operational, legal, and security purposes.",
  },
  {
    heading: "Account Deletion",
    prose:
      "Users may request deletion of their account and associated personal data. Some information may remain in backups for a limited period for security and recovery purposes.",
  },
  {
    heading: "Children's Privacy",
    prose:
      "The platform is not intended for independent use by children without appropriate parental or guardian supervision.",
  },
  {
    heading: "Contact",
    prose: "For privacy-related questions, contact us at:",
    contact: "support@yourdomain.com",
  },
];

const SAFETY_SECTIONS = [
  {
    heading: "Account Security",
    items: [
      "Secure authentication mechanisms",
      "OAuth login support via trusted providers",
      "Passwords stored using industry-standard hashing algorithms",
      "Protection against unauthorized access attempts",
    ],
  },
  {
    heading: "Data Protection",
    items: [
      "Encrypted communication using HTTPS",
      "Restricted access to stored user information",
      "Regular monitoring of system security",
    ],
  },
  {
    heading: "Family Information Responsibility",
    prose: "Users are responsible for:",
    items: [
      "Ensuring information they upload is accurate",
      "Respecting the privacy of family members",
      "Obtaining appropriate consent before sharing sensitive information, photos, or documents",
    ],
  },
  {
    heading: "Content Guidelines",
    prose: "Users must not upload:",
    items: [
      "Illegal content",
      "Harmful or abusive material",
      "Content that infringes copyrights or privacy rights",
      "Malware or malicious files",
    ],
  },
  {
    heading: "Reporting Issues",
    prose:
      "Users may report security concerns, privacy issues, or inappropriate content through our support channels.",
    contact: "support@yourdomain.com",
  },
];

function DocSection({ heading, prose, items, contact }:{
  heading: string;
  prose?: string;
  items?: string[];
  contact?: string;
}) {
  return (
    <section className="mb-7">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-3">
        {heading}
      </h2>
      {prose && (
        <p className="text-sm text-secondary-foreground leading-relaxed mb-2">{prose}</p>
      )}
      {items && (
        <ul className="pl-4 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-secondary-foreground leading-relaxed list-disc list-outside">
              {item}
            </li>
          ))}
        </ul>
      )}
      {contact && (
        <a
          href={`mailto:${contact}`}
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-800 transition-colors"
        >
          {contact}
        </a>
      )}
    </section>
  );
}

export default function PrivacySafetyPage() {
  const [tab, setTab] = useState("privacy");

  const sections = tab === "privacy" ? PRIVACY_SECTIONS : SAFETY_SECTIONS;

  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-background scrollbar-hide">
      <div className="max-w-2xl mx-auto p-4">


        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">
          {tab === "privacy" ? "Privacy Policy" : "Safety & Security"}
        </h1>

        {/* Meta line */}
        <p className="text-xs text-zinc-400 mb-6">
          {tab === "privacy" ? "Last updated: May 2026" : "Family Tree Platform"}
        </p>

        <Separator.Root className="h-px bg-border mb-8" />

        {/* Tab switcher — plain text links */}
        <div className="flex gap-5 mb-10">
          <button
            onClick={() => setTab("privacy")}
            className={`text-xs font-mono tracking-wide transition-colors ${tab === "privacy"
              ? "text-foreground border-b border-foreground pb-0.5"
              : "text-zinc-400 hover:text-secondary-foreground"
              }`}
          >
            privacy-policy
          </button>
          <button
            onClick={() => setTab("safety")}
            className={`text-xs font-mono tracking-wide transition-colors ${tab === "safety"
              ? "text-foreground border-b border-foreground pb-0.5"
              : "text-zinc-400 hover:text-secondary-foreground"
              }`}
          >
            safety-security
          </button>
        </div>

        {/* Sections */}
        <div>
          {sections.map((s, i) => (
            <div key={i}>
              <DocSection {...s} />
              {i < sections.length - 1 && (
                <Separator.Root className="h-px bg-zinc-100 mb-7" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <Separator.Root className="h-px bg-border mt-10 mb-6" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          For a production application, also consider adding a Terms of Service,
          Cookie Policy, Data Deletion Request page, and Contact/Support page.
        </p>
      </div>
    </div>
  );
}