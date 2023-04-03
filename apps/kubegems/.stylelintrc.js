module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'color-no-invalid-hex': true,
    'rule-empty-line-before': null,
    'selector-pseudo-element-no-unknown': null, // 允许::v-deep样式穿透
    'color-hex-length': 'long',
    'color-hex-case': 'lower',
    'unit-allowed-list': ['em', 'rem', '%', 's', 'px', 'vh', 'vw', 'deg', 'turn'],
    'declaration-colon-newline-after': null,
    'font-family-no-missing-generic-family-keyword': null,
    'at-rule-no-unknown': [true, { ignoreAtRules: ['while'] }],
  },
};
