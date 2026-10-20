import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MENU_MAX_HEIGHT = 288;

function Chevron({ open }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="currentColor">
      <path fillRule="evenodd" d="M5.2 7.2a.75.75 0 011.06.02L10 11.1l3.74-3.88a.75.75 0 111.08 1.04l-4.28 4.44a.75.75 0 01-1.08 0L5.18 8.26a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-brand-600" fill="currentColor">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  );
}

const Dot = ({ color }) => <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />;

/**
 * Styled replacement for <select>.
 * options: [{ value, label, description?, dot?: '#hex', icon?: ReactNode }]
 * The menu renders in a portal with fixed positioning, so modals and scrolling tables don't clip it,
 * and it flips upward when there isn't room below.
 */
export default function Select({ value, onChange, options, placeholder = 'Select…', size = 'md', disabled, className = '', label, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const typed = useRef({ text: '', at: 0 });
  const id = useId();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom;
    const up = below < Math.min(MENU_MAX_HEIGHT, options.length * 44 + 12) && r.top > below;
    const width = Math.max(r.width, 200);
    const left = align === 'right' ? Math.max(8, r.right - width) : Math.min(r.left, window.innerWidth - width - 8);
    setPos({ left, width, top: up ? undefined : r.bottom + 6, bottom: up ? window.innerHeight - r.top + 6 : undefined, up });
  }, [options.length, align]);

  const openMenu = () => {
    if (disabled) return;
    place();
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (opt) => {
    if (opt.value !== value) onChange(opt.value);
    close();
  };

  // Keep the menu glued to the button while the page scrolls or resizes
  useLayoutEffect(() => {
    if (!open) return undefined;
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.stopPropagation(); // don't also close a surrounding modal
      close(e.key === 'Escape');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActive(e.key === 'Home' ? 0 : options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key.length === 1) {
      // Type-ahead: jump to the first option starting with the typed letters
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : '') + e.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => String(o.label).toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  };

  const sm = size === 'sm';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={label}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center gap-2 rounded-xl border bg-white text-left text-ink-900 outline-none transition
          ${sm ? 'h-8 px-2.5 text-xs font-semibold' : 'h-10 px-3.5 text-sm'}
          ${open ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-ink-200 hover:border-ink-300'}
          focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/10
          disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500`}
      >
        {selected?.dot ? <Dot color={selected.dot} /> : null}
        {selected?.icon ? <span className="shrink-0">{selected.icon}</span> : null}
        <span className={`flex-1 truncate ${selected ? '' : 'text-ink-300'}`}>{selected ? selected.label : placeholder}</span>
        <Chevron open={open} />
      </button>

      {open && pos
        ? createPortal(
            <ul
              ref={menuRef}
              id={`${id}-menu`}
              role="listbox"
              tabIndex={-1}
              style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: MENU_MAX_HEIGHT, zIndex: 70 }}
              className={`overflow-y-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-ink-200/80 ${pos.up ? 'origin-bottom' : 'origin-top'} animate-scaleIn`}
            >
              {options.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <li
                    key={String(o.value)}
                    data-index={i}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      i === active ? 'bg-ink-100' : ''
                    } ${isSel ? 'font-semibold text-ink-900' : 'text-ink-700'}`}
                  >
                    {o.dot ? <Dot color={o.dot} /> : null}
                    {o.icon ? <span className="shrink-0">{o.icon}</span> : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{o.label}</span>
                      {o.description ? <span className="block truncate text-xs font-normal text-ink-500">{o.description}</span> : null}
                    </span>
                    {isSel ? <Check /> : null}
                  </li>
                );
              })}
            </ul>,
            document.body
          )
        : null}
    </div>
  );
}
