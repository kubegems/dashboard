import { colorRgbArray, deepCopy } from '@kubegems/libs/utils/helpers';

import config from './config.json';

const chartlineBaseColor = colorRgbArray(config.theme.THEME_COLOR.success);
const styleCover =
  `
:root {
  --primary-bg-img: url(` +
  `${config.layout.LOGO_BLUE}` +
  `);
  --white-bg-img: url(` +
  `${config.layout.LOGO_WHITE}` +
  `);
  --primary-color: ` +
  `${config.theme.THEME_COLOR.primary}` +
  `;
  --success-color: ` +
  `${config.theme.THEME_COLOR.success}` +
  `;
  --error-color: ` +
  `${config.theme.THEME_COLOR_OTHER.error}` +
  `;
  --warning-color: ` +
  `${config.theme.THEME_COLOR_OTHER.warning}` +
  `;
  --grey-color: ` +
  `${config.theme.THEME_COLOR_OTHER.grey}` +
  `;
  --grey-light-color: ` +
  `${config.theme.THEME_COLOR_OTHER.greyLight}` +
  `;
  --purple-color: ` +
  `${config.theme.THEME_COLOR_OTHER.critical}` +
  `;
  ` +
  `${Array.from('0123456789')
    .map((item, index) => {
      const nColor = deepCopy(chartlineBaseColor);
      nColor.push(0.8);
      return `--chart-line-${index}: rgba(${nColor
        .map((c, i) => {
          if (index % 2 === 0) {
            if (i === 2) {
              c += 8;
            }
          } else if (index % 2 === 1) {
            if (i === 1) {
              c -= 4;
            }
            if (i === 3) {
              c = 0.6;
            }
          }
          return c;
        })
        .join(',')});`;
    })
    .join('')}` +
  `
}
`;

const ele = document.createElement('style');
(ele.attributes as any).type = 'text/css';
ele.innerHTML = styleCover;
document.head.appendChild(ele);
