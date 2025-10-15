"use client";

import { useEffect, useState } from "react";
import { PERSONA_QUOTES } from "./lib/persona";
import { resetCoinsDaily, getCoins, trySpendCoin } from "./lib/coins";

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  themeParams?: { bg_color?: string };
};
type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

type Result = {
  tone: string;
  formality: string;
  clarity: string;
  issues: string[];
  explanations: string[];
  suggestions: string[];
  rewrites: {
    softer: string;
    shorter: string;
    friendlier: string;
    more_formal: string;
  };
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buddyMsg, setBuddyMsg] = useState<string | null>(null);

  // фиксированная реплика-подкол (не "скачет" при наборе)
  const [greeting] = useState(
    () => PERSONA_QUOTES.greeting[Math.floor(Math.random() * PERSONA_QUOTES.greeting.length)]
  );

  // автофокус + восстановление черновика
  useEffect(() => {
    const saved = localStorage.getItem("tonebuddy:text");
    if (saved) setText(saved);
    document.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  }, []);

  // сохраняем черновик
  useEffect(() => {
    localStorage.setItem("tonebuddy:text", text);
  }, [text]);

  // дневной лимит монет
  useEffect(() => {
    resetCoinsDaily();
  }, []);

  // адаптация под Telegram Mini App
  useEffect(() => {
    const w = window as TelegramWindow;
    const tg = w.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    const bg = tg.themeParams?.bg_color;
    if (bg) document.body.style.background = bg;
  }, []);

  const analyze = async () => {
    const msg = text.trim();
    if (!msg) {
      setBuddyMsg(
        PERSONA_QUOTES.noText[Math.floor(Math.random() * PERSONA_QUOTES.noText.length)]
      );
      return;
    }

    if (!trySpendCoin()) {
      setBuddyMsg(
        PERSONA_QUOTES.coinsEmpty[Math.floor(Math.random() * PERSONA_QUOTES.coinsEmpty.length)]
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Ошибка запроса");
      setResult(json as Result);

      setBuddyMsg(
        PERSONA_QUOTES.afterAnalyze[
          Math.floor(Math.random() * PERSONA_QUOTES.afterAnalyze.length)
        ]
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Cmd/Ctrl + Enter запускает анализ
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && text.trim() && !loading) {
      e.preventDefault();
      analyze();
    }
  };

  return (
    <main className="container">
      {/* только подкол сверху */}
      <h1 className="greeting">{greeting}</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder='Например: «Срочно пришлите отчёт. Вы опять затянули сроки.»'
        aria-label="Текст для анализа тона"
      />

      <div className="controls">
        <button onClick={analyze} disabled={!text.trim() || loading}>
          {loading ? "Анализ..." : "Проверить тон"}
        </button>
        <button
          onClick={() => {
            setText("");
            setResult(null);
            setError(null);
            setBuddyMsg(null);
            localStorage.removeItem("tonebuddy:text");
          }}
        >
          Очистить
        </button>
      </div>

      {buddyMsg && <p className="msg">{buddyMsg}</p>}
      <p className="hint">Осталось анализов сегодня: {getCoins()}</p>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="result">
          <div className="badges">
            <span className={`badge tone ${result.tone}`}>Тон: {result.tone}</span>
            <span className="badge">Формальность: {result.formality}</span>
            <span className="badge">Чёткость: {result.clarity}</span>
          </div>

          {result.issues?.length > 0 && (
            <p className="issues"><b>Проблемы:</b> {result.issues.join(", ")}</p>
          )}

          <div className="card">
            <h3>Почему так</h3>
            <ul>{result.explanations.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>

          <div className="card">
            <h3>Что улучшить</h3>
            <ul>{result.suggestions.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>

          <div className="card">
            <h3>Варианты перефраза</h3>
            <div className="rewrites">
              <Rewrite title="Мягче" text={result.rewrites.softer} />
              <Rewrite title="Короче" text={result.rewrites.shorter} />
              <Rewrite title="Дружелюбнее" text={result.rewrites.friendlier} />
              <Rewrite title="Формальнее" text={result.rewrites.more_formal} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Rewrite({ title, text }: { title: string; text: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="rewrite">
      <div className="rewriteHead">
        <b>{title}</b>
        <button onClick={copy}>📋 Копировать</button>
      </div>
      <p className="rewriteText">{text}</p>
    </div>
  );
}
