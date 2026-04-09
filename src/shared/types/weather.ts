export interface WeatherMain {
  temp: number;
  feels_like?: number;
  temp_min?: number;
  temp_max?: number;
  humidity?: number;
  pressure?: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WindInfo {
  speed: number;
  deg?: number;
  gust?: number;
}

export interface WeatherCurrent {
  dt: number;
  timezone?: number;
  name?: string;
  main: WeatherMain;
  weather: WeatherCondition[];
  wind?: WindInfo;
}

export interface WeatherForecastItem {
  dt: number;
  dt_txt?: string;
  main: WeatherMain;
  weather: WeatherCondition[];
  wind?: WindInfo;
}

export interface WeatherForecast {
  list: WeatherForecastItem[];
  city?: {
    id?: number;
    name?: string;
    timezone?: number;
  };
}
