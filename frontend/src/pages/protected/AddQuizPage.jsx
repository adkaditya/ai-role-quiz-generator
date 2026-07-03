import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  getCategories,
  createQuiz,
  createQuestion,
  bulkUploadQuestions,
} from "../../services/quiz.service";
import {
  FileText,
  Plus,
  Trash,
  Settings,
  Check,
  AlertCircle,
  ArrowRight,
  Clock,
  Tag,
  BookOpen,
  CheckCircle2,
  FileJson,
  PenTool,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AddQuizPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Quiz details state
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    description: "",
    categoryId: "",
    difficulty: "medium",
    timer: 15,
    isPublished: true,
    tags: "",
  });

  // Created quiz reference
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState("manual"); // manual | bulk
  const [addedQuestions, setAddedQuestions] = useState([]);

  // Manual question form state
  const [manualQuestion, setManualQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    explanation: "",
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Bulk upload state
  const [bulkJson, setBulkJson] = useState("");
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await getCategories();
        if (res && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setQuizDetails((prev) => ({
              ...prev,
              categoryId: res.data[0]._id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizDetails.title.trim()) {
      return toast.error("Quiz title is required");
    }
    if (!quizDetails.categoryId) {
      return toast.error("Category is required");
    }

    setIsSubmittingQuiz(true);
    try {
      const tagsArray = quizDetails.tags
        ? quizDetails.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: quizDetails.title,
        description: quizDetails.description,
        categoryId: quizDetails.categoryId,
        difficulty: quizDetails.difficulty,
        timer: Number(quizDetails.timer) || 15,
        isPublished: quizDetails.isPublished,
        tags: tagsArray,
      };

      const res = await createQuiz(payload);
      if (res && res.status === "success") {
        setCreatedQuiz(res.data.quiz);
        toast.success("Quiz header created! Now let's add questions.");
      } else {
        toast.error("Failed to create quiz");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Manual question handlers
  const handleOptionChange = (index, value) => {
    const newOptions = [...manualQuestion.options];
    newOptions[index] = value;
    setManualQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const addOptionField = () => {
    setManualQuestion((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const removeOptionField = (index) => {
    if (manualQuestion.options.length <= 2) {
      return toast.error("A question must have at least 2 options");
    }
    const newOptions = manualQuestion.options.filter((_, idx) => idx !== index);
    const newCorrectIndex =
      manualQuestion.correctAnswerIndex >= newOptions.length
        ? 0
        : manualQuestion.correctAnswerIndex;

    setManualQuestion((prev) => ({
      ...prev,
      options: newOptions,
      correctAnswerIndex: newCorrectIndex,
    }));
  };

  const handleManualQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!manualQuestion.text.trim()) {
      return toast.error("Question text is required");
    }
    const filledOptions = manualQuestion.options
      .map((o) => o.trim())
      .filter(Boolean);
    if (filledOptions.length < 2) {
      return toast.error("At least 2 options are required");
    }

    setIsAddingQuestion(true);
    try {
      const payload = {
        quiz: createdQuiz._id,
        text: manualQuestion.text,
        options: manualQuestion.options,
        correctAnswer: [Number(manualQuestion.correctAnswerIndex)],
        explanation: manualQuestion.explanation,
      };

      const res = await createQuestion(payload);
      if (res && res.status === "success") {
        toast.success("Question added successfully!");
        setAddedQuestions((prev) => [...prev, res.data.question]);
        // Reset question form but keep option fields count
        setManualQuestion({
          text: "",
          options: Array(manualQuestion.options.length).fill(""),
          correctAnswerIndex: 0,
          explanation: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add question");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Bulk Upload handlers
  const loadJsonTemplate = () => {
    const template = [
      {
        text: "What is the primary function of React's useState hook?",
        options: [
          "To manage local state inside a functional component",
          "To fetch data from external APIs",
          "To manage global application routes",
          "To directly manipulate the DOM",
        ],
        correctAnswer: [0],
        explanation:
          "useState is a Hook that lets you add React state to function components.",
      },
      {
        text: "Which of the following is correct about props in React?",
        options: [
          "Props are mutable and can be changed within the component",
          "Props are read-only and immutable",
          "Props are used to store local component variables",
          "Props are only used in class components",
        ],
        correctAnswer: [1],
        explanation:
          "Props are read-only parameters passed into React components.",
      },
    ];
    setBulkJson(JSON.stringify(template, null, 2));
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!bulkJson.trim()) {
      return toast.error("Please paste your JSON questions list first");
    }

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(bulkJson);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Root element must be a JSON Array");
      }
    } catch (err) {
      return toast.error(`Invalid JSON syntax: ${err.message}`);
    }

    setIsUploadingBulk(true);
    try {
      const res = await bulkUploadQuestions(createdQuiz._id, parsedQuestions);
      if (res && res.status === "success") {
        toast.success(`Successfully uploaded ${res.results} questions!`);
        setAddedQuestions((prev) => [...prev, ...res.data.questions]);
        setBulkJson("");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to bulk upload questions",
      );
    } finally {
      setIsUploadingBulk(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Manual Quiz Builder
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create premium quizzes manually by entering quiz metadata and adding
          tailored questions.
        </p>
      </div>

      <Separator className="bg-border/60" />

      {!createdQuiz ? (
        /* STEP 1: CREATE QUIZ HEADER */
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-sm font-semibold">Quiz Details</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Define the name, description, duration, categories, and difficulty
              levels for the new quiz.
            </p>
          </div>

          <Card className="md:col-span-2 border border-border/80 bg-card/40 backdrop-blur-md">
            <form onSubmit={handleQuizSubmit}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Metadata Setup
                </CardTitle>
                <CardDescription className="text-xs">
                  Setup parameters that identify the quiz topic and category.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-semibold">
                    Quiz Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Advanced JavaScript Closures"
                    value={quizDetails.title}
                    onChange={handleQuizChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-semibold"
                  >
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Provide a comprehensive summary of what this quiz covers..."
                    className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                    value={quizDetails.description}
                    onChange={handleQuizChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="categoryId"
                      className="text-xs font-semibold"
                    >
                      Category
                    </Label>
                    <Select
                      value={quizDetails.categoryId}
                      onValueChange={(val) =>
                        setQuizDetails((prev) => ({ ...prev, categoryId: val }))
                      }
                    >
                      <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Loading..."
                              : "Select Category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No categories
                          </SelectItem>
                        ) : (
                          categories.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="difficulty"
                      className="text-xs font-semibold"
                    >
                      Difficulty
                    </Label>
                    <Select
                      value={quizDetails.difficulty}
                      onValueChange={(val) =>
                        setQuizDetails((prev) => ({ ...prev, difficulty: val }))
                      }
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

                  <div className="space-y-2">
                    <Label
                      htmlFor="timer"
                      className="text-xs font-semibold flex items-center gap-1"
                    >
                      <Clock size={12} className="text-muted-foreground" /> Time
                      Limit (mins)
                    </Label>
                    <Input
                      id="timer"
                      name="timer"
                      type="number"
                      min={1}
                      max={180}
                      value={quizDetails.timer}
                      onChange={handleQuizChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tags"
                    className="text-xs font-semibold flex items-center gap-1"
                  >
                    <Tag size={12} className="text-muted-foreground" /> Tags
                    (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="e.g. javascript, coding, array, frontend"
                    value={quizDetails.tags}
                    onChange={handleQuizChange}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="isPublished"
                    name="isPublished"
                    type="checkbox"
                    className="w-4 h-4 rounded border-input text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={quizDetails.isPublished}
                    onChange={handleQuizChange}
                  />
                  <Label
                    htmlFor="isPublished"
                    className="text-xs font-semibold cursor-pointer select-none"
                  >
                    Publish immediately (visible to students)
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-border/40 bg-muted/20 px-6 py-4 rounded-b-lg">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingQuiz}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {isSubmittingQuiz ? "Creating..." : "Next: Add Questions"}{" "}
                  <ArrowRight size={14} />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      ) : (
        /* STEP 2: ADD QUESTIONS TO QUIZ */
        <div className="space-y-6">
          {/* Created Quiz Header Info */}
          <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {createdQuiz.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="capitalize text-[10px] font-semibold py-0"
                  >
                    {createdQuiz.difficulty}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {createdQuiz.timer} mins limit
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {addedQuestions.length} questions added
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium cursor-pointer"
                onClick={() => {
                  toast.success("Quiz saved successfully!");
                  navigate("/dashboard");
                }}
              >
                Done / Finish Quiz
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left sidebar: list of added questions */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Added Questions
                </h4>
                <Badge variant="outline" className="text-[9px] font-bold">
                  {addedQuestions.length} total
                </Badge>
              </div>

              {addedQuestions.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10 text-muted-foreground">
                  <HelpCircle
                    size={32}
                    className="mx-auto mb-2 opacity-40 text-indigo-500"
                  />
                  <p className="text-xs font-medium">No questions yet</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                    Use manual or bulk upload to start
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                  {addedQuestions.map((q, idx) => (
                    <div
                      key={q._id || idx}
                      className="p-3 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors flex gap-2.5 items-start"
                    >
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 min-w-[15px]">
                        {idx + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                          {q.text}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                          {q.options?.length || 0} choices
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right container: Tabs to Add Questions */}
            <div className="md:col-span-2 space-y-4">
              {/* Tab Header Selector */}
              <div className="flex border border-border/60 bg-muted/40 p-1.5 rounded-xl gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className={`flex-1 text-xs py-1.5 h-8 font-semibold rounded-lg gap-2 cursor-pointer transition-all ${
                    activeTab === "manual"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/45"
                  }`}
                  onClick={() => setActiveTab("manual")}
                >
                  <PenTool size={13} /> Add Manually
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`flex-1 text-xs py-1.5 h-8 font-semibold rounded-lg gap-2 cursor-pointer transition-all ${
                    activeTab === "bulk"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/45"
                  }`}
                  onClick={() => setActiveTab("bulk")}
                >
                  <FileJson size={13} /> Bulk JSON Upload
                </Button>
              </div>

              {activeTab === "manual" ? (
                /* MANUAL OPTION FORM */
                <Card className="border border-border/80 bg-card/40 backdrop-blur-md">
                  <form onSubmit={handleManualQuestionSubmit}>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        New Question Setup
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Add an individual question with custom options and
                        explanation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="questionText"
                          className="text-xs font-semibold"
                        >
                          Question Text
                        </Label>
                        <Input
                          id="questionText"
                          placeholder="e.g. Which keyword is used to declare block-scoped variables in JS?"
                          value={manualQuestion.text}
                          onChange={(e) =>
                            setManualQuestion((prev) => ({
                              ...prev,
                              text: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-semibold">
                            Options & Answers
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold gap-1 cursor-pointer"
                            onClick={addOptionField}
                          >
                            <Plus size={10} /> Add Option
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {manualQuestion.options.map((option, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="flex items-center gap-1.5 flex-1">
                                <span className="text-[10px] font-bold text-muted-foreground w-4">
                                  {String.fromCharCode(65 + idx)})
                                </span>
                                <Input
                                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(idx, e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                onClick={() => removeOptionField(idx)}
                              >
                                <Trash size={13} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="correctAnswerIndex"
                          className="text-xs font-semibold"
                        >
                          Correct Option
                        </Label>
                        <Select
                          value={String(manualQuestion.correctAnswerIndex)}
                          onValueChange={(val) =>
                            setManualQuestion((prev) => ({
                              ...prev,
                              correctAnswerIndex: Number(val),
                            }))
                          }
                        >
                          <SelectTrigger className="w-full h-8 bg-card dark:bg-input/20">
                            <SelectValue placeholder="Select Correct Option" />
                          </SelectTrigger>
                          <SelectContent>
                            {manualQuestion.options.map((_, idx) => (
                              <SelectItem key={idx} value={String(idx)}>
                                Option {String.fromCharCode(65 + idx)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="explanation"
                          className="text-xs font-semibold"
                        >
                          Explanation (Optional)
                        </Label>
                        <textarea
                          id="explanation"
                          rows={2}
                          placeholder="Provide the reasoning behind the correct option..."
                          className="w-full min-h-[50px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                          value={manualQuestion.explanation}
                          onChange={(e) =>
                            setManualQuestion((prev) => ({
                              ...prev,
                              explanation: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-border/40 bg-muted/20 px-6 py-4 rounded-b-lg">
                      <Button
                        type="submit"
                        disabled={isAddingQuestion}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        {isAddingQuestion ? "Saving..." : "Save Question"}{" "}
                        <Plus size={14} />
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              ) : (
                /* BULK JSON FORM */
                <Card className="border border-border/80 bg-card/40 backdrop-blur-md">
                  <form onSubmit={handleBulkUploadSubmit}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base font-semibold">
                            Bulk Upload Questions
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Upload multiple questions at once using a formatted
                            JSON array.
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-[10px] font-semibold h-7 gap-1 cursor-pointer"
                          onClick={loadJsonTemplate}
                        >
                          <Sparkles
                            size={11}
                            className="text-indigo-500 animate-pulse"
                          />{" "}
                          Load Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="bulkJson"
                          className="text-xs font-semibold"
                        >
                          JSON Payload
                        </Label>
                        <textarea
                          id="bulkJson"
                          rows={12}
                          placeholder='[\n  {\n    "text": "Your Question?",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": [0],\n    "explanation": "..."\n  }\n]'
                          className="w-full min-h-[260px] font-mono text-[11px] leading-relaxed rounded-lg border border-input bg-transparent px-3 py-2 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground/60 dark:bg-input/20"
                          value={bulkJson}
                          onChange={(e) => setBulkJson(e.target.value)}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-border/40 bg-muted/20 px-6 py-4 rounded-b-lg">
                      <Button
                        type="submit"
                        disabled={isUploadingBulk}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        {isUploadingBulk
                          ? "Uploading..."
                          : "Upload & Parse JSON"}{" "}
                        <CheckCircle2 size={14} />
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}