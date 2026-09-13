import { UnavailableAIService } from './ai';
import { ConsoleEmailService, DisabledEmailService } from './email';
import { DataBackedMarketIntelligenceService } from './market-intelligence';
import { InAppNotificationService } from './notifications';
import { UnavailablePaymentService } from './payments';
import { LocalStorageService } from './storage';
import type {
  AIService,
  EmailService,
  MarketIntelligenceService,
  NotificationService,
  PaymentService,
  StorageService,
  WeatherService,
} from './types';
import { UnavailableWeatherService } from './weather';

/**
 * Provider selection. Swapping Resend for SES, or local storage for R2, is a
 * change in this file and nowhere else.
 */

function createEmailService(): EmailService {
  switch (process.env.EMAIL_PROVIDER) {
    case 'console':
      return new ConsoleEmailService();
    default:
      return new DisabledEmailService();
  }
}

function createStorageService(): StorageService {
  switch (process.env.STORAGE_PROVIDER) {
    case 'local':
    default:
      // 's3' is documented in .env.example and not implemented in the MVP.
      return new LocalStorageService();
  }
}

export const emailService: EmailService = createEmailService();
export const storageService: StorageService = createStorageService();
export const notificationService: NotificationService = new InAppNotificationService();
export const paymentService: PaymentService = new UnavailablePaymentService();
export const aiService: AIService = new UnavailableAIService();
export const weatherService: WeatherService = new UnavailableWeatherService();
export const marketIntelligenceService: MarketIntelligenceService =
  new DataBackedMarketIntelligenceService();

export * from './types';
export { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from './storage';
