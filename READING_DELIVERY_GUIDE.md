# Reading Delivery System Implementation Guide

## Overview
This guide explains how to implement a delayed reading delivery system where customers receive their reading 1 hour after payment via email.

## Architecture

### Components Needed:
1. **Database** - Store orders and readings
2. **Backend API** - Handle payment webhooks and reading generation
3. **Scheduler** - Check for readings ready to send
4. **Email Service** - Send notification emails
5. **Reading Page** - Secure page to display reading

---

## Step 1: Database Setup (Using Supabase - Recommended)

### Install Supabase:
```bash
npm install @supabase/supabase-js
```

### Create Table Schema:
```sql
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  question_data JSONB NOT NULL,
  payment_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_timestamp TIMESTAMPTZ NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  reading_content TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  accessed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_delivery_timestamp ON readings(delivery_timestamp);
CREATE INDEX idx_access_token ON readings(access_token);
CREATE INDEX idx_email_sent ON readings(email_sent);
```

---

## Step 2: Payment Success Handler

### After Stripe Payment Success:
```typescript
// In your Stripe webhook handler or success callback
async function handlePaymentSuccess(paymentIntent: any, customerData: any) {
  const accessToken = generateSecureToken(); // Use crypto.randomBytes(32).toString('hex')
  const deliveryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  
  const { data, error } = await supabase
    .from('readings')
    .insert({
      order_id: paymentIntent.id,
      customer_email: customerData.email,
      customer_name: customerData.name,
      question_data: customerData.intakeData,
      delivery_timestamp: deliveryTime,
      access_token: accessToken,
    });
    
  // Send confirmation email
  await sendConfirmationEmail(customerData.email, {
    name: customerData.name,
    deliveryTime: deliveryTime,
  });
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

---

## Step 3: Scheduled Email Sender

### Option A: Supabase Edge Function (Cron)
```typescript
// supabase/functions/send-readings/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Find readings ready to send
  const { data: readyReadings } = await supabase
    .from('readings')
    .select('*')
    .lte('delivery_timestamp', new Date().toISOString())
    .eq('email_sent', false)
    
  for (const reading of readyReadings || []) {
    // Generate reading if not already generated
    if (!reading.reading_content) {
      const content = await generateReading(reading.question_data);
      await supabase
        .from('readings')
        .update({ reading_content: content })
        .eq('id', reading.id);
    }
    
    // Send email with link
    const readingUrl = `https://yourdomain.com/reading/${reading.access_token}`;
    await sendReadingEmail(reading.customer_email, {
      name: reading.customer_name,
      readingUrl: readingUrl,
    });
    
    // Mark as sent
    await supabase
      .from('readings')
      .update({ email_sent: true })
      .eq('id', reading.id);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Schedule the function (in Supabase dashboard):
```sql
-- Run every 5 minutes
SELECT cron.schedule(
  'send-ready-readings',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-readings',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

---

## Step 4: Email Templates

### Using Resend (Recommended):
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendReadingEmail(email: string, data: any) {
  await resend.emails.send({
    from: 'Wanda <readings@yourdomain.com>',
    to: email,
    subject: '🌙 Your Reading from Wanda is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Your Reading is Ready, ${data.name}!</h1>
        <p>Thank you for your patience. Your personalized reading from Wanda is now available.</p>
        <a href="${data.readingUrl}" 
           style="display: inline-block; background: #EAB308; color: #000; 
                  padding: 12px 24px; text-decoration: none; border-radius: 8px; 
                  font-weight: bold; margin: 20px 0;">
          View Your Reading
        </a>
        <p style="color: #666; font-size: 14px;">
          This link is unique to you and will remain accessible for 30 days.
        </p>
      </div>
    `,
  });
}

async function sendConfirmationEmail(email: string, data: any) {
  await resend.emails.send({
    from: 'Wanda <readings@yourdomain.com>',
    to: email,
    subject: '✨ Payment Confirmed - Your Reading is Being Prepared',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Thank You, ${data.name}!</h1>
        <p>Your payment has been received. Wanda is preparing your personalized reading.</p>
        <p style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #EAB308;">
          <strong>Delivery Time:</strong> ${data.deliveryTime.toLocaleString()}<br>
          You'll receive an email with a link to access your reading.
        </p>
      </div>
    `,
  });
}
```

---

## Step 5: Reading Display Page

### Create Reading Page Component:
```typescript
// App.tsx - Add new route
import { ReadingPage } from './components/ReadingPage';

// In your routing logic:
if (window.location.pathname.startsWith('/reading/')) {
  const token = window.location.pathname.split('/reading/')[1];
  return <ReadingPage token={token} />;
}
```

### Reading Page Component:
```typescript
// components/ReadingPage.tsx
import React, { useEffect, useState } from 'react';

interface ReadingPageProps {
  token: string;
}

export const ReadingPage: React.FC<ReadingPageProps> = ({ token }) => {
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReading();
  }, [token]);

  async function fetchReading() {
    try {
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('access_token', token)
        .single();

      if (error || !data) {
        setError('Reading not found or link is invalid.');
        return;
      }

      if (!data.email_sent) {
        setError('This reading is not yet available. Please check your email for the delivery time.');
        return;
      }

      // Mark as accessed
      await supabase
        .from('readings')
        .update({ accessed: true })
        .eq('id', data.id);

      setReading(data);
    } catch (err) {
      setError('Failed to load reading.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-indigo-100">Loading your reading...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0614] text-indigo-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif-mystic mb-6">Your Reading</h1>
        <div className="bg-indigo-950/50 p-8 rounded-2xl border border-indigo-800/30">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {reading.reading_content}
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## Step 6: Environment Variables

```env
# .env.local
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## Quick Start Checklist

- [ ] Set up Supabase project
- [ ] Create readings table
- [ ] Install dependencies (`@supabase/supabase-js`, `resend`)
- [ ] Create Supabase Edge Function for sending emails
- [ ] Set up cron job to run every 5 minutes
- [ ] Implement payment success handler
- [ ] Create reading display page
- [ ] Set up email templates
- [ ] Test the full flow

---

## Testing

1. Make a test payment
2. Check database - reading should be created with delivery_timestamp
3. Wait for scheduled function to run (or trigger manually)
4. Check email inbox for reading link
5. Click link to view reading

---

## Security Considerations

- Use secure random tokens (crypto.randomBytes)
- Never expose service role keys in frontend
- Implement rate limiting on reading page
- Set expiration dates for reading access
- Use HTTPS only
- Validate all inputs

---

## Cost Estimate (Monthly)

- Supabase: Free tier (up to 500MB database, 2GB bandwidth)
- Resend: Free tier (100 emails/day)
- Total: $0 for small volume, scales as needed
