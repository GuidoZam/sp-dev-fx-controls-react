import * as React from 'react';
import { IChartControlV2State, IChartControlV2Props, ChartPaletteV2, ChartTypeV2 } from './ChartControlV2.types';
import styles from '../chartControl/ChartControl.module.scss';
import { css } from '@fluentui/react/lib/Utilities';
import { Chart, ChartConfiguration, ChartData, ChartDataset, Plugin, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js-v4';
import { PaletteGenerator } from '../chartControl/PaletteGenerator';
import { AccessibleChartTable } from '../chartControl/AccessibleChartTable';
import * as telemetry from '../../common/telemetry';
import { ThemeColorHelper } from '../../common/utilities/ThemeColorHelper';

Chart.register(CategoryScale, LinearScale, BarElement, BarController);

function mapPaletteV2ToV1(palette: ChartPaletteV2): number {
  // ChartPaletteV2 and ChartPalette enums have the same order, so direct cast works
  return palette as unknown as number;
}

export class ChartControlV2 extends React.Component<IChartControlV2Props, IChartControlV2State> {
  public static defaultProps: Partial<IChartControlV2Props> = {
    accessibility: {
      enable: true
    },
    useTheme: true,
    palette: ChartPaletteV2.OfficeColorful1,
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  };

  private _chart: Chart;
  private _canvasElem: HTMLCanvasElement = undefined;

  constructor(props: IChartControlV2Props) {
    super(props);
    telemetry.track('ReactChartComponentV2', {
      type: !!props.type,
      className: !!props.className,
      palette: !!props.palette,
      accessibility: !!props.accessibility?.enable
    });
    this.state = {
      isLoading: false,
      rejected: undefined,
      data: undefined
    };
  }

  public componentDidMount(): void {
    if (this.props.datapromise) {
      this._doPromise(this.props.datapromise);
    } else {
      this._initChart(this.props, this.props.data);
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps: IChartControlV2Props): void {
    if (nextProps.datapromise !== this.props.datapromise) {
      this.setState({
        isLoading: false
      });
      this._doPromise(nextProps.datapromise);
    } else {
      this._destroyChart();
      this._initChart(nextProps, this.props.data);
    }
  }

  public componentWillUnmount(): void {
    this._destroyChart();
  }

  public shouldComponentUpdate(nextProps: IChartControlV2Props, nextState: IChartControlV2State): boolean {
    const { data, options, plugins, className, accessibility, useTheme, palette } = this.props;
    return data !== nextProps.data ||
      options !== nextProps.options ||
      plugins !== nextProps.plugins ||
      className !== nextProps.className ||
      useTheme !== nextProps.useTheme ||
      palette !== nextProps.palette ||
      accessibility !== nextProps.accessibility;
  }

  public render(): React.ReactElement<IChartControlV2Props> {
    const { type, accessibility, useTheme, options, data } = this.props;
    if (this.state.isLoading) {
      if (this.props.loadingtemplate) {
        if (typeof this.props.loadingtemplate === "function") {
          return this.props.loadingtemplate();
        } else {
          return this.props.loadingtemplate;
        }
      }
    }
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
      <div className={css(styles.chartComponent, (useTheme ? styles.themed : null), this.props.className)} >
        <canvas ref={this._linkCanvas} role='img' aria-label={alternateText} />
        {
          accessibility.enable === undefined || accessibility.enable ? (
            <AccessibleChartTable
              chartType={type as any}
              data={(data || this.state.data) as any}
              chartOptions={options as any}
              className={accessibility.className}
              caption={accessibility.caption}
              summary={accessibility.summary}
              onRenderTable={accessibility.onRenderTable} />
          ) : null
        }
      </div>
    );
  }

  public update(): void {
    this._chart.update();
  }

  public renderChart(): void {
    this._chart.render();
  }

  public stop(): void {
    this._chart.stop();
  }

  public clear(): void {
    this._chart.clear();
  }

  public toBase64Image(): string {
    return this._chart.toBase64Image();
  }

  public getChart(): Chart {
    return this._chart;
  }

  public getCanvas(): HTMLCanvasElement {
    return this._chart.canvas as HTMLCanvasElement;
  }

  // Chart.js v4: use getElementsAtEventForMode
  public getElementsAtEvent(e: MouseEvent, mode: string = 'nearest', options = {}): Array<{}> {
    return this._chart.getElementsAtEventForMode(e, mode, options, false);
  }

  private _initChart(props: IChartControlV2Props, data: ChartData): void {
    const { options, type, plugins, useTheme } = props;
    this._applyDatasetPalette(data);
    if (useTheme) {
      this._applyChartThemes();
    }
    if (this._canvasElem) {
      const config: ChartConfiguration = {
        type: type as any, // ChartType may need to be mapped for v4
        data: data,
        options: options,
        plugins: (plugins as Plugin[]) // Cast to Plugin type
      };
      this._chart = new Chart(this._canvasElem.getContext('2d'), config);
    }
  }

  private _applyDatasetPalette(data: ChartData): void {
    try {
      const datasets = data.datasets as ChartDataset[];
      if (datasets !== undefined) {
        datasets.forEach((dataset: ChartDataset) => {
          if (dataset.backgroundColor === undefined) {
            const datasetLength: number = (dataset.data as number[] | undefined)?.length ?? 0;
            if (datasetLength) {
              dataset.backgroundColor = PaletteGenerator.GetPalette(mapPaletteV2ToV1(this.props.palette), datasetLength);
            }
          }
        });
      }
    } catch {
      // no-op;
    }
  }

  private _applyChartThemes(): void {
    try {
      // Chart.js v4 theme application
      Chart.defaults.color = ThemeColorHelper.GetThemeColor(styles.defaultFontColor);
      // Add more theme settings as needed
    } catch {
      // no-op;
    }
  }

  private _destroyChart(): void {
    try {
      if (this._chart !== undefined) {
        this._chart.destroy();
      }
    } catch {
      // no-op;
    }
  }

  private _linkCanvas = (e: HTMLCanvasElement): void => {
    this._canvasElem = e;
  }

  private _getFontSizeNumber(value: string): number {
    try {
      return parseInt(value.replace('px', ''), 10);
    } catch {
      return undefined;
    }
  }

  private _doPromise(promise: Promise<ChartData>): void {
    this.setState({
      isLoading: true
    }, () => {
      promise.then(
        results => {
          this.setState({
            isLoading: false,
            data: results
          }, () => {
            this._initChart(this.props, results);
          });
        },
        rejected => {
          this.setState({
            isLoading: false,
            rejected: rejected
          });
        }
      );
    });
  }
}
