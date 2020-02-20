/**

PvTable[10000]

Entry has .posKey .move

index = current posKey % 10000

PvTable[index].move = Move from AB posKey = GameBoard.posKey

to probe a pv move : when we want to find the pv move or find the best move at a given depth , we take the current posKey % 10000 as index and  lookup in the PvTable whether the key present there is equal to the key present in the table , if it is then we know that the corresponding move stored in the PvTable is the best move for that position

now because the alpha beta backs up till the root, the last move stored for the position at the root is the best move for that position


 */

function GetPvLine(depth) {
	
	var move = ProbePvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( MoveExists(move) == BOOL.TRUE) {
			MakeMove(move);
			GameBoard.PvArray[count++] = move;			
		} else {
			break;
		}		
		move = ProbePvTable();	
	}
	
	while(GameBoard.ply > 0) {
		TakeMove();
	}
	
	return count;
	
}

function ProbePvTable() {
	var index = GameBoard.posKey % PVENTRIES;
	
	if(GameBoard.PvTable[index].posKey == GameBoard.posKey) {
		return GameBoard.PvTable[index].move;
	}
	
	return NOMOVE;
}

function StorePvMove(move) {
	var index = GameBoard.posKey % PVENTRIES;
	GameBoard.PvTable[index].posKey = GameBoard.posKey;
	GameBoard.PvTable[index].move = move;
}

