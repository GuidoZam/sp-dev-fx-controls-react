import { ChartData, ChartOptions, DefaultDataPoint, ChartType } from "chart.js";

/**
 * The properties for the Accessible Chart Table object
 */
export interface IAccessibleChartTableProps {
  /**
   * Provides a caption for the accessible table
   * @default defaults to the chart's title if any
   */
  caption?: string;

  /**
   * Allows you to overwrite the default CSS class name
   * of the accessible table
   */
  className?: string;

  /**
  The identifier of the chart container
   */
  key?: string;

  /**
   * Provides a summary of the data
   */
  summary?: string;

  /**
  The data to be displayed in the chart
  @type {ChartData<ChartType, DefaultDataPoint<ChartType>, unknown>}
  */
  data?: ChartData<ChartType, DefaultDataPoint<ChartType>, unknown>;

  /**
  The options for the chart
  @type {ChartOptions}
   */
  chartOptions?: ChartOptions & {};

  /**
  The type of chart to render
  @type {ChartType}
   */
  chartType: ChartType;

  /** The labels as provided by the chart */
  chartLabels?: string[];

  /**
   * Allows you to custom-render your own accessible table
   */
  onRenderTable?: () => JSX.Element;
}

/**
 * The state of a chart table
 */
export interface IAccessibleChartTableState {
  //  nothing for now
}
