"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  placeholder: string;
  options: string[];
};

export default function Select({ name, label, placeholder, options }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };

  const choose = (i: number) => {
    setValue(options[i]);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(last, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => {
        setOpen(false);
        buttonRef.current?.focus();
      },
    };
    if (e.key === "Tab") return setOpen(false);
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  return (
    <div className="field select" ref={rootRef} data-open={open} data-no-gravity>
      <span id={`${id}-label`}>{label}</span>
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        type="button"
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
      >
        <span id={`${id}-value`} className={value ? "" : "select-placeholder"}>
          {value || placeholder}
        </span>
        <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          className="select-list"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
        >
          {options.map((opt, i) => (
            <li
              key={opt}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={opt === value}
              data-active={i === active}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <span>{opt}</span>
              {opt === value && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="m5 12 5 5 9-10" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
