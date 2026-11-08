import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { Button, Modal, Radio } from 'antd';
import { pharmacies } from '@/shared/config/pharmacies';
import type { PharmacyId } from '@/shared/config/pharmacy-id';
import { useState } from 'react';
import { money, type Product } from '@/entities/product/model';
export default function PharmacyDialog({
  draft,
  onChange,
  onCancel,
  onConfirm,
  product,
}: {
  draft: PharmacyId;
  onChange: (id: PharmacyId) => void;
  onCancel: () => void;
  onConfirm: () => void;
  product?: Product;
}) {
  const [ready, setReady] = useState(false);
  return (
    <AntdBoundary>
      <Modal
        title="Где вам удобно забрать?"
        open
        afterOpenChange={setReady}
        onCancel={onCancel}
        footer={
          <>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" onClick={onConfirm}>
              Применить выбор
            </Button>
          </>
        }
      >
        <span hidden data-dialog-ready={ready} />
        <p className="muted">
          Ангарск · 3 аптеки. После подтверждения цены и наличие пересчитаются. Товары сохранятся в
          корзине; недоступные позиции потребуется проверить.
        </p>
        <Radio.Group
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          className="pharmacy-options"
          aria-label="Аптека для самовывоза"
        >
          {pharmacies.map((p) => (
            <Radio key={p.id} value={p.id}>
              <strong>{p.name}</strong>
              <span>{p.address}</span>
              <span>
                {p.hours} · {p.note}
              </span>
              {product && (
                <span>
                  {money(product.offers[p.id].price)} ·{' '}
                  {product.offers[p.id].stock
                    ? `В наличии ${product.offers[p.id].stock} шт.`
                    : 'Нет в этой аптеке'}
                </span>
              )}
            </Radio>
          ))}
        </Radio.Group>
      </Modal>
    </AntdBoundary>
  );
}
