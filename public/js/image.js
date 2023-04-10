export const createImage = (name) => {
    const img = new Image();
    img.src = `img/${name}.png`;
    return img;
};

export const preeLoadImages = (names = []) => {
    return names.reduce((imgs, name) => ({
      ...imgs,
      [name]: createImage(name),
    }), {});
  };
