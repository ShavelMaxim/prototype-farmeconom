export function productCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  return `${count} ${lastTwo >= 11 && lastTwo <= 14 ? 'товаров' : last === 1 ? 'товар' : last >= 2 && last <= 4 ? 'товара' : 'товаров'}`;
}
