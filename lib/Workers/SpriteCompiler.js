const imagemin = require('imagemin');
const svgo = require('imagemin-svgo');
const svgstore = require('svgstore');
const { basename, extname, resolve } = require('path');

const Worker = require('./Worker');
const { log } = require('../Utils/Logger');

class SpriteCompiler extends Worker {
  /**
   * Create a SVG Sprite image for each defined entry collection.
   */
  async init() {
    await this.services.FileSystem.source(
      this.name,
      async (entry, resolve) => {
        const destinationDirectory = this.services.FileSystem.resolveDestinationDirectory(entry);

        if (destinationDirectory) {
          const chunk = await SpriteCompiler.prepareSprite(entry);

          await this.buildSprite(chunk, destinationDirectory);
        }

        resolve();
      },
      true
    ).then(() => {
      this.resolve();
    });
  }

  /**
   * Prepares the defined entry vector images by removing styling attributes in
   * order to style the actual svg with css.
   *
   * @param {Array} entry The actual entries that will be optimized.
   */
  static prepareSprite(entry) {
    log('Preparing sprite entries...');

    return imagemin(entry, {
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
  }

  /**
   * Build the a SVG sprite within the defined chunk.
   *
   * @param {*} chunk The chunk that will be build to a Sprite.
   */
  buildSprite(chunk, destinationDirectory) {
    return new Promise(callback => {
      if (!chunk) {
        callback();
      }

      const sprite = chunk.reduce(
        (instance, item) => {
          return instance.add(
            `${this.config.prefix}${basename(item.sourcePath, extname(item.sourcePath))}`,
            item.data
          );
        },
        svgstore({
          inline: true,
          svgAttrs: {
            xmlns: 'http://www.w3.org/2000/svg',
          },
        })
      );

      if (sprite) {
        const filename = basename(this.config.name, extname(this.config.name));

        const path = resolve(destinationDirectory, `${filename}.svg`);

        this.services.FileSystem.writeFile(path, sprite.toString()).then(() => {
          callback();
        });
      }
    });
  }
}

module.exports = SpriteCompiler;
