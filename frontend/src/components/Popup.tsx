export default function Popup({message, show, isPositiveMessage}: {message: string, show: boolean, isPositiveMessage: boolean}){
    return (
        <div className={`p-1 text-white text-center rounded-lg px-2 ${!show ? 'hidden' : ''} ${isPositiveMessage ? 'bg-green-500' : 'bg-red-500'}`}>
            {message}
        </div>
    )
}