import Bet from "../models/Bet.js";
import Game from "../models/Game.js";
import * as SocketService from "../socket.js";
import { 
    makeBetBodyValidation,
} from "../utils/validationSchema.js";
import socketio from "socket.io-client";
import gameConfig from "../config/game.js";

const makeBet = async (req, res, next) => {
    try {
        const { error } = makeBetBodyValidation(req.body);
        if (error)
            return res.apiError(error.details[0].message);

        const game = await Game.findOne().sort({ _id: -1 });
        if (!game || game.state !== 'starting') {
            return res.apiError("cant make bet at this time");
        }

        let bet = await Bet({
            user: req.jwtPayload.id,
            amount: req.body.amount
        }).save();

        bet = await (await bet.populate('user')).populate({
            path: 'user',
            model: 'User'
        });
        
        bet.user.balance = bet.user.balance - bet.amount;
        game.amount += bet.amount;        
        game.bets.push(bet);
        await game.save();
        await bet.user.save();
        
        const io = SocketService.socketGetIO();
        io.emit('player_bet', {
            'betId': bet._id,
            'userName': bet.user.userName,
            'amount': bet.amount
        });

        return res.apiSuccess({
            'userName': bet.user.userName
        });
    } catch (error) {   
        console.log(error)
        return res.apiError("Internal Server Error");
    }
}

const cancelBet = async (req, res, next) => {
    try {
        const game = await Game.findOne().sort({ _id: -1 }).populate({
            path: 'bets',
            populate: {
                path: 'user',
                model: 'User'
            }
        });

        if (!game || game.state !== 'starting') {
            return res.apiError("cant cancel bet at this time");
        }

        let bet = game.bets.find((bet) => bet.user.id === req.jwtPayload.id);

        if (bet) {
            bet.user.balance = bet.user.balance + bet.amount;
            game.amount -= bet.amount;
            game.bets.pull(bet);
            await game.save();
            await bet.user.save();

            const playerUserName = bet.user.userName;
            const io = SocketService.socketGetIO();
            io.emit('player_cancel', {
                'userName': playerUserName,
                'amount': bet.amount
            });

            const currentBet = await Bet.findById(bet._id);
            await currentBet.deleteOne();

            return res.apiSuccess({
                'userName': playerUserName
            });
        } else {
            return res.apiError('Cannot find out the bet');
        }
    } catch (error) {   
        console.log(error)
        return res.apiError("Internal Server Error");
    }
}

export {
    makeBet,
    cancelBet
};
