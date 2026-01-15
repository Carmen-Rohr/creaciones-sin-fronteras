const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
  const tag = event.queryStringParameters.tag;

  try {
    const result = await cloudinary.api.resources_by_tag(tag, {
      context: true,
      max_results: 100
    });

    // ORDEN: De la más antigua (primera subida) a la más nueva (última subida)
    const sortedResources = result.resources.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    const images = sortedResources.map(res => {
      let tituloFinal = "Obra Artística";
      if (res.context && res.context.custom && res.context.custom.caption) {
        tituloFinal = res.context.custom.caption;
      } else if (res.context && res.context.caption) {
        tituloFinal = res.context.caption;
      }

      return {
        url: res.secure_url,
        titulo: tituloFinal
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(images),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};