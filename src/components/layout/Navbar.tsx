import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CreditCard,
  Globe,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { useTreeStore } from "@/store/treeStore";
import { treesApi } from "@/api/treesApi";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { toggleTheme, theme, toggleSidebar, sidebarCollapsed } = useAppStore();
  const { user, logout, getProfile,getSessionInfo } = useAuth();
  const loadCurrentTree = useTreeStore(s => s.loadCurrentTree)

  const initials =
    `${user?.firstName} ${user?.lastName}`
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "RS";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-md px-3 sidebar-transition",
        "left-0 lg:left-[260px]",
        sidebarCollapsed && "lg:left-[68px]",
      )}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Search bar */}
      {/* <div className="flex flex-1 items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("navbar.searchPlaceholder")}
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div> */}

      <div className="ml-auto flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={t("navbar.toggleTheme")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Language selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={t("navbar.language")}
            >
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[140px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg animate-fade-in"
              align="end"
              sideOffset={6}
            >
              {[
                { code: "en", label: t("navbar.english") },
                { code: "hi", label: t("navbar.hindi") },
              ].map(({ code, label }) => (
                <DropdownMenu.Item
                  key={code}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none transition-colors hover:bg-secondary focus:bg-secondary"
                  onSelect={() => changeLanguage(code)}
                >
                  <span>{label}</span>
                  {i18n.language === code && (
                    <span className="text-amber-500">·</span>
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </Button>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-secondary focus:outline-none">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium leading-none text-foreground">
                  {user?.firstName ?? "User"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0 capitalize">
                  {user?.plan ?? "free"} plan
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[180px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg animate-fade-in"
              align="end"
              sideOffset={6}
            >
              <div className="px-2.5 py-1.5 mb-1">
                <p className="text-xs font-semibold text-foreground">
                  {user?.firstName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {user?.email}
                </p>
                <Badge variant="gold" className="mt-1 text-[8px]">
                  {user?.plan?.toUpperCase()} PLAN
                </Badge>
              </div>

              <DropdownMenu.Separator className="h-px bg-border my-0.5" />

              {[
                { icon: User, label: t("navbar.profile") },
                { icon: Settings, label: t("navbar.settings") },
                { icon: CreditCard, label: t("navbar.billing") },
              ].map(({ icon: Icon, label }) => (
                <DropdownMenu.Item
                  key={label}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none transition-colors hover:bg-secondary focus:bg-secondary"
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {label}
                </DropdownMenu.Item>
              ))}

              <DropdownMenu.Separator className="h-px bg-border my-0.5" />

              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
                onSelect={() => logout()}
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("navbar.signOut")}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
                onSelect={() => getSessionInfo()}
              >
                getSessionInfo
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
