import express from "express";
import Quote from "../models/quate.js";

const router = express.Router();

// GET /api/quotes/search?q=life&page=1&limit=10
router.get("/search", async (req, res) => {
  const { q = "", page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const results = await Quote.find({ $text: { $search: q } }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get("/category", async (req, res) => {
//   const { name = "", page = 1, limit = 10 } = req.query;
//   const skip = (page - 1) * limit;

//   try {
//     const regex = new RegExp(`\\b${name}\\b`, "i"); // exact word match, case-insensitive

//     const results = await Quote.find({ category: { $regex: regex } })
//       .skip(skip)
//       .limit(parseInt(limit));

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


// GET /api/quotes/category?name=life&page=1&limit=10
// router.get("/category", async (req, res) => {
//   const { name = "", page = 1, limit = 10 } = req.query;
//   const skip = (page - 1) * limit;

//   try {
//     const results = await Quote.find({ category: name.toLowerCase() })
//       .skip(skip)
//       .limit(parseInt(limit));

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/category", async (req, res) => {
  const { name = "", page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const results = await Quote.find({
      category: { $elemMatch: { $regex: `^${name}$`, $options: "i" } }
    })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// GET /api/categories
// router.get("/categories", async (req, res) => {
//   try {
//     const categories = await Quote.distinct("category");
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/categories", async (req, res) => {
    try {
      const categoryStrings = await Quote.distinct("category");
      // categoryStrings is array of comma-separated strings
      
      // flatten all categories to single array
      const categoriesSet = new Set();
  
      categoryStrings.forEach(str => {
        str.split(",").forEach(cat => {
          categoriesSet.add(cat.trim().toLowerCase());
        });
      });
  
      const categories = Array.from(categoriesSet).filter(c => c.length > 0);
  
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// router.get("/categories", async (req, res) => {
//   try {
//     // Get all distinct category values (from array elements)
//     const categoryItems = await Quote.distinct("category");

//     // Normalize to lowercase, remove duplicates, remove empty
//     const categories = [...new Set(
//       categoryItems.map(cat => cat.trim().toLowerCase())
//     )].filter(cat => cat.length > 0);

//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

  

export default router;
