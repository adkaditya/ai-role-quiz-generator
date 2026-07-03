import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/quiz.service";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageCategoriesPage() {
  // Data states
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Filters
  const [categorySearch, setCategorySearch] = useState("");

  // Category modal states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", slug: "" });
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // category object or null
  const [deletingCategoryId, setDeletingCategoryId] = useState(null); // id or null
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Load categories
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await getCategories();
      if (res && res.data) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Submit add category
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return toast.error("Category name is required");

    setIsSavingCategory(true);
    try {
      const slug = categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await createCategory({
        name: categoryForm.name,
        description: categoryForm.description,
        slug,
      });
      if (res && res.data) {
        toast.success("Category created successfully");
        setIsAddCategoryOpen(false);
        setCategoryForm({ name: "", description: "", slug: "" });
        loadCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Submit edit category
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) return toast.error("Category name is required");

    setIsSavingCategory(true);
    try {
      const slug = editingCategory.slug.trim() || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await updateCategory(editingCategory._id, {
        name: editingCategory.name,
        description: editingCategory.description,
        slug,
      });
      if (res) {
        toast.success("Category updated successfully");
        setEditingCategory(null);
        loadCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Submit delete category
  const handleDeleteCategoryConfirm = async () => {
    setIsDeletingCategory(true);
    try {
      const res = await deleteCategory(deletingCategoryId);
      if (res) {
        toast.success("Category deleted successfully");
        setDeletingCategoryId(null);
        loadCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // Filter list
  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.description?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize fields of study, describe learning tracks, and manage URL slugs.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddCategoryOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
        >
          <FolderPlus size={14} /> Add Category
        </Button>
      </div>

      <Separator className="bg-border/60" />

      <Card className="border border-border/80 bg-card/40 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Available Learning Domains</CardTitle>
              <CardDescription className="text-xs">Category templates list.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-9 h-8 text-xs placeholder:text-muted-foreground/60"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingCategories ? (
            <div className="p-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span>Loading categories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No categories found. Click "Add Category" to create a new one.
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-y border-border bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Description</th>
                    <th className="py-3 px-4">Slug (URL Name)</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr key={cat._id} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-foreground">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-6 text-muted-foreground max-w-sm truncate">
                        {cat.description || "No description provided."}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        {cat.slug}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer"
                            onClick={() => setEditingCategory({ ...cat })}
                          >
                            <Edit2 size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                            onClick={() => setDeletingCategoryId(cat._id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG MODAL: ADD CATEGORY */}
      {isAddCategoryOpen && (
        <Dialog open={true} onOpenChange={(open) => !open && setIsAddCategoryOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground">Add New Category</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Setup a new topic field category.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name" className="text-xs font-semibold">Category Name</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Cyber Security"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-slug" className="text-xs font-semibold">Slug / URL Path (Optional)</Label>
                <Input
                  id="cat-slug"
                  placeholder="e.g. cyber-security"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                />
                <p className="text-[10px] text-muted-foreground/80">Generates automatically from name if left empty.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc" className="text-xs font-semibold">Description</Label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  placeholder="Provide a brief summary of the learning field..."
                  className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSavingCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSavingCategory ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG MODAL: EDIT CATEGORY */}
      {editingCategory && (
        <Dialog open={true} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground">Edit Category Details</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Modify the details of this domain category.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCategorySubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-cat-name" className="text-xs font-semibold">Category Name</Label>
                <Input
                  id="edit-cat-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-cat-slug" className="text-xs font-semibold">Slug / URL Path</Label>
                <Input
                  id="edit-cat-slug"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-cat-desc" className="text-xs font-semibold">Description</Label>
                <textarea
                  id="edit-cat-desc"
                  rows={2}
                  className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSavingCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSavingCategory ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG MODAL: DELETE CATEGORY CONFIRM */}
      {deletingCategoryId && (
        <Dialog open={true} onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-2.5 text-rose-500">
                <AlertTriangle size={18} />
                <DialogTitle className="text-sm font-bold">Delete Category</DialogTitle>
              </div>
              <DialogDescription className="text-xs pt-1.5">
                Are you sure you want to delete this category? This will remove the domain definition. Any quizzes using this category may become uncategorized.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingCategoryId(null)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={isDeletingCategory} onClick={handleDeleteCategoryConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isDeletingCategory ? "Deleting..." : "Permanently Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}