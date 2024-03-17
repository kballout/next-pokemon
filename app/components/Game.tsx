"use client";
import { useEffect, useRef, useState } from "react";
import { pokemon } from "../../pokemon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Option, PokemonType, STATUS } from "@/types";

type props = {
  time: number;
  endGame: () => void;
};

export default function Game({ time, endGame }: props) {
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
  const [options, setOptions] = useState<Array<Option>>([]);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(timeToAnswer);
  const [nextTimer, setNextTimer] = useState<number | null>();
  const [gameOver, setGameOver] = useState(false);

  function shuffle(list: any) {
    return list.sort((_a: any, _b: any) => 0.5 - Math.random());
  }

  function nextOptions(list: Array<PokemonType>, current: PokemonType) {
    let opt: Array<Option> = [];
    opt.push({ name: current.name, status: STATUS.PENDING });
    let next;
    while (opt.length !== 4) {
      if (list.length <= 4) {
        next = pokemon[Math.floor(Math.random() * pokemon.length)];
      } else {
        next = list[Math.floor(Math.random() * list.length)].name;
      }
      if (next !== current.name) {
        opt.push({ name: next, status: STATUS.PENDING });
      }
    }
    opt = shuffle(opt);
    setOptions(opt);
  }

  useEffect(() => {
    const prepGame = () => {
      let arr = shuffle(prepPokemon());
      setList(arr);
      current.current = arr[0];
      //options
      let opt: Array<Option> = [];
      opt.push({ name: arr[0].name, status: STATUS.PENDING });
      let next;
      while (opt.length !== 4) {
        if (list.length <= 4) {
          next = pokemon[Math.floor(Math.random() * pokemon.length)];
        } else {
          next = list[Math.floor(Math.random() * list.length)].name;
        }
        if (next !== arr[0].name) {
          opt.push({ name: next, status: STATUS.PENDING });
        }
      }
      opt = shuffle(opt);
      setOptions(opt);
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
      setGameStatus("loading");
      setNextTimer(3);
      setTimeout(() => {
        if (!gameOver) {
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

  function checkSelection(selection: string) {
    if (current.current?.name === selection) {
      setScore(score + 1);
    }
    if (gameStatus === "waiting") {
      setGameStatus("loading");
      setNextTimer(3);
      setTimeout(() => {
        if (!gameOver) {
          updateList();
        }
      }, 3000);
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
        nextOptions(list, curr);
        setGameStatus("waiting");
        setTimer(timeToAnswer);
        setNextTimer(null);
      }
    }
  }, [list]);

  function updateList() {
    let newList = list.filter(item => item.name !== current.current?.name);
    setList(newList);
  }

  if (!hydrated) {
    return null;
  } else {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between md:p-5 p-24 bg-blue-200">
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
        <div className="text-orange-800 text-center">
          <h1 className="md:text-xl text-2xl font-bold whitespace-nowrap">
            Who's That Pokemon?
          </h1>
          {current.current && (
            <>
              <Image
                className={`${
                  nextTimer === null && "brightness-[0.1]"
                } mx-auto`}
                priority
                alt="pokemonImage"
                src={current.current?.path}
                width={250}
                height={250}
              />
              {nextTimer !== null ? (
                <>
                  {!gameOver ? (
                    <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 mb-2">
                      Next round in: <span>{nextTimer}s</span>
                    </h1>
                  ) : (
                    <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 mb-2">
                      Game Over!
                    </h1>
                  )}
                </>
              ) : (
                <h1 className="md:text-xl text-2xl font-bold bg-yellow-200 p-2 mb-5">
                  Time: <span>{timer}s</span>
                </h1>
              )}
              {/* Multiple Choice */}
              <div className="flex flex-col gap-5 md:text-lg text-xl mt-10">
                {options.map((item, index) => (
                  <button
                    disabled={gameStatus === "loading"}
                    onClick={() => checkSelection(item.name)}
                    className={`option ${
                      gameStatus === "loading"
                        ? item.name === current.current?.name
                          ? "bg-green-400 text-black"
                          : "bg-red-400 text-black"
                        : "bg-blue-500 text-white"
                    }`}
                    key={index}
                  >
                    {item.name}
                  </button>
                ))}
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
