/**
 * @jest-environment jsdom
 */

import { createImage, preeLoadImages } from '../public/js/image';

describe('createImage', () => {
    it('creates an image with the specified src', () => {
      // Create mock input values
      const name = 'test';
      
      // Call the function
      const image = createImage(name);
      
      // Assert that the expected methods were called on the image object
      expect(image.src).toEqual('http://localhost/img/test.png'); // The image is located in the public/img folder and jest is configured to add localhost as the base url

      // Assert that the image is of type HTMLImageElement
        expect(image).toBeInstanceOf(HTMLImageElement);
     });
  });

  describe('preeLoadImages', () => {
    const imageNames =['test-image-1', 'test-image-2']
  
    it('returns an object with the same keys as the input array', () => {
      const result = preeLoadImages( imageNames );
      expect(Object.keys(result)).toEqual(expect.arrayContaining(imageNames));
    });
  
    it('returns an object with instances of HTMLImageElement as values', () => {
      const result = preeLoadImages( imageNames );
      Object.values(result).forEach((img) => {
        expect(img).toBeInstanceOf(HTMLImageElement);
      });
    });
  
    it('correctly sets the src attribute of each image', () => {
      const result = preeLoadImages( imageNames );
      Object.entries(result).forEach(([name, img]) => {
        expect(img.src).toEqual(`http://localhost/img/${name}.png`);
      });
    });

    it('returns an empty object if no input is provided', () => {
      const result = preeLoadImages();
      expect(result).toEqual({});
    });
  });