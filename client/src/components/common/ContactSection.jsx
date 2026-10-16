import React, { useState } from 'react';
import {
  Mail,
  Send,
  User,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Card3D from './Card3D.jsx';
import ParallaxLayer from './ParallaxLayer.jsx';
import Button from './Button.jsx';
import { contactApi } from '../../api/contact.js';
import { useToast } from './Toast.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactSection() {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validate = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return 'Please enter your name (at least 2 characters).';
    }
    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      return 'Please provide a message with at least 10 characters.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await contactApi.submitMessage(formData);
      setSubmitted(true);
      setIsSimulated(Boolean(res.simulated));
      showToast(res.message || 'Message sent successfully!', 'success');
    } catch (err) {
      const errMsg = err.message || 'Failed to send message. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setSubmitted(false);
    setError(null);
    setIsSimulated(false);
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
      <ParallaxLayer depth={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Context & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 shadow-glow-indigo">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Contact Me</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Let’s Connect & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400">
                Build Together.
              </span>
            </h2>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Have architectural questions, editorial proposals, bug reports, or platform feedback? Send a direct dispatch to us.
            </p>

            {/* Quality Badges */}
            <div className="pt-2 space-y-3.5">
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Average response within 24 business hours</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/70 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <span>Integrated with Resend & React Email</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-xl bg-violet-950/70 text-violet-400 flex items-center justify-center border border-violet-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Spam-protected & rate-limited endpoint</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Form Card */}
          <div className="lg:col-span-7">
            <Card3D maxTilt={5}>
              <div className="glass-panel p-7 sm:p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                {/* Glow Orb in Corner */}
                <div className="absolute -top-20 -right-20 w-52 h-52 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                {submitted ? (
                  /* Success State */
                  <div className="py-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-glow-emerald">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Message Dispatched!
                      </h3>
                      <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out. Your inquiry has been routed through Resend to our editorial team, and we will get back to you shortly.
                      </p>
                      {isSimulated && (
                        <p className="text-xs font-mono text-indigo-300 bg-indigo-950/50 py-1.5 px-3 rounded-xl border border-indigo-500/30 max-w-sm mx-auto">
                          ℹ️ Dev Note: Dispatched in Resend simulation mode.
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="secondary"
                        size="md"
                        icon={RefreshCw}
                        onClick={handleReset}
                      >
                        Send Another Inquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Active Form State */
                  <form onSubmit={handleSubmit} className="space-y-5 relative">
                    <div className="border-b border-white/10 pb-4 mb-2">
                      <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-400" />
                        <span>Send an Inquiry</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fill in your details below and we will answer your message promptly.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Field */}
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-medium text-slate-300 mb-1.5"
                        >
                          Your Name <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            id="contact-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Alex Johnson"
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-medium text-slate-300 mb-1.5"
                        >
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            id="contact-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="alex@techcorp.io"
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-medium text-slate-300 mb-1.5"
                      >
                        Subject <span className="text-slate-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          id="contact-subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Collaboration, Article Proposal, or Question"
                          disabled={loading}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Message Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="contact-message"
                          className="block text-xs font-medium text-slate-300"
                        >
                          Message <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formData.message.length}/2000
                        </span>
                      </div>
                      <div className="relative">
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Describe your inquiry, feedback, or topic idea..."
                          disabled={loading}
                          maxLength={2000}
                          className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 resize-y min-h-[110px]"
                          required
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Encrypted & delivered via Resend</span>
                      </span>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        loading={loading}
                        icon={Send}
                        iconPosition="right"
                        className="shadow-glow-indigo"
                      >
                        {loading ? 'Transmitting...' : 'Send'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Card3D>
          </div>
        </div>
      </ParallaxLayer>
    </section>
  );
}
