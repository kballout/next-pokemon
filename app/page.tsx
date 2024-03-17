"use client";
import { useState } from "react";
import Game from "./components/Game";
import ShortAnswer from "./components/ShortAnswer";

export default function Home() {
  const [questionType, setQuestionType] = useState("multipleChoice");
  const [timer, setTimer] = useState(8);
  const [started, setStarted] = useState(false);

  const submit = () => {
    if (questionType && timer) {
      setStarted(true);
    }
  };

  function restart() {
    setStarted(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-blue-200">
      <div className="text-orange-800 text-center">
        {started ? (
          <>
            {questionType === "multipleChoice" ? (
              <Game time={timer} endGame={restart} />
            ) : (
              <ShortAnswer endGame={restart} time={timer} />
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold whitespace-nowrap mb-10">
              Guess The Pokemon
            </h1>
            <p>Choose your settings below</p>
            <div className="flex flex-col gap-5 mt-5">
              <label className="flex gap-2 items-center" htmlFor="type">
                Type:
                <select
                  required
                  value={questionType}
                  className="input"
                  onChange={e => setQuestionType(e.target.value)}
                >
                  <option value="multipleChoice">Multiple Choice</option>
                  <option value="shortAnswer">Short Answer</option>
                </select>
              </label>
              <label className="flex gap-2 items-center" htmlFor="time">
                Timer:
                <input
                  value={timer}
                  onChange={e => setTimer(parseInt(e.target.value))}
                  required
                  className="input"
                  type="number"
                  max={15}
                  min={2}
                />
              </label>
              <button onClick={() => submit()} className="basicBtn">
                Start
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
