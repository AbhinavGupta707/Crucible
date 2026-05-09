"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type TransitionContextValue = {
  go: (href: string, label?: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const TRANSITION_DELAY_MS = 620;
const EXIT_DELAY_MS = 420;

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const [label, setLabel] = useState("Opening next step");
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (navTimer.current) clearTimeout(navTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const go = useCallback(
    (href: string, nextLabel?: string) => {
      clearTimers();
      setLabel(nextLabel ?? getTransitionLabel(href));
      setPending(true);
      navTimer.current = setTimeout(() => {
        router.push(href);
      }, TRANSITION_DELAY_MS);
    },
    [clearTimers, router],
  );

  useEffect(() => {
    if (!pending) return;
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setPending(false), EXIT_DELAY_MS);
  }, [pathname, pending]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo(() => ({ go }), [go]);

  return (
    <TransitionContext.Provider value={value}>
      <InternalLinkInterceptor onNavigate={go} />
      {children}
      <TransitionVeil visible={pending} label={label} />
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    return {
      go: (href: string) => {
        window.location.href = href;
      },
    };
  }
  return ctx;
}

function InternalLinkInterceptor({
  onNavigate,
}: {
  onNavigate: (href: string, label?: string) => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(event: globalThis.MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target || anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition === "true") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname && url.hash) return;

      event.preventDefault();
      onNavigate(
        `${url.pathname}${url.search}${url.hash}`,
        anchor.dataset.transitionLabel,
      );
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [onNavigate, pathname]);

  return null;
}

function TransitionVeil({
  visible,
  label,
}: {
  visible: boolean;
  label: string;
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-ink-950/88 px-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          aria-live="polite"
          role="status"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 35%, rgba(91, 211, 255, 0.14), transparent 32%), radial-gradient(circle at 50% 70%, rgba(255, 138, 42, 0.11), transparent 36%)",
            }}
          />
          <motion.div
            className="glass-strong relative w-full max-w-lg rounded-3xl p-6 text-center"
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.99 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-ember-400/30 bg-ember-400/10 amber-glow">
              <span className="pulse-dot" />
            </div>
            <div className="label">Crucible is moving the run forward</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {label || "Opening next step"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
              Carrying the signal memory, buyer context, and message hypothesis into the next screen.
            </p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-ember-400 via-plasma-300 to-signal-green"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function getTransitionLabel(href: string) {
  if (href.includes("/prospects")) return "Opening Signal Radar";
  if (href.includes("/library")) return "Loading Buyer Memory";
  if (href.includes("/forge")) return "Entering Signal Forge";
  if (href.includes("/monitor")) return "Opening Reply Monitor";
  if (href.includes("/calibration")) return "Preparing Learning Loop";
  if (href.includes("/next-cohort")) return "Generating Next Signal Cohort";
  if (href.includes("/settings/gmail")) return "Opening Gmail Controls";
  if (href === "/" || href.startsWith("/?")) return "Returning to Simulation Lab";
  return "Opening next step";
}
