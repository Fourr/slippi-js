var fs = require("fs");
var files = fs.readdirSync("../../../Documents/Slippi");

const { default: SlippiGame } = require("@slippi/slippi-js");
const meleeInfo = require("@slippi/slippi-js/dist");
var jsonArr = [];

for (var i = 0; i < files.length; i++) {
  currentGame = "../../../Documents/Slippi/" + files[i];
  //currentGame = '../../Documents/Slippi/Game_20200720T195337.slp'
  var game = new SlippiGame(currentGame);
  const metadata = game.getMetadata();
  const settings = game.getSettings();
  const stats = game.getStats();

  MyPlayerSlot = 0;
  OpponentPlayerSlot = 1;

  if (!metadata) {
    statement = "File " + files[i] + " MetaData was null";
    console.log(statement);
    continue;
  }
  if (metadata.players[0].names.code == "FOUR#828") {
    myStats = stats.overall[0];
    opponentStats = stats.overall[1];
  } else if (metadata.players[1].names.code == "FOUR#828") {
    myStats = stats.overall[1];
    opponentStats = stats.overall[0];
    MyPlayerSlot = 1;
    OpponentPlayerSlot = 0;
  } else {
    statement = "File " + files[i] + " couldnt find my netcode tag";
    console.log(statement);
  }

  var killMoves = [];
  var k;
  for (var k = 0; k < stats.conversions.length; k++) {
    if (stats.conversions[k].didKill && stats.conversions[k].playerIndex == MyPlayerSlot) {
      move = stats.conversions[k].moves.slice(-1)[0].moveId;
      moveName = meleeInfo.moves.getMoveName(move);
      killMoves.push(moveName);
    }
  }

  myCharacter = meleeInfo.characters.getCharacterName(settings.players[MyPlayerSlot].characterId);
  opponentCharacter = meleeInfo.characters.getCharacterName(settings.players[OpponentPlayerSlot].characterId);
  Stage = meleeInfo.stages.getStageName(settings.stageId);

  Kills = myStats.killCount;
  OpponentKills = opponentStats.killCount;
  Damage = myStats.totalDamage;
  APM = myStats.inputsPerMinute.ratio;
  DAPM = myStats.digitalInputsPerMinute.ratio;
  openingsPerKill = myStats.openingsPerKill.ratio;
  neutralWins = myStats.neutralWinRatio.ratio;
  if (Kills > OpponentKills) {
    result = "Win";
  } else {
    result = "Loss";
  }
  StatList = { kills: Kills, damage: Damage, apm: APM, dapm: DAPM, OPK: openingsPerKill, NeutralWins: neutralWins };
  OtherData = { Result: result, Stage: Stage, MyCharacter: myCharacter, OpponentCharacter: opponentCharacter };

  GameExport = { StatList, OtherData, killMoves, GameFile: files[i] };
  FinalGameExport = { [files[i]]: GameExport };
  jsonArr.push(FinalGameExport);
}
var jsonString = JSON.stringify(jsonArr, null, 2);
fs.writeFile("./GameExport.json", jsonString, (err) => {
  if (err) {
    console.log("Error writing file", err);
  } else {
    console.log("Successfully wrote file");
  }
});
