"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create request with linked user
  async create(ctx) {
    let entity;
    ctx.request.body.user = ctx.state.user.id;
    entity = await strapi.services.request.create(ctx.request.body);

    return sanitizeEntity(entity, { model: strapi.models.request });
  },
  // Get my requests
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }
    const data = await strapi.services.request.find(
      {
        user: user.id,
        status_in: ["pending", "accepted"],
        _sort: "created_at:desc",
      },
      [
        "home.guest",
        "home.guest.profile",
        "home.guest.profile.images",
        "home.user",
        "home.user.profile",
        "home.user.profile.images",
        "home.images",
        "home.favorites",
        "home.favorites.user",
        "home.favorites.user.profile",
        "home.favorites.user.profile.images",
        "home.reviews",
        "home.reviews.user",
        "home.reviews.user.profile",
        "home.reviews.user.profile.images",
      ]
    );

    if (!data) {
      return ctx.notFound();
    }
    return sanitizeEntity(data, { model: strapi.models.request });
  },
  // Update user home
  async update(ctx) {
    const { id } = ctx.params;
    let entity;

    const [requests] = await strapi.services.request.find(
      {
        id: ctx.params.id,
      },
      [
        "home.guest",
        "home.guest.profile",
        "home.guest.profile.images",
        "home.user",
        "home.user.profile",
        "home.user.profile.images",
        "home.images",
        "home.favorites",
        "home.favorites.user",
        "home.favorites.user.profile",
        "home.favorites.user.profile.images",
        "home.reviews",
        "home.reviews.user",
        "home.reviews.user.profile",
        "home.reviews.user.profile.images",
      ]
    );

    if (!requests) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    entity = await strapi.services.request.update({ id }, ctx.request.body);

    if (ctx.request.body.status === "finished") {
      const guests = home.guest.filter(
        (guest) => guest.id !== ctx.state.user.id
      );

      const home = requests.home;
      home.guest = guests;
      home.user = home.user.id;

      await strapi.services.homes.update(
        { id: ctx.request.body.home.id },
        home
      );
    }

    return sanitizeEntity(entity, { model: strapi.models.request });
  },
  // Get requests home
  async home(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }
    //TODO: When having redux the id that comes with params is the home id
    //We have to remove than query
    const homeOfUser = await strapi.services.homes.find({
      user: ctx.state.user.id,
    });

    if (homeOfUser.length === 0) {
      return ctx.notFound();
    }

    const data = await strapi.services.request.find(
      { home: homeOfUser[0].id, status: "pending" },
      ["user", "user.profile", "user.profile.images", "home", "home.guest"]
    );

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.request });
  },
  // Get pending request for a house
  async homeCheck(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.request.find({
      home: id,
      user: user.id,
      status_in: ["pending", "accepted"],
    });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.request });
  },

  // Get pending request for a house
  async updateOnHouseClosed(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.request.find({
      home: id,
      // user: user.id,
      status_in: ["pending", "accepted"],
    });

    if (!data) {
      return ctx.notFound();
    } else {
      data.forEach(async (d) => {
        d.status = "finished";
        await strapi.services.request.update({ id: d.id }, d);
      });
    }

    return sanitizeEntity(data, { model: strapi.models.request });
  },

  // deleteAll requests with linked user
  async deleteAll(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    // TODO: Check if on remove user we remove requests to out house and not only the ones made by our user
    if (ctx.request.body.home) {
      const dataReq = await strapi.services.request.find({
        home: ctx.request.body.home,
      });
      if (dataReq) {
        dataReq.forEach(async (d) => {
          entity = await strapi.services.request.delete({ id: d.id });
        });
      }
    }

    const data = await strapi.services.request.find({
      user: user.id,
    });

    let entity;
    if (data) {
      data.forEach(async (d) => {
        entity = await strapi.services.request.delete({ id: d.id });
      });
    }

    return sanitizeEntity(entity, { model: strapi.models.request });
  },
};
