import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import Post from "../models/post.model.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const smStream = new SitemapStream({ hostname: "https://stylemaven-ashen.vercel.app" });

    // Add static pages
    const staticPages = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/about", changefreq: "monthly", priority: 0.7 },
      { url: "/blog", changefreq: "weekly", priority: 0.9 },
      { url: "/contact", changefreq: "monthly", priority: 0.6 },
      { url: "/terms-and-conditions", changefreq: "yearly", priority: 0.4 },
      { url: "/privacy-policy", changefreq: "yearly", priority: 0.4 },
      { url: "/search", changefreq: "weekly", priority: 0.5 },
      { url: "/quote", changefreq: "weekly", priority: 0.5 },
    ];

    staticPages.forEach(page => smStream.write(page));

    // Add unique categories
    const categories = await Post.distinct("category");
    categories.forEach(cat => {
      smStream.write({
        url: `/category/${cat}`,
        changefreq: "weekly",
        priority: 0.7,
      });
    });

    // Add all blog posts dynamically
    const posts = await Post.find({}, "slug updatedAt metadescription keywords").sort({ updatedAt: -1 });

    posts.forEach(post => {
      smStream.write({
        url: `/post/${post.slug}`,
        lastmod: post.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
        // Custom metadata for SEO (not standard sitemap tags but useful for some crawlers)
        // Some search engines ignore these, but you can include them in XML if needed
        // For full SEO meta, also include meta tags in <head> of post pages
        meta: {
          title: post.title,
          description: post.metadescription || post.title,
          keywords: post.keywords.join(", "),
        },
      });
    });

    smStream.end();

    const sitemapOutput = await streamToPromise(smStream);
    res.header("Content-Type", "application/xml");
    res.send(sitemapOutput.toString());
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
