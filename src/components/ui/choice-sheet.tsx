"use client";
import { useId, useRef, useState } from "react";
import { Check, ChevronRight, Search, X } from "lucide-react";
import styles from "./choice-sheet.module.css";
export function ChoiceSheet({ label, value, options, onChange, language, searchable = false, disabled = false }: {
  label: string; value: string; options: { value: string; label: string }[];
  onChange: (value: string) => void; language: "fr" | "en"; searchable?: boolean; disabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [query, setQuery] = useState("");
  const en = language === "en";
  const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const filtered = options.filter(option => normalize(option.label).includes(normalize(query)));
  function close() { dialog.current?.close(); }
  return <>
    <button ref={trigger} type="button" className={styles.row} disabled={disabled} aria-haspopup="dialog" onClick={() => { setQuery(""); dialog.current?.showModal(); }}>
      <span>{label}</span><strong>{options.find(option => option.value === value)?.label ?? (en ? "All" : "Tous")}</strong><ChevronRight size={17} aria-hidden="true" />
    </button>
    <dialog ref={dialog} className={styles.sheet} aria-labelledby={id} onClose={() => trigger.current?.focus()} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.content}>
        <header><h2 id={id}>{label}</h2><button type="button" onClick={close} aria-label={en ? "Close" : "Fermer"}><X size={22} /></button></header>
        {searchable && <label className={styles.search}><Search size={18} aria-hidden="true" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? "Search a topic…" : "Rechercher un thème…"} aria-label={en ? "Search" : "Rechercher"} /></label>}
        <div className={styles.options} role="group" aria-labelledby={id}>
          {filtered.map(option => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => { onChange(option.value); close(); }}><span>{option.label}</span>{value === option.value && <Check size={20} aria-hidden="true" />}</button>)}
          {!filtered.length && <p>{en ? "No results. Try another word." : "Aucun résultat. Essaie un autre mot."}</p>}
        </div>
      </div>
    </dialog>
  </>;
}
