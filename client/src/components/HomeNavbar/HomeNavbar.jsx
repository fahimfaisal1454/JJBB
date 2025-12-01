// src/components/navbar/HomeNavbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../Provider/UserProvider";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const HomeNavbar = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [isMainNavOpen, setIsMainNavOpen] = useState(false);

  // Top-right nav links
  const navLinks = [
    { to: "/", label: "Home" },
    ...(user
      ? [
          { to: "/dashboard", label: "Dashboard" },
          {
            to: "/",
            label: "Sign Out",
            onClick: () => {
              signOut();
              navigate("/login");
            },
          },
        ]
      : [{ to: "/login", label: "Login" }]),
  ];

  // Main tile navigation (you can change links/titles to your real pages)
  const mainNav = [
    { title: "About", subtitle: "Who we are", link: "/about" },
    { title: "Programs", subtitle: "Our initiatives", link: "/programs" },
    { title: "Donate", subtitle: "Support us", link: "/donate" },
    { title: "Volunteer", subtitle: "Join our team", link: "/volunteer" },
    { title: "Contact", subtitle: "Get in touch", link: "/contact" },
  ];

  return (
    <header className="w-full border-b border-emerald-900/40 bg-slate-950/95 text-slate-50 backdrop-blur">
      {/* Top utility bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2 gap-3">
          <p className="hidden md:flex items-center gap-2 text-emerald-50/90">
            <span className="h-2 w-2 rounded-full bg-emerald-200 animate-pulse" />
            <span>Smart accounting. Real-time visibility. Better decisions.</span>
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            {navLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="rounded-full border border-emerald-300/40 bg-emerald-900/10 px-3 py-1 text-[11px] sm:text-xs font-medium tracking-wide text-emerald-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                >
                  {link.label}
                </button>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      "rounded-full border px-3 py-1 text-[11px] sm:text-xs font-medium tracking-wide shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
                      isActive
                        ? "border-emerald-100 bg-emerald-50 text-emerald-800 shadow-md"
                        : "border-emerald-300/40 bg-emerald-900/10 text-emerald-50 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md",
                    ].join(" ")
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>

      {/* Brand + mobile toggle */}
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-300 text-slate-950 font-bold shadow-[0_0_24px_rgba(16,185,129,0.55)]">
            JJ
          </div>
          <div className="leading-tight">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
              JoyJatra bBook
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Modern accounting for growing businesses
            </p>
          </div>
        </div>

        {/* Desktop main nav inline (subtle, text-only) */}
        <nav className="hidden lg:flex items-center gap-2 text-sm">
          {mainNav.map(({ title, link }) => (
            <NavLink
              key={title}
              to={link}
              className={({ isActive }) =>
                [
                  "relative rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
                  isActive ? "text-emerald-300" : "text-slate-300",
                ].join(" ")
              }
            >
              <span>{title}</span>
              <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-emerald-400/70 opacity-0 transition-opacity duration-200 group-[.active]:opacity-100" />
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMainNavOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 p-2 text-slate-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-slate-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 lg:hidden"
          aria-label="Toggle menu"
        >
          {isMainNavOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Desktop main navigation tiles */}
      <div className="hidden lg:block border-t border-slate-800 bg-slate-950/95">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-1 py-2">
          {mainNav.map(({ title, subtitle, link }) => (
            <NavLink
              key={title}
              to={link}
              className={({ isActive }) =>
                [
                  "group flex flex-col items-start justify-center gap-1 rounded-xl border px-3 py-3 text-left text-xs transition-all duration-200",
                  "bg-slate-900/70 hover:bg-slate-900 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,118,110,0.45)] hover:border-emerald-500/70 cursor-pointer",
                  isActive
                    ? "border-emerald-500/80 text-emerald-100 shadow-[0_18px_40px_rgba(16,185,129,0.6)]"
                    : "border-slate-800 text-slate-200",
                ].join(" ")
              }
            >
              <p className="flex items-center gap-2 font-semibold tracking-tight">
                <span className="text-[13px]">{title}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </p>
              <p className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-200/80">
                {subtitle}
              </p>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile slide-down main nav */}
      {isMainNavOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98">
          <nav className="px-4 py-3 space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.title}
                to={item.link}
                onClick={() => setIsMainNavOpen(false)}
                className={({ isActive }) =>
                  [
                    "flex flex-col rounded-lg border px-3 py-2 text-sm transition-all duration-200",
                    "bg-slate-900/70 hover:bg-slate-900 hover:-translate-y-0.5 hover:border-emerald-500/70 hover:shadow-lg",
                    isActive
                      ? "border-emerald-500/80 text-emerald-100"
                      : "border-slate-800 text-slate-100",
                  ].join(" ")
                }
              >
                <span className="font-semibold text-[13px]">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {item.subtitle}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HomeNavbar;
