// Frontend Messages
export const CREATE_ROOM = "create_room";
export const JOIN_ROOM = "join_room";
export const INIT_GAME = "init_game";
export const ADD_NUMBER = "add_number";
export const CLEAR_CELL = "clear_cell";
export const TIMER_ENDED = "timer_ended";

// Backend Messages
export const ROOM_CREATED = "room_created";
export const ROOM_CREATE_FAILED = "room_create_failed";

export const ROOM_JOINED = "room_joined";
export const ROOM_JOIN_FAILED = "room_join_failed";

export const OPPONENT_JOINED = "opponent_joined";

export const GAME_INITIATED = "game_initiated";
export const GAME_INITIATE_FAILED = "game_initiate_failed";
export const OPPONENT_GAME_INITIATED = "opponent_game_initiated";

export const BOTH_USERS_GAME_INITIATED = "both_users_game_initiated";

export const NUMBER_ADDED = "number_added";
export const NUMBER_ADD_FAILED = "number_add_failed";

export const CELL_CLEARED = "cell_cleared";

export const YOUR_MISTAKES_COMPLETE = "your_mistakes_complete";
export const OPPONENT_MISTAKES_COMPLETE = "opponent_mistakes_complete";

export const WRONG_CELL = "wrong_cell";
export const CORRECT_CELL = "correct_cell";

export const OPPONENT_CORRECT_CELL = "opponent_correct_cell";

export const OPPONENT_MISTAKE = "opponent_mistake";

export const OPPONENT_BOARD_COMPELTE = "opponent_board_complete";

export const ALREADY_ON_CORRECT_POSITION = "already_on_correct_position";

export const GAME_ENDED = "game_ended";

export const GAME_ALREADY_ENDED = "game_already_ended";

// Extras 
export const TIMER_COMPLETE = "timer_complete";
export const BOARD_COMPELTE = "board_complete";
export const MISTAKES_COMPLETE = "mistakes_complete";