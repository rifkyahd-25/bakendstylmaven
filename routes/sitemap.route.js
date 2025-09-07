import express from "express";
import { SitemapStream } from "sitemap";
import Post from "../models/post.model.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    res.header("Content-Type", "application/xml; charset=utf-8");

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
    const posts = await Post.find({}, "slug updatedAt").sort({ updatedAt: -1 });
    posts.forEach(post => {
      smStream.write({
        url: `/post/${post.slug}`,
        lastmod: post.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    smStream.end();

    // Pipe directly to response to avoid BOM and extra conversion
    smStream.pipe(res).on("error", (err) => {
      console.error(err);
      res.status(500).end();
    });

  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
