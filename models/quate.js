import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  quote: String,
  author: String,
  category: [String],
});

quoteSchema.index({ quote: "text", author: "text", category: "text" }); 

// module.exports = mongoose.model('quote', quoteSchema);
const quote = mongoose.model("quote", quoteSchema);
export default quote;
