import { type EmailMessage, type EmailService, type ServiceResult, notConfigured, ok } from './types';

/** Development transport: writes to the server log so flows can be exercised. */
export class ConsoleEmailService implements EmailService {
  isConfigured(): boolean {
    return true;
  }

  status(): string {
    return 'Emails are written to the server log (development transport).';
  }

  async send(message: EmailMessage): Promise<ServiceResult<{ id: string }>> {
    console.info('[agriloop:email]', {
      to: message.to,
      subject: message.subject,
      preview: message.text.slice(0, 200),
    });
    return ok({ id: `console_${Date.now()}` });
  }
}

export class DisabledEmailService implements EmailService {
  isConfigured(): boolean {
    return false;
  }

  status(): string {
    return 'Email delivery is not configured. Verification and reset emails are not sent.';
  }

  async send(_message: EmailMessage): Promise<ServiceResult<{ id: string }>> {
    return notConfigured('Email delivery');
  }
}
