"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create reviews with linked user
  async create(ctx) {
    let entity;
    ctx.request.body.user = ctx.state.user.id;
    entity = await strapi.services.reviews.create(ctx.request.body);

    const data = await strapi.services.profiles.find({ user: entity.user.id });
    entity.user.profile = data[0];

    return sanitizeEntity(entity, { model: strapi.models.reviews });
  },
  // deleteAll reviews with linked user
  async deleteAll(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.reviews.find({
      user: user.id,
    });

    let entity;
    if (data) {
      data.forEach(async (d) => {
        entity = await strapi.services.reviews.delete({ id: d.id });
      });
    }

    return sanitizeEntity(entity, { model: strapi.models.reviews });
  },
};
