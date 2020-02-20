function PCEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}


var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM);

GameBoard.side = COLOURS.WHITE;

GameBoard.fiftyMove = 0;

GameBoard.hisPly = 0; // maintains the count of full moves

GameBoard.history = []; // indexed by hisplay

GameBoard.ply = 0; // maintains the count of half moves

GameBoard.enPas = 0;  // for en passant


/*
0001 - 1 -  white kingside castling
0010 - 2 -  white Queenside castling
0100 - 4 -  Black kingside castling
1000 - 8 -  white kingside castling

we use bitwise AND with the CASTLE bits to know state of castling

1101 - 13 - means white can castle kingside, cant castle queenside
            black can castle both kingside and queenside

 if(1101 & WKCA) != 0  then white can castle kingside
*/

GameBoard.castlePerm =0;

// holds the value of black and white's material at a given position
GameBoard.material = new Array(2); 
 
 // how many of each piece type do we actually have, indexed by PIECES
GameBoard.pceNum = new Array(13); 
// one dimensional array that stores the position of each piece on the board
GameBoard.pList = new Array(14 * 10);







/*

loop (pieces[])
if(piece on sq == Side tomove)
then genmoves() for piece on sq


sqOfpiece = pList[index];

index?

wP * 10 + wPNum -> 0 based index of num of pieces(GameBoard.pceNum)
wN * 10 + wNnum

say we have 4 white pawns GameBoard.pceNum[wP] = 4

for(pceNum = 0; pceNum < GameBoard.pceNum[wP]; ++pceNum) {
	sq = pList[wP * 10 + pceNum]

}

sq1 = pList[wP * 10 + 0]
sq2 = pList[wP * 10 + 1]
sq3 = pList[wP * 10 + 2]
sq4 = pList[wP * 10 + 3]

wP 10 -> 19
wN 20 -> 29
*/


// posKey is the unique number that represents the position on the board
GameBoard.posKey =0;
GameBoard.moveList = new Array(MAXDEPTH* MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

GameBoard.PvTable = []; // stores the 10000 entries


/** this array is filled to store the best line the engine found for the certain depth
 * for example if the engine searches till depth 5 then it will have five moves stored in it
 */
GameBoard.PvArray = new Array(MAXDEPTH);
GameBoard.searchHistory = new Array(14* BRD_SQ_NUM);
GameBoard.searchKillers = new Array(3 * MAXDEPTH);





function CheckBoard() {   
 
	var t_pceNum = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [ 0, 0];
	var sq64, t_piece, t_pce_num, sq120, colour, pcount;
	
	//checking pList and pieces Arrays
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		for(t_pce_num = 0; t_pce_num < GameBoard.pceNum[t_piece]; ++t_pce_num) {
			sq120 = GameBoard.pList[PCEINDEX(t_piece,t_pce_num)];
			if(GameBoard.pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return BOOL.FALSE;
			}
		}	
	}
	
	for(sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = SQ120(sq64);
		t_piece = GameBoard.pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[PieceCol[t_piece]] += PieceVal[t_piece];
	}
	
	for(t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		if(t_pceNum[t_piece] != GameBoard.pceNum[t_piece]) {
				console.log('Error t_pceNum');
				return BOOL.FALSE;
			}	
	}
	
	if(t_material[COLOURS.WHITE] != GameBoard.material[COLOURS.WHITE] ||
			 t_material[COLOURS.BLACK] != GameBoard.material[COLOURS.BLACK]) {
				console.log('Error t_material');
				return BOOL.FALSE;
	}	
	
	if(GameBoard.side!=COLOURS.WHITE && GameBoard.side!=COLOURS.BLACK) {
				console.log('Error GameBoard.side');
				return BOOL.FALSE;
	}
	
	if(GeneratePosKey()!=GameBoard.posKey) {
				console.log('Error GameBoard.posKey');
				return BOOL.FALSE;
	}	
	return BOOL.TRUE;
}








function PrintBoard(){
	var sq,file,rank,piece;



console.log("\nGame Board:\n");
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =(RankChar[rank] + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = GameBoard.pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}
		console.log(line);
	}



	console.log("");

	var line = "  "; 
	for(file = FILES.FILE_A; file <= FILES.FILE_H; file++){
		line += (' '+ FileChar[file] + ' ');
	}

	console.log(line);
	console.log("side:"+ SideChar[GameBoard.side]);
	console.log("enPas:" + GameBoard.enPas);
	line = "";

	if(GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';

	console.log("castle:" + line);
	console.log("key:" + GameBoard.posKey.toString(16));
}






function GeneratePosKey(){

	var sq =0; 
	var finalKey =0;
	var piece = PIECES.EMPTY;



	for(sq=0; sq<BRD_SQ_NUM; ++sq){

		piece = GameBoard.pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD){
			finalKey ^= PieceKeys[(piece*120)+sq];

		}
	}

	if(GameBoard.side == COLOURS.WHITE){
		finalKey ^= SideKey;
	}

	if(GameBoard.enPas != SQUARES.NO_SQ){
		finalKey ^= PieceKeys[GameBoard.enPas];
	}

	finalKey ^= CastleKeys[GameBoard.castlePerm];

	return finalKey;

}


function PrintPieceLists(){
	var piece, pceNum;

	for(piece = PIECES.wP; piece <= PIECES.bK; ++piece){
		for(pceNum =0; pceNum< GameBoard.pceNum[piece]; ++pceNum){
			console.log('Piece '+ PceChar[piece] + ' on ' + PrSq(GameBoard.pList[PCEINDEX(piece,pceNum)]));
		}
	}

}


function UpdateListMaterial(){
	var piece, sq, index, colour;


	for(index=0; index<2; ++index){
 		GameBoard.material[index]= 0;
 	} 


 	for(index=0; index<13; ++index){
 		GameBoard.pceNum[index]= 0; 
 	} 


 	for(index=0;index<14*120; ++index){
 		GameBoard.pList[index] = PIECES.EMPTY;
 	}



	for(index =0; index<64; ++index){
		sq = SQ120(index);
		piece = GameBoard.pieces[sq];

		if(piece != PIECES.EMPTY){
			//console.log('Piece ' +  piece + ' on '+ sq); 

			colour = PieceCol[piece];

			GameBoard.material[colour] += PieceVal[piece];

			/*this fills the position at which a piece is in the pList 
			say the piece is a white knight then PCEINDEX for it returns 
			       wN*10 + pceNum = 2*10 + 0 = 20
			 now we save the position ie sq(square) at which white knight is
			 at the 20th index in the Plist, and then we increment the count of
			 knight by 1; 
			*/

			GameBoard.pList[PCEINDEX(piece,GameBoard.pceNum[piece])] = sq;
			GameBoard.pceNum[piece]++;
		}
	}
//	PrintPieceLists();
}



function ResetBoard(){

	var index =0;
 
 	for(index=0;index< BRD_SQ_NUM; ++ index){
 		GameBoard.pieces[index] = SQUARES.OFFBOARD;
 	}

 	for(inex=0;index<64; ++index){
 		GameBoard.pieces[SQ120(index)]= PIECES.EMPTY;
 	}

 

 	GameBoard.side =  COLOURS.BOTH;
 	GameBoard.enPas = SQUARES.NO_SQ;
 	GameBoard.fiftyMove = 0;
 	GameBoard.ply =0;
 	GameBoard.hisPly =0;
 	GameBoard.castlePerm = 0;
 	GameBoard.posKey =0;
 	GameBoard.moveListStart[GameBoard.ply] = 0;


}

//FEN ex : rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1



function ParseFen(fen){
	ResetBoard();

	var rank = RANKS.RANK_8;
	var file = FILES.FILE_A;
	var piece = 0;
	var count = 0;
	var i = 0;
	var sq120 = 0;
	var fenCnt =0;

	 while((rank>= RANKS.RANK_1)&& fenCnt<fen.length){

	 	count =1;

		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;
            
            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;  
            default:
                console.log("FEN error");
                return;

		}
		
		for (i = 0; i < count; i++) {	
			sq120 = FR2SQ(file,rank);            
            GameBoard.pieces[sq120] = piece;
			file++;
        }

        fenCnt++;

	}// while end 

	GameBoard.side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK;
	fenCnt +=2;

	for(i =0; i <4; i++){
		 if(fen[fenCnt]==' '){
		 	break;
		 }

		 switch(fen[fenCnt]){
		 	case 'K' : GameBoard.castlePerm |= CASTLEBIT.WKCA; break;
		 	case 'Q' : GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
		 	case 'k' : GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
		 	case 'q' : GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
		 	default: break;
		 }

		 fenCnt++;
	}
	fenCnt++;

	if(fen[fenCnt]!='-'){
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt+1].charCodeAt() - '1'.charCodeAt();
		console.log("fen[fenCnt]:"+ fen[fenCnt] + " File: " + file + " Rank: "+ rank );
		GameBoard.enPas = FR2SQ(file,rank);
	}  

	GameBoard.posKey = GeneratePosKey(); 
	UpdateListMaterial();
//	PrintSqAttacked();

}


function PrintSqAttacked() {
	
	var sq,file,rank,piece;

	console.log("\nAttacked:\n");
	
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =((rank+1) + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			if(SqAttacked(sq, GameBoard.side) == BOOL.TRUE) piece = "X";
			else piece = "-";
			line += (" " + piece + " ");
		}
		console.log(line);
	}
	
	console.log("");
	
}





function SqAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;
	
	if(side == COLOURS.WHITE) {
		if(GameBoard.pieces[sq - 11] == PIECES.wP || GameBoard.pieces[sq - 9] == PIECES.wP) {
			return BOOL.TRUE;
		}
	} else {
		if(GameBoard.pieces[sq + 11] == PIECES.bP || GameBoard.pieces[sq + 9] == PIECES.bP) {
			return BOOL.TRUE;
		}	
	}
	
	for(index = 0; index < 8; index++) {
		pce = GameBoard.pieces[sq + KnDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKnight[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = RkDir[index];
		t_sq = sq + dir;
		pce = GameBoard.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(PieceRookQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = GameBoard.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = BiDir[index];
		t_sq = sq + dir;
		pce = GameBoard.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(PieceBishopQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = GameBoard.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 8; index++) {
		pce = GameBoard.pieces[sq + KiDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKing[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	return BOOL.FALSE;
	 
}








