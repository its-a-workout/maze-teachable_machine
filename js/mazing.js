// Original JavaScript code by Chirp Internet: chirpinternet.eu
// Please acknowledge use of this code by including this header.
//import {result} from './main.html';

function Position(x, y) {
    this.x = x;
    this.y = y;
  }
  
  Position.prototype.toString = function() {
    return this.x + ":" + this.y;
  };
  
  function Mazing(id) {
  
    // bind to HTML element
    this.mazeContainer = document.getElementById(id);
  
    this.mazeScore = document.createElement("div");
    this.mazeScore.id = "maze_score";
  
    this.mazeMessage = document.createElement("div");
    this.mazeMessage.id = "maze_message";
  
    // this.heroScore = this.mazeContainer.getAttribute("data-steps") - 2;
    this.heroScore = 9999;
    this.maze = [];
    this.heroPos = {};
    this.heroHasKey = false;
    this.childMode = false;
  
    this.utter = null;
  
    for(i=0; i < this.mazeContainer.children.length; i++) {
      for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
        var el =  this.mazeContainer.children[i].children[j];
        this.maze[new Position(i, j)] = el;
        if(el.classList.contains("entrance")) {
          // place hero at entrance
          this.heroPos = new Position(i, j);
          this.maze[this.heroPos].classList.add("hero");
        }
      }
    }
  
    // var mazeOutputDiv = document.createElement("div");
    // mazeOutputDiv.id = "maze_output";
  
    // mazeOutputDiv.appendChild(this.mazeScore);
    // mazeOutputDiv.appendChild(this.mazeMessage);
  
    // mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";
    // this.setMessage("first find the key");
  
    // this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);


   

   // activate control keys
   //디버깅을 위해 키보드로도 움직일수 있게 함
    this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
    //console.log(this.keyPressHandler);
    document.addEventListener("keydown", this.keyPressHandler, false);
 
 
    //   function delay(milliseconds){
  //     return new Promise(resolve => {
  //         setTimeout(resolve, milliseconds);
  //     });
  // }
    //every 1 second, call the function
    //setInterval(this.keyPressHandler, 1000);

  

  };
  
  Mazing.prototype.enableSpeech = function() {
    this.utter = new SpeechSynthesisUtterance()
    this.setMessage(this.mazeMessage.innerText);
  };
  
  Mazing.prototype.setMessage = function(text) {
    this.mazeMessage.innerHTML = text;
    this.mazeScore.innerHTML = this.heroScore;
    if(this.utter) {
      this.utter.text = text;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(this.utter);
    }
  };
  
  Mazing.prototype.heroTakeTreasure = function() {
    this.maze[this.heroPos].classList.remove("nubbin");
    this.heroScore += 10;
    this.setMessage("yay, treasure!");
  };
  
  Mazing.prototype.heroTakeKey = function() {
    this.maze[this.heroPos].classList.remove("key");
    this.heroHasKey = true;
    this.heroScore += 20;
    this.mazeScore.classList.add("has-key");
    this.setMessage("you now have the key!");
  };
  
  Mazing.prototype.gameOver = function(text) {
    // de-activate control keys
    document.removeEventListener("keydown", this.keyPressHandler, false);
    this.setMessage(text);
    this.mazeContainer.classList.add("finished");
  };
  
  Mazing.prototype.heroWins = function() {
    this.mazeScore.classList.remove("has-key");
    this.maze[this.heroPos].classList.remove("door");
    this.heroScore += 50;
    this.gameOver("you finished !!!");
  };
  
  Mazing.prototype.tryMoveHero = function(pos) {
  
    if("object" !== typeof this.maze[pos]) {
      return;
    }
  
    var nextStep = this.maze[pos].className;
  
    // before moving
    if(nextStep.match(/sentinel/)) {
      this.heroScore = Math.max(this.heroScore - 5, 0);
      if(!this.childMode && this.heroScore <= 0) {
        this.gameOver("sorry, you didn't make it");
      } else {
        this.setMessage("ow, that hurt!");
      }
      return;
    }
    if(nextStep.match(/wall/)) {
      return;
    }
    if(nextStep.match(/exit/)) {
      if(this.heroHasKey) {
        this.heroWins();
      } else {
        this.setMessage("you need a key to unlock the door");
        return;
      }
    }
  
    // move hero one step
    this.maze[this.heroPos].classList.remove("hero");
    this.maze[pos].classList.add("hero");
    this.heroPos = pos;
  
    // after moving
    if(nextStep.match(/nubbin/)) {
      this.heroTakeTreasure();
      return;
    }
    if(nextStep.match(/key/)) {
      this.heroTakeKey();
      return;
    }
    if(nextStep.match(/exit/)) {
      return;
    }
    if(this.heroScore >= 1) {
      if(!this.childMode) {
        this.heroScore--;
      }
      if(!this.childMode && (this.heroScore <= 0)) {
        this.gameOver("sorry, you didn't make it");
      } else {
        this.setMessage("...");
      }
    }
  };
     
  //디버깅을 위해 키보드로도 움직일수 있게 함
  Mazing.prototype.mazeKeyPressHandler = function(e) {
    var tryPos = new Position(this.heroPos.x, this.heroPos.y);
    switch(e.keyCode)
    {
      case 37: // left
        this.mazeContainer.classList.remove("face-right");
        tryPos.y--;
        break;
  
      case 38: // up
        tryPos.x--;
        break;
  
      case 39: // right
        this.mazeContainer.classList.add("face-right");
        tryPos.y++;
        break;
  
      case 40: // down
        tryPos.x++;
        break;
  
      default:
        return;
  
    }
    this.tryMoveHero(tryPos);
    e.preventDefault();
  };
  
  Mazing.prototype.setChildMode = function() {
    this.childMode = true;
    this.heroScore = 0;
    this.setMessage("collect all the treasure");
  };
//console.log(Mazing.prototype.mazeKeyPressHandler);





Mazing.prototype.moveCharacter = function(direction) {
  //console.log(hello);
  var tryPos = new Position(this.heroPos.x, this.heroPos.y);
  //console.log(result[result.length-1]);
  switch(direction)
  {
    case 'left': // left
      this.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      break;

    case 'up': // up
      tryPos.x--;
      break;
    
    case 'squat': // up
      tryPos.x--;
      break;

    case 'right': // right
      this.mazeContainer.classList.add("face-right");
      tryPos.y++;
      break;

    case 'down': // down
      tryPos.x++;
      break;

    default:
      return;

  }

  this.tryMoveHero(tryPos);
  //e.preventDefault();
};

// while(true){
//   console.log("hello");
//   setTimeout(Mazing.prototype.whatisit(self),1000);

// }

