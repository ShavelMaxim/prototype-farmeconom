'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ActionButton } from '@/shared/ui/action-button';
import { LoadingNotice } from '@/shared/ui/loading-notice';
import { EnvironmentOutlined, DownOutlined } from '@ant-design/icons';
import { pharmacies } from '@/shared/config/pharmacies';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { setPharmacy } from '@/entities/cart/model';
import { useDialogController } from '@/shared/lib/use-dialog-controller';
import type { PharmacyId, Product } from '@/entities/product/model';
const PharmacyDialog = dynamic(() => import('./pharmacy-dialog'), {
  loading: () => <LoadingNotice>Открываем выбор аптеки…</LoadingNotice>,
});
export function PharmacyPicker({ target, product }: { target?: PharmacyId; product?: Product }) {
  const { open: open, show: show, close: close, setTrigger: setTrigger } = useDialogController();
  const id = useAppSelector((s) => s.cart.pharmacy);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const [draft, setDraft] = useState(id);
  const pharmacy = pharmacies.find((p) => p.id === id)!;
  const destination = pharmacies.find((p) => p.id === target);
  const dispatch = useAppDispatch();
  return (
    <>
      <ActionButton
        disabled={!hydrated}
        ref={setTrigger}
        onPointerEnter={() => {
          void import('./pharmacy-dialog').catch(() => {});
        }}
        onFocus={() => {
          void import('./pharmacy-dialog').catch(() => {});
        }}
        variant="text"
        icon={<EnvironmentOutlined />}
        onClick={() => {
          setDraft(target ?? id);
          show();
        }}
        aria-label={
          destination
            ? `${target === id ? 'Изменить выбор аптеки' : 'Выбрать аптеку'}: ${destination.name}`
            : 'Выбрать аптеку'
        }
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {destination ? (target === id ? 'Изменить выбор' : 'Выбрать') : pharmacy.name}{' '}
        <DownOutlined />
      </ActionButton>
      {open && (
        <PharmacyDialog
          product={product}
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
