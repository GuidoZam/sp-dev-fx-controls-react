import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartDataset, Plugin } from 'chart.js-v4';

export interface IChartControlV2Props {
  accessibility?: IChartAccessibilityV2;
  data?: ChartData;
  datapromise?: Promise<ChartData>;
  loadingtemplate?: JSX.Element | (() => JSX.Element | undefined);
  rejectedtemplate?: JSX.Element | ((rejected: {}) => JSX.Element | undefined);
  options?: ChartOptions;
  type: ChartTypeV2;
  className?: string;
  palette?: ChartPaletteV2;
  plugins?: Plugin[];
  useTheme?: boolean;
  onClick?(event?: MouseEvent, activeElements?: Array<{}>): void;
  onHover?(chart: Chart, event: MouseEvent, activeElements: Array<{}>): void;
  onResize?(chart: Chart, newSize: { width: number; height: number }): void;
}

export interface IChartControlV2State {
  isLoading: boolean;
  data?: ChartData;
  rejected?: {};
}

export enum ChartPaletteV2 {
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

export interface IChartAccessibilityV2 {
  enable?: boolean;
  className?: string;
  caption?: string;
  summary?: string;
  alternateText?: string;
  onRenderTable?: () => JSX.Element;
}

export type ChartTypeV2 = 'line' | 'bar' | 'radar' | 'doughnut' | 'polarArea' | 'bubble' | 'pie' | 'scatter';

export const ChartTypeV2 = {
  Line: 'line' as ChartTypeV2,
  Bar: 'bar' as ChartTypeV2,
  Radar: 'radar' as ChartTypeV2,
  Doughnut: 'doughnut' as ChartTypeV2,
  PolarArea: 'polarArea' as ChartTypeV2,
  Bubble: 'bubble' as ChartTypeV2,
  Pie: 'pie' as ChartTypeV2,
  Scatter: 'scatter' as ChartTypeV2
};
