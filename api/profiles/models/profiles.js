const slugify = require("slugify");

module.exports = {
  /**
   * Triggered before user creation.
   */
  lifecycles: {
    async beforeCreate(data) {
      const { firstName, lastName } = data;
      if (firstName) {
        data.slug = slugify(
          `${Math.floor(Math.random() * 99999)}-${firstName}-${lastName}`,
          { lower: true }
        );
      }
    },
    async beforeUpdate(params, data) {
      const { firstName, lastName } = data;
      if (firstName) {
        data.slug = slugify(
          `${Math.floor(Math.random() * 99999)}-${firstName}-${lastName}`,
          { lower: true }
        );
      }
    },
  },
};
