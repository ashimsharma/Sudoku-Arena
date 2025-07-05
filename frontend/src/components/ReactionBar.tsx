import { useSelector } from "react-redux"
import { getSocket } from "../config/socket.config";
import { SEND_REACTION } from "../messages/messages";

export default function ReactionBar(){
    const reactions = useSelector((state: any) => state.game).emojiReactions;
    const gameId = useSelector((state: any) => state.game).gameId;
    const me = useSelector((state: any) => state.game).me;

    const sendReaction = (reactionId: number) => {
        const socket = getSocket();

        socket?.send(
            JSON.stringify(
                {
                    type: SEND_REACTION,
                    params: {
                        roomId: gameId,
                        userId: me.id,
                        reactionId: reactionId
                    }
                }
            )
        )
    }
    return (
        <div className="bg-gray-900 flex p-2 w-fit rounded-full">
            {reactions.map((reaction: any) => {
                return (<button key={reaction.id} title={reaction.label} className="text-2xl m-1 hover:scale-150" onClick={() => sendReaction(reaction.id)}>
                    {reaction.emoji}
                </button>)
            })}
        </div>
    )
}