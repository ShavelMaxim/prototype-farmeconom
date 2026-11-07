import type { CatalogQuery, Product } from './model';
import { filterCatalog } from './filter-catalog';

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').replace(/\s+/g, ' ');
}

// A deliberately narrow typo hint: one insertion/deletion/replacement or a swap.
// No automatic correction, symptom search, transliteration or dosage inference.
function oneEdit(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return false;
  let i = 0;
  while (i < left.length && left[i] === right[i]) i++;
  if (i === left.length) return right.length === left.length + 1;
  if (left.length === right.length)
    return (
      left.slice(i + 1) === right.slice(i + 1) ||
      (left[i] === right[i + 1] &&
        left[i + 1] === right[i] &&
        left.slice(i + 2) === right.slice(i + 2))
    );
  return left.length > right.length
    ? left.slice(i + 1) === right.slice(i)
    : left.slice(i) === right.slice(i + 1);
}

export function searchSuggestions(text: string, products: Product[], query: CatalogQuery) {
  const needle = normalize(text);
  if (needle.length < 2) return { items: [] as Product[], correction: '' };
  const eligible = filterCatalog({ ...query, q: '' }, products).items;
  const matches = filterCatalog({ ...query, q: needle }, eligible).items;
  if (matches.length) {
    return {
      items: matches
        .slice()
        .sort(
          (a, b) =>
            Number(normalize(b.name).startsWith(needle)) -
            Number(normalize(a.name).startsWith(needle)),
        )
        .slice(0, 5),
      correction: '',
    };
  }
  // Only a single word of >=5 characters; short numbers and ambiguous doses are excluded.
  if (!/^[а-яa-z]{5,30}$/.test(needle)) return { items: [] as Product[], correction: '' };
  const candidates = new Set(
    eligible
      .flatMap((p) => normalize(`${p.name} ${p.brand}`).match(/[а-яa-z]{5,30}/g) ?? [])
      .filter((word) => oneEdit(needle, word)),
  );
  return { items: [] as Product[], correction: candidates.size === 1 ? [...candidates][0] : '' };
}
