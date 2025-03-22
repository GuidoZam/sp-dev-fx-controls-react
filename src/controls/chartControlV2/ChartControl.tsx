import * as React from 'react';
import { IChartControlState, IChartControlProps } from './ChartControl.types';
import styles from './ChartControl.module.scss';
import { css } from '@fluentui/react/lib/Utilities';
import Chart, { ActiveElement, BubbleDataPoint, ChartData, ChartDataset, ChartEvent, ChartType, ChartTypeRegistry, DefaultDataPoint, FontSpec, Point } from 'chart.js/auto';
import { PaletteGenerator } from './PaletteGenerator';
import { AccessibleChartTable } from './AccessibleChartTable';
import * as telemetry from '../../common/telemetry';
import { ChartPalette } from './ChartControl.types';
import { ThemeColorHelper } from '../../common/utilities/ThemeColorHelper';

export class ChartControl extends React.Component<IChartControlProps, IChartControlState> {

  /**
   * Sets default properties
   */
  public static defaultProps: Partial<IChartControlProps> = {
    // We want accessibility on by default
    // -- it's the law in some countries!!!
    accessibility: {
      enable: true
    },
    useTheme: true,
    palette: ChartPalette.OfficeColorful1,
    // Make charts responsive so that they fit within their
    // parent elements
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  };

  /**
   * The ChartJs instance
   */
  private _chart: Chart;

  /**
   * The canvas element that will host the chart
   */
  private _canvasElem: HTMLCanvasElement = undefined;

  constructor(props: IChartControlProps) {
    super(props);

    telemetry.track('ReactChartComponentV2', {
      type: !!props.type,
      className: !!props.className,
      palette: !!props.palette,
      accessibility: !!props.accessibility.enable
    });

    this.state = {
      isLoading: false,
      rejected: undefined,
      data: undefined
    };
  }

  /**
   * componentDidMount lifecycle hook
   */
  public componentDidMount(): void {
    this._initChart(this.props, this.props.data);
  }

  /**
   * componentWillReceiveProps lifecycle hook
   *
   * @param nextProps
   */
  public UNSAFE_componentWillReceiveProps(nextProps: IChartControlProps): void {
    this._destroyChart();
    this._initChart(nextProps, this.props.data);
  }

  /**
   * componentWillUnmount lifecycle hook
   */
  public componentWillUnmount(): void {
    this._destroyChart();
  }

  /**
  * shouldComponentUpdate lifecycle hook
  *
  * @param nextProps
  * @param nextState
  */
  public shouldComponentUpdate(nextProps: IChartControlProps, nextState: IChartControlState): boolean {
    const { data,
      options,
      plugins,
      className,
      accessibility,
      useTheme,
      palette } = this.props;

    return data !== nextProps.data ||
      options !== nextProps.options ||
      plugins !== nextProps.plugins ||
      className !== nextProps.className ||
      useTheme !== nextProps.useTheme ||
      palette !== nextProps.palette ||
      accessibility !== nextProps.accessibility;
  }

  /**
   * Default React render method
   */
  public render(): React.ReactElement<IChartControlProps> {
    const {
      type,
      accessibility,
      useTheme,
      options,
      data,
      width,
      height
    } = this.props;

    // If we're still loading, try to show the loading template
    if (this.state.isLoading) {
      if (this.props.loadingtemplate) {
        if (typeof this.props.loadingtemplate === "function") {
          return this.props.loadingtemplate();
        } else {
          return this.props.loadingtemplate;
        }
      }
    }

    // If promise was rejected, try to show the rejected template
    if (this.state.rejected) {
      if (this.props.rejectedtemplate) {
        if (typeof this.props.rejectedtemplate === "function") {
          return this.props.rejectedtemplate(this.state.rejected);
        } else {
          return this.props.rejectedtemplate;
        }
      }
    }

    const alternateText: string = accessibility.alternateText;

    return (
      <div
        className={css(styles.chartComponent, (useTheme ? styles.themed : null), this.props.className)}
        style={{
          width: width ? width : '100%',
          height: height ? height : '100%'
        }}
      >
        <canvas ref={this._linkCanvas} role='img' aria-label={alternateText} />
        {
          accessibility.enable === undefined || accessibility.enable ? (
            <AccessibleChartTable
              chartType={type}
              data={data || this.state.data}
              chartOptions={options}
              className={accessibility.className}
              caption={accessibility.caption}
              summary={accessibility.summary}
              onRenderTable={accessibility.onRenderTable} />
          ) : null
        }
      </div>
    );
  }

  /**
   * Triggers an update of the chart.
   * This can be safely called after updating the data object.
   * This will update all scales, legends, and then re-render the chart.
   * @param config duration (number): Time for the animation of the redraw in milliseconds
   * lazy (boolean): If true, the animation can be interrupted by other animations
   * easing (string): The animation easing function.
   */
  public update(mode?: "resize" | "reset" | "none" | "hide" | "show" | "default" | "active" | ((ctx: {
    datasetIndex: number;
  }) => "resize" | "reset" | "none" | "hide" | "show" | "default" | "active")): void {
    this._chart.update(mode);
  }

  /**
   * Triggers a redraw of all chart elements.
   * Note, this does not update elements for new data. Use .update() in that case.
   */
  public renderChart(): void {
    this._chart.render();
  }

  /**
  Use this to stop any current animation loop.
  This will pause the chart during any current animation frame.
  Call .render() to re-animate.
   */
  public stop(): void {
    this._chart.stop();
  }

  /**
  Will clear the chart canvas.
  Used extensively internally between animation frames, but you might find it useful.
  */
  public clear(): void {
    this._chart.clear();
  }

  /**
  Returns a base 64 encoded string of the chart in it's current state.
  @returns {string} A base-64 encoded PNG data URL containing image of the chart in its current state
  */
  public toBase64Image(): string {
    return this._chart.toBase64Image();
  }

  /**
  Return the chartjs instance
   */
  //  tslint:disable-next-line no-any
  public getChart(): Chart {
    return this._chart;
  }

  /**
  Return the canvass element that contains the chart
  @returns {HTMLCanvasElement} the canvas element containig the chart
   */
  public getCanvas(): HTMLCanvasElement {
    return this._chart.canvas;
  }

  /**
  Looks for the element under the event point,
  then returns all elements from that dataset.
  This is used internally for 'dataset' mode highlighting
   * @param e An array of elements
   */
  public getDatasetAtEvent(e: MouseEvent): Array<{}> {
    return this.getChart().getElementsAtEventForMode(e, 'dataset', { intersect: true }, false);
  }

  /**
 * Calling getElementAtEvent(event) on your Chart instance passing an argument of an event,
 * or jQuery event, will return the single element at the event position.
 * If there are multiple items within range, only the first is returned.
 * The value returned from this method is an array with a single parameter.
 * An array is used to keep a consistent API between the get*AtEvent methods.
 * @param e the first element at the event point.
 */
  public getElementAtEvent(e: MouseEvent): {} {
    return this.getChart().getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
  }

  /**
  Looks for the element under the event point, then returns all elements
  at the same data index. This is used internally for 'label' mode highlighting.
  Calling getElementsAtEvent(event) on your Chart instance passing an argument of an
  event, or jQuery event, will return the point elements that are at that
  the same position of that event.
  * @param e
  */
  public getElementsAtEvent(e: MouseEvent): Array<{}> {
    return this.getChart().getElementsAtEventForMode(e, 'index', { intersect: true }, false);
  }

  /**
   * Initializes the chart
   * @param props chart control properties
   */
  private _initChart(props: IChartControlProps, data: ChartData<ChartType, DefaultDataPoint<ChartType>, unknown>): void {
    const {
      options,
      type,
      plugins,
      useTheme,
      onClick,
      onHover,
      onResize
    } = props;

    // add event handlers -- if they weren't already provided through options
    if (onClick !== undefined) {
      if (options.onClick === undefined) {
        options.onClick = onClick;
      }
    }

    // Add onhover
    if (onHover !== undefined) {
      if (options.onHover === undefined) {
        options.onHover = (event: ChartEvent,
          elements: ActiveElement[],
          chart: Chart<keyof ChartTypeRegistry, (number | [number, number] | Point | BubbleDataPoint)[], unknown>)
          : void => {
          onHover(event, elements, chart);
        };
      }
    }

    // Add onResize
    // Note that onResize won't work unless the chart is
    // position: relative and has a height and width defined
    if (onResize !== undefined) {
      if (options.onResize === undefined) {
        options.onResize = (chart: Chart, size: { width: number; height: number }) => {
          onResize(this.getChart(), size);
        };
      }
    }

    this._applyDatasetPalette(data);

    if (useTheme) {
      this._applyChartThemes();
    }

    this._chart = new Chart(this._canvasElem, {
      type: type,
      data: data,
      options: options
    });
  }

  private _applyDatasetPalette(data: ChartData<ChartType, DefaultDataPoint<ChartType>, unknown>): void {
    try {
      // Get the dataset
      const datasets: ChartDataset<ChartType, DefaultDataPoint<ChartType>>[] = data.datasets;

      if (datasets !== undefined) {
        datasets.forEach(dataset => {
          if (dataset.backgroundColor === undefined) {
            const datasetLength: number = dataset.data?.length;
            if (datasetLength) {
              dataset.backgroundColor = PaletteGenerator.GetPalette(this.props.palette, datasetLength);
            }
          }
        });
      }
    } catch (error) {
      // no-op;
      console.error(error);
    }
  }

  private _applyChartThemes(): void {
    try {
      Chart.defaults.color = ThemeColorHelper.GetThemeColor(styles.defaultFontColor);
      Chart.defaults.font.family = styles.defaultFontFamily;
      Chart.defaults.font.size = this._getFontSizeNumber(styles.defaultFontSize);
      Chart.defaults.plugins.title.color = ThemeColorHelper.GetThemeColor(styles.titleColor);
      Chart.defaults.plugins.title.font = {
        ...Chart.defaults.plugins.title.font,
        family: styles.titleFont
      };
      Chart.defaults.plugins.title.font.size = this._getFontSizeNumber(styles.titleFontSize);
      Chart.defaults.plugins.legend.labels.color = ThemeColorHelper.GetThemeColor(styles.legendColor);
      const legendFont = Chart.defaults.plugins.legend.labels.font as Partial<FontSpec>;
      if (legendFont) {
        legendFont.family = styles.legendFont;
      }
      if (Chart.defaults.plugins.legend.labels.font) {
        (Chart.defaults.plugins.legend.labels.font as FontSpec).size = this._getFontSizeNumber(styles.legendFontSize);
      }
      Chart.defaults.plugins.tooltip.backgroundColor = ThemeColorHelper.GetThemeColor(styles.tooltipBackgroundColor);
      Chart.defaults.plugins.tooltip.bodyColor = ThemeColorHelper.GetThemeColor(styles.tooltipBodyColor);
      if (Chart.defaults.plugins.tooltip.bodyFont) {
        (Chart.defaults.plugins.tooltip.bodyFont as FontSpec).family = styles.tooltipFont;
      }
      if (Chart.defaults.plugins.tooltip.bodyFont) {
        (Chart.defaults.plugins.tooltip.bodyFont as FontSpec).size = this._getFontSizeNumber(styles.tooltipFontSize);
      }
      Chart.defaults.plugins.tooltip.titleColor = ThemeColorHelper.GetThemeColor(styles.tooltipTitleColor);
      if (Chart.defaults.plugins.tooltip.titleFont) {
        (Chart.defaults.plugins.tooltip.titleFont as FontSpec).family = styles.tooltipTitleFont;
      }
      const titleFont = Chart.defaults.plugins.tooltip.titleFont as FontSpec | undefined;
      if (titleFont) {
        titleFont.size = this._getFontSizeNumber(styles.tooltipTitleFontSize);
      }
      Chart.defaults.plugins.tooltip.footerColor = ThemeColorHelper.GetThemeColor(styles.tooltipFooterColor);
      if (Chart.defaults.plugins.tooltip.footerFont) {
        (Chart.defaults.plugins.tooltip.footerFont as FontSpec).family = styles.tooltipFooterFont;
      }
      const footerFont = Chart.defaults.plugins.tooltip.footerFont as FontSpec | undefined;
      if (footerFont) {
        footerFont.size = this._getFontSizeNumber(styles.tooltipFooterFontSize);
      }
      Chart.defaults.plugins.tooltip.borderColor = ThemeColorHelper.GetThemeColor(styles.tooltipBorderColor);

      if (Chart.defaults
        && Chart.defaults.scale
        && Chart.defaults.scale.grid
        && Chart.defaults.scale.grid.color) {
        Chart.defaults.scale.grid.color = ThemeColorHelper.GetThemeColor(styles.lineColor);
      }
    } catch (error) {
      // no-op;
      console.error(error);
    }
  }

  private _destroyChart(): void {
    try {
      if (this._chart !== undefined || this._chart !== null) {
        this._chart.destroy();
      }
    } catch (error) {
      // no-op;
      console.error(error);
    }
  }

  private _linkCanvas = (e: HTMLCanvasElement): void => {
    console.log("linkCanvas", e);
    this._canvasElem = e;
  }

  // Reads one of the Office Fabric defined font sizes
  // and converts to a number
  private _getFontSizeNumber(value: string): number {
    try {
      return parseInt(value.replace('px', ''), 10);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
