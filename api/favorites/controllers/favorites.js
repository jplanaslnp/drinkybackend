"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create favorites with linked user
  async create(ctx) {
    let entity;
    ctx.request.body.user = ctx.state.user.id;
    entity = await strapi.services.favorites.create(ctx.request.body);

    const data = await strapi.services.profiles.find({ user: entity.user.id });
    entity.user.profile = data[0];

    return sanitizeEntity(entity, { model: strapi.models.request });
  },

  // Get my favorites
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.favorites.find({
      user: user.id,
    });

    if (!data) {
      return ctx.notFound();
    }
    return sanitizeEntity(data, { model: strapi.models.request });
  },
  // deleteAll favorites with linked user
  async deleteAll(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.favorites.find({
      user: user.id,
    });

    let entity;
    if (data.length) {
      data.forEach(async (d) => {
        entity = await strapi.services.favorites.delete({ id: d.id });
      });
    }

    return sanitizeEntity(entity, { model: strapi.models.favorites });
  },
};
