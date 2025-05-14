import { useContext, useState } from "react";
import {Popup} from "./";
import { GameContext } from "./GameBoardScreen";

const GameBoard = () => {
  const [popupProperties, setPopupProperties] = useState({show: false, isPositiveMessage: false, message: ''});
  const {game, setGame, selectedCellIndex, setSelectedCellIndex} = useContext(GameContext)!;

  const isTopEdge = (i: number) => Math.floor(i / 9) % 3 === 0;
  const isLeftEdge = (i: number) => (i % 9) % 3 === 0;
  const isBottomEdge = (i: number) => Math.floor(i / 9) % 3 === 2;
  const isRightEdge = (i: number) => (i % 9) % 3 === 2;

  const isRowSelected = (i: number): boolean => {
    if(selectedCellIndex === null){
      return false;
    }
    const row = Math.floor(i / 9);

    return row === Math.floor(selectedCellIndex / 9);
  }

  const isColumnSelected = (i: number): boolean =>  {
    if(selectedCellIndex === null){
      return false;
    }
    const column = i % 9;
    if(column === (selectedCellIndex % 9)){
      console.log(`${i} - ${column} - ${selectedCellIndex % 9}`);
    }
    
    return column === (selectedCellIndex % 9);
  }

  const isBlockSelected = (i: number): boolean => {
    if(selectedCellIndex === null){
      return false;
    }
    const row = Math.floor(i / 9);
    const column = i % 9;
    const block = Math.floor(row / 3) * 3 + Math.floor(column / 3);

    const selectedRow = Math.floor(selectedCellIndex / 9);
    const selectedColumn = selectedCellIndex % 9;
    const selectedBlock = Math.floor(selectedRow / 3) * 3 + Math.floor(selectedColumn / 3);

    return block === selectedBlock;
  }
  // const isTyped = (i: number) => initialGameState[i] === null;

  const generateCellId = (i: number): string => {
    const row = Math.floor(i / 9);
    const column = i % 9;
    const block = Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor(column / 3);
    return `${row}-${column}-${block}`;
  }

  return (
    <div className="relative grid grid-cols-9 grid-rows-9 rounded-md w-full bg-blue-50">
      <div className="absolute left-1/2 top-10 -translate-x-1/2">
        <Popup show={popupProperties?.show} isPositiveMessage={popupProperties?.isPositiveMessage} message={popupProperties?.message} />
      </div>
      {game?.map((cell, i) => {
        const baseClass = "border border-black text-center text-black text-2xl p-2 flex justify-center items-center";
        const cellClasses = [
          baseClass,
          isRowSelected(i) || isColumnSelected(i) || isBlockSelected(i) ? 'bg-gray-300' : '',
          isRowSelected(i) && isColumnSelected(i) && isBlockSelected(i) ? '!bg-blue-200' : '',
        //   hasSameValue(cell) ? 'bg-gray-400' : '',
          isTopEdge(i) ? 'border-t-4' : '',
          isLeftEdge(i) ? 'border-l-4' : '',
          isBottomEdge(i) ? 'border-b-4' : '',
          isRightEdge(i) ? 'border-r-2' : '',
        //   isOnWrongPosition(i, cell) ? 'text-red-600' : '',
        //   isTyped(i) && !isOnWrongPosition(i, cell) ? 'text-green-600' : '',
        //   isBoardComplete() ? 'text-black bg-blue-50' : ''
        ].join(' ');

        return (
          <div
            key={i}
            id={generateCellId(i)}
            className={cellClasses}
            onClick={() => 
              setSelectedCellIndex(i)
            }
          >
            {cell}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
