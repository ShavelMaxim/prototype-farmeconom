'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { money, type CatalogQuery, type Product } from '@/entities/product/model';
import { searchSuggestions } from '@/entities/product/search-suggestions';
import styles from './catalog.module.css';

export function SearchField({
  draft,
  query,
  products,
  disabled,
  unavailable,
  onChange,
  onSelect,
}: {
  draft: string;
  query: CatalogQuery;
  products: Product[];
  disabled: boolean;
  unavailable: boolean;
  onChange: (text: string) => void;
  onSelect: () => void;
}) {
  const router = useRouter();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const suggestions = useMemo(
    () => searchSuggestions(draft, products, query),
    [draft, products, query],
  );
  const options = suggestions.correction
    ? [
        {
          id: 'correction',
          label: `Возможно, вы имели в виду «${suggestions.correction}»`,
          product: null,
        },
      ]
    : suggestions.items.map((product) => ({ id: product.id, label: product.name, product }));
  const expanded = open && !disabled && !unavailable && !composing && options.length > 0;
  const active = expanded ? options.find((option) => option.id === activeId) : undefined;
  useEffect(() => {
    if (!expanded) return;
    const form = root.current?.closest('form');
    const navigation = document.querySelector<HTMLElement>('nav[aria-label="Мобильная навигация"]');
    const measure = () => {
      if (!form || !popup.current) return;
      const viewport = window.visualViewport;
      const bottom =
        (viewport?.offsetTop ?? 0) + (viewport?.height ?? document.documentElement.clientHeight);
      const nav = navigation?.getBoundingClientRect();
      const boundary = nav && nav.height && nav.top < bottom ? nav.top : bottom;
      popup.current.style.maxHeight = `${Math.max(64, Math.min(420, boundary - form.getBoundingClientRect().bottom - 8))}px`;
    };
    const observer = new ResizeObserver(measure);
    if (form) observer.observe(form);
    if (navigation) observer.observe(navigation);
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [expanded]);
  function close() {
    setOpen(false);
    setActiveId(null);
  }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false);
        setActiveId(null);
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  function choose(option: (typeof options)[number]) {
    close();
    if (!option.product) {
      onChange(suggestions.correction);
      input.current?.focus();
    } else {
      onSelect();
      router.push(`/products/${option.product.slug}`);
    }
  }
  return (
    <div
      ref={root}
      className={styles.searchInput}
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          close();
      }}
    >
      <SearchOutlined aria-hidden="true" />
      <input
        ref={input}
        role="combobox"
        aria-label="Поиск товаров"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? `${id}-list` : undefined}
        aria-activedescendant={active ? `${id}-${active.id}` : undefined}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder="Название или бренд"
        value={draft}
        maxLength={80}
        enterKeyHint="search"
        onFocus={() => setOpen(true)}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        onChange={(event) => {
          onChange(event.currentTarget.value);
          setActiveId(null);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || composing) return;
          if (event.key === 'Escape') {
            event.stopPropagation();
            close();
          }
          if (
            (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
            options.length &&
            !unavailable
          ) {
            event.preventDefault();
            setOpen(true);
            const index = options.findIndex((option) => option.id === activeId);
            const next =
              index < 0
                ? event.key === 'ArrowDown'
                  ? 0
                  : options.length - 1
                : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
            setActiveId(options[next].id);
            requestAnimationFrame(() =>
              document
                .getElementById(`${id}-${options[next].id}`)
                ?.scrollIntoView({ block: 'nearest' }),
            );
          }
          if (event.key === 'Enter') {
            if (active) {
              event.preventDefault();
              choose(active);
            } else close();
          }
        }}
      />
      {draft && (
        <button
          className={styles.clear}
          type="button"
          aria-label="Очистить поиск"
          onClick={() => {
            onChange('');
            close();
            input.current?.focus();
          }}
        >
          <CloseOutlined />
        </button>
      )}
      {expanded && (
        <div ref={popup} className={styles.suggestions}>
          <p className={styles.suggestionHeading}>
            С учётом ваших фильтров · цены выбранной аптеки
          </p>
          <div id={`${id}-list`} role="listbox" aria-label="Подсказки поиска">
            {options.map((option) => (
              <button
                key={option.id}
                id={`${id}-${option.id}`}
                role="option"
                type="button"
                aria-selected={option.id === activeId}
                tabIndex={-1}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {option.product && (
                  <small>
                    {money(option.product.offers[query.pharmacy].price)} ·{' '}
                    {option.product.offers[query.pharmacy].stock
                      ? `В наличии ${option.product.offers[query.pharmacy].stock} шт.`
                      : 'Нет в этой аптеке'}
                  </small>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
