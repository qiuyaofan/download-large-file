// postcss 插件库 https://github.com/postcss/postcss/blob/main/docs/plugins.md
module.exports = {
  plugins: {
    // 自动添加浏览器前缀 https://github.com/postcss/autoprefixer
    autoprefixer: {},
    // 将 px 转为 rem https://github.com/cuth/postcss-pxtorem
    // 'postcss-pxtorem': {
    //   rootValue: 16,
    //   propList: ['*'],
    // },
    // 'postcss-px-to-viewport': {
    //   unitToConvert: 'px', // 需要转换的单位，默认为"px"
    //   viewportWidth: 1920, // 设计稿的视口宽度
    //   unitPrecision: 5, // 单位转换后保留的精度
    //   propList: ['*'],
    //   viewportUnit: 'vw',
    //   fontViewportUnit: 'vw',
    //   minPixelValue: 1,
    //   mediaQuery: false,
    //   replace: true,
    //   include: undefined,
    //   exclude: undefined,
    //   landscape: false,
    //   landscapeUnit: 'vw',
    //   landscapeWidth: 1920, // 横屏时使用的视口宽度
    // },
  },
};
