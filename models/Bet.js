import mongoose from "mongoose";

const Schema = mongoose.Schema;

const betSchema = new Schema({
    user:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"  
    },
    won:{
        type:Boolean,               // dunno are we really need this
    },
    amount:{
        type: Number,
        required: true,
    }
});

const Bet = mongoose.model('Bet', betSchema);
export default Bet;