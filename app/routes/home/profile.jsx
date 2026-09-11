import profileImgLarge from '~/assets/profile-large.jpg';
import profileImgPlaceholder from '~/assets/profile-placeholder.jpg';
import profileImg from '~/assets/profile.jpg';
import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Heading } from '~/components/heading';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { Transition } from '~/components/transition';
import { Fragment, useState } from 'react';
import { media } from '~/utils/style';
import katakana from './katakana.svg';
import styles from './profile.module.css';

const ProfileText = ({ visible, titleId, home }) => (
  <Fragment>
    <Heading className={styles.title} data-visible={visible} level={3} id={titleId}>
      <DecoderText text={home.title} start={visible} delay={500} />
    </Heading>
    <Text className={styles.description} data-visible={visible} size="l" as="p">
      {home.paragraph1}
    </Text>
    {home.paragraph2 && (
      <Text className={styles.description} data-visible={visible} size="l" as="p">
        {home.paragraph2} Explore our <Link href="/services">services</Link>, browse our{' '}
        <Link href="/portfolio">portfolio</Link>, or <Link href="/about">learn more about us</Link>.
      </Text>
    )}
  </Fragment>
);

export const Profile = ({ id, visible, sectionRef, home }) => {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;
  const hasCustomImage = Boolean(home?.image?.trim());
  const imageSrc = hasCustomImage ? home.image : profileImg;
  const imageLargeSrc = hasCustomImage ? home.imageLarge || home.image : profileImgLarge;
  const srcSet = `${imageSrc} 480w, ${imageLargeSrc} 960w`;
  const placeholder = hasCustomImage ? imageSrc : profileImgPlaceholder;
  const alt = home?.imageAlt || 'Vynex Solutions team working on a project';

  return (
    <Section
      className={styles.profile}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused} timeout={0}>
        {({ visible, nodeRef }) => (
          <div className={styles.content} ref={nodeRef}>
            <div className={styles.column}>
              <ProfileText visible={visible} titleId={titleId} home={home} />
              <Button
                secondary
                className={styles.button}
                data-visible={visible}
                href="/quote"
                icon="send"
              >
                Get a quote
              </Button>
            </div>
            <div className={styles.column}>
              <div className={styles.tag} aria-hidden>
                <Divider
                  notchWidth="64px"
                  notchHeight="8px"
                  collapsed={!visible}
                  collapseDelay={1000}
                />
                <div className={styles.tagText} data-visible={visible}>
                  {home?.tagLabel || 'Who we are'}
                </div>
              </div>
              <div className={styles.image}>
                <Image
                  key={imageSrc}
                  reveal
                  delay={100}
                  placeholder={placeholder}
                  src={imageSrc}
                  srcSet={srcSet}
                  width={960}
                  height={1280}
                  sizes={`(max-width: ${media.mobile}px) 100vw, 480px`}
                  alt={alt}
                />
                <svg className={styles.svg} data-visible={visible} viewBox="0 0 136 766">
                  <use href={`${katakana}#katakana-profile`} />
                </svg>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
