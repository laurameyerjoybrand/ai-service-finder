"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = "landing" | "quiz" | "loading" | "result";

interface QuestionOption {
  value: string;
  label: string;
  sub: string;
}

interface Question {
  id: number;
  heading: string;
  headingItalic: string;
  help: string;
  options: QuestionOption[];
}

interface ServiceResult {
  servicePackage: string;
  firstClient: string;
  pricingAnchor: string;
}

// ─── Quiz Data ─────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 1,
    heading: "Where did you spend",
    headingItalic: "most of your career?",
    help: "The department where your credibility lives.",
    options: [
      {
        value: "Marketing, content, brand, or audience growth",
        label: "Marketing & content",
        sub: "Brand, demand gen, audience",
      },
      {
        value: "Sales, business development, or revenue growth",
        label: "Sales & revenue",
        sub: "Pipeline, closing, BD",
      },
      {
        value: "Finance, accounting, or business operations",
        label: "Finance & operations",
        sub: "Numbers, processes, systems",
      },
      {
        value: "HR, people operations, talent, or organizational development",
        label: "HR & people",
        sub: "Hiring, culture, development",
      },
      {
        value: "Technology, product, data, or engineering",
        label: "Technology & product",
        sub: "Systems, tools, data",
      },
    ],
  },
  {
    id: 2,
    heading: "What do colleagues trust you",
    headingItalic: "to just handle?",
    help: "The thing that lands on your desk because everyone knows you'll sort it.",
    options: [
      {
        value: "Broken or inefficient processes that are costing time and money",
        label: "Fixing broken processes",
        sub: "Chaos → efficiency",
      },
      {
        value: "Finding, hiring, and keeping the right people",
        label: "People and hiring",
        sub: "Talent that actually fits",
      },
      {
        value: "Generating leads, closing deals, and growing revenue",
        label: "Revenue growth",
        sub: "Pipeline → closed deals",
      },
      {
        value: "Creating content, building an audience, and driving brand awareness",
        label: "Content and visibility",
        sub: "Audience, brand, reach",
      },
      {
        value: "Managing data, tools, tech stack decisions, and system integrations",
        label: "Data and tech",
        sub: "Tools, integrations, systems",
      },
    ],
  },
  {
    id: 3,
    heading: "What outcome does your work",
    headingItalic: "most reliably produce?",
    help: "The result that follows you from job to job.",
    options: [
      {
        value: "More revenue — deals closed, clients retained, pipeline consistently growing",
        label: "More revenue",
        sub: "Deals closed, clients staying",
      },
      {
        value: "More efficiency — hours saved, costs cut, manual work eliminated",
        label: "More efficiency",
        sub: "Time back, less chaos",
      },
      {
        value: "Better people outcomes — right hires, stronger teams, lower turnover",
        label: "Better people outcomes",
        sub: "Strong teams that stay",
      },
      {
        value: "Stronger marketing — audience growing, leads coming in, content converting",
        label: "Stronger marketing",
        sub: "Audience, leads, conversion",
      },
      {
        value: "Cleaner operations — data trusted, systems working, nothing falling through gaps",
        label: "Cleaner operations",
        sub: "Reliable systems, clean data",
      },
    ],
  },
  {
    id: 4,
    heading: "How comfortable are you",
    headingItalic: "with AI tools right now?",
    help: "Be honest — there's no wrong answer, and it shapes which services fit best.",
    options: [
      {
        value: "I use AI tools regularly and am already experimenting with automations",
        label: "Regular user",
        sub: "Already experimenting",
      },
      {
        value: "I understand AI conceptually and have tried several tools",
        label: "Comfortable explorer",
        sub: "Tried it, getting the hang of it",
      },
      {
        value: "I'm just starting to explore — I know I need to get up to speed",
        label: "Just getting started",
        sub: "Know I need to learn",
      },
      {
        value: "I haven't used much AI yet but I'm motivated to start now",
        label: "Ready to start",
        sub: "Fresh start, motivated",
      },
    ],
  },
  {
    id: 5,
    heading: "How do you want to",
    headingItalic: "work with clients?",
    help: "The engagement model that leaves you energized, not drained.",
    options: [
      {
        value: "Build the AI system for them and hand it over — project-based work",
        label: "Build and hand off",
        sub: "Project-based, clean exit",
      },
      {
        value: "Run the AI systems for them on an ongoing monthly basis — retainer work",
        label: "Ongoing retainer",
        sub: "Monthly, recurring revenue",
      },
      {
        value: "Advise them on AI strategy without doing the hands-on implementation",
        label: "Strategic advisor",
        sub: "Guide the thinking, not the doing",
      },
      {
        value: "Train their internal team to use AI effectively themselves",
        label: "Team trainer",
        sub: "Teach the team, scale the impact",
      },
    ],
  },
];

// ─── Root Component ────────────────────────────────────────────────────────────

export default function AIServiceFinder() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<ServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setAppState("quiz");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setError(null);
  };

  const handleSelectOption = (value: string) => {
    setSelectedOption(value);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      const prev = currentQuestion - 1;
      setCurrentQuestion(prev);
      setSelectedOption(answers[prev] ?? null);
      setAnswers(answers.slice(0, prev));
    } else {
      setAppState("landing");
    }
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setAppState("loading");
      try {
        const response = await fetch("/api/generate-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || "Failed to generate results");
        }

        const data: ServiceResult = await response.json();
        setResult(data);
        setAppState("result");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setAppState("quiz");
        setCurrentQuestion(QUESTIONS.length - 1);
        setSelectedOption(newAnswers[newAnswers.length - 1]);
        setAnswers(newAnswers.slice(0, -1));
      }
    }
  };

  const handleRestart = () => {
    setAppState("landing");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="ef-page">
      <header className="ef-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-plum.png" alt="Expert Freedom" style={{ height: 28, width: "auto" }} />
      </header>

      <main className="ef-stage" key={appState + currentQuestion}>
        {appState === "landing" && <LandingView onStart={handleStart} />}
        {appState === "quiz" && (
          <QuizView
            question={QUESTIONS[currentQuestion]}
            questionIndex={currentQuestion}
            totalQuestions={QUESTIONS.length}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          />
        )}
        {appState === "loading" && <LoadingView />}
        {appState === "result" && result && (
          <ResultView result={result} onRestart={handleRestart} />
        )}
      </main>

      <footer className="ef-foot">
        <div className="ef-foot-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-plum.png" alt="Expert Freedom" style={{ height: 22, width: "auto" }} />
          <nav className="ef-foot-links">
            <a href="https://joybrandcreative.com/privacy-policy">Privacy</a>
            <a href="https://joybrandcreative.com/terms">Terms</a>
            <a href="mailto:hello@joybrandcreative.com">Contact</a>
          </nav>
        </div>
        <div className="ef-foot-disclaimer">
          <strong style={{ color: "var(--plum)" }}>IMPORTANT — Earnings Disclaimer.</strong>{" "}
          All testimonials are from real clients; results are not typical. Your results depend on
          your skills, experience, motivation, and other factors. Joybrand Creative is a marketing
          education company. We do not sell a business opportunity or &ldquo;get rich quick&rdquo;
          system. We make no earnings claims. &copy; 2026 Joybrand Creative.
        </div>
      </footer>
    </div>
  );
}

// ─── Landing ───────────────────────────────────────────────────────────────────

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="ef-stage-inner">
      <div className="ef-eyebrow">AI Niche Generator</div>
      <h1 className="ef-hero-h1">
        <span className="row">Find the AI Services</span>
        <span className="emph">You&apos;re Best Positioned to Sell</span>
      </h1>
      <p className="ef-hook">
        Answer 5 questions about your background to find your AI service sweet spot.
      </p>
      <p className="ef-body-copy">
        No AI certification required. No audience required. Just <strong>5 questions</strong>{" "}about what you&apos;ve spent years getting really good at.
      </p>
      <div className="ef-cta-wrap">
        <button className="ef-btn ef-btn-primary ef-btn-arrow" onClick={onStart}>
          Find My AI Sweet Spot
        </button>
      </div>
      <div className="ef-stat-row">
        <div className="ef-stat">
          <div className="n">5</div>
          <div className="l">Questions</div>
        </div>
        <div className="ef-stat">
          <div className="n">
            3<span className="unit">min</span>
          </div>
          <div className="l">To complete</div>
        </div>
        <div className="ef-stat">
          <div className="n">100</div>
          <div className="l">Services mapped</div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz ──────────────────────────────────────────────────────────────────────

function QuizView({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onBack,
  error,
}: {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  onSelectOption: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  error: string | null;
}) {
  const isLast = questionIndex === totalQuestions - 1;

  return (
    <div className="ef-stage-inner">
      <div className="ef-quiz-card">
        {/* Progress */}
        <div className="ef-progress">
          <div className="bars">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`ef-bar${i < questionIndex ? " done" : i === questionIndex ? " current" : ""}`}
              />
            ))}
          </div>
          <div className="ef-step-label">
            {String(questionIndex + 1).padStart(2, "0")} /{" "}
            {String(totalQuestions).padStart(2, "0")}
          </div>
        </div>

        {/* Question */}
        <span className="ef-q-num">Question {questionIndex + 1}</span>
        <h2 className="ef-q-title">
          {question.heading} <em>{question.headingItalic}</em>
        </h2>
        <p className="ef-q-help">{question.help}</p>

        {/* Options */}
        <div className="ef-options">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.value;
            return (
              <button
                key={opt.value}
                className={`ef-option${isSelected ? " selected" : ""}`}
                onClick={() => onSelectOption(opt.value)}
                type="button"
              >
                <span className="ef-dot" />
                <span className="ef-lbl">
                  <b>{opt.label}</b>
                  <span>{opt.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && <p className="ef-error">{error}</p>}

        {/* Nav */}
        <div className="ef-quiz-nav">
          <button className="ef-btn ef-btn-ghost" onClick={onBack} type="button">
            ← Back
          </button>
          <div className="right">
            <button
              className={`ef-btn ef-btn-primary ef-btn-arrow${!selectedOption ? " ef-btn-disabled" : ""}`}
              onClick={onNext}
              type="button"
              aria-disabled={!selectedOption}
            >
              {isLast ? "Find My Sweet Spot" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div className="ef-stage-inner">
      <div className="ef-loading">
        <div className="ef-spinner" />
        <h2 className="ef-loading-title">Matching your background</h2>
        <p className="ef-loading-sub">Finding the AI services built for exactly what you know&hellip;</p>
      </div>
    </div>
  );
}

// ─── Result ────────────────────────────────────────────────────────────────────

function ResultView({
  result,
  onRestart,
}: {
  result: ServiceResult;
  onRestart: () => void;
}) {
  return (
    <div className="ef-stage-inner">
      <div className="ef-results">
        <div className="ef-res-eyebrow">Your AI Service Match</div>
        <h1 className="ef-res-h1">
          Here&apos;s your <em>sweet spot.</em>
        </h1>
        <p className="ef-res-pitch">
          Built from your background — not invented from scratch.
        </p>

        <div className="ef-res-card">
          <span className="ef-card-label">Your Service Package</span>
          <div className="ef-blockquote">{result.servicePackage}</div>

          <h4>Your First Client</h4>
          <p className="ef-client-text">{result.firstClient}</p>

          <h4>What to Charge</h4>
          <div className="ef-blockquote">{result.pricingAnchor}</div>

          <h4>Your Next 3 Moves</h4>
          <ol className="ef-steps">
            <li>
              <span className="ef-step-num">1</span>
              <span>
                <b>Name your service.</b> Take the package above and write one sentence
                that describes what you build, for whom, and what it does for their business.
              </span>
            </li>
            <li>
              <span className="ef-step-num">2</span>
              <span>
                <b>List your Warm 10.</b> Ten past colleagues, clients, or contacts in
                companies that have the exact problem your service solves.
              </span>
            </li>
            <li>
              <span className="ef-step-num">3</span>
              <span>
                <b>Send one message this week.</b> Not a pitch — a question. &ldquo;Are
                you dealing with [problem]? I&apos;ve been building something for exactly that.&rdquo;
              </span>
            </li>
          </ol>
        </div>

        <div className="ef-res-cta">
          <div className="row">
            <a
              href="https://expertfreedom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ef-btn ef-btn-primary ef-btn-arrow"
            >
              Learn to Build &amp; Deliver These Services
            </a>
            <button className="ef-btn ef-btn-ghost" onClick={onRestart} type="button">
              Try a different angle
            </button>
          </div>
          <p className="micro">
            Save your service package — you&apos;ll use it when you write your first pitch.
          </p>
        </div>
      </div>
    </div>
  );
}
