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
          subject &&
            React.createElement(
              Text,
              { style: { color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' } },
              'Subject: ',
              React.createElement('span', { style: { color: '#e2e8f0', fontWeight: '500' } }, subject)
            ),
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
          '⚡ You can reply directly to this email to respond to ',
          React.createElement('strong', { style: { color: '#94a3b8' } }, name),
          ' at ',
          React.createElement(
            Link,
            { href: `mailto:${email}`, style: { color: '#818cf8', textDecoration: 'underline' } },
            email
          ),
          '.'
        )
      )
    )
  );
}

/**
 * Render ContactEmail component to HTML string
 */
export async function renderContactEmail(props) {
  const element = React.createElement(ContactEmail, props);
  return await render(element);
}
