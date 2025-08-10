import { Chart, ChartData, ChartOptions } from 'chart.js-v4';

export interface IChartControlProps {
  accessibility?: IChartAccessibility;
  data?: ChartData;
  datapromise?: Promise<ChartData>;
  loadingtemplate?: JSX.Element | (() => JSX.Element | undefined);
  rejectedtemplate?: JSX.Element | ((rejected: {}) => JSX.Element | undefined);
  options?: ChartOptions;
  type: ChartType;
  className?: string;
  palette?: ChartPalette;
  useTheme?: boolean;
  onClick?(event?: MouseEvent, activeElements?: Array<{}>): void;
  onHover?(chart: Chart, event: MouseEvent, activeElements: Array<{}>): void;
  onResize?(chart: Chart, newSize: { width: number; height: number }): void;
}

export interface IChartControlState {
  isLoading: boolean;
  data?: ChartData;
  rejected?: {};
}

export enum ChartPalette {
  OfficeColorful1,
  OfficeColorful2,
  OfficeColorful3,
  OfficeColorful4,
  OfficeMonochromatic1,
  OfficeMonochromatic2,
  OfficeMonochromatic3,
  OfficeMonochromatic4,
  OfficeMonochromatic5,
  OfficeMonochromatic6,
  OfficeMonochromatic7,
  OfficeMonochromatic8,
  OfficeMonochromatic9,
  OfficeMonochromatic10,
  OfficeMonochromatic11,
  OfficeMonochromatic12,
  OfficeMonochromatic13
}

export interface IChartAccessibility {
  enable?: boolean;
  className?: string;
  caption?: string;
  summary?: string;
  alternateText?: string;
  onRenderTable?: () => JSX.Element;
}

export type ChartType = 'line' | 'bar' | 'radar' | 'doughnut' | 'polarArea' | 'bubble' | 'pie' | 'scatter';

export const ChartType = {
  Line: 'line' as ChartType,
  Bar: 'bar' as ChartType,
  Radar: 'radar' as ChartType,
  Doughnut: 'doughnut' as ChartType,
  PolarArea: 'polarArea' as ChartType,
  Bubble: 'bubble' as ChartType,
  Pie: 'pie' as ChartType,
  Scatter: 'scatter' as ChartType,
};
