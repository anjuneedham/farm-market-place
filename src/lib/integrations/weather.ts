import {
  type ServiceResult,
  type WeatherService,
  type WeatherSnapshot,
  notConfigured,
} from './types';

export class UnavailableWeatherService implements WeatherService {
  isConfigured(): boolean {
    return false;
  }

  status(): string {
    return 'Weather information is not connected to a data provider yet.';
  }

  async forRegion(_regionId: string): Promise<ServiceResult<WeatherSnapshot>> {
    return notConfigured('Weather information');
  }
}
