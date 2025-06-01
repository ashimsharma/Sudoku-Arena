export default function Keypad(){
    return (
        <div className="grid grid-cols-3 grid-rows-3 gap-3 h-full">
            {[1,2,3,4,5,6,7,8,9].map((key: number) => {
                return (
                    <div className="p-2 flex justify-center items-center text-2xl rounded cursor-pointer bg-indigo-600 hover:bg-indigo-800" key={key}>{key}</div>
                )
            })}
        </div>
    )
}