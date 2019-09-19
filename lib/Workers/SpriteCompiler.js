const imagemin = require('imagemin');
const svgo = require('imagemin-svgo');
const svgstore = require('svgstore');

const Worker = require('./Worker');

class SpriteCompiler extends Worker {
  constructor(services) {
    super(services, 'sprites', true);
  }

  /**
   *
   */
  async init() {
    const entries = this.services.FileSystem.getStack(this.name);

    console.log(entries);

    return;

    // Optimize the defined entry files before it will be bundled within a sprite.
    const build = await imagemin(entries, {
      use: [
        svgo({
          plugins: [
            {
              convertPathData: false,
            },
            {
              removeViewBox: false,
            },
            {
              removeAttrs: {
                attrs: ['(fill|stroke|class|style)', 'svg:(width|height)'],
              },
            },
          ],
        }),
      ],
    });

    console.log(build);
  }
}

module.exports = SpriteCompiler;
