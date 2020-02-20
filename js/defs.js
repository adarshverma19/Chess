// definition for the pieces 
//Using constants for PIECES is better than using hardcode numbers

var PIECES = { EMPTY : 0 , wP:1, wN: 2, wB: 3, wR: 4, wQ:5 , wK:6, 
				bP:7 , bN: 8, bB:9, bR: 10, bQ:11, bK: 12 };

// number of squares on the board
var BRD_SQ_NUM = 120;

// defining files : 0 to 7
var FILES = { FILE_A:0 , FILE_B:1, FILE_C:2 , FILE_D:3,
			  FILE_E:4 , FILE_F:5, FILE_G:6 , FILE_H:7,
			  FILE_NONE:8
			  };

// defining ranks : 0 to 7     
var RANKS = { RANK_1:0 , RANK_2:1, RANK_3:2 , RANK_4:3,
			  RANK_5:4 , RANK_6:5, RANK_7:6 , RANK_8:7,
			  RANK_NONE:8
			  };
 
var COLOURS = { WHITE: 0, BLACK: 1, BOTH:2};

//Bits for castling permissions
var CASTLEBIT = {WKCA: 1, WQCA :2, BKCA :4 ,  BQCA:8};

// Important squares on the board 
var SQUARES = {A1:21 , B1:22, C1:23 , D1:24,
			  E1:25 , F1:26, G1:27 , H1:28,
			  A8:91 , B8:92, C8:93 , D8:94,
			  E8:95 , F8:96, G8:97 , H8:98,
			  NO_SQ: 99, OFFBOARD: 100}; 

var BOOL = {FALSE:0, TRUE:1};  //EX  BOOL.FALSE

 // list of moves the board has at a given position indexed by the current ply 
var MAXGAMEMOVES = 2048;
//
var MAXPOSITIONMOVES = 256;
// max depth the engine goes to 
var MAXDEPTH = 64;

var INFINITE = 30000;

var MATE = 29000; // this score should be inside the bounds of alpha beta you know the reason, if not use your brain 

var PVENTRIES = 10000;

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; 


// these strings will be used to print the board characters 
var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var FileChar = "abcdefgh";
var RankChar = "12345678";

//this function returns the square of given the file and rank
// example FR2SQ(2,3) = 53  look at the board position from the screenshot 

function FR2SQ(f,r){
	return ((21+f) + ((r)*10));
}


// the below arrays all map to the PIECES array  defined above

// Is the piece a non pawn 
var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
// Is the piece a major piece like rook, queen , king 
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
// minor piece like knight , bishop  
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
// values associated with each piece
var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
// color of the pieces i.e to which color do they belong
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
// is the piece a pawn

var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
// is the piece a knight
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
// is the piece a king
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
// is the piece a rook or a queen
var PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
// is the piece a bishop or a queen
var PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
//// can the piece slide or not only rook, bishop and queen can slide 
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
 

// Arrays for the directions of each piece type 
var KnDir = [ -8, -19, -21, -12, 8, 19, 21, 12];
var RkDir = [ -1,-10,1,10];
var BiDir = [-9,-11,11,9];
var KiDir = [-1,-10,1,10,-9,-11,11,9];


//indexed by the piece type, indicates number of directions a piece can move
// notice the directions for pawn is zero because we are using this only for other type of pieces only
// the code for pawn movement is already written without the use of this array
var DirNum = [0,0,8,4,4,8,8,0,8,4,4,8,8];

//  refers the direction array each piece would be using, again indexed by piece type
// notice queen's directions are same as the king but only sliding
var PceDir = [0,0,KnDir,BiDir,RkDir, KiDir, KiDir,0, KnDir, BiDir, RkDir, KiDir, KiDir];

var LoopNonSlidePce = [PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK,0];
var LoopNonSlideIndex = [0,3]; 


var LoopSlidePce = [PIECES.wB, PIECES.wR, PIECES.wQ , 0,PIECES.bB, PIECES.bR, PIECES.bQ , 0 ];
var LoopSlideIndex = [0,4];


/*

while(pce!=0)
	pceIndex = LoopNonSlideIndex[WHITE](0)
	pce = LoopNonSlidePce[pceIndex] (wN)
	pceIndex++
	loop pceDir[wN][0 - 8]
*/

/*Because each piece can be on any of the given 120 squares so we need a random number that represents
the unique position of that piece on that square, we do this for all the pieces
then we can get the index in the same way
pce * 120 + sq , we then get the random key at this index and then XOR it with our board position key */


/*NOTE: for en passant we simply use the pce==EMPTY*120 + square,  in PieceKeys to represent the en passant
squares because EMPTY key values wont be used   */

var PieceKeys  = new Array(14*120);

//we just XOR in and out to represent the side to move

var SideKey;

//castle keys are from 0-15 as there 16 combination of castle permissions 
var CastleKeys = new Array(16);


// Now we initialize values for above arrays in main


var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64);


var Mirror64 = [
	56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,
	48	,	49	,	50	,	51	,	52	,	53	,	54	,	55	,
	40	,	41	,	42	,	43	,	44	,	45	,	46	,	47	,
	32	,	33	,	34	,	35	,	36	,	37	,	38	,	39	,
	24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,
	16	,	17	,	18	,	19	,	20	,	21	,	22	,	23	,
	8	,	9	,	10	,	11	,	12	,	13	,	14	,	15	,
	0	,	1	,	2	,	3	,	4	,	5	,	6	,	7
	];
	


 function RAND_32(){
 	return (Math.floor((Math.random()*255)+1)<<23)  | (Math.floor((Math.random()*255)+1)<<16) | (Math.floor((Math.random()*255)+1)<<8) |(Math.floor((Math.random()*255)+1));  
 }


 function SQ64(sq120){
 	return Sq120ToSq64[(sq120)];
 }

 function SQ120(sq64){
 	return Sq64ToSq120[(sq64)];
 }

 function PCEINDEX(pce, pceNum){
  	return (pce * 10 + pceNum);
 }
 
 
 function MIRROR64(sq) {
	return Mirror64[sq];
}




 var Kings = [PIECES.wK, PIECES.bK];


 var CastlePerm = [
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	 15, 15, 15, 15, 15, 15, 15, 15, 15, 15
 ];
 






 /*

before moving a piece we need to know 

fromSquare 
toSquare
Cap tured a piece
Pawn Start
Castling Move


range of our squares on the board = 21 to 98
so 7 bits are sufficient to represent the from and to square

  
we represent our move with 28 bits

for example

00001 1100 0000 1111 0000 0100 1011

here right most seven bits represent the from square
the next seven bits represent the to square
the next four bits represent the captured piece
the next 1 bit represents whether the move is an en passant move
the next 1 bit represents whether the move is pawn start move 
the next 4 bits represent the promotion piece  

so now to get all this from the 28 move bits we

0001 1100 0000 1111 0000 0100 1011 -> move bits

0000 0000 0000 0000 0000 0111 1111 -> AND 0x7F           "from" square
0000 0000 0000 0011 1111 1000 0000 -> AND >> 7, 0x7F     "to" square
0000 0000 0011 1100 0000 0000 0000 -> AND >> 14, 0xF      captured piece 
0000 0000 0100 0000 0000 0000 0000 -> AND 0x40000,        en passant move, if the result of the and is NOT 0 then it is an enpassant move
0000 0000 1000 0000 000f0 0000 0000 -> AND 0x80000 ,       pawn start 
0000 1111 0000 0000 0000 0000 0000 -> AND >> 20, 0xF      promoted piece type in the move
0001 0000 0000 0000 0000 0000 0000 -> AND 0x1000000 ,     catling move



*/


function FROMSQ(m){ return (m & 0x7F); }

function TOSQ(m){return ((m>>7) & 0x7F);}

function CAPTURED(m){return ((m>>14) & 0xF);}

function PROMOTED(m){return ((m>>20) & 0xF);}

var MFLAGEP = 0x40000;

var MFLAGPS = 0x80000;

var MFLAGCA = 0x1000000;

var MFLAGCAP = 0x7C000;  

/*
because enpassant is also a type of capture, OR the enpassant and capture bits

    0000 0000 0011 1100 0000 0000 0000
 OR 0000 0000 0100 0000 0000 0000 0000 
    0000 0000 0111 1100 0000 0000 0000  = 0x7C
*/

var MFLAGPROM =  0xF500000;
var NOMOVE =0;

 

 function SQOFFBOARD(sq){
	if(FilesBrd[sq]==SQUARES.OFFBOARD) return BOOL.TRUE;
	return BOOL.FALSE;
}


function HASH_PCE(pce,sq){
	GameBoard.posKey ^= PieceKeys[(pce*120)+sq];

}

function HASH_CA(){
	GameBoard.posKey ^= CastleKeys[GameBoard.castlePerm];
}

function HASH_SIDE(){
	GameBoard.posKey ^= SideKey;
}

function HASH_EP(){
	GameBoard.posKey ^= PieceKeys[GameBoard.enPas];
}


var GameController = {};

GameController.EngineSide = COLOURS.BOTH;
GameController.PlayerSide = COLOURS.BOTH;
GameController.GameOver = BOOL.FALSE;

var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;