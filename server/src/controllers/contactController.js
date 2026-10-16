import { Resend } from 'resend';
import { renderContactEmail } from '../emails/ContactEmail.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @desc    Submit a contact message and dispatch via Resend
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your name (at least 2 characters).',
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Name cannot exceed 100 characters.',
      });
    }

    // Validate Email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    // Validate Subject (Optional)
    const cleanSubject = typeof subject === 'string' ? subject.trim() : '';
    if (cleanSubject.length > 150) {
      return res.status(400).json({
        success: false,
        error: 'Subject cannot exceed 150 characters.',
      });
    }

    // Validate Message
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a message with at least 10 characters.',
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot exceed 2000 characters.',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();
    const submittedAt = new Date().toUTCString();

    // Render email HTML via React Email
    const html = await renderContactEmail({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      submittedAt,
    });

    const apiKey = process.env.RESEND_API_KEY;
    const isPlaceholderOrMissing =
      !apiKey ||
      apiKey.startsWith('re_placeholder') ||
      apiKey === 'your_resend_api_key_here';

    // Development or Test fallback simulation
    if (isPlaceholderOrMissing || process.env.NODE_ENV === 'test') {
      console.log(
        `📨 [Resend Simulation] Contact message from ${cleanName} <${cleanEmail}>: "${cleanSubject || 'General Inquiry'}"`
      );
      return res.status(200).json({
        success: true,
        message: 'Thank you! Your message has been received.',
        simulated: true,
      });
    }

    // Production delivery via Resend API
    const resend = new Resend(apiKey);
    const fromAddress = process.env.CONTACT_EMAIL_FROM || 'OmniLog Contact <onboarding@resend.dev>';
    const toAddress = process.env.CONTACT_EMAIL_TO || 'amitbora007@gmail.com';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      reply_to: cleanEmail,
      subject: `[OmniLog Contact] ${cleanSubject || 'New message from ' + cleanName}`,
      html,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      const resendErrMsg = typeof error === 'string' ? error : (error.message || JSON.stringify(error) || 'Failed to dispatch email via Resend.');
      return res.status(500).json({
        success: false,
        error: resendErrMsg,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      id: data?.id,
    });
  } catch (err) {
    console.error('❌ Contact Controller Exception:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to send message. Please try again later.',
    });
  }
};
