import { useEffect, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from '@remix-run/react';
import { Button } from '~/components/button';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { resolveMediaUrl } from '~/utils/media-url';
import styles from '~/layouts/admin/admin.module.css';

function previewUrl(src, apiUrl) {
  return resolveMediaUrl(src, apiUrl);
}

export function HomeAboutTextFields({ home = {}, image, imageLarge, onImageChange }) {
  return (
    <div className={styles.logoSection}>
      <Heading level={4} as="h3">
        Homepage about copy
      </Heading>
      <Text secondary size="s">
        Text shown in the &ldquo;About EMBEDIXe&rdquo; block on the homepage.
      </Text>

      <label>
        <Text secondary size="s">
          Section title
        </Text>
        <input className={styles.select} name="homeTitle" defaultValue={home.title || ''} required />
      </label>

      <label>
        <Text secondary size="s">
          Tag label
        </Text>
        <input className={styles.select} name="homeTagLabel" defaultValue={home.tagLabel || ''} />
      </label>

      <label>
        <Text secondary size="s">
          First paragraph
        </Text>
        <textarea
          className={styles.select}
          name="homeParagraph1"
          rows={3}
          defaultValue={home.paragraph1 || ''}
          required
        />
      </label>

      <label>
        <Text secondary size="s">
          Second paragraph
        </Text>
        <textarea className={styles.select} name="homeParagraph2" rows={3} defaultValue={home.paragraph2 || ''} />
      </label>

      <label>
        <Text secondary size="s">
          Image alt text
        </Text>
        <input className={styles.select} name="homeImageAlt" defaultValue={home.imageAlt || ''} />
      </label>

      <div className={styles.formRow}>
        <label>
          <Text secondary size="s">
            Image path (auto-filled after upload)
          </Text>
          <input
            className={styles.select}
            name="homeImage"
            value={image}
            onChange={event => onImageChange(event.target.value, imageLarge)}
            placeholder="/uploads/your-photo.jpg"
          />
        </label>
        <label>
          <Text secondary size="s">
            Large image path (optional)
          </Text>
          <input
            className={styles.select}
            name="homeImageLarge"
            value={imageLarge}
            onChange={event => onImageChange(image, event.target.value)}
            placeholder="Leave empty to reuse main image"
          />
        </label>
      </div>
    </div>
  );
}

export function HomeAboutImagePanel({ home = {} }) {
  const rootData = useRouteLoaderData('root');
  const apiUrl = rootData?.apiUrl;
  const uploadFetcher = useFetcher();
  const removeFetcher = useFetcher();
  const fileInputRef = useRef(null);
  const processedUploadRef = useRef(null);
  const processedRemoveRef = useRef(null);
  const [image, setImage] = useState(home.image || '');
  const [imageLarge, setImageLarge] = useState(home.imageLarge || '');
  const [selectedFileName, setSelectedFileName] = useState('');

  const isUploading = uploadFetcher.state !== 'idle';
  const isRemoving = removeFetcher.state !== 'idle';
  const activeImage = image || imageLarge;
  const displaySrc = activeImage ? previewUrl(activeImage, apiUrl) : '';

  useEffect(() => {
    setImage(home.image || '');
    setImageLarge(home.imageLarge || '');
  }, [home.image, home.imageLarge]);

  useEffect(() => {
    const data = uploadFetcher.data;
    if (!data?.success || processedUploadRef.current === data) return;

    processedUploadRef.current = data;
    const uploadedUrl = data.uploadedUrl || data.home?.image;
    if (uploadedUrl) {
      setImage(uploadedUrl);
      setImageLarge(uploadedUrl);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadFetcher.data]);

  useEffect(() => {
    const data = removeFetcher.data;
    if (!data?.success || processedRemoveRef.current === data) return;

    processedRemoveRef.current = data;
    setImage('');
    setImageLarge('');
  }, [removeFetcher.data]);

  return (
    <div className={styles.aboutImagePanel}>
      <Heading level={4} as="h3">
        Homepage about image
      </Heading>
      <Text secondary size="s">
        This is the portrait photo on the right side of the &ldquo;About EMBEDIXe&rdquo; section on
        the homepage. Uploading saves the file and stores the image path in the database.
      </Text>

      <div className={styles.aboutImageLayout}>
        <div className={styles.aboutImagePreviewCard}>
          <Text secondary size="s">
            {activeImage ? 'Current image' : 'Default image (no upload yet)'}
          </Text>
          <div className={styles.aboutImagePreviewFrame} data-theme="dark">
            {displaySrc ? (
              <img src={displaySrc} alt="" className={styles.aboutImagePreviewImage} />
            ) : (
              <div className={styles.aboutImagePreviewEmpty}>
                <Text secondary size="s">
                  Uses the built-in profile photo until you upload one.
                </Text>
              </div>
            )}
          </div>
          {activeImage && (
            <Text secondary size="s" className={styles.aboutImagePath}>
              {activeImage}
            </Text>
          )}
        </div>

        <div className={styles.aboutImageActions}>
          <uploadFetcher.Form method="post" encType="multipart/form-data" className={styles.form}>
            <input type="hidden" name="intent" value="upload-home-image" />
            <AdminFieldBlock label="Choose replacement image">
              <input
                ref={fileInputRef}
                className={styles.select}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                onChange={event => setSelectedFileName(event.target.files?.[0]?.name || '')}
              />
            </AdminFieldBlock>
            {selectedFileName && (
              <Text secondary size="s">
                Selected: {selectedFileName}
              </Text>
            )}
            <div className={styles.buttonRow}>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading…' : activeImage ? 'Replace image' : 'Upload image'}
              </Button>
            </div>
          </uploadFetcher.Form>

          {activeImage && (
            <removeFetcher.Form method="post" className={styles.form}>
              <input type="hidden" name="intent" value="remove-home-image" />
              <Button secondary type="submit" disabled={isRemoving}>
                {isRemoving ? 'Removing…' : 'Remove custom image'}
              </Button>
            </removeFetcher.Form>
          )}

          {uploadFetcher.data?.success === false && (
            <div className={styles.alert} data-variant="error" role="alert">
              {uploadFetcher.data.message}
            </div>
          )}
          {uploadFetcher.data?.success && uploadFetcher.data?.message && (
            <div className={styles.alert} role="status">
              {uploadFetcher.data.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminFieldBlock({ label, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

export function useHomeAboutImages(home = {}) {
  const [image, setImage] = useState(home.image || '');
  const [imageLarge, setImageLarge] = useState(home.imageLarge || '');

  useEffect(() => {
    setImage(home.image || '');
    setImageLarge(home.imageLarge || '');
  }, [home.image, home.imageLarge]);

  function onImageChange(nextImage, nextLarge) {
    setImage(nextImage);
    setImageLarge(nextLarge);
  }

  return { image, imageLarge, onImageChange };
}
