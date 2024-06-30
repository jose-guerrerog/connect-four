var index_x, index_y; //// what user plays
var winner;
rows = 6;
columns = 7;
var player2 = false;

if (window.location.search === "?twoPlayer=true") {
  player2 = true;
}

var position = new Array(columns); /// where the coins are?

/////// JAVASCRIPT BOARD
var Board = new Array(rows);

for (let i = 0; i < rows; i++) {
  Board[i] = new Array(columns);
}
/////////

var flag = true;

const init_boards = function () {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      Board[i][j] = "-";
    }
  }

  for (let i = 0; i < columns; i++) {
    position[i] = rows - 1;
  }
};

init_boards();

function formsub() {
  $("#audio_in").get(0).play();
  $("#audio_in").prop("volume", 0).animate({ volume: 0.4 }, 8000);
}

const checkForWinner = function (ii, ij) {
  for (
    let i = ii - 3;
    i <= ii;
    i++ //// Vertical comparison
  ) {
    if (i < 0 || i > 2) continue;

    if (
      Board[i][ij] === Board[i + 1][ij] &&
      Board[i + 1][ij] === Board[i + 2][ij] &&
      Board[i + 2][ij] === Board[i + 3][ij] &&
      Board[i + 3][ij] !== "-"
    ) {
      return {
        player: Board[ii][ij],
        point1: { x: i, y: ij },
        point2: { x: i + 1, y: ij },
        point3: { x: i + 2, y: ij },
        point4: { x: i + 3, y: ij },
      };
    }
  }

  for (
    let i = ii - 3;
    i <= ii;
    i++ //// Main diagonal
  ) {
    if (i < 0 || i > 2) continue;

    for (let j = ij - 3; j <= ij; j++) {
      if (j < 0 || j > 3) continue;

      if (
        Board[i][j] === Board[i + 1][j + 1] &&
        Board[i + 1][j + 1] === Board[i + 2][j + 2] &&
        Board[i + 2][j + 2] === Board[i + 3][j + 3] &&
        Board[i + 3][j + 3] !== "-"
      ) {
        return {
          player: Board[ii][ij],
          point1: { x: i, y: j },
          point2: { x: i + 1, y: j + 1 },
          point3: { x: i + 2, y: j + 2 },
          point4: { x: i + 3, y: j + 3 },
        };
      }
    }
  }

  for (
    let i = ii + 3;
    i >= ii;
    i-- //// Main diagonal Inverse
  ) {
    if (i >= 6 || i <= 2) continue;

    for (let j = ij - 3; j <= ij; j++) {
      if (j < 0 || j > 3) continue;

      if (
        Board[i][j] === Board[i - 1][j + 1] &&
        Board[i - 1][j + 1] === Board[i - 2][j + 2] &&
        Board[i - 2][j + 2] === Board[i - 3][j + 3] &&
        Board[i - 3][j + 3] !== "-"
      ) {
        return {
          player: Board[ii][ij],
          point1: { x: i, y: j },
          point2: { x: i - 1, y: j + 1 },
          point3: { x: i - 2, y: j + 2 },
          point4: { x: i - 3, y: j + 3 },
        };
      }
    }
  }

  for (
    let j = ij - 3;
    j <= ij;
    j++ //// Horizontal comparison
  ) {
    if (j < 0 || j > 3) continue;

    if (
      Board[ii][j] === Board[ii][j + 1] &&
      Board[ii][j + 1] === Board[ii][j + 2] &&
      Board[ii][j + 2] === Board[ii][j + 3] &&
      Board[ii][j + 3] !== "-"
    ) {
      return {
        player: Board[ii][ij],
        point1: { x: ii, y: j },
        point2: { x: ii, y: j + 1 },
        point3: { x: ii, y: j + 2 },
        point4: { x: ii, y: j + 3 },
      };
    }
  }

  return 0;
};

const emptySquares = function () {
  let array_empty = [];

  for (let j = 0; j < columns; j++) {
    if (position[j] === -1) continue;
    array_empty.push(position[j] * columns + j);
  }

  return array_empty;
};

const minimax = function (player, depth, ii, ij) {
  let spots = emptySquares();
  let maxval = -1000;
  let minval = 1000;
  let move = { index: "", score: "" };

  if (depth !== 0) {
    let n = checkForWinner(ii, ij);
    if (n != 0) {
      if (n?.player === "X") return { score: depth - 10 };
      if (n?.player === "O") return { score: 10 - depth };
    } else {
      if (spots.length === 0) {
        return { score: 0 };
      }
    }
  }

  if (depth === 7) {
    return { score: 0 };
  }
  for (let i = 0; i < spots.length; i++) {
    let indexj = spots[i] % columns;
    let indexi = (spots[i] - indexj) / columns;

    if (player === "computer") {
      Board[indexi][indexj] = "O";
      position[indexj]--;
      var result = minimax("human", depth + 1, indexi, indexj);

      if (result.score > maxval) {
        maxval = result.score;
        move.score = maxval;
        move.index = spots[i];
      }
    } else {
      Board[indexi][indexj] = "X";
      position[indexj]--;
      var result = minimax("computer", depth + 1, indexi, indexj);

      if (result.score < minval) {
        minval = result.score;
        move.score = minval;
        move.index = spots[i];
      }
    }
    position[indexj]++;
    Board[indexi][indexj] = "-";
  }

  return move;
};

$(document).ready(function () {
  var turns = 1; /// display "X" in the first turn

  $("#board tr td").click(function () {
    if ($(this).text() === "" && flag) {
      let string = $(this)[0].classList[0];
      index_y = parseInt(string[5]);
      index_x = position[index_y];

      /*    $('td').eq(index_x*columns+index_y).append("X");*/
      if (turns % 2) {
        $(`.item${index_x}${index_y}`).addClass("yellow");
        Board[index_x][index_y] = "X";

        position[index_y]--;

        let m1 = checkForWinner(index_x, index_y);

        if (m1 && m1.player === "X") {
          const { point1, point2, point3, point4 } = m1;

          $("#text")
            .append("You won. Would you like to try again?")
            .attr("value");
          $("#close-dialog").attr("value", "Try again");

          $("#main-dialog").show();
          $("#overlay").show();

          $("#audio_in").get(0).pause();

          flag = false;
          $(`.item${point1.x}${point1.y}`).addClass("green");
          $(`.item${point2.x}${point2.y}`).addClass("green");
          $(`.item${point3.x}${point3.y}`).addClass("green");
          $(`.item${point4.x}${point4.y}`).addClass("green");
          return;
        }
      }

      let answer = minimax("computer", 0, 0, 0);

      let indice = answer.index;

      let indicej = indice % columns;
      let indicei = (indice - indicej) / columns;

      $(`.item${indicei}${indicej}`).addClass("red");

      Board[indicei][indicej] = "O";
      position[indicej]--;

      let m = checkForWinner(indicei, indicej);

      if (m !== 0) {
        const { point1, point2, point3, point4 } = m;
        flag = false;
        $(`.item${point1.x}${point1.y}`).addClass("green");
        $(`.item${point2.x}${point2.y}`).addClass("green");
        $(`.item${point3.x}${point3.y}`).addClass("green");
        $(`.item${point4.x}${point4.y}`).addClass("green");
        $("#audio_in").get(0).pause();

        $("#main-dialog").attr("open", true);
        $("#overlay").show();

        $("#text").text("CPU won. Would you like to try again?");
        $("#close-dialog").attr("value", "Try again");
      }
    }
  });

  $("#board tr td").on("mouseenter", function (event) {
    let c = $(this)[0].classList[1];
    $(`.${c}`).css("background-color", "#e4e4e4");
  });

  $("#board tr td").on("mouseleave", function (event) {
    let c = $(this)[0].classList[1];
    $(`.${c}`).css("background-color", "white");
  });

  $("#text").text("Are you ready to start the game?");
  $("#close-dialog").attr("value", "Accept");
  $("#main-dialog").show();
  $("#main-dialog").attr("open", true);

  $("#close-dialog").click(function () {
    $("#main-dialog").attr("open", false);
    $("#main-dialog").hide();

    $("#audio_in").get(0).play();
    $("#audio_in").prop("volume", 0).animate({ volume: 0.4 }, 8000);
    $("#overlay").hide();

    flag = true;
    $("td").empty();
    init_boards();
    $("#audio_in").get(0).play();
    $("#audio_in").prop("volume", 0).animate({ volume: 0.4 }, 8000);
    $("td").removeClass("yellow").removeClass("red").removeClass("green");
  });
});
