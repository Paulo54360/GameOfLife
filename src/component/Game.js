import React from "react"
import { Button, Box,TextareaAutosize } from "@mui/material";
import  PentadécathlonPattern from "../Pattern/pentadécathlon .txt";
import  PulsarPatter from "../Pattern/Pulsar.txt";
import "./Game.css";

/* x = lignes (raws)
   y = colonnes (colomns)
*/

// Dimension du tableau //

const CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;


class Cell extends React.Component {
  // positionne les cellules //
  render() {
    const { x, y } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${CELL_SIZE * x + 1}px`,
          top: `${CELL_SIZE * y + 1}px`,
          width: `${CELL_SIZE - 1}px`,
          height: `${CELL_SIZE - 1}px`,
        }}
      />
    );
  }
}

class Game extends React.Component {
  constructor() {
    // Permet d'interagir avec le tableau pour créer des cellules//
    super();
    this.rows = HEIGHT / CELL_SIZE; // sauvegarde la position des cellules//
    this.cols = WIDTH / CELL_SIZE;

    this.board = this.makeEmptyBoard(); // conserve l'état du tableau
  }
  // Etat par défaut
  state = {
    cells: [],
    isRunning: false,
    interval: 100,
  };

  // vide le tableau //
  makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < this.rows; y++) {
      board[y] = [];
      for (let x = 0; x < this.cols; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }

  // calcule la position de l'élément du tableau //
  getElementOffset() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;

    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop,
    };
  }

  makeCells() {
    let cells = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  }

  handleClick = (event) => {
    // Récupère la position du click
    const elemOffset = this.getElementOffset();
    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;

    const x = Math.floor(offsetX / CELL_SIZE);
    const y = Math.floor(offsetY / CELL_SIZE);

    if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
      this.board[y][x] = !this.board[y][x];
    }

    this.setState({ cells: this.makeCells() });
  };

  // Démarre le jeu //
  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  };

  // Arrete le jeu //
  stopGame = () => {
    this.setState({ isRunning: false });
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };

  runPattern = async (selectedPattern) => {
    console.log(selectedPattern)
    this.handleClear()
    const pattern = {binocle: PentadécathlonPattern, pulsar: PulsarPatter}
    const r = await fetch(pattern[selectedPattern])
    const result = await r.text() //recup le texte
    const tableau = result.split('\n');
    for (let y = 0; y < tableau.length; y++) {
      for (let x = 0; x < tableau[y].length; x++) {
        console.log(tableau[y][x])
        if (tableau[y][x] === 'X') {
          this.board[y][x] = true
        } else {
          this.board[y][x] = false
        }
      }
    }
    this.setState({ cells: this.makeCells() });
  };


  runIteration() {
    let newBoard = this.makeEmptyBoard();
  //  this.handleClear()
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let neighbours = this.calculateNeighbour(this.board, x, y);
        if (this.board[y][x]) {
          newBoard[y][x] = neighbours === 2 || neighbours === 3;
        } else {
          if (!this.board[y][x] && neighbours === 3) {
            newBoard[y][x] = true;
          }
        }
      }
    }

    this.board = newBoard;
    this.setState({ cells: this.makeCells() });

    this.timeoutHandler = window.setTimeout(() => {
      this.runIteration();
    }, this.state.interval);
  }
  /*
  "runIteration" permet de faire appel au tableau à chaque iteration
  window.setTimeout appel la method "runIteration" avant chaque nouvelle itération
  */

  calculateNeighbour(board, x, y) {
    let neighbours = 0;
    const direction = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];

    for (let i = 0; i < direction.length; i++) {
      const dir = direction[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];

      if (
        x1 >= 0 &&
        x1 < this.cols &&
        y1 >= 0 &&
        y1 < this.rows &&
        board[y1][x1]
      ) {
        neighbours++;
      }
    }
    return neighbours;
  }

  // Fais l'intervale entre chaque jour //
  handleIntervalChange = (event) => {
    this.setState({ interval: event.target.value });
  };

  // Vide le tableau des cellules //
  handleClear = () => {
    this.board = this.makeEmptyBoard();
    this.setState({ cells: this.makeCells() });
  };

  // Positionne de manière aléatoire le tableau //
  handleRandom = () => {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.board[y][x] = Math.random() >= 0.5;
      }
    }

    this.setState({ cells: this.makeCells() });
  };

  render() {
    // sauvegarde les éléments du tableau //
    const { cells, isRunning } = this.state;
    return (
      <div>
        <div
          className="Board"
          style={{
            width: WIDTH,
            height: HEIGHT,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
          onClick={this.handleClick}
          ref={(n) => {
            this.boardRef = n;
          }}
        >
          {cells.map((cell) => (
            <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
          ))}
        </div>

        <div className="controls" >
          Mise à jour toutes {" "}
          <input style={{width:65, margin:"5px"}}
                 type="number"
              value={this.state.interval}
              onChange={this.handleIntervalChange}
          />
          ms
          {isRunning ? (
            <Button
                style={{width:35, margin:"5px"}}
              className="button"
              variant="contained"
              pa={"100px"}
              onClick={this.stopGame}
              color="error"
            >
              Stop
            </Button>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={this.runGame}
              color="success"
            >
              Run
            </Button>
          )}
          <Button className="button" variant="contained" onClick={() => this.runPattern('binocle')}>
            Pentadécathlon
          </Button>
          <Button className="button" variant="contained" onClick={() => this.runPattern('pulsar')}>
            Pulsar 3
          </Button>
          <Button className="button" variant="contained" onClick={this.handleRandom}>
            Aléatoire
          </Button>
          <Button className="button" variant="contained" onClick={this.handleClear}>
            Clear
          </Button>
        </div>
      </div>
    );
  }
}

export default Game;
