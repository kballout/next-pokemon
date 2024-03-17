"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { pokemon } from "../../pokemon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PokemonType } from "@/types";

type props = {
  time: number;
  endGame: () => void;
};

export default function ShortAnswer({ time, endGame }: props) {
  function prepPokemon() {
    let listOfPokemon: Array<PokemonType> = [];
    for (const next of pokemon) {
      listOfPokemon.push({
        name: next,
        path: "/pictures/" + next + ".png",
      });
    }
    return listOfPokemon;
  }

  const timeToAnswer = time;
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [list, setList] = useState<Array<PokemonType>>([]);
  const current = useRef<PokemonType>();
  const [gameStatus, setGameStatus] = useState("waiting");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(timeToAnswer);
  const [nextTimer, setNextTimer] = useState<number | null>();
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  function shuffle(list: any) {
    return list.sort((_a: any, _b: any) => 0.5 - Math.random());
  }

  useEffect(() => {
    const prepGame = () => {
      let arr = shuffle(prepPokemon());
      setList(arr);
      current.current = arr[0];
    };
    prepGame();
    setHydrated(true);
  }, []);

  useEffect(() => {
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (gameStatus === "waiting" && timer > 0) {
      countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (gameStatus === "waiting" && timer === 0) {
      setSelectedAnswer(current.current!.name);
      setGameStatus("loading");
      setNextTimer(3);
      setTimeout(() => {
        if (!gameOver) {
          setSelectedAnswer("");
          updateList();
        }
      }, 3000);
    }
    return () => clearInterval(countdown);
  }, [gameStatus, timer]);

  useEffect(() => {
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (nextTimer !== null && nextTimer! > 0) {
      countdown = setInterval(() => {
        setNextTimer(prevCountdown => prevCountdown! - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [nextTimer]);

  function checkSelection(input: string) {
    setSelectedAnswer(input);
    if (current.current?.name.toLowerCase() === input.toLowerCase()) {
      setScore(score + 1);
      if (gameStatus === "waiting") {
        setSelectedAnswer(current.current?.name);
        setGameStatus("loading");
        setNextTimer(3);
        setTimeout(() => {
          if (!gameOver) {
            setSelectedAnswer("");
            updateList();
          }
        }, 3000);
      }
    }
  }

  //get next
  useEffect(() => {
    if (hydrated) {
      if (list.length === 0) {
        setGameOver(true);
      } else {
        let curr: PokemonType = { name: list[0].name, path: list[0].path };
        current.current = curr;
      }
    }
  }, [list]);

  function updateList() {
    let newList = list.filter(item => item.name !== current.current?.name);
    setList(newList);
  }

  function loadedImage() {
    setGameStatus("waiting");
    setTimer(timeToAnswer);
    setNextTimer(null);
  }

  if (!hydrated) {
    return null;
  } else {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between md:p-5 p-24 bg-blue-200">
        <div className="text-orange-800 text-center">
          <button
            onClick={() => {
              if (!gameOver) {
                setList([]);
                setGameOver(true);
                setTimer(0);
                setNextTimer(0);
              } else {
                endGame();
              }
            }}
            className="basicBtn mb-10"
          >
            {!gameOver ? "End Game" : "Restart"}
          </button>
          <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 mb-5">
            Score: {score}
          </h1>
          <h1 className="md:text-xl text-2xl font-bold whitespace-nowrap">
            {`Who's That Pokemon?`}
          </h1>
          {current.current && (
            <>
              <Image
                className={`${
                  nextTimer === null && "brightness-[0.1]"
                } mx-auto`}
                priority
                onLoadingComplete={() => loadedImage()}
                alt="pokemonImage"
                src={current.current?.path}
                width={250}
                height={250}
              />
              {nextTimer !== null ? (
                <>
                  {!gameOver ? (
                    <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 my-2">
                      Next round in: <span>{nextTimer}s</span>
                    </h1>
                  ) : (
                    <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 my-2">
                      Game Over!
                    </h1>
                  )}
                </>
              ) : (
                <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 mb-5">
                  Time: <span>{timer}s</span>
                </h1>
              )}
              <div className="flex flex-col gap-5 md:text-lg text-xl mt-10">
                <input
                  ref={inp => {
                    inp?.focus();
                  }}
                  value={selectedAnswer}
                  disabled={gameStatus === "loading"}
                  type="text"
                  className="input"
                  onChange={e => checkSelection(e.target.value)}
                />
              </div>
              {gameOver && (
                <h1 className="mg:text-xl text-2xl p-2 mt-10">
                  You got {score} out of {pokemon.length} correct:{" "}
                  {(score / pokemon.length).toFixed(2)}%
                </h1>
              )}
            </>
          )}
        </div>
      </main>
    );
  }
}
