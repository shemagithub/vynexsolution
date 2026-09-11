import { useId, useRef, useState } from 'react';
import { Icon } from '~/components/icon';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { classes, cssProps, msToNum } from '~/utils/style';
import { TextArea } from './text-area';
import styles from './input.module.css';

export const Input = ({
  id,
  label,
  value,
  multiline,
  className,
  style,
  error,
  onBlur,
  autoComplete,
  required,
  maxLength,
  type = 'text',
  onChange,
  name,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const generatedId = useId();
  const errorRef = useRef();
  const inputId = id || `${generatedId}input`;
  const labelId = `${inputId}-label`;
  const errorId = `${inputId}-error`;
  const isPassword = type === 'password';
  const InputElement = multiline ? TextArea : 'input';
  const inputType = isPassword ? (passwordVisible ? 'text' : 'password') : type;

  const handleBlur = event => {
    setFocused(false);

    if (onBlur) {
      onBlur(event);
    }
  };

  return (
    <div
      className={classes(styles.container, className)}
      data-error={!!error}
      data-password={isPassword || undefined}
      style={style}
      {...rest}
    >
      <div className={styles.content}>
        <label
          className={styles.label}
          data-focused={focused}
          data-filled={!!value}
          id={labelId}
          htmlFor={inputId}
        >
          {label}
        </label>
        <InputElement
          className={styles.input}
          id={inputId}
          aria-labelledby={labelId}
          aria-describedby={error ? errorId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          maxLength={maxLength}
          type={inputType}
          name={name}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setPasswordVisible(visible => !visible)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            title={passwordVisible ? 'Hide password' : 'Show password'}
          >
            <Icon icon={passwordVisible ? 'eye-off' : 'eye'} size={20} />
          </button>
        )}
        <div className={styles.underline} data-focused={focused} />
      </div>
      <Transition unmount in={error} timeout={msToNum(tokens.base.durationM)}>
        {({ visible, nodeRef }) => (
          <div
            ref={nodeRef}
            className={styles.error}
            data-visible={visible}
            id={errorId}
            role="alert"
            style={cssProps({
              height: visible ? errorRef.current?.getBoundingClientRect().height : 0,
            })}
          >
            <div className={styles.errorMessage} ref={errorRef}>
              <Icon icon="error" />
              {error}
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};
