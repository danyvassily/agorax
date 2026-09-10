"use client";
import { CATEGORIES, type QuestionCategory } from "@/lib/questions/schema";
import { categoryLabel } from "@/lib/game/modes";
import { getSubthemesForCategory } from "@/lib/questions/subthemes";
import { ChoiceSheet } from "@/components/ui/choice-sheet";
export function TopicSelector({ value, subcategory, language, onChange, onSubcategoryChange }: {
  value: QuestionCategory | "mixed"; subcategory?: string; language: "fr" | "en";
  onChange: (topic: QuestionCategory | "mixed") => void;
  onSubcategoryChange?: (subcategory: string | undefined) => void;
}) {
  const en = language === "en";
  const subthemes = value === "mixed" ? [] : getSubthemesForCategory(value);
  return <div className="overflow-hidden rounded-2xl border border-fp-border bg-white my-4">
    <ChoiceSheet label={en ? "Topic" : "Thème"} language={language} searchable value={value}
      options={["mixed", ...CATEGORIES].map(category => ({ value: category, label: categoryLabel(language, category) }))}
      onChange={next => { onChange(next as QuestionCategory | "mixed"); if (next !== value) onSubcategoryChange?.(undefined); }} />
    {onSubcategoryChange && <ChoiceSheet label={en ? "Sub-theme" : "Sous-thème"} language={language} value={subcategory ?? ""} disabled={!subthemes.length}
      options={[{ value: "", label: en ? "All" : "Tous" }, ...subthemes.map(sub => ({ value: sub.slug, label: en ? sub.nameEn : sub.nameFr }))]}
      onChange={next => onSubcategoryChange(next || undefined)} />}
  </div>;
}
