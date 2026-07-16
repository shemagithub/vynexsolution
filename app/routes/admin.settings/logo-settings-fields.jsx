import { useEffect, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from '@remix-run/react';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { resolveMediaUrl } from '~/utils/media-url';
import styles from '~/layouts/admin/admin.module.css';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';

function previewUrl(src, apiUrl) {
  return resolveMediaUrl(src, apiUrl);
}

function LogoUploadZone({
  variant,
  label,
  hint,
  theme,
  value,
  onValueChange,
  apiUrl,
}) {
  const uploadFetcher = useFetcher();
  const removeFetcher = useFetcher();
  const fileInputRef = useRef(null);
  const processedUploadRef = useRef(null);
  const processedRemoveRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const isUploading = uploadFetcher.state !== 'idle';
  const isRemoving = removeFetcher.state !== 'idle';
  const displaySrc = value ? previewUrl(value, apiUrl) : '';
  const uploadIntent = variant === 'light' ? 'upload-logo-light' : 'upload-logo-dark';
  const removeIntent = variant === 'light' ? 'remove-logo-light' : 'remove-logo-dark';

  useEffect(() => {
    const data = uploadFetcher.data;
    if (!data?.success || processedUploadRef.current === data) return;

    processedUploadRef.current = data;
    const nextValue = variant === 'light' ? data.logoLight : data.logoDark;
    if (nextValue) {
      onValueChange(nextValue);
    }
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFetcher.data, variant, onValueChange]);

  useEffect(() => {
    const data = removeFetcher.data;
    if (!data?.success || processedRemoveRef.current === data) return;

    processedRemoveRef.current = data;
    const nextValue = variant === 'light' ? data.logoLight : data.logoDark;
    if (nextValue) {
      onValueChange(nextValue);
    }
  }, [removeFetcher.data, variant, onValueChange]);

  function submitFile(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('intent', uploadIntent);
    formData.append('file', file);
    uploadFetcher.submit(formData, { method: 'post', encType: 'multipart/form-data' });
    setSelectedFileName(file.name);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    submitFile(event.dataTransfer.files?.[0]);
  }

  function submitRemove() {
    const formData = new FormData();
    formData.append('intent', removeIntent);
    removeFetcher.submit(formData, { method: 'post' });
  }

  const activeFetcher = uploadFetcher.data?.success === false ? uploadFetcher : removeFetcher;
  const statusMessage =
    uploadFetcher.data?.message || removeFetcher.data?.message || activeFetcher.data?.message;

  return (
    <div className={styles.logoUploadCard}>
      <Text secondary size="s">
        {label}
      </Text>
      <Text secondary size="s">
        {hint}
      </Text>

      <div
        className={styles.dropzone}
        data-theme={theme}
        data-drag-over={dragOver || undefined}
        data-busy={isUploading || isRemoving || undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && !isRemoving && fileInputRef.current?.click()}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
      >
        {displaySrc ? (
          <img src={displaySrc} alt="" className={styles.logoPreviewImage} />
        ) : (
          <div className={styles.dropzonePlaceholder}>
            <Text secondary size="s">
              Drag and drop your logo here
            </Text>
            <Text secondary size="s">
              or click to browse
            </Text>
            <Text secondary size="s">
              SVG, PNG, JPG, WebP, GIF · max 5MB
            </Text>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className={styles.dropzoneInput}
          onChange={event => submitFile(event.target.files?.[0])}
        />
      </div>

      {selectedFileName && isUploading && (
        <Text secondary size="s">
          Uploading {selectedFileName}…
        </Text>
      )}

      <div className={styles.buttonRow}>
        <Button
          type="button"
          disabled={isUploading || isRemoving}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? 'Uploading…' : displaySrc ? 'Replace logo' : 'Choose file'}
        </Button>
        {displaySrc && (
          <Button
            secondary
            type="button"
            disabled={isRemoving || isUploading}
            onClick={submitRemove}
          >
            {isRemoving ? 'Resetting…' : 'Reset to default'}
          </Button>
        )}
      </div>

      {value && (
        <Text secondary size="s" className={styles.logoPath}>
          {value}
        </Text>
      )}

      {activeFetcher.data?.success === false && (
        <div className={styles.alert} data-variant="error" role="alert">
          {activeFetcher.data.message}
        </div>
      )}
      {statusMessage && activeFetcher.data?.success && (
        <div className={styles.alert} role="status">
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export function LogoSettingsFields({ logoLight = '', logoDark = '' }) {
  const rootData = useRouteLoaderData('root');
  const apiUrl = rootData?.apiUrl;
  const [lightSrc, setLightSrc] = useState(logoLight);
  const [darkSrc, setDarkSrc] = useState(logoDark);

  useEffect(() => {
    setLightSrc(logoLight);
    setDarkSrc(logoDark);
  }, [logoLight, logoDark]);

  return (
    <div className={styles.logoSection}>
      <Heading level={4} as="h3">
        Brand logos
      </Heading>
      <Text secondary size="s">
        Upload a dark logo for light mode and a light logo for dark mode. You can drag and drop
        files or paste a URL below.
      </Text>

      <div className={styles.logoUploadGrid}>
        <LogoUploadZone
          variant="light"
          label="Logo for light mode"
          hint="Shown on the light theme (navbar, footer)."
          theme="light"
          value={lightSrc}
          onValueChange={setLightSrc}
          apiUrl={apiUrl}
        />
        <LogoUploadZone
          variant="dark"
          label="Logo for dark mode"
          hint="Shown on the dark theme (navbar, footer)."
          theme="dark"
          value={darkSrc}
          onValueChange={setDarkSrc}
          apiUrl={apiUrl}
        />
      </div>

      <div className={styles.formRow}>
        <label>
          <Text secondary size="s">
            Light mode URL (optional override)
          </Text>
          <input
            className={styles.select}
            name="logoLight"
            value={lightSrc}
            onChange={event => setLightSrc(event.target.value)}
            placeholder="/logo-light.svg"
          />
        </label>
        <label>
          <Text secondary size="s">
            Dark mode URL (optional override)
          </Text>
          <input
            className={styles.select}
            name="logoDark"
            value={darkSrc}
            onChange={event => setDarkSrc(event.target.value)}
            placeholder="/logo-dark.svg"
          />
        </label>
      </div>
    </div>
  );
}
