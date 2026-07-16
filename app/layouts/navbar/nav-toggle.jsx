import { Button } from '~/components/button';
import { Icon } from '~/components/icon';
import { classes } from '~/utils/style';
import styles from './nav-toggle.module.css';

export const NavToggle = ({ menuOpen, onClick, className, ...rest }) => {
  function handleClick(event) {
    event.stopPropagation();
    onClick?.(event);
  }

  return (
    <Button
      iconOnly
      type="button"
      className={classes(styles.toggle, className)}
      aria-label="Menu"
      aria-expanded={menuOpen}
      onClick={handleClick}
      {...rest}
    >
      <div className={styles.inner}>
        <Icon className={styles.icon} data-menu={true} data-open={menuOpen} icon="menu" />
        <Icon
          className={styles.icon}
          data-close={true}
          data-open={menuOpen}
          icon="close"
        />
      </div>
    </Button>
  );
};
