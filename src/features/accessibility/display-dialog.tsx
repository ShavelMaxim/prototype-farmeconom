'use client';
import { Drawer, Button } from 'antd';
import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { setDisplay, resetDisplay, type PersonalData } from '@/entities/personal/model';
import styles from './display-dialog.module.css';
export default function DisplayDialog({ onClose }: { onClose: () => void }) {
  const display = useAppSelector((s) => s.personal.display);
  const storageUnavailable = useAppSelector((s) => s.personal.storageUnavailable);
  const dispatch = useAppDispatch();
  return (
    <AntdBoundary>
      <Drawer
        title="Настройки отображения"
        open
        onClose={onClose}
        styles={{ wrapper: { width: 'min(100vw, 480px)' } }}
        footer={
          <Button type="primary" block onClick={onClose}>
            Готово
          </Button>
        }
      >
        <p className="muted">Изменения видны сразу и сохраняются в этом браузере.</p>
        <fieldset className={styles.group}>
          <legend>Размер текста</legend>
          <div className={styles.choices}>
            {['100', '125', '150', '200'].map((scale) => (
              <label key={scale}>
                <input
                  type="radio"
                  name="text-scale"
                  value={scale}
                  checked={display.scale === scale}
                  onChange={() =>
                    dispatch(setDisplay({ scale: scale as PersonalData['display']['scale'] }))
                  }
                />
                {scale}%
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>Цветовая схема</legend>
          {Object.entries({
            standard: 'Обычная',
            light: 'Контрастная светлая',
            dark: 'Контрастная тёмная',
          }).map(([contrast, label]) => (
            <label key={contrast}>
              <input
                type="radio"
                name="contrast"
                checked={display.contrast === contrast}
                onChange={() =>
                  dispatch(
                    setDisplay({ contrast: contrast as PersonalData['display']['contrast'] }),
                  )
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={display.spacing}
            onChange={(e) => dispatch(setDisplay({ spacing: e.target.checked }))}
          />
          Увеличить интервалы текста
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={display.reducedMotion}
            onChange={(e) => dispatch(setDisplay({ reducedMotion: e.target.checked }))}
          />
          Уменьшить анимацию
        </label>
        <p className="muted">
          Системное предпочтение уменьшенной анимации учитывается всегда. Масштаб браузера также
          доступен.
        </p>
        {storageUnavailable && (
          <p role="alert">Хранилище недоступно. Настройки работают до закрытия страницы.</p>
        )}
        <Button onClick={() => dispatch(resetDisplay())}>Сбросить настройки</Button>
      </Drawer>
    </AntdBoundary>
  );
}
