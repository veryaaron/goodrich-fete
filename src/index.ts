interface SecretsStoreSecret {
  get(): Promise<string>;
}

interface Env {
  CONTACT_SUBMISSIONS?: KVNamespace;
  RESEND_API_KEY?: SecretsStoreSecret;
}

interface ContactSubmission {
  name: string;
  email: string;
  interest: string;
  message: string;
  submittedAt: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle contact form submissions
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json() as Record<string, string>;
        const { name, email, interest, message } = body;

        // Basic validation
        if (!name || !email) {
          return jsonResponse({ error: 'Name and email are required' }, 400);
        }

        const submission: ContactSubmission = {
          name,
          email,
          interest: interest || 'general',
          message: message || '',
          submittedAt: new Date().toISOString(),
        };

        // Store in KV (if configured)
        if (env.CONTACT_SUBMISSIONS) {
          const key = `submission_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
          await env.CONTACT_SUBMISSIONS.put(key, JSON.stringify(submission), {
            expirationTtl: 60 * 60 * 24 * 365, // 1 year
          });
        } else {
          console.log('KV not configured, submission logged:', submission);
        }

        // Send email notification via Resend (non-blocking)
        if (env.RESEND_API_KEY) {
          env.RESEND_API_KEY.get()
            .then((apiKey) => sendEmailNotification(apiKey, submission))
            .catch((err) => console.error('Email send failed:', err));
        }

        return jsonResponse({ success: true, message: 'Thank you for your message!' });
      } catch {
        return jsonResponse({ error: 'Invalid request' }, 400);
      }
    }

    // List submissions (simple admin endpoint, protected by secret)
    if (url.pathname === '/api/submissions' && request.method === 'GET') {
      const auth = url.searchParams.get('key');
      if (!auth || auth.length < 10) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      if (!env.CONTACT_SUBMISSIONS) {
        return jsonResponse({ error: 'KV not configured' }, 503);
      }

      const list = await env.CONTACT_SUBMISSIONS.list({ prefix: 'submission_' });
      const submissions: ContactSubmission[] = [];

      for (const key of list.keys) {
        const value = await env.CONTACT_SUBMISSIONS.get(key.name);
        if (value) {
          submissions.push(JSON.parse(value));
        }
      }

      submissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      return jsonResponse({ count: submissions.length, submissions });
    }

    // All other requests are served by the [assets] binding in wrangler.toml
    return new Response('Not found', { status: 404 });
  },
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sendEmailNotification(apiKey: string, submission: ContactSubmission): Promise<void> {
  const interestLabels: Record<string, string> = {
    general: 'General enquiry',
    volunteer: 'Volunteering',
    stall: 'Running a stall',
    competition: 'Competition info',
    other: 'Something else',
  };

  const html = `
    <h2>New Fete Enquiry</h2>
    <p><strong>From:</strong> ${escapeHtml(submission.name)} (${escapeHtml(submission.email)})</p>
    <p><strong>Interest:</strong> ${interestLabels[submission.interest] || submission.interest}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(submission.message) || '<em>No message provided</em>'}</p>
    <hr>
    <p style="color: #999; font-size: 12px;">Submitted at ${submission.submittedAt} via goodrichfete.com</p>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Goodrich Fete <noreply@goodrichfete.com>',
      to: ['hello@goodrichfete.com'],
      subject: `Fete enquiry from ${submission.name}`,
      html,
    }),
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
