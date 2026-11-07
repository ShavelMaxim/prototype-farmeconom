'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ActionButton } from '@/shared/ui/action-button';
import { LoadingNotice } from '@/shared/ui/loading-notice';
import { EnvironmentOutlined, DownOutlined } from '@ant-design/icons';
import { pharmacies } from '@/shared/config/pharmacies';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { setPharmacy } from '@/entities/cart/model';
const PharmacyDialog = dynamic(() => import('./pharmacy-dialog'), {
  loading: () => <LoadingNotice>Открываем выбор аптеки…</LoadingNotice>,
});
export function PharmacyPicker() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  const id = useAppSelector((s) => s.cart.pharmacy);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const [draft, setDraft] = useState(id);
  const pharmacy = pharmacies.find((p) => p.id === id)!;
  const dispatch = useAppDispatch();
  return (
    <>
      <ActionButton
        disabled={!hydrated}
        ref={trigger}
        onPointerEnter={() => {
          void import('./pharmacy-dialog').catch(() => {});
        }}
        onFocus={() => {
          void import('./pharmacy-dialog').catch(() => {});
        }}
        variant="text"
        icon={<EnvironmentOutlined />}
        onClick={() => {
          setDraft(id);
          setOpen(true);
        }}
        aria-label="Выбрать аптеку"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {pharmacy.name} <DownOutlined />
      </ActionButton>
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
