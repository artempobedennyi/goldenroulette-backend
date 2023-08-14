import mongoose from "mongoose";

const Schema = mongoose.Schema;

const gameSchema = new Schema({
    koef: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    state: {
        type: String,
        required: true,
        default: "starting"
    },
    bets: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Bet"
    }]
});

const Game = mongoose.model("Game", gameSchema);
export default Game;