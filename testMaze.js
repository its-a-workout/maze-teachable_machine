var Maze, MazeGame;


document.getElementById("hello").onclick = function () {
    Maze = new MazeBuilder(8, 8);
//Maze.placeKey();
console.log(Maze);
Maze.display("maze_container");
MazeGame = new Mazing("maze");
  };