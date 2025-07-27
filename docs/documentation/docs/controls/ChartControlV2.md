# ChartControlV2 control

This control makes it easy to integrate [Chart.js v4](https://www.chartjs.org) charts into your web parts. It offers most of the functionality available with Chart.js v4, and is designed as a drop-in alternative to the original ChartControl, but uses the latest Chart.js API.

The control automatically renders responsive charts, uses the environment's theme colors, and renders a hidden table for users with impaired vision.

## How to use this control in your solutions

- Check that you installed the `@pnp/spfx-controls-react` dependency and that your project supports Chart.js v4. See [getting started](../../#getting-started) for more information.
- Import the following module to your component:

```TypeScript
import { ChartControlV2, ChartType } from '@pnp/spfx-controls-react/lib/ChartControlV2';
```

- Use the `ChartControlV2` control in your code as follows:

```TypeScript
<ChartControlV2 
  type={ChartType.Bar}
  data={{
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First dataset',
      data: [65, 59, 80, 81, 56, 55, 40]
    }]
  }} />
```

### Compatibility with Chart.js v4

Most Chart.js v4 options like `data`, `options`, `type`, and `plugins` will work the same way as is -- except that you use TypeScript syntax. See the [Chart.js v4 documentation](https://www.chartjs.org/docs/latest/) for more details and examples.

### Accessibility

ChartControlV2 automatically renders a hidden table for screen readers, similar to the original ChartControl.

### Migration from ChartControl

If you are using ChartControl and want to migrate to ChartControlV2, update your imports and ensure your chart configuration is compatible with Chart.js v4. Some breaking changes may exist between Chart.js v2 and v4, so refer to the [Chart.js migration guide](https://www.chartjs.org/docs/latest/getting-started/v3-migration.html).
