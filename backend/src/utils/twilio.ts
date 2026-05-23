import twilio from 'twilio';

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  );
}

export function getTwilioClient() {
  if (!isTwilioConfigured()) return null;
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendVerificationSms(
  phone: string,
  code: string,
  role: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client) return false;
  try {
    await client.messages.create({
      body: `SOVEREIGN LEDGER | Identity Verification Code: ${code}. Access Role: ${role}.`,
      from: process.env.TWILIO_FROM_NUMBER!,
      to: phone,
    });
    return true;
  } catch (err: any) {
    console.error('[TWILIO ERROR]:', err.message);
    return false;
  }
}
