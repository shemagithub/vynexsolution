import { Icon } from '~/components/icon';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { useEffect } from 'react';
import styles from './admin.module.css';

export function AdminPageHeader({ title, meta, children }) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderMain}>
        <Heading level={3} as="h2" className={styles.pageTitle}>
          {title}
        </Heading>
        {meta && (
          <Text secondary size="s">
            {meta}
          </Text>
        )}
      </div>
      {children && <div className={styles.pageHeaderActions}>{children}</div>}
    </div>
  );
}

export function AdminAlert({ children, variant = 'success' }) {
  return (
    <div className={styles.alert} data-variant={variant} role="status">
      {children}
    </div>
  );
}

export function AdminSection({ title, children, className }) {
  return (
    <section className={[styles.pageSection, className].filter(Boolean).join(' ')}>
      {title && (
        <Heading level={4} as="h3" className={styles.sectionTitle}>
          {title}
        </Heading>
      )}
      {children}
    </section>
  );
}

export function AdminPanel({ title, children, defaultOpen = true }) {
  return (
    <details className={styles.panel} open={defaultOpen || undefined}>
      <summary className={styles.panelSummary}>
        <Heading level={4} as="h3" className={styles.panelTitle}>
          {title}
        </Heading>
        <Icon icon="chevron-right" className={styles.panelChevron} />
      </summary>
      <div className={styles.panelBody}>{children}</div>
    </details>
  );
}

export function AdminField({ label, children, className }) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export function AdminCard({ title, meta, children, footer }) {
  return (
    <article className={styles.card}>
      {title && (
        <Heading level={4} as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
      )}
      {meta}
      <div className={styles.cardContent}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </article>
  );
}

export function AdminModal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.modalRoot} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button type="button" className={styles.modalBackdrop} aria-label="Close dialog" onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <Heading level={4} as="h2" id="admin-modal-title">
            {title}
          </Heading>
          <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
            <Icon icon="close" />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

export function AdminTableWrap({ children, className }) {
  return (
    <div className={[styles.tableWrap, className].filter(Boolean).join(' ')}>
      <div className={styles.tableScroll}>{children}</div>
    </div>
  );
}

export function AdminCheckboxRow({ children }) {
  return <div className={styles.checkboxRow}>{children}</div>;
}

export function AdminButtonRow({ children }) {
  return <div className={styles.buttonRow}>{children}</div>;
}
