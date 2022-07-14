export const THEME_COLORS = ['#00BCD4', '#1e88e5', '#fb8c00', '#ff5252', '#607d8b'];

export function generateRadialBarChartOptions(title, labels, total, suffix = '', show = false) {
  return {
    chart: {
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    title: {
      show: false,
      text: '',
      align: 'center',
      style: {
        fontSize: '14px',
      },
    },
    colors: THEME_COLORS,
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 1,
          size: '60%',
        },
        dataLabels: {
          value: {
            fontSize: '14px',
            formatter: function (val) {
              let tl = parseFloat(total).toFixed(2);
              if (parseInt(tl) === parseFloat(tl)) {
                tl = parseInt(tl);
              }
              if (val === 0) {
                return `0 / ${tl} ${suffix}`;
              }
              let used = parseFloat((val * parseFloat(tl)) / 100).toFixed(2);
              if (parseInt(used) === parseFloat(used)) {
                used = parseInt(used);
              }

              return `${used} / ${tl} ${suffix}`;
            },
          },
          total: {
            fontSize: '14px',
            show: show,
            label: `${title}`,
            formatter: function () {
              let tl = parseFloat(total).toFixed(2);
              if (parseInt(tl) === parseFloat(tl)) {
                tl = parseInt(tl);
              }
              return `${tl} ${suffix}`;
            },
          },
        },
      },
    },
    labels: labels,
    tooltip: {
      theme: 'dark',
    },
  };
}
