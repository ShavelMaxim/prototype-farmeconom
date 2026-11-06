'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from 'antd';
import { EnvironmentOutlined, DownOutlined } from '@ant-design/icons';
import { pharmacies } from '@/shared/config/pharmacies';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { setPharmacy } from '@/entities/cart/model';
const PharmacyDialog = dynamic(() => import('./pharmacy-dialog'), {
  loading: () => <span role="status">Открываем выбор аптеки…</span>,
});
export function PharmacyPicker() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  const id = useAppSelector((s) => s.cart.pharmacy);
  const [draft, setDraft] = useState(id);
  const pharmacy = pharmacies.find((p) => p.id === id)!;
  const dispatch = useAppDispatch();
  return (
    <>
      <Button
        ref={trigger}
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
      {open && (
        <PharmacyDialog
          draft={draft}
          onChange={setDraft}
          onCancel={close}
          onConfirm={() => {
            dispatch(setPharmacy(draft));
            close();
          }}
        />
      )}
    </>
  );
}
