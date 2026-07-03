import React, { useState, useEffect } from "react";
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
  getQuizzesAdmin,
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUploadQuestions
} from "../../services/quiz.service";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  AlertTriangle,
  Loader2,
  CheckCircle,
  FileJson,
  UploadCloud,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageQuestionsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questions, setQuestions] = useState([]);
  
  // Loading states
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Search filter
  const [questionSearch, setQuestionSearch] = useState("");
  const [quizFilterSearch, setQuizFilterSearch] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // question object or null
  const [deletingQuestionId, setDeletingQuestionId] = useState(null); // id or null
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Forms state
  const [questionForm, setQuestionForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    explanation: ""
  });
  const [bulkJson, setBulkJson] = useState("");

  // Load quizzes on mount
  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoadingQuizzes(true);
      try {
        const res = await getQuizzesAdmin({ limit: 100 });
        if (res && res.status === "success") {
          setQuizzes(res.data.quizzes || []);
          if (res.data.quizzes?.length > 0) {
            setSelectedQuizId(res.data.quizzes[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quizzes");
      } finally {
        setIsLoadingQuizzes(false);
      }
    };
    loadQuizzes();
  }, []);

  // Load questions when selected quiz changes
  const loadQuestions = async () => {
    if (!selectedQuizId) return;
    setIsLoadingQuestions(true);
    try {
      const res = await getQuizQuestions(selectedQuizId);
      if (res && res.status === "success" && res.data) {
        setQuestions(res.data.questions || []);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedQuizId]);

  const selectedQuiz = quizzes.find(q => q._id === selectedQuizId);

  // Add option field
  const handleAddOptionField = (isEdit = false) => {
    if (isEdit) {
      setEditingQuestion(prev => ({ ...prev, options: [...prev.options, ""] }));
    } else {
      setQuestionForm(prev => ({ ...prev, options: [...prev.options, ""] }));
    }
  };

  // Remove option field
  const handleRemoveOptionField = (index, isEdit = false) => {
    const target = isEdit ? editingQuestion : questionForm;
    if (target.options.length <= 2) {
      return toast.error("A question must have at least 2 options");
    }
    const newOptions = target.options.filter((_, idx) => idx !== index);
    const newCorrectIndex = target.correctAnswerIndex >= newOptions.length 
      ? 0 
      : target.correctAnswerIndex;

    if (isEdit) {
      setEditingQuestion(prev => ({
        ...prev,
        options: newOptions,
        correctAnswerIndex: newCorrectIndex
      }));
    } else {
      setQuestionForm(prev => ({
        ...prev,
        options: newOptions,
        correctAnswerIndex: newCorrectIndex
      }));
    }
  };

  const handleOptionValChange = (index, val, isEdit = false) => {
    if (isEdit) {
      const newOptions = [...editingQuestion.options];
      newOptions[index] = val;
      setEditingQuestion(prev => ({ ...prev, options: newOptions }));
    } else {
      const newOptions = [...questionForm.options];
      newOptions[index] = val;
      setQuestionForm(prev => ({ ...prev, options: newOptions }));
    }
  };

  // Submit Add Question
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionForm.text.trim()) return toast.error("Question text is required");
    const filledOptions = questionForm.options.map(o => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) return toast.error("At least 2 options are required");

    setIsSaving(true);
    try {
      const payload = {
        quiz: selectedQuizId,
        text: questionForm.text,
        options: questionForm.options,
        correctAnswer: [Number(questionForm.correctAnswerIndex)],
        explanation: questionForm.explanation,
      };

      const res = await createQuestion(payload);
      if (res && res.status === "success") {
        toast.success("Question created successfully");
        setIsAddOpen(false);
        setQuestionForm({ text: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" });
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create question");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Edit Question
  const handleEditQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!editingQuestion.text.trim()) return toast.error("Question text is required");
    const filledOptions = editingQuestion.options.map(o => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) return toast.error("At least 2 options are required");

    setIsSaving(true);
    try {
      const payload = {
        text: editingQuestion.text,
        options: editingQuestion.options,
        correctAnswer: [Number(editingQuestion.correctAnswerIndex)],
        explanation: editingQuestion.explanation,
      };

      const res = await updateQuestion(editingQuestion._id, payload);
      if (res && res.status === "success") {
        toast.success("Question updated successfully");
        setEditingQuestion(null);
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update question");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Delete Question
  const handleDeleteConfirm = async () => {
    setIsSaving(true);
    try {
      const res = await deleteQuestion(deletingQuestionId);
      if (res && res.status === "success") {
        toast.success("Question deleted successfully");
        setDeletingQuestionId(null);
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete question");
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Upload
  const loadTemplate = () => {
    const template = [
      {
        text: "What tag is used to define an interactive form in HTML?",
        options: ["<input>", "<form>", "<textarea>", "<select>"],
        correctAnswer: [1],
        explanation: "The <form> element is the wrapper that contains interactive inputs."
      }
    ];
    setBulkJson(JSON.stringify(template, null, 2));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkJson.trim()) return toast.error("JSON payload is required");

    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("Must be a JSON Array");
    } catch (err) {
      return toast.error(`Invalid JSON: ${err.message}`);
    }

    setIsSaving(true);
    try {
      const res = await bulkUploadQuestions(selectedQuizId, parsed);
      if (res && res.status === "success") {
        toast.success(`Uploaded ${res.results} questions successfully`);
        setIsBulkOpen(false);
        setBulkJson("");
        loadQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload questions");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter list
  const filteredQuestions = questions.filter(q =>
    q.text?.toLowerCase().includes(questionSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Title & Top controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Maintain quiz contents by adding, editing, or deleting question choices.
          </p>
        </div>

        {/* Selected Quiz Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Label className="text-xs font-semibold shrink-0">Selected Quiz:</Label>
          <div className="w-64">
            <Select
              value={selectedQuizId}
              onValueChange={(val) => {
                setSelectedQuizId(val);
                setQuizFilterSearch(""); // Reset filter search when a quiz is selected
              }}
            >
              <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                <SelectValue placeholder={isLoadingQuizzes ? "Loading Quizzes..." : "Select Quiz"} />
              </SelectTrigger>
              <SelectContent className="w-64">
                {/* Search box within Select Content */}
                <div className="p-2 sticky top-0 bg-popover dark:bg-card border-b border-border/40 z-10">
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search quiz..."
                      className="w-full h-7 pl-6 pr-2 rounded-md border border-input bg-transparent text-xs transition-colors outline-none focus:border-ring placeholder:text-muted-foreground/60 text-foreground"
                      value={quizFilterSearch}
                      onChange={(e) => setQuizFilterSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto no-scrollbar">
                  {quizzes.filter(q => q.title?.toLowerCase().includes(quizFilterSearch.toLowerCase())).length === 0 ? (
                    <div className="p-2.5 text-center text-muted-foreground text-[10px]">No quizzes found</div>
                  ) : (
                    quizzes
                      .filter(q => q.title?.toLowerCase().includes(quizFilterSearch.toLowerCase()))
                      .map(q => (
                        <SelectItem key={q._id} value={q._id}>{q.title}</SelectItem>
                      ))
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {selectedQuiz && (
        <div className="space-y-6">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border/80 bg-card/45 backdrop-blur-xs rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-none">{selectedQuiz.title}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="capitalize text-[9px] font-semibold py-0">
                    {selectedQuiz.difficulty}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {questions.length} questions total
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 shrink-0">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-8 h-7 text-[11px] placeholder:text-muted-foreground/60"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                onClick={() => setIsBulkOpen(true)}
                className="h-7 text-xs font-semibold gap-1 bg-muted/60 hover:bg-muted text-foreground border border-border cursor-pointer rounded-lg"
              >
                <FileJson size={12} /> Bulk Upload
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="h-7 text-xs font-semibold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer rounded-lg shadow-sm"
              >
                <Plus size={12} /> Add Question
              </Button>
            </div>
          </div>

          {/* List of Questions */}
          {isLoadingQuestions ? (
            <div className="p-12 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span>Loading questions...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border/80 bg-muted/10 rounded-2xl text-muted-foreground text-xs">
              No questions found inside this quiz. Click "Add Question" to begin.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <Card key={q._id} className="border border-border/80 bg-card/45 hover:bg-card transition-colors duration-200">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-2.5 items-start">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{idx + 1}.</span>
                        <h4 className="text-xs font-bold text-foreground leading-relaxed">{q.text}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-md cursor-pointer"
                          onClick={() => setEditingQuestion({
                            ...q,
                            correctAnswerIndex: q.correctAnswer?.[0] || 0
                          })}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md cursor-pointer"
                          onClick={() => setDeletingQuestionId(q._id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-4 space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options?.map((option, oIdx) => {
                        const isCorrect = q.correctAnswer?.includes(oIdx);
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold"
                                : "bg-muted/30 border-border/60 text-muted-foreground/80"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold opacity-60">
                                {String.fromCharCode(65 + oIdx)})
                              </span>
                              <span>{option}</span>
                            </div>
                            {isCorrect && <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-muted-foreground/80 leading-relaxed">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIALOG MODAL: ADD QUESTION */}
      {isAddOpen && (
        <Dialog open={true} onOpenChange={(open) => !open && setIsAddOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground">Add New Question</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Add manually to {selectedQuiz?.title}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-q-text" className="text-xs font-semibold">Question Text</Label>
                <Input
                  id="add-q-text"
                  placeholder="e.g. Which keyword is used to import modules in JavaScript?"
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Options & Choices</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold gap-1 cursor-pointer"
                    onClick={() => handleAddOptionField(false)}
                  >
                    <Plus size={10} /> Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {questionForm.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-muted-foreground w-4">{String.fromCharCode(65 + oIdx)})</span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionValChange(oIdx, e.target.value, false)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                        onClick={() => handleRemoveOptionField(oIdx, false)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Correct Answer Option</Label>
                <Select
                  value={String(questionForm.correctAnswerIndex)}
                  onValueChange={(val) => setQuestionForm(prev => ({ ...prev, correctAnswerIndex: Number(val) }))}
                >
                  <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                    <SelectValue placeholder="Select Correct Choice" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionForm.options.map((_, oIdx) => (
                      <SelectItem key={oIdx} value={String(oIdx)}>
                        Option {String.fromCharCode(65 + oIdx)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-q-explanation" className="text-xs font-semibold">Explanation (Optional)</Label>
                <textarea
                  id="add-q-explanation"
                  rows={2}
                  placeholder="Explain why this option is correct..."
                  className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSaving ? "Saving..." : "Create Question"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG MODAL: EDIT QUESTION */}
      {editingQuestion && (
        <Dialog open={true} onOpenChange={(open) => !open && setEditingQuestion(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground">Edit Question Details</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Modify details for the selected question entry.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditQuestionSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-q-text" className="text-xs font-semibold">Question Text</Label>
                <Input
                  id="edit-q-text"
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion(prev => ({ ...prev, text: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Options & Choices</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold gap-1 cursor-pointer"
                    onClick={() => handleAddOptionField(true)}
                  >
                    <Plus size={10} /> Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {editingQuestion.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-muted-foreground w-4">{String.fromCharCode(65 + oIdx)})</span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionValChange(oIdx, e.target.value, true)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                        onClick={() => handleRemoveOptionField(oIdx, true)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Correct Answer Option</Label>
                <Select
                  value={String(editingQuestion.correctAnswerIndex)}
                  onValueChange={(val) => setEditingQuestion(prev => ({ ...prev, correctAnswerIndex: Number(val) }))}
                >
                  <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                    <SelectValue placeholder="Select Correct Choice" />
                  </SelectTrigger>
                  <SelectContent>
                    {editingQuestion.options.map((_, oIdx) => (
                      <SelectItem key={oIdx} value={String(oIdx)}>
                        Option {String.fromCharCode(65 + oIdx)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-q-explanation" className="text-xs font-semibold">Explanation (Optional)</Label>
                <textarea
                  id="edit-q-explanation"
                  rows={2}
                  className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG MODAL: DELETE CONFIRM */}
      {deletingQuestionId && (
        <Dialog open={true} onOpenChange={(open) => !open && setDeletingQuestionId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-2.5 text-rose-500">
                <AlertTriangle size={18} />
                <DialogTitle className="text-sm font-bold">Delete Question</DialogTitle>
              </div>
              <DialogDescription className="text-xs pt-1.5">
                Are you sure you want to delete this question? This will permanently remove it from the quiz and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingQuestionId(null)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={isSaving} onClick={handleDeleteConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isSaving ? "Deleting..." : "Permanently Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG MODAL: BULK UPLOAD */}
      {isBulkOpen && (
        <Dialog open={true} onOpenChange={(open) => !open && setIsBulkOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-sm font-bold">Bulk Upload Questions</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Upload a JSON array of questions directly to this quiz.</DialogDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[9px] font-bold h-6 cursor-pointer"
                  onClick={loadTemplate}
                >
                  Load Template
                </Button>
              </div>
            </DialogHeader>
            <form onSubmit={handleBulkSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="bulk-payload" className="text-xs font-semibold">JSON Array</Label>
                <textarea
                  id="bulk-payload"
                  rows={8}
                  placeholder='[\n  {\n    "text": "Question Text?",\n    "options": ["Option A", "Option B"],\n    "correctAnswer": [1],\n    "explanation": "..."\n  }\n]'
                  className="w-full min-h-[180px] font-mono text-[10px] leading-normal rounded-lg border border-input bg-transparent px-3 py-2 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSaving ? "Uploading..." : "Upload JSON"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}