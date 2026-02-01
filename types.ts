export type Trend = 'UP' | 'DOWN' | 'FLAT' | 'RAPID_UP' | 'RAPID_DOWN';
export type Status = 'LOW' | 'IN_RANGE' | 'HIGH' | 'STALE';
export type SystemState = 'OK' | 'NO_SIGNAL' | 'WARMUP' | 'ERROR';
export type ScanState = 'IDLE' | 'SCANNING' | 'COMPLETE';
export type ImpactLevel = 'LOW' | 'MED' | 'HIGH';

export enum HealthStatus {
  SAFE = 'SAFE',
  MODERATE = 'MODERATE',
  CAUTION = 'CAUTION'
}

export interface Alternative {
  name: string;
  reason: string;
  carbsSaved: string;
}

export interface AssistantState {
  is_active: boolean;
  last_query?: string;
  response?: string;
  is_thinking: boolean;
}

export interface MetabolicData {
  system_state: SystemState;
  glucose: {
    value: number;
    unit: string;
    trend: Trend;
    status: Status;
    age_minutes: number;
  };
  calories: {
    consumed_today: number;
    daily_target: number;
    net_carbs_grams: number;
  };
  scan: {
    state: ScanState;
    impact_level: ImpactLevel;
    delta_glucose_min: number;
    delta_glucose_max: number;
    carbs_grams: number;
    sugars_grams: number;
    fiber_grams: number;
    food_name?: string;
  };
  assistant: AssistantState;
}

export interface NutritionData {
  foodName: string;
  totalCarbs: number;
  sugars: number;
  fiber: number;
  netCarbs: number;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  impact_high: boolean;
  alternatives: Alternative[];
}
