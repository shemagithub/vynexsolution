import { Button } from '~/components/button';
import { DecoderText } from '~/components/decoder-text';
import { Divider } from '~/components/divider';
import { Footer } from '~/components/footer';
import { Heading } from '~/components/heading';
import { Icon } from '~/components/icon';
import { Input } from '~/components/input';
import { Section } from '~/components/section';
import { Text } from '~/components/text';
import { tokens } from '~/components/theme-provider/theme';
import { Transition } from '~/components/transition';
import { budgetRanges, projectTypes } from '~/data/content';
import { useFormInput } from '~/hooks';
import { useRef } from 'react';
import { cssProps, msToNum, numToMs } from '~/utils/style';
import { baseMeta } from '~/utils/meta';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import config from '~/config.json';
import styles from './quote.module.css';

export const meta = () => {
  return baseMeta({
    title: 'Request a Quote',
    description: 'Tell us about your project and get a custom quote from EMBEDIXe.',
  });
};

const MAX_EMAIL_LENGTH = 512;
const MAX_MESSAGE_LENGTH = 4096;
const EMAIL_PATTERN = /(.+)@(.+){2,}\.(.+){2,}/;

export async function action({ context, request }) {
  const ses = new SESClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: context.cloudflare.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: context.cloudflare.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const formData = await request.formData();
  const isBot = String(formData.get('name'));
  const email = String(formData.get('email'));
  const projectType = String(formData.get('projectType'));
  const budget = String(formData.get('budget'));
  const deadline = String(formData.get('deadline'));
  const message = String(formData.get('message'));
  const errors = {};

  if (isBot) return json({ success: true });

  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!projectType) {
    errors.projectType = 'Please select a project type.';
  }

  if (!message) {
    errors.message = 'Please describe your project.';
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    errors.email = `Email address must be shorter than ${MAX_EMAIL_LENGTH} characters.`;
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Description must be shorter than ${MAX_MESSAGE_LENGTH} characters.`;
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  const body = [
    `From: ${email}`,
    `Project Type: ${projectType}`,
    `Budget: ${budget || 'Not specified'}`,
    `Deadline: ${deadline || 'Not specified'}`,
    '',
    message,
  ].join('\n');

  await ses.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [context.cloudflare.env.EMAIL],
      },
      Message: {
        Body: {
          Text: { Data: body },
        },
        Subject: {
          Data: `Quote request from ${email} — ${projectType}`,
        },
      },
      Source: `EMBEDIXe <${context.cloudflare.env.FROM_EMAIL}>`,
      ReplyToAddresses: [email],
    })
  );

  return json({ success: true });
}

export const Quote = () => {
  const errorRef = useRef();
  const email = useFormInput('');
  const deadline = useFormInput('');
  const message = useFormInput('');
  const initDelay = tokens.base.durationS;
  const actionData = useActionData();
  const { state } = useNavigation();
  const sending = state === 'submitting';

  return (
    <Section className={styles.quote}>
      <Transition unmount in={!actionData?.success} timeout={1600}>
        {({ status, nodeRef }) => (
          <Form
            unstable_viewTransition
            className={styles.form}
            method="post"
            ref={nodeRef}
          >
            <Heading
              className={styles.title}
              data-status={status}
              level={3}
              as="h1"
              style={getDelay(tokens.base.durationXS, initDelay, 0.3)}
            >
              <DecoderText text="Request a quote" start={status !== 'exited'} delay={300} />
            </Heading>
            <Divider
              className={styles.divider}
              data-status={status}
              style={getDelay(tokens.base.durationXS, initDelay, 0.4)}
            />
            <Input
              className={styles.botkiller}
              label="Name"
              name="name"
              maxLength={MAX_EMAIL_LENGTH}
            />
            <Input
              required
              className={styles.input}
              data-status={status}
              style={getDelay(tokens.base.durationXS, initDelay)}
              autoComplete="email"
              label="Your email"
              type="email"
              name="email"
              maxLength={MAX_EMAIL_LENGTH}
              {...email}
            />
            <div
              className={styles.selectWrapper}
              data-status={status}
              style={getDelay(tokens.base.durationXS, initDelay, 0.5)}
            >
              <label className={styles.selectLabel} htmlFor="projectType">
                Project type
              </label>
              <select
                id="projectType"
                name="projectType"
                className={styles.select}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select a project type
                </option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={styles.selectWrapper}
              data-status={status}
              style={getDelay(tokens.base.durationS, initDelay, 0.3)}
            >
              <label className={styles.selectLabel} htmlFor="budget">
                Budget range
              </label>
              <select id="budget" name="budget" className={styles.select} defaultValue="">
                <option value="">Select a budget range</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
            <Input
              className={styles.input}
              data-status={status}
              style={getDelay(tokens.base.durationS, initDelay, 0.5)}
              autoComplete="off"
              label="Deadline (optional)"
              name="deadline"
              maxLength={128}
              {...deadline}
            />
            <Input
              required
              multiline
              className={styles.input}
              data-status={status}
              style={getDelay(tokens.base.durationS, initDelay)}
              autoComplete="off"
              label="Project description"
              name="message"
              maxLength={MAX_MESSAGE_LENGTH}
              {...message}
            />
            <Transition
              unmount
              in={!sending && actionData?.errors}
              timeout={msToNum(tokens.base.durationM)}
            >
              {({ status: errorStatus, nodeRef: errNodeRef }) => (
                <div
                  className={styles.formError}
                  ref={errNodeRef}
                  data-status={errorStatus}
                  style={cssProps({
                    height: errorStatus ? errorRef.current?.offsetHeight : 0,
                  })}
                >
                  <div className={styles.formErrorContent} ref={errorRef}>
                    <div className={styles.formErrorMessage}>
                      <Icon className={styles.formErrorIcon} icon="error" />
                      {actionData?.errors?.email}
                      {actionData?.errors?.projectType}
                      {actionData?.errors?.message}
                    </div>
                  </div>
                </div>
              )}
            </Transition>
            <Button
              className={styles.button}
              data-status={status}
              data-sending={sending}
              style={getDelay(tokens.base.durationM, initDelay)}
              disabled={sending}
              loading={sending}
              loadingText="Sending..."
              icon="send"
              type="submit"
            >
              Submit request
            </Button>
          </Form>
        )}
      </Transition>
      <Transition unmount in={actionData?.success}>
        {({ status, nodeRef }) => (
          <div className={styles.complete} aria-live="polite" ref={nodeRef}>
            <Heading level={3} as="h3" className={styles.completeTitle} data-status={status}>
              Request Sent
            </Heading>
            <Text
              size="l"
              as="p"
              className={styles.completeText}
              data-status={status}
              style={getDelay(tokens.base.durationXS)}
            >
              We will review your project and get back to you within 48 hours.
            </Text>
            <Button
              secondary
              iconHoverShift
              className={styles.completeButton}
              data-status={status}
              style={getDelay(tokens.base.durationM)}
              href="/"
              icon="chevron-right"
            >
              Back to homepage
            </Button>
          </div>
        )}
      </Transition>
      <Footer className={styles.footer} />
    </Section>
  );
};

function getDelay(delayMs, offset = numToMs(0), multiplier = 1) {
  const numDelay = msToNum(delayMs) * multiplier;
  return cssProps({ delay: numToMs((msToNum(offset) + numDelay).toFixed(0)) });
}
