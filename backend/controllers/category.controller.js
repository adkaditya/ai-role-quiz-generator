import Category from "../models/category.model.js";

export const createCategory = async (req, resp) => {
  //here we have to write create category logic
  const { name, description, slug } = req.body;

  //validations
  if (!name) {
    return resp.status(400).json({
      message: "Category name is required",
    });
  }

  try {
    const newCategory = await Category.create({
      name,
      description,
      slug,
    });

    console.log("creating category");
    return resp.json({
      message: "category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "something went wrong ",
      error: error,
    });
  }
};

export const getCategories = async (req, resp) => {
  const categories = await Category.find();
  return resp.status(200).json({
    data: categories,
  });
};

export const getCategory = async (req, resp) => {
  //category id: fetch url

  const categoryId = req.params.id;

  try {
    const category = await Category.findOne({ _id: categoryId });
    return resp.status(200).json(category);
  } catch (error) {
    console.log(error);
    return resp.status(404).json({
      message: "category not found",
      error: error,
    });
  }
};

export const deleteCategory = async (req, resp) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findOneAndDelete({ _id: categoryId });

    if (!category) {
      return resp.status(404).json({
        message: "category not found",
      });
    }

    return resp.status(200).json(category);
  } catch (error) {
    console.log(error);
    return resp.status(404).json({
      message: "category not found",
      error: error,
    });
  }
};

export const updateCategory = async (req, resp) => {
  const categoryId = req.params.id;
  const { name, description, slug } = req.body;

  try {
    const category = await Category.findOneAndUpdate(
      { _id: categoryId },
      { name, description, slug },
      { new: true }
    );

    if (!category) {
      return resp.status(404).json({
        message: "category not found",
      });
    }

    return resp.status(200).json(category);
  } catch (error) {
    console.log(error);
    return resp.status(404).json({
      message: "category not found",
      error: error,
    });
  }
};