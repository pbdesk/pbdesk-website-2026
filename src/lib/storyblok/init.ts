import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";

const region = process.env.STORYBLOK_REGION ?? "eu";
const accessToken =
  process.env.STORYBLOK_PREVIEW_TOKEN ?? process.env.STORYBLOK_ACCESS_TOKEN;

storyblokInit({
  accessToken,
  apiOptions: {
    region,
  },
  components: {},
  use: [apiPlugin],
});
