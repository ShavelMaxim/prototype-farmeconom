'use client';
import { useState } from 'react';
import { Button, Modal, Radio } from 'antd';
import { EnvironmentOutlined, DownOutlined } from '@ant-design/icons';
import { pharmacies } from '@/shared/config/pharmacies';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { setPharmacy } from '@/entities/cart/model';
export function PharmacyPicker() {
  const [open, setOpen] = useState(false);
  const id = useAppSelector((s) => s.cart.pharmacy);
  const [draft, setDraft] = useState(id);
  const pharmacy = pharmacies.find((p) => p.id === id)!;
  const dispatch = useAppDispatch();
  return (
    <>
      <Button
        type="text"
        icon={<EnvironmentOutlined />}
        onClick={() => {
          setDraft(id);
          setOpen(true);
        }}
        aria-label="Выбрать аптеку"
      >
        {pharmacy.name} <DownOutlined />
      </Button>
      <Modal
        title="Где вам удобно забрать?"
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button
              type="primary"
              onClick={() => {
                dispatch(setPharmacy(draft));
                setOpen(false);
              }}
            >
              Применить выбор
            </Button>
          </>
        }
      >
        <p className="muted">
          Ангарск · 3 демонстрационные аптеки. После подтверждения цены и наличие пересчитаются.
          Товары сохранятся в корзине; недоступные позиции потребуется проверить.
        </p>
        <Radio.Group
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="pharmacy-options"
        >
          {pharmacies.map((p) => (
            <Radio key={p.id} value={p.id}>
              <strong>{p.name}</strong>
              <span>{p.address}</span>
              <span>
                {p.hours} · {p.note}
              </span>
            </Radio>
          ))}
        </Radio.Group>
      </Modal>
    </>
  );
}
