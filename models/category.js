const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: "" },
  color: { type: String, default: "" },
});

categorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

categorySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id; // deletes `_id` columns before showing them.
  },
});

exports.Category = mongoose.model("Category", categorySchema);

exports.categorySchema = categorySchema;
