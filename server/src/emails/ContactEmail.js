import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import { render } from '@react-email/render';

/**
 * React Email Template for OmniLog Contact Inquiries
 */
export function ContactEmail({ name, email, subject, message, submittedAt }) {
  const formattedDate = submittedAt || new Date().toUTCString();

  return React.createElement(
    Html,
    { lang: 'en' },
    React.createElement(Head, null),
    React.createElement(Preview, null, `New OmniLog Message from ${name}: "${subject || 'General Inquiry'}"`),
    React.createElement(
      Body,
      {
        style: {
          backgroundColor: '#030712',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
          margin: '0 auto',
          padding: '24px 0',
        },
      },
      React.createElement(
        Container,
        {
          style: {
            backgroundColor: '#080e1e',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '36px 32px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
          },
        },
        // Header Badge
        React.createElement(
          Section,
          { style: { textAlign: 'center', marginBottom: '28px' } },
          React.createElement(
            'div',
            {
              style: {
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              },
            },
            '⚡ OmniLog • Platform 2.0 Inquiries'
          )
        ),
        // Title
        React.createElement(
          Heading,
          {
            style: {
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
            },
          },
          'New Contact Submission'
        ),
        React.createElement(
          Text,
          {
            style: {
              color: '#94a3b8',
              fontSize: '14px',
              textAlign: 'center',
              margin: '0 0 28px',
              lineHeight: '1.5',
            },
          },
          'A visitor submitted an inquiry through the OmniLog landing page contact portal.'
        ),
        React.createElement(Hr, { style: { borderColor: 'rgba(255, 255, 255, 0.08)', margin: '24px 0' } }),
        // Metadata Details Box
        React.createElement(
          Section,
          {
            style: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '20px 24px',
              marginBottom: '28px',
            },
          },
          React.createElement(
            Text,
            { style: { color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 6px', letterSpacing: '0.05em' } },
            'Sender Details'
          ),
          React.createElement(
            Text,
            { style: { color: '#f1f5f9', fontSize: '15px', fontWeight: '600', margin: '0 0 8px' } },
            name
          ),
          React.createElement(
            Text,
            { style: { color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' } },
            'Email: ',
            React.createElement(
              Link,
              { href: `mailto:${email}`, style: { color: '#818cf8', textDecoration: 'underline' } },
              email
            )
          ),
          subject
            ? React.createElement(
                Text,
                { style: { color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' } },
                `Subject: ${subject}`
              )
            : null,
          React.createElement(
            Text,
            { style: { color: '#64748b', fontSize: '11px', fontFamily: 'monospace', margin: '12px 0 0' } },
            `Received: ${formattedDate}`
          )
        ),
        // Message Content Box
        React.createElement(
          Text,
          { style: { color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' } },
          'Message Content'
        ),
        React.createElement(
          Section,
          {
            style: {
              backgroundColor: '#030712',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '20px 24px',
              marginBottom: '28px',
            },
          },
          React.createElement(
            Text,
            {
              style: {
                color: '#e2e8f0',
                fontSize: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
                margin: '0',
              },
            },
            message
          )
        ),
        React.createElement(Hr, { style: { borderColor: 'rgba(255, 255, 255, 0.08)', margin: '24px 0' } }),
        // Direct Reply Note
        React.createElement(
          Text,
          {
            style: {
              color: '#64748b',
              fontSize: '12px',
              textAlign: 'center',
              lineHeight: '1.6',
              margin: '0',
            },
          },
          `⚡ You can reply directly to this email to respond to ${name} at ${email}.`
        )
      )
    )
  );
}

/**
 * Render ContactEmail component to HTML string with resilient fallback
 */
export async function renderContactEmail(props) {
  try {
    const element = React.createElement(ContactEmail, props);
    return await render(element);
  } catch (err) {
    console.warn('⚠️ React Email render warning, using fallback HTML generator:', err.message);
    return generateFallbackEmailHtml(props);
  }
}

/**
 * Resilient static HTML email template generator
 * Ensures email generation never fails even in misconfigured SSR or React version mismatch environments
 */
export function generateFallbackEmailHtml({ name, email, subject, message, submittedAt }) {
  const formattedDate = submittedAt || new Date().toUTCString();
  const safeName = String(name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeEmail = String(email || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSubject = String(subject || 'General Inquiry').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeMessage = String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniLog Contact - ${safeSubject}</title>
</head>
<body style="background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px 0;">
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #080e1e; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 0 auto; padding: 36px 32px; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);">
    <tr>
      <td style="text-align: center; padding-bottom: 24px;">
        <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-family: monospace;">
          ⚡ OmniLog • Platform 2.0 Inquiries
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; text-align: center; letter-spacing: -0.025em; margin: 16px 0 8px;">
          New Contact Submission
        </h1>
        <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0 0 16px;">
          A visitor submitted an inquiry through the OmniLog landing page contact portal.
        </p>
      </td>
    </tr>
    <tr>
      <td style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(15, 23, 42, 0.8); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); padding: 20px 24px; margin-bottom: 24px;">
          <tr>
            <td>
              <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Sender Details</div>
              <div style="color: #f1f5f9; font-size: 15px; font-weight: 600; margin-bottom: 8px;">${safeName}</div>
              <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">
                Email: <a href="mailto:${safeEmail}" style="color: #818cf8; text-decoration: underline;">${safeEmail}</a>
              </div>
              <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">
                Subject: <span style="color: #e2e8f0; font-weight: 500;">${safeSubject}</span>
              </div>
              <div style="color: #64748b; font-size: 11px; font-family: monospace; margin-top: 12px;">Received: ${formattedDate}</div>
            </td>
          </tr>
        </table>

        <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">Message Content</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #030712; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.25); padding: 20px 24px; margin-bottom: 24px;">
          <tr>
            <td style="color: #e2e8f0; font-size: 14px; line-height: 1.7; word-break: break-word;">
              ${safeMessage}
            </td>
          </tr>
        </table>

        <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
          ⚡ You can reply directly to this email to respond to <strong style="color: #94a3b8;">${safeName}</strong> at <a href="mailto:${safeEmail}" style="color: #818cf8; text-decoration: underline;">${safeEmail}</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

