"use strict";
const { sanitizeEntity } = require("strapi-utils");
const { convertRestQueryParams, buildQuery } = require("strapi-utils");
const { get } = require("strapi-utils/lib/policy");
const _ = require("lodash");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { slug } = ctx.params;
    const sort = "open:DESC";

    const data = await strapi.services.homes.find({ _sort: sort }, [
      "guest",
      "guest.profile",
      "guest.profile.images",
      "user",
      "user.profile",
      "user.profile.images",
      "images",
      "favorites",
      "favorites.user",
      "favorites.user.profile",
      "favorites.user.profile.images",
      "reviews",
      "reviews.user",
      "reviews.user.profile",
      "reviews.user.profile.images",
    ]);

    return sanitizeEntity(data, { model: strapi.models.homes });
  },
  // Get home by slug
  async findOne(ctx) {
    const { slug } = ctx.params;
    const entity = await strapi.services.homes.findOne({ slug: slug }, [
      "guest",
      "guest.profile",
      "guest.profile.images",
      "user",
      "user.profile",
      "user.profile.images",
      "images",
      "favorites",
      "favorites.user",
      "favorites.user.profile",
      "favorites.user.profile.images",
      "reviews",
      "reviews.user",
      "reviews.user.profile",
      "reviews.user.profile.images",
    ]);

    return sanitizeEntity(entity, { model: strapi.models.homes });
  },

  // Get home by id
  async findOneById(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.services.homes.findOne({ id: id });

    return sanitizeEntity(entity, { model: strapi.models.homes });
  },

  // Create home with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.homes.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.homes.create(ctx.request.body);
    }

    // Populate relationships in the created entity
    entity = await strapi.services.homes.findOne({ id: entity.id }, [
      "guest",
      "guest.profile",
      "guest.profile.images",
      "user",
      "user.profile",
      "user.profile.images",
      "images",
      "favorites",
      "favorites.user",
      "favorites.user.profile",
      "favorites.user.profile.images",
      "reviews",
      "reviews.user",
      "reviews.user.profile",
      "reviews.user.profile.images",
    ]);

    return sanitizeEntity(entity, { model: strapi.models.homes });
  },
  // Update user home
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [homes] = await strapi.services.homes.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!homes) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.homes.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.homes.update({ id }, ctx.request.body);
    }

    // Populate relationships in the created entity
    entity = await strapi.services.homes.findOne({ id: entity.id }, [
      "guest",
      "guest.profile",
      "guest.profile.images",
      "user",
      "user.profile",
      "user.profile.images",
      "images",
      "favorites",
      "favorites.user",
      "favorites.user.profile",
      "favorites.user.profile.images",
      "reviews",
      "reviews.user",
      "reviews.user.profile",
      "reviews.user.profile.images",
    ]);

    console.log("EEEEEE: ", entity);

    return sanitizeEntity(entity, { model: strapi.models.homes });
  },
  // Delete a user home
  async delete(ctx) {
    const { id } = ctx.params;

    const [homes] = await strapi.services.homes.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!homes) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.homes.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.homes });
  },
  // Get my home
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.homes.find({ user: user.id }, [
      "guest",
      "guest.profile",
      "guest.profile.images",
      "user",
      "user.profile",
      "user.profile.images",
      "images",
      "favorites",
      "favorites.user",
      "favorites.user.profile",
      "favorites.user.profile.images",
      "reviews",
      "reviews.user",
      "reviews.user.profile",
      "reviews.user.profile.images",
    ]);

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.homes });
  },

  // Get all near homes
  async findAllNear(ctx) {
    //console.log("findAllNear: ", ctx);
    console.log("findAllNear: ", ctx.params);

    // const result = strapi.services.homes.find({
    //   location: {
    //     $nearSphere: {
    //       $geometry: {
    //         type: "Point",
    //         coordinates: [61.492315, 21.800464],
    //       },
    //       $maxDistance: 300,
    //       // distanceField: "dist.distance",
    //       // includeLocs: "dist.location",
    //       // $maxDistance: 100000000,
    //       // spherical: true,
    //     },
    //   },
    // });

    var METERS_PER_MILE = 1609.34;
    console.log("EEE: ", strapi.services.homes);
    const result = strapi.services.homes.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [61.492315, 21.800464],
          },
          $maxDistance: 5000 * METERS_PER_MILE,
        },
      },
    });

    console.log("Results: ", result);
    const res = await Promise.resolve(result);
    console.log("res: ", res);
    const fields = res.map((entry) => entry.toObject());
    console.log("Fields: ", fields);
  },

  // async findAllNear(ctx) {
  //   console.log("CTX: ", ctx.params);
  //   const latitude = ctx.latitude;
  //   const longitude = ctx.longitude;
  //   const distance = 100000;
  //   console.log("latitude: ", latitude);
  //   console.log("longitude: ", longitude);
  //   console.log("distance: ", distance);
  //   const isGeoQuery = latitude && longitude && distance;
  //   // delete params._latitude;
  //   // delete params._longitude;
  //   // delete params.distance;
  //   const distanceInMilesSql = `
  // ST_distance_sphere( point(latitude, longitude), point(${latitude}, ${longitude})) as distance`;
  //   const knex = strapi.connections.default;
  //   // const filters = convertRestQueryParams(params);
  //   const model = strapi.models.homes;
  //   const query = buildQuery({ model });
  //   // const query = buildQuery({ model, filters });
  //   return model
  //     .query((qb) => {
  //       if (isGeoQuery) {
  //         console.log("Is geo query");
  //         qb.column(knex.raw(distanceInMilesSql));
  //         qb.having("distance", "<", distance);
  //         qb.orderBy("distance");
  //       }
  //       query(qb);
  //     })
  //     .fetchAll({
  //       // withRelated: populate,
  //       // transacting,
  //       // publicationState: filters.publicationState,
  //     })
  //     .then((results) => results.toJSON());
  // },
};
