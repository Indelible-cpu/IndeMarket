import React, { useState } from 'react';
import { HelpCircle, ThumbsUp, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuestionItem {
  id: string;
  question: string;
  askedBy: string;
  askedDate: string;
  answer?: string;
  answeredBy?: string;
  answeredDate?: string;
  upvotes: number;
}

const DUMMY_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    question: 'Is this item covered under local warranty in Malawi?',
    askedBy: 'Chikondi M.',
    askedDate: '2 days ago',
    answer: 'Yes, this product comes with a 12-month official manufacturer warranty backed by our Lilongwe and Blantyre service centers.',
    answeredBy: 'Verified Seller',
    answeredDate: '1 day ago',
    upvotes: 14,
  },
  {
    id: 'q2',
    question: 'How long does delivery take to Mzuzu?',
    askedBy: 'Kelvin K.',
    askedDate: '1 week ago',
    answer: 'Standard express delivery to Mzuzu takes 24 to 48 hours via AXA or Postbus pickup points.',
    answeredBy: 'Verified Seller',
    answeredDate: '6 days ago',
    upvotes: 8,
  },
];

export function ProductQuestionsAndAnswers({ productId, productName }: { productId: string; productName: string }) {
  const [questions, setQuestions] = useState<QuestionItem[]>(DUMMY_QUESTIONS);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: QuestionItem = {
      id: `q_${Date.now()}`,
      question: newQuestionText.trim(),
      askedBy: 'You',
      askedDate: 'Just now',
      answer: 'Our seller team usually answers new customer questions within 2 to 4 hours. Check back soon!',
      answeredBy: 'IndeMarket Support Bot',
      answeredDate: 'Just now',
      upvotes: 1,
    };

    setQuestions([newQ, ...questions]);
    setNewQuestionText('');
    toast.success('Your question has been posted to the seller!');
  };

  const toggleUpvote = (qId: string) => {
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
        setQuestions((list) => list.map((q) => (q.id === qId ? { ...q, upvotes: q.upvotes - 1 } : q)));
      } else {
        next.add(qId);
        setQuestions((list) => list.map((q) => (q.id === qId ? { ...q, upvotes: q.upvotes + 1 } : q)));
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mt-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Customer Q&A</h3>
            <p className="text-xs text-gray-500">Have questions about {productName}? Get answers from verified sellers and buyers.</p>
          </div>
        </div>
      </div>

      {/* Ask Question Input */}
      <form onSubmit={handleAskQuestion} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a question about size, compatibility, delivery..."
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!newQuestionText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Questions List */}
      <div className="space-y-4 pt-2">
        {questions.map((q) => (
          <div key={q.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">Q: {q.question}</span>
                </div>
                <p className="text-[11px] text-gray-400">Asked by {q.askedBy} • {q.askedDate}</p>
              </div>

              <button
                onClick={() => toggleUpvote(q.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
                  upvotedIds.has(q.id)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{q.upvotes}</span>
              </button>
            </div>

            {q.answer && (
              <div className="pl-4 border-l-2 border-indigo-500 space-y-1 pt-1">
                <p className="text-xs text-gray-800 font-medium leading-relaxed">
                  <span className="font-bold text-indigo-600">A: </span>
                  {q.answer}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Answered by {q.answeredBy} ({q.answeredDate})</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
