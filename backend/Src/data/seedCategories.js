const slugify = require('slugify');
const { Category } = require('../model');

async function seedCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  await Category.insertMany(
    ['TV', 'Washing Machine', 'Refrigerator', 'Air Conditioner', 'Microwave', 'Vacuum Cleaner', 'Kitchen Appliances'].map((name) => ({
      name,
      slug: slugify(name, { lower: true, strict: true }),
    }))
  );
}

module.exports = seedCategories;
