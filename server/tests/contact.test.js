import request from 'supertest';
import app from '../src/app.js';
import { renderContactEmail } from '../src/emails/ContactEmail.js';

describe('Contact Form & Resend Integration API', () => {
  describe('POST /api/contact validation', () => {
    it('should reject submission with missing or short name', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'A',
        email: 'alex@example.com',
        message: 'This is a valid inquiry message.',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('name');
    });

    it('should reject submission with invalid email format', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Alex Johnson',
        email: 'invalid-email-address',
        message: 'This is a valid inquiry message.',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('valid email');
    });

    it('should reject submission with message shorter than 10 characters', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        message: 'Too short',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('at least 10 characters');
    });
  });

  describe('POST /api/contact successful submission', () => {
    it('should successfully accept valid contact inquiry and return 200', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Alex Johnson',
        email: 'alex.johnson@techcorp.io',
        subject: 'Partnership Inquiry',
        message: 'We would love to feature our technical publications on OmniLog Platform 2.0.',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('received');
      expect(res.body.simulated).toBe(true);
    });

    it('should accept valid submission without optional subject', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Sara Connor',
        email: 'sara@resistance.net',
        message: 'Inquiring about monospace code highlighting capabilities.',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('React Email Template Rendering', () => {
    it('should render HTML with sender details, subject, and message block', async () => {
      const html = await renderContactEmail({
        name: 'Dave Architect',
        email: 'dave@distributed.io',
        subject: 'Raft Consensus Question',
        message: 'How is the Raft quorum logic represented in the 3D code viewer?',
        submittedAt: 'Fri, 16 Oct 2026 12:00:00 GMT',
      });

      expect(html).toContain('Dave Architect');
      expect(html).toContain('mailto:dave@distributed.io');
      expect(html).toContain('Raft Consensus Question');
      expect(html).toContain('Raft quorum logic');
      expect(html).toContain('OmniLog • Platform 2.0');
    });
  });
});
