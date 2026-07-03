import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  getCategories,
  getQuizzesAdmin,
  updateQuiz,
  deleteQuiz
} from "../../services/quiz.service";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Tag,
  Clock,
  BookOpen,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageQuizzesPage() {
  const navigate = useNavigate();

  // Data states
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);

  // Filters
  const [quizSearch, setQuizSearch] = useState("");

  // Modals state
  const [editingQuiz, setEditingQuiz] = useState(null); // quiz object or null
  const [deletingQuizId, setDeletingQuizId] = useState(null); // id or null
  const [isUpdatingQuiz, setIsUpdatingQuiz] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);

  // Load quizzes
  const loadQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const res = await getQuizzesAdmin({ limit: 100 });
      if (res && res.status === "success") {
        setQuizzes(res.data.quizzes || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quizzes");
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  // Load categories (needed for editing dropdown)
  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res && res.data) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQuizzes();
    loadCategories();
  }, []);

  // Toggle quiz publish status inline
  const handleTogglePublish = async (quiz) => {
    try {
      const updatedStatus = !quiz.isPublished;
      const res = await updateQuiz(quiz._id, { isPublished: updatedStatus });
      if (res && res.status === "success") {
        toast.success(`Quiz ${updatedStatus ? "published" : "unpublished"} successfully`);
        setQuizzes(prev => prev.map(q => q._id === quiz._id ? { ...q, isPublished: updatedStatus } : q));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quiz status");
    }
  };

  // Submit edit quiz
  const handleEditQuizSubmit = async (e) => {
    e.preventDefault();
    if (!editingQuiz.title.trim()) return toast.error("Quiz title is required");

    setIsUpdatingQuiz(true);
    try {
      const tagsArray = typeof editingQuiz.tags === "string"
        ? editingQuiz.tags.split(",").map(t => t.trim()).filter(Boolean)
        : editingQuiz.tags;

      const payload = {
        title: editingQuiz.title,
        description: editingQuiz.description,
        categoryId: editingQuiz.categoryId || editingQuiz.category?._id,
        difficulty: editingQuiz.difficulty,
        timer: Number(editingQuiz.timer) || 15,
        isPublished: editingQuiz.isPublished,
        tags: tagsArray,
      };

      const res = await updateQuiz(editingQuiz._id, payload);
      if (res && res.status === "success") {
        toast.success("Quiz updated successfully");
        setEditingQuiz(null);
        loadQuizzes();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quiz");
    } finally {
      setIsUpdatingQuiz(false);
    }
  };

  // Submit delete quiz
  const handleDeleteQuizConfirm = async () => {
    setIsDeletingQuiz(true);
    try {
      const res = await deleteQuiz(deletingQuizId);
      if (res && res.status === "success") {
        toast.success("Quiz deleted successfully");
        setDeletingQuizId(null);
        loadQuizzes();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete quiz");
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  // Filter list
  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(quizSearch.toLowerCase()) ||
    q.description?.toLowerCase().includes(quizSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quiz Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, edit, publish, or delete existing quiz modules.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/dashboard/add-quiz")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
        >
          <Plus size={14} /> Create Quiz
        </Button>
      </div>

      <Separator className="bg-border/60" />

      <Card className="border border-border/80 bg-card/40 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Quizzes Catalog</CardTitle>
              <CardDescription className="text-xs">Publish drafts or modify configurations.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                className="pl-9 h-8 text-xs placeholder:text-muted-foreground/60"
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingQuizzes ? (
            <div className="p-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span>Loading quizzes...</span>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No quizzes found. Create one using the manual builder or AI generator first.
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-y border-border bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Qns Count</th>
                    <th className="py-3 px-4">Time Limit</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz._id} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-foreground">
                        <div>
                          <p className="font-semibold line-clamp-1">{quiz.title}</p>
                          <p className="text-[10px] text-muted-foreground font-normal line-clamp-1 mt-0.5">{quiz.description || "No description provided."}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {quiz.category?.name || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="secondary" className="capitalize text-[9px] font-bold py-0">
                          {quiz.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {quiz.questionsCount || 0} Questions
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {quiz.timer || 15} mins
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            quiz.isPublished
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {quiz.isPublished ? (
                            <>
                              <Globe size={10} /> Published
                            </>
                          ) : (
                            <>
                              <Lock size={10} /> Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer"
                            onClick={() => setEditingQuiz({ ...quiz, tags: quiz.tags ? quiz.tags.join(", ") : "" })}
                          >
                            <Edit2 size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                            onClick={() => setDeletingQuizId(quiz._id)}
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

      {/* DIALOG MODAL: EDIT QUIZ */}
      {editingQuiz && (
        <Dialog open={true} onOpenChange={(open) => !open && setEditingQuiz(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground">Edit Quiz Details</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Modify parameters for the selected quiz.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditQuizSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-semibold">Quiz Title</Label>
                <Input
                  id="edit-title"
                  value={editingQuiz.title}
                  onChange={(e) => setEditingQuiz(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-semibold">Description</Label>
                <textarea
                  id="edit-description"
                  rows={2}
                  className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                  value={editingQuiz.description}
                  onChange={(e) => setEditingQuiz(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-category" className="text-xs font-semibold">Category</Label>
                  <Select
                    value={editingQuiz.categoryId || editingQuiz.category?._id}
                    onValueChange={(val) => setEditingQuiz(prev => ({ ...prev, categoryId: val }))}
                  >
                    <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-difficulty" className="text-xs font-semibold">Difficulty</Label>
                  <Select
                    value={editingQuiz.difficulty}
                    onValueChange={(val) => setEditingQuiz(prev => ({ ...prev, difficulty: val }))}
                  >
                    <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-timer" className="text-xs font-semibold">Time Limit (mins)</Label>
                  <Input
                    id="edit-timer"
                    type="number"
                    value={editingQuiz.timer}
                    onChange={(e) => setEditingQuiz(prev => ({ ...prev, timer: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="edit-published"
                    type="checkbox"
                    className="w-4 h-4 rounded border-input text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={editingQuiz.isPublished}
                    onChange={(e) => setEditingQuiz(prev => ({ ...prev, isPublished: e.target.checked }))}
                  />
                  <Label htmlFor="edit-published" className="text-xs font-semibold cursor-pointer select-none">
                    Published
                  </Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tags" className="text-xs font-semibold">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={editingQuiz.tags}
                  onChange={(e) => setEditingQuiz(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingQuiz(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUpdatingQuiz} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                  {isUpdatingQuiz ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG MODAL: DELETE QUIZ CONFIRM */}
      {deletingQuizId && (
        <Dialog open={true} onOpenChange={(open) => !open && setDeletingQuizId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-2.5 text-rose-500">
                <AlertTriangle size={18} />
                <DialogTitle className="text-sm font-bold">Delete Quiz</DialogTitle>
              </div>
              <DialogDescription className="text-xs pt-1.5">
                Are you sure you want to delete this quiz? This action will permanently remove the quiz and all associated questions from the database and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingQuizId(null)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={isDeletingQuiz} onClick={handleDeleteQuizConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isDeletingQuiz ? "Deleting..." : "Permanently Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}